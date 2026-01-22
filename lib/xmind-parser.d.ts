import { XMindWorkbook } from './types';
/**
 * XMind file parser - parses .xmind files (which are ZIP archives)
 */
export declare class XMindParser {
    /**
     * Parse XMind file from ArrayBuffer
     */
    parse(arrayBuffer: ArrayBuffer): Promise<XMindWorkbook>;
    /**
     * Extract images from the resources folder in the XMind ZIP
     */
    private extractImages;
    /**
     * Get MIME type from filename
     */
    private getMimeType;
    /**
     * Extract nodes from XMind topic recursively
     */
    private extractNodes;
    /**
     * Generate unique ID
     */
    private generateId;
}
//# sourceMappingURL=xmind-parser.d.ts.map