import { CanvasData, CanvasNode, CanvasEdge } from './types';
import { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled';

/**
 * JSON Canvas generator
 */
export class CanvasGenerator {
  /**
   * Generate Canvas data from layouted ELK graph
   */
  generate(layoutedGraph: ElkNode): CanvasData {
    const nodes: CanvasNode[] = [];
    const edges: CanvasEdge[] = [];

    // Convert ELK nodes to Canvas nodes
    if (layoutedGraph.children) {
      for (const elkNode of layoutedGraph.children) {
        const canvasNode = this.convertNode(elkNode);
        nodes.push(canvasNode);
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
   * Convert ELK node to Canvas node
   */
  private convertNode(elkNode: ElkNode): CanvasNode {
    // Extract title from labels
    const title = elkNode.labels && elkNode.labels.length > 0
      ? elkNode.labels[0].text
      : 'Untitled';

    // Format text with markdown heading
    const text = `### ${title}`;

    return {
      id: elkNode.id,
      type: 'text',
      x: Math.round(elkNode.x || 0),
      y: Math.round(elkNode.y || 0),
      width: Math.round(elkNode.width || 200),
      height: Math.round(elkNode.height || 80),
      text,
    };
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
