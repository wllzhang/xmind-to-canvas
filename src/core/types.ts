/**
 * Type definitions for XMind to Canvas conversion
 */

// XMind image data
export interface XMindImage {
  src: string;       // e.g., "xap:resources/image.png"
  width?: number;
  height?: number;
}

// Extracted image resource
export interface ImageResource {
  name: string;      // filename in resources folder
  data: ArrayBuffer; // binary image data
  mimeType: string;  // e.g., "image/png"
}

// XMind data structures
export interface XMindNode {
  id: string;
  title: string;
  children?: XMindNode[];
  notes?: string;
  labels?: string[];
  markers?: string[];
  image?: XMindImage;  // image attached to this node
}

export interface XMindSheet {
  id: string;
  title: string;
  rootTopic: XMindNode;
}

export interface XMindWorkbook {
  sheets: XMindSheet[];
  images: Map<string, ImageResource>;  // map of resource name to image data
}

// JSON Canvas data structures (based on https://jsoncanvas.org/spec/1.0/)
export interface CanvasNode {
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

export interface CanvasEdge {
  id: string;
  fromNode: string;
  toNode: string;
  fromSide?: 'top' | 'right' | 'bottom' | 'left';
  toSide?: 'top' | 'right' | 'bottom' | 'left';
  color?: string;
  label?: string;
}

export interface CanvasData {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

// ELK layout structures
export interface ELKNode {
  id: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  children?: ELKNode[];
}

export interface ELKEdge {
  id: string;
  sources: string[];
  targets: string[];
}

export interface ELKGraph {
  id: string;
  layoutOptions?: Record<string, string>;
  children: ELKNode[];
  edges: ELKEdge[];
}

// Conversion options
export interface ConversionOptions {
  layoutAlgorithm?: 'layered' | 'mrtree';
  direction?: 'RIGHT' | 'LEFT' | 'DOWN' | 'UP';
  nodeSpacing?: number;
  layerSpacing?: number;
  defaultNodeWidth?: number;
  defaultNodeHeight?: number;
}

// Default conversion options
export const DEFAULT_OPTIONS: ConversionOptions = {
  layoutAlgorithm: 'mrtree',
  direction: 'RIGHT',
  nodeSpacing: 80,
  layerSpacing: 150,
  defaultNodeWidth: 200,
  defaultNodeHeight: 80,
};

