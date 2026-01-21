import { Plugin, TFile, Notice, Menu } from 'obsidian';
import { XMindParser } from './xmind-parser';
import { LayoutCalculator } from './layout-calculator';
import { CanvasGenerator } from './canvas-generator';
import { ConversionOptions } from './types';

export default class XMindToCanvasPlugin extends Plugin {
  private xmindParser: XMindParser;
  private layoutCalculator: LayoutCalculator;
  private canvasGenerator: CanvasGenerator;

  async onload() {
    console.log('Loading XMind to Canvas plugin');

    // Initialize components
    this.xmindParser = new XMindParser();
    this.layoutCalculator = new LayoutCalculator();
    this.canvasGenerator = new CanvasGenerator();

    // Add command to convert XMind file
    this.addCommand({
      id: 'convert-xmind-to-canvas',
      name: 'Convert XMind to Canvas',
      callback: () => this.selectAndConvertXMindFile(),
    });

    // Register file menu event
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu: Menu, file: TFile) => {
        if (file.extension === 'xmind') {
          menu.addItem((item) => {
            item
              .setTitle('Convert to Canvas')
              .setIcon('canvas')
              .onClick(async () => {
                await this.convertXMindFile(file);
              });
          });
        }
      })
    );

    console.log('XMind to Canvas plugin loaded');
  }

  onunload() {
    console.log('Unloading XMind to Canvas plugin');
  }

  /**
   * Show file selector and convert selected XMind file
   */
  private async selectAndConvertXMindFile() {
    // Get all XMind files in the vault
    const xmindFiles = this.app.vault.getFiles().filter(
      (file) => file.extension === 'xmind'
    );

    if (xmindFiles.length === 0) {
      new Notice('No XMind files found in vault');
      return;
    }

    // For now, just convert the first one (TODO: add file picker UI)
    if (xmindFiles.length === 1) {
      await this.convertXMindFile(xmindFiles[0]);
    } else {
      new Notice(`Found ${xmindFiles.length} XMind files. Please use right-click menu on specific file.`);
    }
  }

  /**
   * Convert a XMind file to Canvas format
   */
  private async convertXMindFile(file: TFile) {
    try {
      new Notice(`Converting ${file.name}...`);

      // Read XMind file
      const arrayBuffer = await this.app.vault.readBinary(file);

      // Parse XMind file
      const xmindData = await this.xmindParser.parse(arrayBuffer);

      // Default conversion options
      const options: ConversionOptions = {
        layoutAlgorithm: 'mrtree',
        direction: 'RIGHT',
        nodeSpacing: 80,
        layerSpacing: 150,
        defaultNodeWidth: 200,
        defaultNodeHeight: 80,
      };

      // Calculate layout
      const layoutData = await this.layoutCalculator.calculate(xmindData, options);

      // Generate Canvas data
      const canvasData = this.canvasGenerator.generate(layoutData);

      // Create output file path
      const outputPath = file.path.replace(/\.xmind$/, '.canvas');

      // Check if output file already exists
      const existingFile = this.app.vault.getAbstractFileByPath(outputPath);
      
      if (existingFile instanceof TFile) {
        // File exists, modify it instead of creating new
        await this.app.vault.modify(
          existingFile,
          JSON.stringify(canvasData, null, '\t')
        );
      } else {
        // Create new file
        await this.app.vault.create(
          outputPath,
          JSON.stringify(canvasData, null, '\t')
        );
      }

      new Notice(`✅ Converted to ${outputPath}`);

      // Open the canvas file
      const canvasFile = this.app.vault.getAbstractFileByPath(outputPath);
      if (canvasFile instanceof TFile) {
        await this.app.workspace.getLeaf(false).openFile(canvasFile);
      }
    } catch (error) {
      console.error('Error converting XMind file:', error);
      new Notice(`❌ Error: ${error.message}`);
    }
  }
}
