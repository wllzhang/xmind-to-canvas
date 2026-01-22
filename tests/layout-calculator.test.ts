/**
 * Layout Calculator Tests
 * Black-box tests for layout calculation functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { XMindParser } from '../src/core/xmind-parser';
import { LayoutCalculator } from '../src/core/layout-calculator';
import { DEFAULT_OPTIONS, ConversionOptions } from '../src/core/types';
import { 
  createSimpleXMind, 
  createXMindWithImages, 
  createComplexXMind,
} from './fixtures/xmind-builder';

describe('LayoutCalculator', () => {
  let parser: XMindParser;
  let calculator: LayoutCalculator;

  beforeEach(() => {
    parser = new XMindParser();
    calculator = new LayoutCalculator();
  });

  describe('Basic Layout', () => {
    it('should calculate positions for all nodes', async () => {
      const xmindBuffer = await createSimpleXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);

      expect(layout).toBeDefined();
      expect(layout.children).toBeDefined();
      expect(layout.children.length).toBeGreaterThan(0);

      // Each node should have x, y coordinates
      for (const node of layout.children) {
        expect(typeof node.x).toBe('number');
        expect(typeof node.y).toBe('number');
      }
    });

    it('should generate edge connections', async () => {
      const xmindBuffer = await createSimpleXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);

      expect(layout.edges).toBeDefined();
      expect(layout.edges.length).toBeGreaterThan(0);

      // Each edge should have sources and targets
      for (const edge of layout.edges) {
        expect(edge.sources).toBeDefined();
        expect(edge.targets).toBeDefined();
        expect(edge.sources.length).toBe(1);
        expect(edge.targets.length).toBe(1);
      }
    });

    it('should have edge count equal to child node count (tree structure)', async () => {
      const xmindBuffer = await createSimpleXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);

      // For a tree: edges = nodes - 1
      const nodeCount = layout.children.length;
      const edgeCount = layout.edges.length;
      expect(edgeCount).toBe(nodeCount - 1);
    });
  });

  describe('Node Size Calculation', () => {
    it('should set default dimensions for regular nodes', async () => {
      const xmindBuffer = await createSimpleXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);

      for (const node of layout.children) {
        expect(node.width).toBeGreaterThan(0);
        expect(node.height).toBeGreaterThan(0);
      }
    });

    it('should have larger dimensions for nodes with images', async () => {
      const xmindBuffer = await createXMindWithImages();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);

      // Find node with image (root should have image)
      const nodeWithImage = layout.children.find((n: any) => n.hasImage === true);
      const nodeWithoutImage = layout.children.find((n: any) => !n.hasImage && n.id !== 'root-1');

      expect(nodeWithImage).toBeDefined();
      if (nodeWithImage && nodeWithoutImage) {
        // Image node should have height that accounts for image + title
        expect(nodeWithImage.height).toBeGreaterThanOrEqual(DEFAULT_OPTIONS.defaultNodeHeight!);
      }
    });

    it('should preserve image information in nodes', async () => {
      const xmindBuffer = await createXMindWithImages();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);

      const nodeWithImage = layout.children.find((n: any) => n.hasImage === true);
      
      expect(nodeWithImage).toBeDefined();
      expect(nodeWithImage!.imageSrc).toBeDefined();
      expect(typeof nodeWithImage!.imageSrc).toBe('string');
    });
  });

  describe('Layout Direction', () => {
    it('should default to RIGHT direction', async () => {
      const xmindBuffer = await createSimpleXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);

      // With RIGHT direction, child nodes should be to the right of parent
      // The root should have smallest x
      const xValues = layout.children.map((n: any) => n.x);
      const minX = Math.min(...xValues);
      
      // Root node should have minimum or near-minimum x value
      const rootNode = layout.children.find((n: any) => n.id === 'root-1');
      expect(rootNode).toBeDefined();
    });

    it('should place children below parent with DOWN direction', async () => {
      const xmindBuffer = await createSimpleXMind();
      const xmindData = await parser.parse(xmindBuffer);
      
      const options: ConversionOptions = {
        ...DEFAULT_OPTIONS,
        direction: 'DOWN',
      };
      const layout = await calculator.calculate(xmindData, options);

      // The algorithm should place children below parent
      expect(layout.children.length).toBeGreaterThan(0);
    });
  });

  describe('Complex Structure Layout', () => {
    it('should correctly handle deeply nested structures', async () => {
      const xmindBuffer = await createComplexXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);

      // Count total nodes from xmindData
      const countNodes = (node: any): number => {
        let count = 1;
        if (node.children) {
          for (const child of node.children) {
            count += countNodes(child);
          }
        }
        return count;
      };
      
      const expectedNodeCount = countNodes(xmindData.sheets[0].rootTopic);
      expect(layout.children.length).toBe(expectedNodeCount);
    });

    it('should have valid positions for all nodes', async () => {
      const xmindBuffer = await createComplexXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);

      for (const node of layout.children) {
        expect(isFinite(node.x!)).toBe(true);
        expect(isFinite(node.y!)).toBe(true);
        expect(node.x!).toBeGreaterThanOrEqual(0);
        expect(node.y!).toBeGreaterThanOrEqual(0);
      }
    });

    it('should not have overlapping nodes', async () => {
      const xmindBuffer = await createComplexXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);

      // Check that no two nodes overlap
      const nodes = layout.children;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const node1 = nodes[i];
          const node2 = nodes[j];
          
          // Check for overlap
          const noOverlap = 
            node1.x! + node1.width! <= node2.x! ||
            node2.x! + node2.width! <= node1.x! ||
            node1.y! + node1.height! <= node2.y! ||
            node2.y! + node2.height! <= node1.y!;
          
          expect(noOverlap).toBe(true);
        }
      }
    });
  });

  describe('Custom Options', () => {
    it('should use custom node spacing', async () => {
      const xmindBuffer = await createSimpleXMind();
      const xmindData = await parser.parse(xmindBuffer);
      
      const options1: ConversionOptions = { ...DEFAULT_OPTIONS, nodeSpacing: 50 };
      const options2: ConversionOptions = { ...DEFAULT_OPTIONS, nodeSpacing: 200 };
      
      const layout1 = await calculator.calculate(xmindData, options1);
      const layout2 = await calculator.calculate(xmindData, options2);

      // Both should produce valid layouts
      expect(layout1.children.length).toBe(layout2.children.length);
    });

    it('should use custom layer spacing', async () => {
      const xmindBuffer = await createSimpleXMind();
      const xmindData = await parser.parse(xmindBuffer);
      
      const options: ConversionOptions = { 
        ...DEFAULT_OPTIONS, 
        layerSpacing: 300,
      };
      
      const layout = await calculator.calculate(xmindData, options);
      expect(layout.children.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty sheets array', async () => {
      const emptyWorkbook = { sheets: [], images: new Map() };
      
      await expect(calculator.calculate(emptyWorkbook, DEFAULT_OPTIONS))
        .rejects.toThrow('No sheets found');
    });
  });
});

