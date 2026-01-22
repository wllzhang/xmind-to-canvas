/**
 * XMind to Canvas - Web Application
 * 完全在浏览器端运行的思维导图转换器
 */

// ========================================
// XMind Parser
// ========================================

class XMindParser {
  async parse(arrayBuffer) {
    try {
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      let contentFile = zip.file('content.json');
      let isJson = true;
      
      if (!contentFile) {
        contentFile = zip.file('content.xml');
        isJson = false;
      }
      
      if (!contentFile) {
        throw new Error('无法找到 content.json 或 content.xml 文件');
      }
      
      const contentText = await contentFile.async('text');
      
      let workbookData;
      if (isJson) {
        workbookData = JSON.parse(contentText);
      } else {
        throw new Error('XML 格式暂不支持，请使用 XMind Zen 格式');
      }
      
      const sheets = [];
      
      if (workbookData && Array.isArray(workbookData)) {
        for (const sheet of workbookData) {
          const rootTopic = sheet.rootTopic;
          
          if (rootTopic) {
            sheets.push({
              id: sheet.id || this.generateId(),
              title: sheet.title || '未命名画布',
              rootTopic: this.extractNodes(rootTopic),
            });
          }
        }
      }
      
      if (sheets.length === 0) {
        throw new Error('未找到有效的思维导图数据');
      }
      
      return { sheets };
    } catch (error) {
      console.error('解析 XMind 文件失败:', error);
      throw new Error(`解析失败: ${error.message}`);
    }
  }

  extractNodes(topic, parentId) {
    const title = topic.title || topic.label || topic.name || '未命名';
    
    const node = {
      id: topic.id || this.generateId(),
      title: String(title),
      children: [],
    };

    if (topic.notes) {
      node.notes = topic.notes.plain || topic.notes;
    }

    if (topic.labels && Array.isArray(topic.labels)) {
      node.labels = topic.labels;
    }

    // Handle different possible children fields
    let children = [];
    
    if (topic.children) {
      if (topic.children.attached && Array.isArray(topic.children.attached)) {
        children = topic.children.attached;
      } else if (Array.isArray(topic.children)) {
        children = topic.children;
      }
    } else if (topic.attached && Array.isArray(topic.attached)) {
      children = topic.attached;
    } else if (topic.topics && Array.isArray(topic.topics)) {
      children = topic.topics;
    }
    
    if (children.length > 0) {
      node.children = children.map((child) => this.extractNodes(child, node.id));
    }

    return node;
  }

  generateId() {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ========================================
// Layout Calculator (using ELK.js)
// ========================================

class LayoutCalculator {
  constructor() {
    this.elk = new ELK();
  }

  async calculate(xmindData, options) {
    try {
      if (!xmindData.sheets || xmindData.sheets.length === 0) {
        throw new Error('未找到画布数据');
      }

      const sheet = xmindData.sheets[0];
      const rootTopic = sheet.rootTopic;

      const elkGraph = this.convertToELKGraph(rootTopic, options);
      const layoutedGraph = await this.elk.layout(elkGraph);

      return layoutedGraph;
    } catch (error) {
      console.error('布局计算失败:', error);
      throw new Error(`布局计算失败: ${error.message}`);
    }
  }

  convertToELKGraph(rootNode, options) {
    const graph = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': options.layoutAlgorithm || 'mrtree',
        'elk.direction': options.direction || 'RIGHT',
        'elk.spacing.nodeNode': String(options.nodeSpacing || 60),
        'elk.layered.spacing.nodeNodeBetweenLayers': String(options.layerSpacing || 120),
      },
      children: [],
      edges: [],
    };

    const { nodes, edges } = this.flattenNodeTree(rootNode, options);
    
    graph.children = nodes;
    graph.edges = edges;

    return graph;
  }

  flattenNodeTree(node, options, parentId, isRoot = true) {
    const nodes = [];
    const edges = [];

    const textLength = node.title.length;
    const width = Math.max(options.defaultNodeWidth || 160, Math.min(textLength * 10 + 40, 300));
    const height = options.defaultNodeHeight || 50;

    const elkNode = {
      id: node.id,
      width,
      height,
      labels: [{ text: node.title }],
      isRoot,
    };

    nodes.push(elkNode);

    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${node.id}`,
        sources: [parentId],
        targets: [node.id],
      });
    }

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const childResult = this.flattenNodeTree(child, options, node.id, false);
        nodes.push(...childResult.nodes);
        edges.push(...childResult.edges);
      }
    }

    return { nodes, edges };
  }
}

// ========================================
// Canvas Generator
// ========================================

class CanvasGenerator {
  generate(layoutedGraph) {
    const nodes = [];
    const edges = [];

    if (layoutedGraph.children) {
      for (const elkNode of layoutedGraph.children) {
        nodes.push(this.convertNode(elkNode));
      }
    }

    if (layoutedGraph.edges) {
      for (const elkEdge of layoutedGraph.edges) {
        edges.push(this.convertEdge(elkEdge));
      }
    }

    return { nodes, edges };
  }

  convertNode(elkNode) {
    const title = elkNode.labels && elkNode.labels.length > 0
      ? elkNode.labels[0].text
      : '未命名';

    return {
      id: elkNode.id,
      type: 'text',
      x: Math.round(elkNode.x || 0),
      y: Math.round(elkNode.y || 0),
      width: Math.round(elkNode.width || 160),
      height: Math.round(elkNode.height || 50),
      text: `### ${title}`,
      isRoot: elkNode.isRoot,
    };
  }

  convertEdge(elkEdge) {
    const fromNode = Array.isArray(elkEdge.sources) ? elkEdge.sources[0] : elkEdge.sources;
    const toNode = Array.isArray(elkEdge.targets) ? elkEdge.targets[0] : elkEdge.targets;

    return {
      id: elkEdge.id,
      fromNode,
      toNode,
      fromSide: 'right',
      toSide: 'left',
    };
  }
}

// ========================================
// Canvas Renderer (SVG)
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

  render(canvasData) {
    this.canvasData = canvasData;
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
    g.setAttribute('class', `canvas-node${node.isRoot ? ' root' : ''}`);
    g.setAttribute('transform', `translate(${node.x}, ${node.y})`);

    // Rectangle background
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', node.width);
    rect.setAttribute('height', node.height);
    rect.setAttribute('rx', 8);
    g.appendChild(rect);

    // Text
    const title = node.text.replace('### ', '');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', node.width / 2);
    text.setAttribute('y', node.height / 2);
    text.textContent = this.truncateText(title, node.width - 20);
    g.appendChild(text);

    return g;
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
    this.parser = new XMindParser();
    this.layoutCalculator = new LayoutCalculator();
    this.canvasGenerator = new CanvasGenerator();
    this.renderer = null;
    this.canvasData = null;
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
      
      // Parse XMind
      const xmindData = await this.parser.parse(arrayBuffer);
      
      // Calculate layout
      const options = {
        layoutAlgorithm: 'mrtree',
        direction: 'RIGHT',
        nodeSpacing: 60,
        layerSpacing: 120,
        defaultNodeWidth: 160,
        defaultNodeHeight: 50,
      };
      const layoutData = await this.layoutCalculator.calculate(xmindData, options);
      
      // Generate canvas
      this.canvasData = this.canvasGenerator.generate(layoutData);
      
      // Update UI
      this.updateStats(xmindData.sheets.length);
      this.showPreview();
      
      // Initialize renderer
      const container = document.getElementById('canvasContainer');
      const svg = document.getElementById('canvasSvg');
      this.renderer = new CanvasRenderer(container, svg);
      this.renderer.render(this.canvasData);
      
    } catch (error) {
      alert('转换失败: ' + error.message);
      console.error(error);
    } finally {
      this.hideLoading();
    }
  }

  updateStats(sheetCount) {
    this.fileNameEl.textContent = this.fileName;
    this.nodeCountEl.textContent = this.canvasData.nodes.length;
    this.edgeCountEl.textContent = this.canvasData.edges.length;
    this.sheetCountEl.textContent = sheetCount;
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
    this.renderer = null;
  }

  download() {
    if (!this.canvasData) return;

    // Create clean canvas data without isRoot property
    const cleanData = {
      nodes: this.canvasData.nodes.map(node => {
        const { isRoot, ...cleanNode } = node;
        return cleanNode;
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

