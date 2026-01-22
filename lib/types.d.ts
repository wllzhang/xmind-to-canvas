/**
 * Type definitions for XMind to Canvas conversion
 */
export interface XMindImage {
    src: string;
    width?: number;
    height?: number;
}
export interface ImageResource {
    name: string;
    data: ArrayBuffer;
    mimeType: string;
}
export interface XMindNode {
    id: string;
    title: string;
    children?: XMindNode[];
    notes?: string;
    labels?: string[];
    markers?: string[];
    image?: XMindImage;
}
export interface XMindSheet {
    id: string;
    title: string;
    rootTopic: XMindNode;
}
export interface XMindWorkbook {
    sheets: XMindSheet[];
    images: Map<string, ImageResource>;
}
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
export interface ConversionOptions {
    layoutAlgorithm?: 'layered' | 'mrtree';
    direction?: 'RIGHT' | 'LEFT' | 'DOWN' | 'UP';
    nodeSpacing?: number;
    layerSpacing?: number;
    defaultNodeWidth?: number;
    defaultNodeHeight?: number;
}
export declare const DEFAULT_OPTIONS: ConversionOptions;
//# sourceMappingURL=types.d.ts.map