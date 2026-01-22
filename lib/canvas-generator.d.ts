import { CanvasData } from './types';
import { ElkNode } from 'elkjs/lib/elk.bundled';
export type ImagePathGenerator = (imageName: string) => string;
/**
 * JSON Canvas generator
 */
export declare class CanvasGenerator {
    private imagePathGenerator;
    /**
     * Set a custom image path generator
     * This allows customizing how image paths are resolved in the canvas
     */
    setImagePathGenerator(generator: ImagePathGenerator): void;
    /**
     * Generate Canvas data from layouted ELK graph
     */
    generate(layoutedGraph: ElkNode): CanvasData;
    /**
     * Convert ELK node to Canvas node(s)
     * Returns an array because a node with image may create both a text node and an image node
     */
    private convertNode;
    /**
     * Convert ELK edge to Canvas edge
     */
    private convertEdge;
}
//# sourceMappingURL=canvas-generator.d.ts.map