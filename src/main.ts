import { Plugin, TFile, Notice, Menu } from 'obsidian';
import { 
  XMindParser, 
  LayoutCalculator, 
  CanvasGenerator, 
  ConversionOptions, 
  ImageResource,
  DEFAULT_OPTIONS 
} from './core';

export default class XMindToCanvasPlugin extends Plugin {
  private xmindParser: XMindParser;
  private layoutCalculator: LayoutCalculator;
  private canvasGenerator: CanvasGenerator;

  onload() {
    // Initialize components
    this.xmindParser = new XMindParser();
    this.layoutCalculator = new LayoutCalculator();
    this.canvasGenerator = new CanvasGenerator();

    // Add command to convert XMind file
    this.addCommand({
      id: 'convert',
      name: 'Convert to canvas',
      callback: () => this.selectAndConvertXMindFile(),
    });

    // Register file menu event
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu: Menu, file: TFile) => {
        if (file.extension === 'xmind') {
          menu.addItem((item) => {
            item
              .setTitle('Convert to canvas')
              .setIcon('canvas')
              .onClick(async () => {
                await this.convertXMindFile(file);
              });
          });
        }
      })
    );
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
      new Notice('No XMind files found in vault.');
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

      // Create attachments folder for images if there are any
      const baseName = file.basename;
      const parentPath = file.parent?.path || '';
      const imagesFolderPath = parentPath 
        ? `${parentPath}/${baseName}_images`
        : `${baseName}_images`;

      // Save images to vault if any exist
      const savedImagePaths = new Map<string, string>();
      if (xmindData.images && xmindData.images.size > 0) {
        await this.saveImagesToVault(xmindData.images, imagesFolderPath, savedImagePaths);
        new Notice(`📷 Saved ${xmindData.images.size} images`);
      }

      // Set up image path generator for the canvas
      this.canvasGenerator.setImagePathGenerator((imageName: string) => {
        return savedImagePaths.get(imageName) || `${imagesFolderPath}/${imageName}`;
      });

      // Default conversion options
      const options: ConversionOptions = { ...DEFAULT_OPTIONS };

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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error converting XMind file:', error);
      new Notice(`❌ Error: ${errorMessage}`);
    }
  }

  /**
   * Save extracted images to the vault
   */
  private async saveImagesToVault(
    images: Map<string, ImageResource>,
    folderPath: string,
    savedPaths: Map<string, string>
  ) {
    // Create the images folder if it doesn't exist
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      await this.app.vault.createFolder(folderPath);
    }

    // Save each image
    for (const [name, imageResource] of images) {
      try {
        const imagePath = `${folderPath}/${name}`;
        
        // Check if image already exists
        const existingImage = this.app.vault.getAbstractFileByPath(imagePath);
        if (existingImage instanceof TFile) {
          // Update existing image
          await this.app.vault.modifyBinary(existingImage, imageResource.data);
        } else {
          // Create new image file
          await this.app.vault.createBinary(imagePath, imageResource.data);
        }
        
        savedPaths.set(name, imagePath);
      } catch (error) {
        console.warn(`Failed to save image ${name}:`, error);
      }
    }
  }
}
