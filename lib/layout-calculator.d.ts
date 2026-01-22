import { ElkNode } from 'elkjs/lib/elk.bundled';
import { XMindWorkbook, ConversionOptions } from './types';
/**
 * Extended ELK node with image properties
 */
export interface ExtendedElkNode extends ElkNode {
    hasImage?: boolean;
    imageSrc?: string;
    imageWidth?: number;
    imageHeight?: number;
}
/**
 * Layout calculator using ELK.js
 */
export declare class LayoutCalculator {
    private elk;
    constructor();
    /**
     * Calculate layout for XMind data
     */
    calculate(xmindData: XMindWorkbook, options: ConversionOptions): Promise<ElkNode>;
    /**
     * Convert XMind node tree to ELK graph structure
     */
    private convertToELKGraph;
    /**
     * Flatten XMind node tree into nodes and edges arrays
     */
    private flattenNodeTree;
}
//# sourceMappingURL=layout-calculator.d.ts.map