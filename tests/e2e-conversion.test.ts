/**
 * End-to-End Conversion Tests
 * Complete black-box tests for XMind to Canvas conversion flow
 */

import { describe, it, expect } from 'vitest';
import { convertXMindToCanvas } from '../src/core';
import { DEFAULT_OPTIONS, CanvasData, CanvasNode, CanvasEdge } from '../src/core/types';
import { 
  createSimpleXMind, 
  createXMindWithImages, 
  createComplexXMind,
  XMindBuilder,
  createTestPngImage,
} from './fixtures/xmind-builder';

describe('End-to-End Conversion Tests', () => {
  describe('Basic Conversion Flow', () => {
    it('should successfully convert simple XMind to Canvas', async () => {
      const xmindBuffer = await createSimpleXMind();
      const { canvasData, xmindData } = await convertXMindToCanvas(xmindBuffer);

      // Verify input was correctly parsed
      expect(xmindData).toBeDefined();
      expect(xmindData.sheets).toHaveLength(1);

      // Verify output is valid Canvas data
      expect(canvasData).toBeDefined();
      expect(canvasData.nodes).toBeDefined();
      expect(canvasData.edges).toBeDefined();
    });

    it('should preserve node hierarchy in conversion result', async () => {
      const xmindBuffer = await createSimpleXMind();
      const { canvasData, xmindData } = await convertXMindToCanvas(xmindBuffer);

      // Original data: root -> child1, child2
      const rootTopic = xmindData.sheets[0].rootTopic;
      const childCount = rootTopic.children?.length || 0;

      // Canvas should have correct edge connections
      const edgesFromRoot = canvasData.edges.filter(e => e.fromNode === rootTopic.id);
      expect(edgesFromRoot.length).toBe(childCount);
    });

    it('should include all original nodes in Canvas', async () => {
      const xmindBuffer = await createSimpleXMind();
      const { canvasData, xmindData } = await convertXMindToCanvas(xmindBuffer);

      // Collect all original node IDs
      const collectIds = (node: any): string[] => {
        const ids = [node.id];
        if (node.children) {
          for (const child of node.children) {
            ids.push(...collectIds(child));
          }
        }
        return ids;
      };

      const originalIds = collectIds(xmindData.sheets[0].rootTopic);
      const canvasNodeIds = canvasData.nodes.map(n => n.id);

      // Each original node should have a corresponding Canvas node
      for (const id of originalIds) {
        expect(canvasNodeIds).toContain(id);
      }
    });
  });

  describe('Image Conversion Tests', () => {
    it('should successfully convert XMind files with images', async () => {
      const xmindBuffer = await createXMindWithImages();
      const { canvasData, xmindData } = await convertXMindToCanvas(xmindBuffer);

      // Verify images were correctly extracted
      expect(xmindData.images.size).toBeGreaterThan(0);
      expect(xmindData.images.has('test-image.png')).toBe(true);

      // Verify Canvas data was generated successfully
      expect(canvasData.nodes.length).toBeGreaterThan(0);
    });

    it('should generate file type for image nodes', async () => {
      const xmindBuffer = await createXMindWithImages();
      const { canvasData, xmindData } = await convertXMindToCanvas(xmindBuffer);

      // Find the original node with image
      const rootTopic = xmindData.sheets[0].rootTopic;
      expect(rootTopic.image).toBeDefined();

      // Corresponding Canvas node should be file type
      const canvasNode = canvasData.nodes.find(n => n.id === rootTopic.id);
      expect(canvasNode).toBeDefined();
      expect(canvasNode!.type).toBe('file');
    });

    it('should include file path in image nodes', async () => {
      const xmindBuffer = await createXMindWithImages();
      const { canvasData } = await convertXMindToCanvas(xmindBuffer);

      const fileNodes = canvasData.nodes.filter(n => n.type === 'file');
      expect(fileNodes.length).toBeGreaterThan(0);

      for (const node of fileNodes) {
        expect(node.file).toBeDefined();
        expect(node.file).toContain('test-image.png');
      }
    });

    it('should include valid binary data for image resources', async () => {
      const xmindBuffer = await createXMindWithImages();
      const { xmindData } = await convertXMindToCanvas(xmindBuffer);

      for (const [name, resource] of xmindData.images) {
        expect(resource.name).toBe(name);
        expect(resource.data).toBeDefined();
        expect(resource.data.byteLength).toBeGreaterThan(0);
        expect(resource.mimeType).toBeDefined();
      }
    });

    it('should correctly handle multiple images', async () => {
      const xmindBuffer = await createComplexXMind();
      const { canvasData, xmindData } = await convertXMindToCanvas(xmindBuffer);

      // Complex XMind has 2 images
      expect(xmindData.images.size).toBe(2);

      // Canvas should have corresponding file nodes
      const fileNodes = canvasData.nodes.filter(n => n.type === 'file');
      expect(fileNodes.length).toBe(2);
    });
  });

  describe('Complex Structure Conversion Tests', () => {
    it('should correctly handle deeply nested structures', async () => {
      const xmindBuffer = await createComplexXMind();
      const { canvasData, xmindData } = await convertXMindToCanvas(xmindBuffer);

      // Count original node count
      const countNodes = (node: any): number => {
        let count = 1;
        if (node.children) {
          for (const child of node.children) {
            count += countNodes(child);
          }
        }
        return count;
      };

      const originalNodeCount = countNodes(xmindData.sheets[0].rootTopic);
      
      // Canvas node count should be >= original (image nodes may have additional title nodes)
      expect(canvasData.nodes.length).toBeGreaterThanOrEqual(originalNodeCount);
    });

    it('should have correct edge connections', async () => {
      const xmindBuffer = await createComplexXMind();
      const { canvasData } = await convertXMindToCanvas(xmindBuffer);

      const nodeIds = new Set(canvasData.nodes.map(n => n.id));

      for (const edge of canvasData.edges) {
        // fromNode and toNode should both exist
        expect(nodeIds.has(edge.fromNode)).toBe(true);
        expect(nodeIds.has(edge.toNode)).toBe(true);

        // Should not have self-loops
        expect(edge.fromNode).not.toBe(edge.toNode);
      }
    });

    it('should not have overlapping node positions', async () => {
      const xmindBuffer = await createComplexXMind();
      const { canvasData } = await convertXMindToCanvas(xmindBuffer);

      const nodes = canvasData.nodes;
      
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          
          const noOverlap = 
            n1.x + n1.width <= n2.x ||
            n2.x + n2.width <= n1.x ||
            n1.y + n1.height <= n2.y ||
            n2.y + n2.height <= n1.y;
          
          expect(noOverlap).toBe(true);
        }
      }
    });
  });

  describe('Custom Options Tests', () => {
    it('should support custom layout direction', async () => {
      const xmindBuffer = await createSimpleXMind();
      
      const { canvasData: rightLayout } = await convertXMindToCanvas(xmindBuffer, {
        direction: 'RIGHT',
      });
      
      const { canvasData: downLayout } = await convertXMindToCanvas(xmindBuffer, {
        direction: 'DOWN',
      });

      // Both layouts should have same node count
      expect(rightLayout.nodes.length).toBe(downLayout.nodes.length);
      
      // Node positions should be different
      const rightPositions = rightLayout.nodes.map(n => `${n.x},${n.y}`).sort();
      const downPositions = downLayout.nodes.map(n => `${n.x},${n.y}`).sort();
      
      expect(rightPositions.join('|')).not.toBe(downPositions.join('|'));
    });

    it('should support custom spacing', async () => {
      const xmindBuffer = await createSimpleXMind();
      
      const { canvasData } = await convertXMindToCanvas(xmindBuffer, {
        nodeSpacing: 200,
        layerSpacing: 300,
      });

      expect(canvasData.nodes.length).toBeGreaterThan(0);
    });

    it('should support custom node dimensions', async () => {
      const xmindBuffer = await createSimpleXMind();
      
      const { canvasData } = await convertXMindToCanvas(xmindBuffer, {
        defaultNodeWidth: 300,
        defaultNodeHeight: 100,
      });

      // Nodes should use custom dimensions (or larger if text requires)
      for (const node of canvasData.nodes) {
        expect(node.width).toBeGreaterThanOrEqual(200); // minimum based on text
        expect(node.height).toBeGreaterThanOrEqual(80);
      }
    });
  });

  describe('JSON Canvas Specification Compliance', () => {
    it('should conform to JSON Canvas 1.0 specification', async () => {
      const xmindBuffer = await createComplexXMind();
      const { canvasData } = await convertXMindToCanvas(xmindBuffer);

      // Must have nodes and edges arrays
      expect(Array.isArray(canvasData.nodes)).toBe(true);
      expect(Array.isArray(canvasData.edges)).toBe(true);

      // Nodes must have required fields
      for (const node of canvasData.nodes) {
        expect(typeof node.id).toBe('string');
        expect(['text', 'file', 'link', 'group']).toContain(node.type);
        expect(typeof node.x).toBe('number');
        expect(typeof node.y).toBe('number');
        expect(typeof node.width).toBe('number');
        expect(typeof node.height).toBe('number');
        expect(node.width).toBeGreaterThan(0);
        expect(node.height).toBeGreaterThan(0);
      }

      // Edges must have required fields
      for (const edge of canvasData.edges) {
        expect(typeof edge.id).toBe('string');
        expect(typeof edge.fromNode).toBe('string');
        expect(typeof edge.toNode).toBe('string');
      }
    });

    it('should be JSON serializable', async () => {
      const xmindBuffer = await createComplexXMind();
      const { canvasData } = await convertXMindToCanvas(xmindBuffer);

      // Should not throw error
      const jsonString = JSON.stringify(canvasData, null, '\t');
      expect(typeof jsonString).toBe('string');

      // Should be deserializable
      const parsed = JSON.parse(jsonString);
      expect(parsed.nodes.length).toBe(canvasData.nodes.length);
      expect(parsed.edges.length).toBe(canvasData.edges.length);
    });

    it('should have unique node IDs', async () => {
      const xmindBuffer = await createComplexXMind();
      const { canvasData } = await convertXMindToCanvas(xmindBuffer);

      const ids = canvasData.nodes.map(n => n.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique edge IDs', async () => {
      const xmindBuffer = await createComplexXMind();
      const { canvasData } = await convertXMindToCanvas(xmindBuffer);

      const ids = canvasData.edges.map(e => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Real-World Scenario Tests', () => {
    it('should handle single-node XMind', async () => {
      const builder = new XMindBuilder();
      builder.addSheet({
        id: 'sheet-1',
        title: 'Single Node',
        rootTopic: {
          id: 'root-1',
          title: 'Just One Node',
        },
      });
      const buffer = await builder.build();

      const { canvasData } = await convertXMindToCanvas(buffer);
      expect(canvasData.nodes.length).toBe(1);
      expect(canvasData.edges.length).toBe(0);
    });

    it('should handle wide tree structure (many siblings)', async () => {
      const builder = new XMindBuilder();
      builder.addSheet({
        id: 'sheet-1',
        title: 'Wide Tree',
        rootTopic: {
          id: 'root-1',
          title: 'Root',
          children: Array.from({ length: 10 }, (_, i) => ({
            id: `child-${i}`,
            title: `Child ${i}`,
          })),
        },
      });
      const buffer = await builder.build();

      const { canvasData } = await convertXMindToCanvas(buffer);
      expect(canvasData.nodes.length).toBe(11); // root + 10 children
      expect(canvasData.edges.length).toBe(10); // 10 edges from root to children
    });

    it('should handle deep tree structure (many levels)', async () => {
      // Create a deep tree: root -> level1 -> level2 -> level3 -> level4
      const builder = new XMindBuilder();
      builder.addSheet({
        id: 'sheet-1',
        title: 'Deep Tree',
        rootTopic: {
          id: 'level-0',
          title: 'Level 0',
          children: [{
            id: 'level-1',
            title: 'Level 1',
            children: [{
              id: 'level-2',
              title: 'Level 2',
              children: [{
                id: 'level-3',
                title: 'Level 3',
                children: [{
                  id: 'level-4',
                  title: 'Level 4',
                }],
              }],
            }],
          }],
        },
      });
      const buffer = await builder.build();

      const { canvasData } = await convertXMindToCanvas(buffer);
      expect(canvasData.nodes.length).toBe(5);
      expect(canvasData.edges.length).toBe(4);
    });

    it('should handle mixed image and text nodes', async () => {
      const builder = new XMindBuilder();
      const testImage = createTestPngImage();
      
      builder.addImage('mixed-image.png', testImage);
      builder.addSheet({
        id: 'sheet-1',
        title: 'Mixed Content',
        rootTopic: {
          id: 'root-1',
          title: 'Root',
          children: [
            { id: 'text-1', title: 'Text Only' },
            { 
              id: 'image-1', 
              title: 'With Image',
              image: { src: 'mixed-image.png', width: 100, height: 80 },
            },
            { id: 'text-2', title: 'Text Again' },
          ],
        },
      });
      const buffer = await builder.build();

      const { canvasData } = await convertXMindToCanvas(buffer);
      
      const textNodes = canvasData.nodes.filter(n => n.type === 'text');
      const fileNodes = canvasData.nodes.filter(n => n.type === 'file');
      
      expect(textNodes.length).toBeGreaterThan(0);
      expect(fileNodes.length).toBe(1);
    });

    it('should handle nodes with special characters', async () => {
      const builder = new XMindBuilder();
      builder.addSheet({
        id: 'sheet-1',
        title: 'Special Characters',
        rootTopic: {
          id: 'root-1',
          title: 'Test <>&"\' emoji 🎉 😊',
          children: [
            { id: 'child-1', title: 'Code snippet: `const x = 1`' },
            { id: 'child-2', title: 'Math: a^2 + b^2 = c^2' },
            { id: 'child-3', title: 'Path: C:\\Users\\test' },
          ],
        },
      });
      const buffer = await builder.build();

      const { canvasData, xmindData } = await convertXMindToCanvas(buffer);
      
      // Verify special characters are preserved
      expect(xmindData.sheets[0].rootTopic.title).toContain('Test');
      expect(xmindData.sheets[0].rootTopic.title).toContain('🎉');
      
      // Verify Canvas node contains correct text
      const rootNode = canvasData.nodes.find(n => n.id === 'root-1');
      expect(rootNode?.text).toContain('Test');
    });
  });

  describe('Performance Tests', () => {
    it('should process large XMind files within reasonable time', async () => {
      // Create a larger tree
      const children = Array.from({ length: 20 }, (_, i) => ({
        id: `branch-${i}`,
        title: `Branch ${i}`,
        children: Array.from({ length: 5 }, (_, j) => ({
          id: `leaf-${i}-${j}`,
          title: `Leaf ${i}-${j}`,
        })),
      }));

      const builder = new XMindBuilder();
      builder.addSheet({
        id: 'sheet-1',
        title: 'Large Tree',
        rootTopic: {
          id: 'root-1',
          title: 'Root',
          children,
        },
      });
      const buffer = await builder.build();

      const startTime = Date.now();
      const { canvasData } = await convertXMindToCanvas(buffer);
      const endTime = Date.now();

      // Should complete in less than 5 seconds
      expect(endTime - startTime).toBeLessThan(5000);
      
      // Should have correct node count: 1 (root) + 20 (branches) + 100 (leaves)
      expect(canvasData.nodes.length).toBe(121);
    });
  });
});

