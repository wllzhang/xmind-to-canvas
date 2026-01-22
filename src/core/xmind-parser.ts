import { XMindWorkbook, XMindSheet, XMindNode, ImageResource } from './types';
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
      let workbookData: unknown;
      if (isJson) {
        workbookData = JSON.parse(contentText);
      } else {
        // For XML format, we'll need to parse it differently
        // For now, throw an error - we can implement XML parsing later if needed
        throw new Error('XML format (.xmind) is not yet supported. Please use XMind Zen format.');
      }
      
      // Extract images from resources folder
      const images = await this.extractImages(zip);
      
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
      
      return { sheets, images };
    } catch (error: unknown) {
      console.error('Error parsing XMind file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to parse XMind file: ${errorMessage}`);
    }
  }

  /**
   * Extract images from the resources folder in the XMind ZIP
   */
  private async extractImages(zip: JSZip): Promise<Map<string, ImageResource>> {
    const images = new Map<string, ImageResource>();
    
    // Find all files in resources folder
    const resourceFiles = Object.keys(zip.files).filter(
      path => path.startsWith('resources/') && !path.endsWith('/')
    );
    
    for (const filePath of resourceFiles) {
      const file = zip.file(filePath);
      if (file) {
        try {
          const data = await file.async('arraybuffer');
          const name = filePath.replace('resources/', '');
          const mimeType = this.getMimeType(name);
          
          if (mimeType) {
            images.set(name, { name, data, mimeType });
          }
        } catch (error) {
          console.warn(`Failed to extract image: ${filePath}`, error);
        }
      }
    }
    
    return images;
  }

  /**
   * Get MIME type from filename
   */
  private getMimeType(filename: string): string | null {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'bmp': 'image/bmp',
    };
    return mimeTypes[ext || ''] || null;
  }

  /**
   * Extract nodes from XMind topic recursively
   */
  private extractNodes(topic: Record<string, unknown>, parentId?: string): XMindNode {
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

    // Extract image if available
    // XMind stores images as: { "src": "xap:resources/image.png", "width": 200, "height": 150 }
    if (topic.image && topic.image.src) {
      const imageSrc = topic.image.src;
      // Extract the filename from "xap:resources/filename.png" or "resources/filename.png"
      const match = imageSrc.match(/(?:xap:)?resources\/(.+)$/);
      if (match) {
        node.image = {
          src: match[1],  // Store just the filename
          width: topic.image.width,
          height: topic.image.height,
        };
      }
    }

    // Recursively process children
    // Handle different possible children fields
    // XMind Zen format uses children.attached for child topics
    let children: Record<string, unknown>[] = [];
    
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
      node.children = children.map((child: Record<string, unknown>) => 
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

