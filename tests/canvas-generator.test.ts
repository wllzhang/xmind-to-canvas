/**
 * Canvas Generator Tests
 * Black-box tests for Canvas generation functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { XMindParser } from '../src/core/xmind-parser';
import { LayoutCalculator } from '../src/core/layout-calculator';
import { CanvasGenerator } from '../src/core/canvas-generator';
import { DEFAULT_OPTIONS } from '../src/core/types';
import { 
  createSimpleXMind, 
  createXMindWithImages, 
  createComplexXMind,
} from './fixtures/xmind-builder';

describe('CanvasGenerator', () => {
  let parser: XMindParser;
  let calculator: LayoutCalculator;
  let generator: CanvasGenerator;

  beforeEach(() => {
    parser = new XMindParser();
    calculator = new LayoutCalculator();
    generator = new CanvasGenerator();
  });

  describe('Basic Generation', () => {
    it('should generate valid Canvas data structure', async () => {
      const xmindBuffer = await createSimpleXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);
      const canvas = generator.generate(layout);

      expect(canvas).toBeDefined();
      expect(canvas.nodes).toBeDefined();
      expect(canvas.edges).toBeDefined();
      expect(Array.isArray(canvas.nodes)).toBe(true);
      expect(Array.isArray(canvas.edges)).toBe(true);
    });

    it('should generate correct number of nodes', async () => {
      const xmindBuffer = await createSimpleXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);
      const canvas = generator.generate(layout);

      // Simple XMind has 3 nodes: root + 2 children
      expect(canvas.nodes.length).toBe(3);
    });

    it('should generate correct number of edges', async () => {
      const xmindBuffer = await createSimpleXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);
      const canvas = generator.generate(layout);

      // For tree structure: edges = nodes - 1
      expect(canvas.edges.length).toBe(canvas.nodes.length - 1);
    });
  });

  describe('Node Properties', () => {
    it('should have correct type and properties for text nodes', async () => {
      const xmindBuffer = await createSimpleXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);
      const canvas = generator.generate(layout);

      for (const node of canvas.nodes) {
        expect(node.id).toBeDefined();
        expect(typeof node.x).toBe('number');
        expect(typeof node.y).toBe('number');
        expect(typeof node.width).toBe('number');
        expect(typeof node.height).toBe('number');
        expect(['text', 'file', 'link', 'group']).toContain(node.type);
      }
    });

    it('should contain formatted title in text nodes', async () => {
      const xmindBuffer = await createSimpleXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);
      const canvas = generator.generate(layout);

      const textNodes = canvas.nodes.filter(n => n.type === 'text');
      for (const node of textNodes) {
        expect(node.text).toBeDefined();
        expect(node.text).toContain('###'); // Should be markdown heading
      }
    });

    it('should have integer values for node positions', async () => {
      const xmindBuffer = await createSimpleXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);
      const canvas = generator.generate(layout);

      for (const node of canvas.nodes) {
        expect(Number.isInteger(node.x)).toBe(true);
        expect(Number.isInteger(node.y)).toBe(true);
        expect(Number.isInteger(node.width)).toBe(true);
        expect(Number.isInteger(node.height)).toBe(true);
      }
    });
  });

  describe('Edge Properties', () => {
    it('should have correct properties for edges', async () => {
      const xmindBuffer = await createSimpleXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);
      const canvas = generator.generate(layout);

      for (const edge of canvas.edges) {
        expect(edge.id).toBeDefined();
        expect(edge.fromNode).toBeDefined();
        expect(edge.toNode).toBeDefined();
      }
    });

    it('should have edge endpoints pointing to existing nodes', async () => {
      const xmindBuffer = await createSimpleXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);
      const canvas = generator.generate(layout);

      const nodeIds = new Set(canvas.nodes.map(n => n.id));

      for (const edge of canvas.edges) {
        expect(nodeIds.has(edge.fromNode)).toBe(true);
        expect(nodeIds.has(edge.toNode)).toBe(true);
      }
    });

    it('should have connection sides for edges', async () => {
      const xmindBuffer = await createSimpleXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);
      const canvas = generator.generate(layout);

      for (const edge of canvas.edges) {
        expect(['top', 'right', 'bottom', 'left']).toContain(edge.fromSide);
        expect(['top', 'right', 'bottom', 'left']).toContain(edge.toSide);
      }
    });
  });

  describe('Image Node Handling', () => {
    it('should generate file type nodes for nodes with images', async () => {
      const xmindBuffer = await createXMindWithImages();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);
      const canvas = generator.generate(layout);

      const fileNodes = canvas.nodes.filter(n => n.type === 'file');
      expect(fileNodes.length).toBeGreaterThan(0);
    });

    it('should have file property for image nodes', async () => {
      const xmindBuffer = await createXMindWithImages();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);
      const canvas = generator.generate(layout);

      const fileNodes = canvas.nodes.filter(n => n.type === 'file');
      for (const node of fileNodes) {
        expect(node.file).toBeDefined();
        expect(typeof node.file).toBe('string');
      }
    });

    it('should use custom image path generator', async () => {
      const xmindBuffer = await createXMindWithImages();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);
      
      generator.setImagePathGenerator((imageName) => `custom/path/${imageName}`);
      const canvas = generator.generate(layout);

      const fileNodes = canvas.nodes.filter(n => n.type === 'file');
      for (const node of fileNodes) {
        expect(node.file).toContain('custom/path/');
      }
    });

    it('may generate additional title nodes for nodes with images', async () => {
      const xmindBuffer = await createXMindWithImages();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);
      const canvas = generator.generate(layout);

      // Some nodes with images might have accompanying title nodes
      const titleNodes = canvas.nodes.filter(n => n.id.endsWith('-title'));
      // This is optional behavior, just verify it doesn't break anything
      expect(Array.isArray(titleNodes)).toBe(true);
    });
  });

  describe('Complex Structure Handling', () => {
    it('should correctly handle deeply nested structures', async () => {
      const xmindBuffer = await createComplexXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);
      const canvas = generator.generate(layout);

      // Should have nodes for all topics
      expect(canvas.nodes.length).toBeGreaterThan(0);
      expect(canvas.edges.length).toBeGreaterThan(0);
    });

    it('should be serializable as JSON', async () => {
      const xmindBuffer = await createComplexXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);
      const canvas = generator.generate(layout);

      // Should be able to stringify and parse
      const jsonString = JSON.stringify(canvas);
      const parsed = JSON.parse(jsonString);

      expect(parsed.nodes).toHaveLength(canvas.nodes.length);
      expect(parsed.edges).toHaveLength(canvas.edges.length);
    });

    it('should conform to JSON Canvas specification', async () => {
      const xmindBuffer = await createComplexXMind();
      const xmindData = await parser.parse(xmindBuffer);
      const layout = await calculator.calculate(xmindData, DEFAULT_OPTIONS);
      const canvas = generator.generate(layout);

      // Validate against JSON Canvas spec
      // https://jsoncanvas.org/spec/1.0/
      
      // Must have nodes and edges arrays
      expect(Array.isArray(canvas.nodes)).toBe(true);
      expect(Array.isArray(canvas.edges)).toBe(true);

      // Node validation
      for (const node of canvas.nodes) {
        expect(typeof node.id).toBe('string');
        expect(['text', 'file', 'link', 'group']).toContain(node.type);
        expect(typeof node.x).toBe('number');
        expect(typeof node.y).toBe('number');
        expect(typeof node.width).toBe('number');
        expect(typeof node.height).toBe('number');
      }

      // Edge validation
      for (const edge of canvas.edges) {
        expect(typeof edge.id).toBe('string');
        expect(typeof edge.fromNode).toBe('string');
        expect(typeof edge.toNode).toBe('string');
      }
    });
  });
});

