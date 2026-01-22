/**
 * Mock for Obsidian module - used in tests
 */

export class Plugin {
  app: any;
  manifest: any;

  addCommand(_command: any) {}
  registerEvent(_event: any) {}
}

export class TFile {
  path: string;
  name: string;
  basename: string;
  extension: string;
  parent: any;

  constructor(path: string) {
    this.path = path;
    this.name = path.split('/').pop() || '';
    this.basename = this.name.replace(/\.[^.]+$/, '');
    this.extension = this.name.split('.').pop() || '';
    this.parent = null;
  }
}

export class Notice {
  constructor(_message: string, _timeout?: number) {}
}

export class Menu {
  addItem(_callback: any) {
    return this;
  }
}

