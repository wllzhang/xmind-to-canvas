import ELK, { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled';
import { XMindWorkbook, XMindNode, ConversionOptions, ELKGraph } from './types';

/**
 * Layout calculator using ELK.js
 */
export class LayoutCalculator {
  private elk: InstanceType<typeof ELK>;

  constructor() {
    this.elk = new ELK();
  }

  /**
   * Calculate layout for XMind data
   */
  async calculate(xmindData: XMindWorkbook, options: ConversionOptions): Promise<any> {
    try {
      // Get the first sheet (most XMind files have one sheet)
      if (!xmindData.sheets || xmindData.sheets.length === 0) {
        throw new Error('No sheets found in XMind file');
      }

      const sheet = xmindData.sheets[0];
      const rootTopic = sheet.rootTopic;

      // Convert XMind tree to ELK graph
      const elkGraph = this.convertToELKGraph(rootTopic, options);

      // Calculate layout
      const layoutedGraph = await this.elk.layout(elkGraph);

      return layoutedGraph;
    } catch (error) {
      console.error('Error calculating layout:', error);
      throw new Error(`Failed to calculate layout: ${error.message}`);
    }
  }

  /**
   * Convert XMind node tree to ELK graph structure
   */
  private convertToELKGraph(rootNode: XMindNode, options: ConversionOptions): ElkNode {
    const graph: ElkNode = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': options.layoutAlgorithm || 'mrtree',
        'elk.direction': options.direction || 'RIGHT',
        'elk.spacing.nodeNode': String(options.nodeSpacing || 80),
        'elk.layered.spacing.nodeNodeBetweenLayers': String(options.layerSpacing || 150),
      },
      children: [],
      edges: [],
    };

    // Convert node tree to ELK nodes and edges
    const { nodes, edges } = this.flattenNodeTree(rootNode, options);
    
    graph.children = nodes;
    graph.edges = edges;

    return graph;
  }

  /**
   * Flatten XMind node tree into nodes and edges arrays
   */
  private flattenNodeTree(
    node: XMindNode,
    options: ConversionOptions,
    parentId?: string
  ): { nodes: ElkNode[]; edges: ElkExtendedEdge[] } {
    const nodes: ElkNode[] = [];
    const edges: ElkExtendedEdge[] = [];

    // Estimate text width and height
    const textLength = node.title.length;
    const width = Math.max(options.defaultNodeWidth || 200, Math.min(textLength * 8, 400));
    const height = options.defaultNodeHeight || 80;

    // Create current node
    const elkNode: ElkNode = {
      id: node.id,
      width,
      height,
      labels: [{ text: node.title }],
    };

    nodes.push(elkNode);

    // Create edge from parent to current node
    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${node.id}`,
        sources: [parentId],
        targets: [node.id],
      });
    }

    // Process children recursively
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const childResult = this.flattenNodeTree(child, options, node.id);
        nodes.push(...childResult.nodes);
        edges.push(...childResult.edges);
      }
    }

    return { nodes, edges };
  }
}
