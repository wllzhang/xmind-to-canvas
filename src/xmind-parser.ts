import { XMindWorkbook, XMindSheet, XMindNode } from './types';
import JSZip from 'jszip';

/**
 * XMind file parser - parses .xmind files (which are ZIP archives)
 */
export class XMindParser {
  /**
   * Parse XMind file from ArrayBuffer
   */
  async parse(arrayBuffer: ArrayBuffer): Promise<XMindWorkbook> {
    try {
      // XMind files are ZIP archives
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      // Try to find content.json first (XMind Zen format)
      let contentFile = zip.file('content.json');
      let isJson = true;
      
      // If not found, try content.xml (older XMind format)
      if (!contentFile) {
        contentFile = zip.file('content.xml');
        isJson = false;
      }
      
      if (!contentFile) {
        throw new Error('No content.json or content.xml found in XMind file');
      }
      
      const contentText = await contentFile.async('text');
      
      // Parse based on format
      let workbookData: any;
      if (isJson) {
        workbookData = JSON.parse(contentText);
      } else {
        // For XML format, we'll need to parse it differently
        // For now, throw an error - we can implement XML parsing later if needed
        throw new Error('XML format (.xmind) is not yet supported. Please use XMind Zen format.');
      }
      
      // Convert to our internal structure
      const sheets: XMindSheet[] = [];
      
      if (workbookData && Array.isArray(workbookData)) {
        for (const sheet of workbookData) {
          const rootTopic = sheet.rootTopic;
          
          if (rootTopic) {
            sheets.push({
              id: sheet.id || this.generateId(),
              title: sheet.title || 'Untitled Sheet',
              rootTopic: this.extractNodes(rootTopic),
            });
          }
        }
      }
      
      if (sheets.length === 0) {
        throw new Error('No valid sheets found in XMind file');
      }
      
      return { sheets };
    } catch (error: any) {
      console.error('Error parsing XMind file:', error);
      throw new Error(`Failed to parse XMind file: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Extract nodes from XMind topic recursively
   */
  private extractNodes(topic: any, parentId?: string): XMindNode {
    // Handle different possible title fields
    const title = topic.title || topic.label || topic.name || 'Untitled';
    
    const node: XMindNode = {
      id: topic.id || this.generateId(),
      title: String(title),
      children: [],
    };

    // Extract notes if available
    if (topic.notes) {
      node.notes = topic.notes.plain || topic.notes;
    }

    // Extract labels if available
    if (topic.labels && Array.isArray(topic.labels)) {
      node.labels = topic.labels;
    } else if (topic.labels && typeof topic.labels === 'string') {
      node.labels = [topic.labels];
    }

    // Extract markers if available
    if (topic.markers && Array.isArray(topic.markers)) {
      node.markers = topic.markers;
    }

    // Recursively process children
    // Handle different possible children fields
    // XMind Zen format uses children.attached for child topics
    let children: any[] = [];
    
    if (topic.children) {
      if (topic.children.attached && Array.isArray(topic.children.attached)) {
        // XMind Zen format: children.attached
        children = topic.children.attached;
      } else if (Array.isArray(topic.children)) {
        // Direct array format
        children = topic.children;
      }
    } else if (topic.attached && Array.isArray(topic.attached)) {
      // Alternative format
      children = topic.attached;
    } else if (topic.topics && Array.isArray(topic.topics)) {
      // Another alternative format
      children = topic.topics;
    }
    
    if (children.length > 0) {
      node.children = children.map((child: any) => 
        this.extractNodes(child, node.id)
      );
    } else {
      // Ensure children is always an array
      node.children = [];
    }

    return node;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
