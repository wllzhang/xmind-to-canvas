/**
 * XMind Test Fixture Builder
 * Utility class to create XMind files for testing
 */

import JSZip from 'jszip';

export interface TestXMindNode {
  id: string;
  title: string;
  children?: TestXMindNode[];
  notes?: string;
  labels?: string[];
  image?: {
    src: string;
    width?: number;
    height?: number;
  };
}

export interface TestXMindSheet {
  id: string;
  title: string;
  rootTopic: TestXMindNode;
}

export interface TestImage {
  name: string;
  data: ArrayBuffer;
  mimeType: string;
}

/**
 * Build a simple test XMind file
 */
export class XMindBuilder {
  private sheets: any[] = [];
  private images: Map<string, ArrayBuffer> = new Map();

  /**
   * Add a sheet with root topic
   */
  addSheet(sheet: TestXMindSheet): XMindBuilder {
    const sheetData = {
      id: sheet.id,
      title: sheet.title,
      rootTopic: this.buildTopic(sheet.rootTopic),
    };
    this.sheets.push(sheetData);
    return this;
  }

  /**
   * Add an image resource
   */
  addImage(name: string, data: ArrayBuffer): XMindBuilder {
    this.images.set(name, data);
    return this;
  }

  /**
   * Build topic structure for XMind format
   */
  private buildTopic(node: TestXMindNode): any {
    const topic: any = {
      id: node.id,
      title: node.title,
    };

    if (node.notes) {
      topic.notes = { plain: node.notes };
    }

    if (node.labels && node.labels.length > 0) {
      topic.labels = node.labels;
    }

    if (node.image) {
      topic.image = {
        src: `xap:resources/${node.image.src}`,
        width: node.image.width || 200,
        height: node.image.height || 150,
      };
    }

    if (node.children && node.children.length > 0) {
      topic.children = {
        attached: node.children.map(child => this.buildTopic(child)),
      };
    }

    return topic;
  }

  /**
   * Generate the XMind file as ArrayBuffer
   */
  async build(): Promise<ArrayBuffer> {
    const zip = new JSZip();

    // Add content.json
    const contentJson = JSON.stringify(this.sheets, null, 2);
    zip.file('content.json', contentJson);

    // Add images to resources folder
    for (const [name, data] of this.images) {
      zip.file(`resources/${name}`, data);
    }

    // Add metadata.json (minimal)
    const metadata = { creator: { name: 'XMind Builder Test' } };
    zip.file('metadata.json', JSON.stringify(metadata));

    // Generate ZIP file
    const arrayBuffer = await zip.generateAsync({ type: 'arraybuffer' });
    return arrayBuffer;
  }
}

/**
 * Create a simple 1x1 pixel PNG image for testing
 */
export function createTestPngImage(): ArrayBuffer {
  // Minimal valid 1x1 red PNG (base64 decoded)
  const pngBase64 = 
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  
  const binaryString = atob(pngBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Create a simple test XMind with a single node
 */
export async function createSimpleXMind(): Promise<ArrayBuffer> {
  const builder = new XMindBuilder();
  
  builder.addSheet({
    id: 'sheet-1',
    title: 'Test Sheet',
    rootTopic: {
      id: 'root-1',
      title: 'Root Topic',
      children: [
        { id: 'child-1', title: 'Child 1' },
        { id: 'child-2', title: 'Child 2' },
      ],
    },
  });

  return builder.build();
}

/**
 * Create a test XMind with images
 */
export async function createXMindWithImages(): Promise<ArrayBuffer> {
  const builder = new XMindBuilder();
  const testImage = createTestPngImage();
  
  // Add the test image
  builder.addImage('test-image.png', testImage);
  
  builder.addSheet({
    id: 'sheet-1',
    title: 'Test Sheet with Images',
    rootTopic: {
      id: 'root-1',
      title: 'Root Topic',
      image: {
        src: 'test-image.png',
        width: 200,
        height: 150,
      },
      children: [
        { 
          id: 'child-1', 
          title: 'Text Child',
        },
        { 
          id: 'child-2', 
          title: 'Image Child',
          image: {
            src: 'test-image.png',
            width: 100,
            height: 80,
          },
        },
      ],
    },
  });

  return builder.build();
}

/**
 * Create a complex XMind with multiple levels, images, notes, and labels
 */
export async function createComplexXMind(): Promise<ArrayBuffer> {
  const builder = new XMindBuilder();
  const testImage1 = createTestPngImage();
  const testImage2 = createTestPngImage();
  
  // Add images
  builder.addImage('image1.png', testImage1);
  builder.addImage('image2.png', testImage2);
  
  builder.addSheet({
    id: 'sheet-1',
    title: 'Complex Mind Map',
    rootTopic: {
      id: 'root-1',
      title: 'Project Overview',
      notes: 'This is the root topic with notes',
      labels: ['important'],
      children: [
        {
          id: 'branch-1',
          title: 'Development',
          image: { src: 'image1.png', width: 150, height: 100 },
          children: [
            { id: 'dev-1', title: 'Frontend', labels: ['react'] },
            { id: 'dev-2', title: 'Backend', labels: ['nodejs'] },
            { 
              id: 'dev-3', 
              title: 'Database',
              children: [
                { id: 'db-1', title: 'PostgreSQL' },
                { id: 'db-2', title: 'Redis' },
              ],
            },
          ],
        },
        {
          id: 'branch-2',
          title: 'Design',
          children: [
            { 
              id: 'design-1', 
              title: 'UI/UX',
              image: { src: 'image2.png', width: 200, height: 120 },
            },
            { id: 'design-2', title: 'Branding' },
          ],
        },
        {
          id: 'branch-3',
          title: 'Testing',
          notes: 'All testing related tasks',
          children: [
            { id: 'test-1', title: 'Unit Tests' },
            { id: 'test-2', title: 'Integration Tests' },
            { id: 'test-3', title: 'E2E Tests' },
          ],
        },
      ],
    },
  });

  return builder.build();
}

