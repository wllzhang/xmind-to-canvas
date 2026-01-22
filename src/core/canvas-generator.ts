import { CanvasData, CanvasNode, CanvasEdge } from './types';
import { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled';
import { ExtendedElkNode } from './layout-calculator';

// Image path generator function type
export type ImagePathGenerator = (imageName: string) => string;

/**
 * JSON Canvas generator
 */
export class CanvasGenerator {
  private imagePathGenerator: ImagePathGenerator | null = null;

  /**
   * Set a custom image path generator
   * This allows customizing how image paths are resolved in the canvas
   */
  setImagePathGenerator(generator: ImagePathGenerator) {
    this.imagePathGenerator = generator;
  }

  /**
   * Generate Canvas data from layouted ELK graph
   */
  generate(layoutedGraph: ElkNode): CanvasData {
    const nodes: CanvasNode[] = [];
    const edges: CanvasEdge[] = [];

    // Convert ELK nodes to Canvas nodes
    if (layoutedGraph.children) {
      for (const elkNode of layoutedGraph.children) {
        const canvasNodes = this.convertNode(elkNode as ExtendedElkNode);
        nodes.push(...canvasNodes);
      }
    }

    // Convert ELK edges to Canvas edges
    if (layoutedGraph.edges) {
      for (const elkEdge of layoutedGraph.edges) {
        const canvasEdge = this.convertEdge(elkEdge);
        edges.push(canvasEdge);
      }
    }

    return { nodes, edges };
  }

  /**
   * Convert ELK node to Canvas node(s)
   * Returns an array because a node with image may create both a text node and an image node
   */
  private convertNode(elkNode: ExtendedElkNode): CanvasNode[] {
    const nodes: CanvasNode[] = [];
    
    // Extract title from labels
    const title = elkNode.labels && elkNode.labels.length > 0
      ? elkNode.labels[0].text
      : 'Untitled';

    const x = Math.round(elkNode.x || 0);
    const y = Math.round(elkNode.y || 0);
    const width = Math.round(elkNode.width || 200);
    const height = Math.round(elkNode.height || 80);

    // If node has an image, create an image file node
    if (elkNode.hasImage && elkNode.imageSrc) {
      const imagePath = this.imagePathGenerator 
        ? this.imagePathGenerator(elkNode.imageSrc)
        : elkNode.imageSrc;

      // Create a file node for the image
      const imageNode: CanvasNode = {
        id: elkNode.id,
        type: 'file',
        x,
        y,
        width,
        height,
        file: imagePath,
      };
      nodes.push(imageNode);

      // Create a text node for the title below the image
      if (title && title !== 'Untitled') {
        const textNode: CanvasNode = {
          id: `${elkNode.id}-title`,
          type: 'text',
          x,
          y: y + height + 10, // Position below the image
          width,
          height: 40,
          text: `### ${title}`,
        };
        nodes.push(textNode);
      }
    } else {
      // Regular text node
      const textNode: CanvasNode = {
        id: elkNode.id,
        type: 'text',
        x,
        y,
        width,
        height,
        text: `### ${title}`,
      };
      nodes.push(textNode);
    }

    return nodes;
  }

  /**
   * Convert ELK edge to Canvas edge
   */
  private convertEdge(elkEdge: ElkExtendedEdge): CanvasEdge {
    const fromNode = Array.isArray(elkEdge.sources) ? elkEdge.sources[0] : elkEdge.sources;
    const toNode = Array.isArray(elkEdge.targets) ? elkEdge.targets[0] : elkEdge.targets;

    return {
      id: elkEdge.id,
      fromNode,
      toNode,
      fromSide: 'right',
      toSide: 'left',
    };
  }
}

