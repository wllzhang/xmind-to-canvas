/**
 * XMind to Canvas - Web Application
 * Uses the shared core library for conversion logic
 */

// ========================================
// Canvas Renderer (SVG) - Web-specific
// ========================================

class CanvasRenderer {
  constructor(container, svg) {
    this.container = container;
    this.svg = svg;
    this.zoom = 1;
    this.minZoom = 0.1;
    this.maxZoom = 3;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
    
    this.setupEvents();
  }

  setupEvents() {
    // Mouse wheel zoom
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this.setZoom(this.zoom * delta);
    });

    // Pan with mouse drag
    this.container.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.isDragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.container.style.cursor = 'grabbing';
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;
        this.panX += dx;
        this.panY += dy;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.updateTransform();
      }
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.container.style.cursor = 'grab';
    });

    this.container.style.cursor = 'grab';
  }

  render(canvasData, images) {
    this.canvasData = canvasData;
    this.images = images || new Map();
    this.svg.innerHTML = '';

    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const node of canvasData.nodes) {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    }

    const padding = 100;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;

    this.svg.setAttribute('width', width);
    this.svg.setAttribute('height', height);
    this.svg.setAttribute('viewBox', `${minX - padding} ${minY - padding} ${width} ${height}`);

    // Create defs for arrow markers
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#334155"/>
      </marker>
    `;
    this.svg.appendChild(defs);

    // Create node lookup for edge drawing
    const nodeMap = new Map();
    for (const node of canvasData.nodes) {
      nodeMap.set(node.id, node);
    }

    // Draw edges first (under nodes)
    const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgesGroup.setAttribute('class', 'edges');
    
    for (const edge of canvasData.edges) {
      const fromNode = nodeMap.get(edge.fromNode);
      const toNode = nodeMap.get(edge.toNode);
      
      if (fromNode && toNode) {
        const path = this.createEdgePath(fromNode, toNode);
        edgesGroup.appendChild(path);
      }
    }
    this.svg.appendChild(edgesGroup);

    // Draw nodes
    const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodesGroup.setAttribute('class', 'nodes');
    
    for (const node of canvasData.nodes) {
      const nodeElement = this.createNodeElement(node);
      nodesGroup.appendChild(nodeElement);
    }
    this.svg.appendChild(nodesGroup);

    // Fit to view
    this.fitView();
  }

  createEdgePath(fromNode, toNode) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    const x1 = fromNode.x + fromNode.width;
    const y1 = fromNode.y + fromNode.height / 2;
    const x2 = toNode.x;
    const y2 = toNode.y + toNode.height / 2;
    
    // Bezier curve
    const cx1 = x1 + (x2 - x1) * 0.5;
    const cy1 = y1;
    const cx2 = x1 + (x2 - x1) * 0.5;
    const cy2 = y2;
    
    path.setAttribute('d', `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`);
    path.setAttribute('class', 'canvas-edge');
    path.setAttribute('marker-end', 'url(#arrowhead)');
    
    return path;
  }

  createNodeElement(node) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const isRoot = node.id === 'root' || !node.id.includes('-');
    g.setAttribute('class', `canvas-node${isRoot ? ' root' : ''}${node.type === 'file' ? ' image-node' : ''}`);
    g.setAttribute('transform', `translate(${node.x}, ${node.y})`);

    // Rectangle background
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', node.width);
    rect.setAttribute('height', node.height);
    rect.setAttribute('rx', 8);
    g.appendChild(rect);

    // Handle image nodes
    if (node.type === 'file' && node.file) {
      const imageData = this.images.get(node.file);
      if (imageData) {
        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.setAttribute('x', 5);
        image.setAttribute('y', 5);
        image.setAttribute('width', node.width - 10);
        image.setAttribute('height', node.height - 10);
        image.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
        // Convert ArrayBuffer to base64 data URL
        const base64 = this.arrayBufferToBase64(imageData.data);
        image.setAttribute('href', `data:${imageData.mimeType};base64,${base64}`);
        g.appendChild(image);
      } else {
        // Show placeholder for missing image
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.width / 2);
        text.setAttribute('y', node.height / 2);
        text.textContent = '📷 ' + node.file;
        g.appendChild(text);
      }
    } else {
      // Text node
      const title = node.text ? node.text.replace('### ', '') : 'Untitled';
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.width / 2);
      text.setAttribute('y', node.height / 2);
      text.textContent = this.truncateText(title, node.width - 20);
      g.appendChild(text);
    }

    return g;
  }

  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  truncateText(text, maxWidth) {
    const charWidth = 10;
    const maxChars = Math.floor(maxWidth / charWidth);
    if (text.length > maxChars) {
      return text.substring(0, maxChars - 1) + '…';
    }
    return text;
  }

  setZoom(zoom) {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    this.updateTransform();
    this.updateZoomDisplay();
  }

  updateTransform() {
    this.svg.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
  }

  updateZoomDisplay() {
    const zoomLevel = document.getElementById('zoomLevel');
    if (zoomLevel) {
      zoomLevel.textContent = Math.round(this.zoom * 100) + '%';
    }
  }

  fitView() {
    const containerRect = this.container.getBoundingClientRect();
    const svgWidth = parseFloat(this.svg.getAttribute('width'));
    const svgHeight = parseFloat(this.svg.getAttribute('height'));
    
    const scaleX = containerRect.width / svgWidth;
    const scaleY = containerRect.height / svgHeight;
    const scale = Math.min(scaleX, scaleY, 1) * 0.9;
    
    this.zoom = scale;
    this.panX = (containerRect.width - svgWidth * scale) / 2;
    this.panY = (containerRect.height - svgHeight * scale) / 2;
    
    this.updateTransform();
    this.updateZoomDisplay();
  }

  zoomIn() {
    this.setZoom(this.zoom * 1.2);
  }

  zoomOut() {
    this.setZoom(this.zoom / 1.2);
  }
}

// ========================================
// Main Application
// ========================================

class App {
  constructor() {
    // Use the core library classes
    this.parser = new XMindToCanvas.XMindParser();
    this.layoutCalculator = new XMindToCanvas.LayoutCalculator();
    this.canvasGenerator = new XMindToCanvas.CanvasGenerator();
    this.renderer = null;
    this.canvasData = null;
    this.xmindData = null;
    this.fileName = '';
    
    this.initElements();
    this.initEvents();
  }

  initElements() {
    this.uploadSection = document.getElementById('uploadSection');
    this.previewSection = document.getElementById('previewSection');
    this.uploadZone = document.getElementById('uploadZone');
    this.fileInput = document.getElementById('fileInput');
    this.loadingOverlay = document.getElementById('loadingOverlay');
    this.fileNameEl = document.getElementById('fileName');
    this.nodeCountEl = document.getElementById('nodeCount');
    this.edgeCountEl = document.getElementById('edgeCount');
    this.sheetCountEl = document.getElementById('sheetCount');
    this.imageCountEl = document.getElementById('imageCount');
  }

  initEvents() {
    // File input
    this.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.handleFile(file);
    });

    // Drag and drop
    this.uploadZone.addEventListener('click', () => this.fileInput.click());
    
    this.uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadZone.classList.add('dragover');
    });

    this.uploadZone.addEventListener('dragleave', () => {
      this.uploadZone.classList.remove('dragover');
    });

    this.uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadZone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith('.xmind')) {
        this.handleFile(file);
      } else {
        alert('请上传 .xmind 文件');
      }
    });

    // Action buttons
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    document.getElementById('downloadBtn').addEventListener('click', () => this.download());

    // Zoom controls
    document.getElementById('zoomIn').addEventListener('click', () => this.renderer?.zoomIn());
    document.getElementById('zoomOut').addEventListener('click', () => this.renderer?.zoomOut());
    document.getElementById('fitView').addEventListener('click', () => this.renderer?.fitView());
  }

  async handleFile(file) {
    this.fileName = file.name;
    this.showLoading();

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Parse XMind using core library
      this.xmindData = await this.parser.parse(arrayBuffer);
      
      // Calculate layout using core library
      const options = {
        layoutAlgorithm: 'mrtree',
        direction: 'RIGHT',
        nodeSpacing: 60,
        layerSpacing: 120,
        defaultNodeWidth: 160,
        defaultNodeHeight: 50,
      };
      const layoutData = await this.layoutCalculator.calculate(this.xmindData, options);
      
      // Set up image path generator for web (images are referenced by filename)
      this.canvasGenerator.setImagePathGenerator((imageName) => imageName);
      
      // Generate canvas using core library
      this.canvasData = this.canvasGenerator.generate(layoutData);
      
      // Update UI
      this.updateStats();
      this.showPreview();
      
      // Initialize renderer
      const container = document.getElementById('canvasContainer');
      const svg = document.getElementById('canvasSvg');
      this.renderer = new CanvasRenderer(container, svg);
      
      // Pass images to renderer for display
      this.renderer.render(this.canvasData, this.xmindData.images);
      
    } catch (error) {
      alert('转换失败: ' + error.message);
      console.error(error);
    } finally {
      this.hideLoading();
    }
  }

  updateStats() {
    this.fileNameEl.textContent = this.fileName;
    this.nodeCountEl.textContent = this.canvasData.nodes.length;
    this.edgeCountEl.textContent = this.canvasData.edges.length;
    this.sheetCountEl.textContent = this.xmindData.sheets.length;
    
    // Update image count if element exists
    if (this.imageCountEl) {
      this.imageCountEl.textContent = this.xmindData.images ? this.xmindData.images.size : 0;
    }
  }

  showPreview() {
    this.uploadSection.classList.add('hidden');
    this.previewSection.classList.remove('hidden');
  }

  showLoading() {
    this.loadingOverlay.classList.remove('hidden');
  }

  hideLoading() {
    this.loadingOverlay.classList.add('hidden');
  }

  reset() {
    this.uploadSection.classList.remove('hidden');
    this.previewSection.classList.add('hidden');
    this.fileInput.value = '';
    this.canvasData = null;
    this.xmindData = null;
    this.renderer = null;
  }

  download() {
    if (!this.canvasData) return;

    // Create clean canvas data
    const cleanData = {
      nodes: this.canvasData.nodes.map(node => {
        // For web download, keep the file reference but note that images won't work in Obsidian
        // unless user manually copies images
        return { ...node };
      }),
      edges: this.canvasData.edges,
    };

    const json = JSON.stringify(cleanData, null, '\t');
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = this.fileName.replace('.xmind', '.canvas');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
