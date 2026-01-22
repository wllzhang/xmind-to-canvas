/**
 * XMind to Canvas Core
 * Shared logic for parsing XMind files and generating Canvas data
 */

// Export types
export * from './types';

// Export classes
export { XMindParser } from './xmind-parser';
export { LayoutCalculator } from './layout-calculator';
export type { ExtendedElkNode } from './layout-calculator';
export { CanvasGenerator } from './canvas-generator';
export type { ImagePathGenerator } from './canvas-generator';

// Convenience function for quick conversion
import { XMindParser } from './xmind-parser';
import { LayoutCalculator } from './layout-calculator';
import { CanvasGenerator } from './canvas-generator';
import { ConversionOptions, CanvasData, XMindWorkbook, DEFAULT_OPTIONS } from './types';

/**
 * Convert XMind ArrayBuffer to Canvas data in one step
 */
export async function convertXMindToCanvas(
  arrayBuffer: ArrayBuffer,
  options?: Partial<ConversionOptions>
): Promise<{ canvasData: CanvasData; xmindData: XMindWorkbook }> {
  const parser = new XMindParser();
  const layoutCalculator = new LayoutCalculator();
  const canvasGenerator = new CanvasGenerator();

  const mergedOptions: ConversionOptions = { ...DEFAULT_OPTIONS, ...options };

  // Parse XMind file
  const xmindData = await parser.parse(arrayBuffer);

  // Calculate layout
  const layoutData = await layoutCalculator.calculate(xmindData, mergedOptions);

  // Generate Canvas data
  const canvasData = canvasGenerator.generate(layoutData);

  return { canvasData, xmindData };
}

