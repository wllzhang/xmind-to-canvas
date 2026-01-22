# API Documentation

Complete API reference for `xmind-to-canvas` npm package.

## Installation

```bash
npm install xmind-to-canvas
```

## Quick Start

```javascript
import { convertXMindToCanvas } from 'xmind-to-canvas';
import fs from 'fs/promises';

const xmindBuffer = await fs.readFile('example.xmind');
const { canvasData } = await convertXMindToCanvas(xmindBuffer);
await fs.writeFile('example.canvas', JSON.stringify(canvasData, null, 2));
```

## API Reference

### Functions

#### `convertXMindToCanvas(arrayBuffer, options?)`

Convenience function that converts XMind file to Canvas format in one step.

**Parameters:**
- `arrayBuffer: ArrayBuffer` - The XMind file as an ArrayBuffer
- `options?: Partial<ConversionOptions>` - Optional conversion options (see [ConversionOptions](#conversionoptions))

**Returns:** `Promise<{ canvasData: CanvasData; xmindData: XMindWorkbook }>`

**Example:**
```javascript
import { convertXMindToCanvas } from 'xmind-to-canvas';

const buffer = await fs.readFile('example.xmind');
const { canvasData, xmindData } = await convertXMindToCanvas(buffer, {
  layoutAlgorithm: 'mrtree',
  direction: 'RIGHT'
});
```

---

### Classes

#### `XMindParser`

Parses XMind files and extracts workbook data.

**Methods:**

##### `parse(arrayBuffer: ArrayBuffer): Promise<XMindWorkbook>`

Parses an XMind file from an ArrayBuffer.

**Parameters:**
- `arrayBuffer: ArrayBuffer` - The XMind file as an ArrayBuffer

**Returns:** `Promise<XMindWorkbook>` - Parsed XMind workbook data

**Example:**
```javascript
import { XMindParser } from 'xmind-to-canvas';

const parser = new XMindParser();
const xmindData = await parser.parse(arrayBuffer);
console.log(xmindData.sheets); // Array of sheets
console.log(xmindData.images); // Map of image resources
```

**Throws:**
- `Error` if the file is not a valid XMind file
- `Error` if content.json or content.xml is not found
- `Error` if XML format is used (only JSON format is supported)

---

#### `LayoutCalculator`

Calculates node positions using the ELK layout engine.

**Constructor:**
```javascript
const calculator = new LayoutCalculator();
```

**Methods:**

##### `calculate(xmindData: XMindWorkbook, options: ConversionOptions): Promise<ElkNode>`

Calculates layout positions for XMind data.

**Parameters:**
- `xmindData: XMindWorkbook` - Parsed XMind workbook data
- `options: ConversionOptions` - Layout options (see [ConversionOptions](#conversionoptions))

**Returns:** `Promise<ElkNode>` - Layouted graph with node positions

**Example:**
```javascript
import { LayoutCalculator } from 'xmind-to-canvas';

const calculator = new LayoutCalculator();
const layoutData = await calculator.calculate(xmindData, {
  layoutAlgorithm: 'layered',
  direction: 'DOWN',
  nodeSpacing: 60
});
```

**Throws:**
- `Error` if no sheets are found in the workbook
- `Error` if layout calculation fails

---

#### `CanvasGenerator`

Generates JSON Canvas data from layouted graph.

**Constructor:**
```javascript
const generator = new CanvasGenerator();
```

**Methods:**

##### `setImagePathGenerator(generator: ImagePathGenerator): void`

Sets a custom function for generating image paths in the canvas.

**Parameters:**
- `generator: ImagePathGenerator` - Function that takes image name and returns path

**Example:**
```javascript
const generator = new CanvasGenerator();
generator.setImagePathGenerator((imageName) => {
  return `/assets/images/${imageName}`;
});
```

##### `generate(layoutedGraph: ElkNode): CanvasData`

Generates Canvas data from a layouted ELK graph.

**Parameters:**
- `layoutedGraph: ElkNode` - Layouted graph from LayoutCalculator

**Returns:** `CanvasData` - Canvas data with nodes and edges

**Example:**
```javascript
const generator = new CanvasGenerator();
const canvasData = generator.generate(layoutData);
console.log(canvasData.nodes); // Array of canvas nodes
console.log(canvasData.edges); // Array of canvas edges
```

---

## Type Definitions

### `ConversionOptions`

Options for controlling the conversion process.

```typescript
interface ConversionOptions {
  layoutAlgorithm?: 'layered' | 'mrtree';
  direction?: 'RIGHT' | 'LEFT' | 'DOWN' | 'UP';
  nodeSpacing?: number;
  layerSpacing?: number;
  defaultNodeWidth?: number;
  defaultNodeHeight?: number;
}
```

**Properties:**
- `layoutAlgorithm?: 'layered' | 'mrtree'` - Layout algorithm to use
  - `'layered'`: Hierarchical layered layout (good for tree structures)
  - `'mrtree'`: Minimum spanning tree layout (default, good for mind maps)
- `direction?: 'RIGHT' | 'LEFT' | 'DOWN' | 'UP'` - Direction of the layout (default: `'RIGHT'`)
- `nodeSpacing?: number` - Spacing between nodes in pixels (default: `80`)
- `layerSpacing?: number` - Spacing between layers in pixels (default: `150`)
- `defaultNodeWidth?: number` - Default width for nodes in pixels (default: `200`)
- `defaultNodeHeight?: number` - Default height for nodes in pixels (default: `80`)

**Default Options:**
```javascript
const DEFAULT_OPTIONS = {
  layoutAlgorithm: 'mrtree',
  direction: 'RIGHT',
  nodeSpacing: 80,
  layerSpacing: 150,
  defaultNodeWidth: 200,
  defaultNodeHeight: 80,
};
```

---

### `XMindWorkbook`

Parsed XMind workbook structure.

```typescript
interface XMindWorkbook {
  sheets: XMindSheet[];
  images: Map<string, ImageResource>;
}
```

**Properties:**
- `sheets: XMindSheet[]` - Array of sheets in the workbook
- `images: Map<string, ImageResource>` - Map of image resources (key: filename, value: image data)

---

### `XMindSheet`

A single sheet in an XMind workbook.

```typescript
interface XMindSheet {
  id: string;
  title: string;
  rootTopic: XMindNode;
}
```

---

### `XMindNode`

A node in the XMind mind map tree.

```typescript
interface XMindNode {
  id: string;
  title: string;
  children?: XMindNode[];
  notes?: string;
  labels?: string[];
  markers?: string[];
  image?: XMindImage;
}
```

**Properties:**
- `id: string` - Unique identifier for the node
- `title: string` - Node title/text
- `children?: XMindNode[]` - Child nodes
- `notes?: string` - Notes attached to the node
- `labels?: string[]` - Labels/tags
- `markers?: string[]` - Markers/icons
- `image?: XMindImage` - Image attached to the node

---

### `XMindImage`

Image information in an XMind node.

```typescript
interface XMindImage {
  src: string;       // e.g., "xap:resources/image.png"
  width?: number;
  height?: number;
}
```

---

### `ImageResource`

Extracted image resource from XMind file.

```typescript
interface ImageResource {
  name: string;      // filename in resources folder
  data: ArrayBuffer; // binary image data
  mimeType: string;  // e.g., "image/png"
}
```

---

### `CanvasData`

JSON Canvas format data structure.

```typescript
interface CanvasData {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}
```

---

### `CanvasNode`

A node in the JSON Canvas format.

```typescript
interface CanvasNode {
  id: string;
  type: 'text' | 'file' | 'link' | 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  text?: string;
  file?: string;
  url?: string;
}
```

**Properties:**
- `id: string` - Unique identifier
- `type: 'text' | 'file' | 'link' | 'group'` - Node type
- `x: number` - X coordinate
- `y: number` - Y coordinate
- `width: number` - Node width
- `height: number` - Node height
- `color?: string` - Optional color
- `text?: string` - Text content (for text nodes)
- `file?: string` - File path (for file nodes)
- `url?: string` - URL (for link nodes)

---

### `CanvasEdge`

An edge connecting two nodes in the JSON Canvas format.

```typescript
interface CanvasEdge {
  id: string;
  fromNode: string;
  toNode: string;
  fromSide?: 'top' | 'right' | 'bottom' | 'left';
  toSide?: 'top' | 'right' | 'bottom' | 'left';
  color?: string;
  label?: string;
}
```

**Properties:**
- `id: string` - Unique identifier
- `fromNode: string` - Source node ID
- `toNode: string` - Target node ID
- `fromSide?: 'top' | 'right' | 'bottom' | 'left'` - Connection side on source node
- `toSide?: 'top' | 'right' | 'bottom' | 'left'` - Connection side on target node
- `color?: string` - Optional edge color
- `label?: string` - Optional edge label

---

### `ImagePathGenerator`

Function type for custom image path generation.

```typescript
type ImagePathGenerator = (imageName: string) => string;
```

---

## Usage Examples

### Basic Conversion

```javascript
import { convertXMindToCanvas } from 'xmind-to-canvas';
import fs from 'fs/promises';

async function convert() {
  const buffer = await fs.readFile('example.xmind');
  const { canvasData } = await convertXMindToCanvas(buffer);
  await fs.writeFile('example.canvas', JSON.stringify(canvasData, null, 2));
}
```

### Custom Layout Options

```javascript
import { convertXMindToCanvas } from 'xmind-to-canvas';

const { canvasData } = await convertXMindToCanvas(buffer, {
  layoutAlgorithm: 'layered',
  direction: 'DOWN',
  nodeSpacing: 100,
  layerSpacing: 200,
  defaultNodeWidth: 250,
  defaultNodeHeight: 100
});
```

### Step-by-Step Conversion

```javascript
import {
  XMindParser,
  LayoutCalculator,
  CanvasGenerator
} from 'xmind-to-canvas';

const parser = new XMindParser();
const layoutCalculator = new LayoutCalculator();
const canvasGenerator = new CanvasGenerator();

// Step 1: Parse XMind file
const xmindData = await parser.parse(arrayBuffer);

// Step 2: Calculate layout
const layoutData = await layoutCalculator.calculate(xmindData, {
  direction: 'RIGHT',
  nodeSpacing: 80
});

// Step 3: Generate Canvas data
const canvasData = canvasGenerator.generate(layoutData);
```

### Custom Image Path Generation

```javascript
import {
  XMindParser,
  LayoutCalculator,
  CanvasGenerator
} from 'xmind-to-canvas';

const parser = new XMindParser();
const layoutCalculator = new LayoutCalculator();
const canvasGenerator = new CanvasGenerator();

// Set custom image path generator
canvasGenerator.setImagePathGenerator((imageName) => {
  // Convert image name to your desired path format
  return `assets/${imageName}`;
});

const xmindData = await parser.parse(buffer);
const layoutData = await layoutCalculator.calculate(xmindData, {});
const canvasData = canvasGenerator.generate(layoutData);
```

### TypeScript Usage

```typescript
import {
  convertXMindToCanvas,
  type CanvasData,
  type XMindWorkbook,
  type ConversionOptions
} from 'xmind-to-canvas';
import fs from 'fs/promises';

async function convert(
  inputPath: string,
  outputPath: string,
  options?: Partial<ConversionOptions>
): Promise<void> {
  const buffer = await fs.readFile(inputPath);
  const { canvasData, xmindData }: {
    canvasData: CanvasData;
    xmindData: XMindWorkbook;
  } = await convertXMindToCanvas(buffer, options);
  
  await fs.writeFile(outputPath, JSON.stringify(canvasData, null, 2));
}
```

### CommonJS Usage

```javascript
const { convertXMindToCanvas } = require('xmind-to-canvas');
const fs = require('fs/promises');

async function convert() {
  const buffer = await fs.readFile('example.xmind');
  const { canvasData } = await convertXMindToCanvas(buffer);
  await fs.writeFile('example.canvas', JSON.stringify(canvasData, null, 2));
}
```

---

## Error Handling

All methods may throw errors. Always wrap calls in try-catch blocks:

```javascript
import { convertXMindToCanvas } from 'xmind-to-canvas';

try {
  const { canvasData } = await convertXMindToCanvas(buffer);
  // Use canvasData
} catch (error) {
  console.error('Conversion failed:', error.message);
}
```

Common errors:
- `"No content.json or content.xml found in XMind file"` - Invalid XMind file
- `"XML format (.xmind) is not yet supported"` - Only JSON format (XMind Zen) is supported
- `"No sheets found in XMind file"` - Empty or invalid workbook
- `"Failed to calculate layout: ..."` - Layout calculation error

---

## Browser Usage

The package can also be used in browsers with bundlers (Webpack, Vite, etc.):

```javascript
import { convertXMindToCanvas } from 'xmind-to-canvas';

// Read file from file input
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const arrayBuffer = await file.arrayBuffer();
  const { canvasData } = await convertXMindToCanvas(arrayBuffer);
  
  // Download as .canvas file
  const blob = new Blob([JSON.stringify(canvasData, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'output.canvas';
  a.click();
});
```

---

## Related Links

- [JSON Canvas Specification](https://github.com/obsidianmd/jsoncanvas)
- [ELK Layout Engine](https://www.eclipse.org/elk/)
- [Project Repository](https://github.com/wllzhang/xmind-to-canvas)

