/**
 * XMind to Canvas Core
 * Shared logic for parsing XMind files and generating Canvas data
 */
export * from './types';
export { XMindParser } from './xmind-parser';
export { LayoutCalculator } from './layout-calculator';
export type { ExtendedElkNode } from './layout-calculator';
export { CanvasGenerator } from './canvas-generator';
export type { ImagePathGenerator } from './canvas-generator';
import { ConversionOptions, CanvasData, XMindWorkbook } from './types';
/**
 * Convert XMind ArrayBuffer to Canvas data in one step
 */
export declare function convertXMindToCanvas(arrayBuffer: ArrayBuffer, options?: Partial<ConversionOptions>): Promise<{
    canvasData: CanvasData;
    xmindData: XMindWorkbook;
}>;
//# sourceMappingURL=index.d.ts.map