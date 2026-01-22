/**
 * XMind Parser Tests
 * Black-box tests for XMind file parsing functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { XMindParser } from '../src/core/xmind-parser';
import { 
  createSimpleXMind, 
  createXMindWithImages, 
  createComplexXMind,
  XMindBuilder,
  createTestPngImage,
} from './fixtures/xmind-builder';

describe('XMindParser', () => {
  let parser: XMindParser;

  beforeEach(() => {
    parser = new XMindParser();
  });

  describe('Basic Parsing', () => {
    it('should correctly parse a simple XMind file', async () => {
      const xmindBuffer = await createSimpleXMind();
      const result = await parser.parse(xmindBuffer);

      expect(result).toBeDefined();
      expect(result.sheets).toHaveLength(1);
      expect(result.sheets[0].title).toBe('Test Sheet');
      expect(result.sheets[0].rootTopic.title).toBe('Root Topic');
    });

    it('should correctly parse child nodes of root topic', async () => {
      const xmindBuffer = await createSimpleXMind();
      const result = await parser.parse(xmindBuffer);

      const rootTopic = result.sheets[0].rootTopic;
      expect(rootTopic.children).toHaveLength(2);
      expect(rootTopic.children![0].title).toBe('Child 1');
      expect(rootTopic.children![1].title).toBe('Child 2');
    });

    it('should generate unique IDs for each node', async () => {
      const xmindBuffer = await createSimpleXMind();
      const result = await parser.parse(xmindBuffer);

      const rootTopic = result.sheets[0].rootTopic;
      expect(rootTopic.id).toBeDefined();
      expect(rootTopic.children![0].id).toBeDefined();
      expect(rootTopic.children![1].id).toBeDefined();
      
      // IDs should be unique
      const ids = [rootTopic.id, rootTopic.children![0].id, rootTopic.children![1].id];
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Image Parsing', () => {
    it('should correctly extract image resources from XMind', async () => {
      const xmindBuffer = await createXMindWithImages();
      const result = await parser.parse(xmindBuffer);

      expect(result.images).toBeDefined();
      expect(result.images.size).toBeGreaterThan(0);
      expect(result.images.has('test-image.png')).toBe(true);
    });

    it('should correctly parse node image properties', async () => {
      const xmindBuffer = await createXMindWithImages();
      const result = await parser.parse(xmindBuffer);

      const rootTopic = result.sheets[0].rootTopic;
      expect(rootTopic.image).toBeDefined();
      expect(rootTopic.image!.src).toBe('test-image.png');
      expect(rootTopic.image!.width).toBe(200);
      expect(rootTopic.image!.height).toBe(150);
    });

    it('should correctly parse child node images', async () => {
      const xmindBuffer = await createXMindWithImages();
      const result = await parser.parse(xmindBuffer);

      const imageChild = result.sheets[0].rootTopic.children![1];
      expect(imageChild.image).toBeDefined();
      expect(imageChild.image!.src).toBe('test-image.png');
      expect(imageChild.image!.width).toBe(100);
      expect(imageChild.image!.height).toBe(80);
    });

    it('should include correct MIME type for image resources', async () => {
      const xmindBuffer = await createXMindWithImages();
      const result = await parser.parse(xmindBuffer);

      const imageResource = result.images.get('test-image.png');
      expect(imageResource).toBeDefined();
      expect(imageResource!.mimeType).toBe('image/png');
      expect(imageResource!.data).toBeDefined();
      expect(imageResource!.data.byteLength).toBeGreaterThan(0);
    });
  });

  describe('Complex Structure Parsing', () => {
    it('should correctly parse deeply nested structures', async () => {
      const xmindBuffer = await createComplexXMind();
      const result = await parser.parse(xmindBuffer);

      const rootTopic = result.sheets[0].rootTopic;
      expect(rootTopic.children).toHaveLength(3);
      
      // Check nested children
      const devBranch = rootTopic.children![0];
      expect(devBranch.title).toBe('Development');
      expect(devBranch.children).toHaveLength(3);
      
      // Check deep nesting
      const dbBranch = devBranch.children![2];
      expect(dbBranch.title).toBe('Database');
      expect(dbBranch.children).toHaveLength(2);
      expect(dbBranch.children![0].title).toBe('PostgreSQL');
    });

    it('should correctly parse node notes', async () => {
      const xmindBuffer = await createComplexXMind();
      const result = await parser.parse(xmindBuffer);

      const rootTopic = result.sheets[0].rootTopic;
      expect(rootTopic.notes).toBe('This is the root topic with notes');

      const testBranch = rootTopic.children![2];
      expect(testBranch.notes).toBe('All testing related tasks');
    });

    it('should correctly parse node labels', async () => {
      const xmindBuffer = await createComplexXMind();
      const result = await parser.parse(xmindBuffer);

      const rootTopic = result.sheets[0].rootTopic;
      expect(rootTopic.labels).toContain('important');

      const devBranch = rootTopic.children![0];
      const frontendNode = devBranch.children![0];
      expect(frontendNode.labels).toContain('react');
    });

    it('should extract all image resources', async () => {
      const xmindBuffer = await createComplexXMind();
      const result = await parser.parse(xmindBuffer);

      expect(result.images.size).toBe(2);
      expect(result.images.has('image1.png')).toBe(true);
      expect(result.images.has('image2.png')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should reject invalid ZIP files', async () => {
      const invalidBuffer = new ArrayBuffer(100);
      
      await expect(parser.parse(invalidBuffer)).rejects.toThrow();
    });

    it('should reject ZIP files without content.json', async () => {
      // Create a ZIP without content.json
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      zip.file('random.txt', 'some content');
      const buffer = await zip.generateAsync({ type: 'arraybuffer' });
      
      await expect(parser.parse(buffer)).rejects.toThrow('No content.json or content.xml found');
    });

    it('should handle empty sheets array', async () => {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      zip.file('content.json', JSON.stringify([]));
      const buffer = await zip.generateAsync({ type: 'arraybuffer' });
      
      await expect(parser.parse(buffer)).rejects.toThrow('No valid sheets found');
    });
  });

  describe('Edge Cases', () => {
    it('should handle root node without children', async () => {
      const builder = new XMindBuilder();
      builder.addSheet({
        id: 'sheet-1',
        title: 'Sheet',
        rootTopic: {
          id: 'root-1',
          title: 'Lonely Root',
        },
      });
      const buffer = await builder.build();
      
      const result = await parser.parse(buffer);
      expect(result.sheets[0].rootTopic.children).toEqual([]);
    });

    it('should handle XMind files without images', async () => {
      const buffer = await createSimpleXMind();
      const result = await parser.parse(buffer);
      
      expect(result.images.size).toBe(0);
    });

    it('should handle long titles', async () => {
      const longTitle = 'A'.repeat(1000);
      const builder = new XMindBuilder();
      builder.addSheet({
        id: 'sheet-1',
        title: 'Sheet',
        rootTopic: {
          id: 'root-1',
          title: longTitle,
        },
      });
      const buffer = await builder.build();
      
      const result = await parser.parse(buffer);
      expect(result.sheets[0].rootTopic.title).toBe(longTitle);
    });

    it('should handle special characters', async () => {
      const specialTitle = 'Test<>&"\' Chinese emoji 🎉';
      const builder = new XMindBuilder();
      builder.addSheet({
        id: 'sheet-1',
        title: 'Sheet',
        rootTopic: {
          id: 'root-1',
          title: specialTitle,
        },
      });
      const buffer = await builder.build();
      
      const result = await parser.parse(buffer);
      expect(result.sheets[0].rootTopic.title).toBe(specialTitle);
    });
  });
});

