// --- VARIABLES GLOBALES ---
let startNodeSelect, endNodeSelect, submitBtn, prevBtn, nextBtn;
let stepTitle, stepDescription, tableContainer, stepCounter, navControls;

let pasos = [];
let pasoActual = 0;
let calculando = false;

let nodeMap = {}; // Mapea ID de nodo a índice (ej: 'GUATEMALA' -> 0)
let adjacencyMatrix = []; // Matriz de adyacencia para los pesos

// --- DATOS DEL GRAFO (LUGARES TURÍSTICOS DE GUATEMALA) ---
const graph = {
  nodes: [
    { id: 'GUATEMALA', name: 'Cd. de Guatemala', x: 450, y: 450 },
    { id: 'ANTIGUA', name: 'Antigua G.', x: 380, y: 460 },
    { id: 'PANAJACHEL', name: 'Panajachel', x: 300, y: 380 },
    { id: 'XELA', name: 'Quetzaltenango', x: 220, y: 350 },
    { id: 'COBAN', name: 'Cobán', x: 500, y: 250 },
    { id: 'TIKAL', name: 'Tikal (Flores)', x: 650, y: 100 },
    { id: 'LIVINGSTON', name: 'Livingston', x: 750, y: 280 },
  ],
  edges: [
    { from: 'GUATEMALA', to: 'ANTIGUA', weight: 40 },
    { from: 'GUATEMALA', to: 'PANAJACHEL', weight: 115 },
    { from: 'GUATEMALA', to: 'COBAN', weight: 215 },
    { from: 'GUATEMALA', to: 'LIVINGSTON', weight: 295 },
    { from: 'GUATEMALA', to: 'XELA', weight: 200 },
    { from: 'ANTIGUA', to: 'PANAJACHEL', weight: 80 },
    { from: 'ANTIGUA', to: 'XELA', weight: 160 },
    { from: 'PANAJACHEL', to: 'XELA', weight: 90 },
    { from: 'XELA', to: 'COBAN', weight: 330 },
    { from: 'COBAN', to: 'TIKAL', weight: 210 },
    { from: 'COBAN', to: 'LIVINGSTON', weight: 165 },
    { from: 'LIVINGSTON', to: 'TIKAL', weight: 240 },
  ]
};

// --- LÓGICA DE PREPARACIÓN ---
function prepararGrafo() {
  const n = graph.nodes.length;
  // Crear mapa de ID a índice
  graph.nodes.forEach((node, i) => {
    nodeMap[node.id] = i;
  });

  // Inicializar matriz de adyacencia con Infinito
  adjacencyMatrix = Array(n).fill(null).map(() => Array(n).fill(Infinity));

  // Llenar la matriz con los pesos
  for (let i = 0; i < n; i++) {
    adjacencyMatrix[i][i] = 0; // Distancia de un nodo a sí mismo es 0
  }

  graph.edges.forEach(edge => {
    const fromIndex = nodeMap[edge.from];
    const toIndex = nodeMap[edge.to];
    adjacencyMatrix[fromIndex][toIndex] = edge.weight;
    adjacencyMatrix[toIndex][fromIndex] = edge.weight; // Grafo no dirigido
  });
}

// --- CONFIGURACIÓN INICIAL (p5.js) ---
function setup() {
  let canvasContainer = select('#canvas-container');
  let canvas = createCanvas(900, 600);
  canvas.parent(canvasContainer);

  prepararGrafo();

  // Referencias a elementos del DOM
  startNodeSelect = select('#start-node');
  endNodeSelect = select('#end-node');
  submitBtn = select('#submit-btn');
  prevBtn = select('#prev-btn');
  nextBtn = select('#next-btn');
  stepTitle = select('#step-title');
  stepDescription = select('#step-description');
  tableContainer = select('#table-container');
  stepCounter = select('#step-counter');
  navControls = select('#navigation-controls');

  // Poblar los menús desplegables
  graph.nodes.forEach(node => {
    startNodeSelect.option(node.name, node.id);
    endNodeSelect.option(node.name, node.id);
  });
  
  // Eventos de los botones
  submitBtn.mousePressed(iniciarVisualizacion);
  prevBtn.mousePressed(pasoAnterior);
  nextBtn.mousePressed(siguientePaso);

  noLoop();
  drawEstadoInicial();
}

// --- DIBUJO PRINCIPAL (p5.js) ---
function draw() {
  if (!calculando) return;
  background('#1E1E1E'); // Fondo oscuro del canvas
  drawMapBackground(); // Dibuja la nueva silueta del mapa
  
  const paso = pasos[pasoActual];
  actualizarUI(paso);
  drawGraph(paso);

  if (paso.fase === 'Finalizado') {
    const endNodeIndex = nodeMap[endNodeSelect.value()];
    const finalPath = reconstruirCamino(paso.predecesores, endNodeIndex);
    highlightPath(finalPath);
  }
}

function drawEstadoInicial() {
  background('#1E1E1E');
  drawMapBackground();
  drawGraph(); // Dibuja el grafo sin etiquetas
}

// --- LÓGICA DE LA APLICACIÓN ---
function iniciarVisualizacion() {
  const startNodeId = startNodeSelect.value();
  const endNodeId = endNodeSelect.value();

  if (startNodeId === endNodeId) {
    alert('El origen y el destino no pueden ser el mismo.');
    return;
  }

  pasos = generarPasosDijkstra(startNodeId, endNodeId);
  pasoActual = 0;
  calculando = true;
  navControls.style('visibility', 'visible');
  redraw();
}

function siguientePaso() {
  if (pasoActual < pasos.length - 1) {
    pasoActual++;
    redraw();
  }
}

function pasoAnterior() {
  if (pasoActual > 0) {
    pasoActual--;
    redraw();
  }
}

// --- GENERADOR DE PASOS DE DIJKSTRA ---
function generarPasosDijkstra(startId, endId) {
  const n = graph.nodes.length;
  const startIndex = nodeMap[startId];
  const pasosGenerados = [];

  let distancias = Array(n).fill(Infinity);
  let predecesores = Array(n).fill(null);
  let visitados = Array(n).fill(false);
  distancias[startIndex] = 0;

  // 1. Paso de Inicialización
  pasosGenerados.push({
    distancias: [...distancias],
    predecesores: [...predecesores],
    visitados: [...visitados],
    verticeActual: null,
    fase: 'Inicialización',
    descripcion: `Se inicializan todas las distancias a infinito, excepto el origen (${startId}) que es 0. Aún no hay predecesores.`
  });

  for (let count = 0; count < n; count++) {
    // 2. Seleccionar vértice con menor distancia
    let u = -1;
    for (let i = 0; i < n; i++) {
      if (!visitados[i] && (u === -1 || distancias[i] < distancias[u])) {
        u = i;
      }
    }

    if (u === -1 || distancias[u] === Infinity) break;

    const u_id = graph.nodes[u].id;
    pasosGenerados.push({
      distancias: [...distancias],
      predecesores: [...predecesores],
      visitados: [...visitados],
      verticeActual: u,
      fase: `Selección del Vértice ${u_id}`,
      descripcion: `Se selecciona el vértice no visitado con la menor distancia acumulada: ${u_id} (Distancia: ${distancias[u]}).`
    });

    // 3. Marcar como visitado
    visitados[u] = true;

    // 4. Actualizar vecinos
    for (let v = 0; v < n; v++) {
      if (!visitados[v] && adjacencyMatrix[u][v] !== Infinity) {
        const nuevaDistancia = distancias[u] + adjacencyMatrix[u][v];
        if (nuevaDistancia < distancias[v]) {
          distancias[v] = nuevaDistancia;
          predecesores[v] = u;
        }
      }
    }
    pasosGenerados.push({
      distancias: [...distancias],
      predecesores: [...predecesores],
      visitados: [...visitados],
      verticeActual: u,
      fase: `Actualización desde ${u_id}`,
      descripcion: `Se actualizan las distancias de los vecinos de ${u_id} y se marca como visitado.`
    });
  }

  // 5. Paso Final
  const endNodeIndex = nodeMap[endId];
  const finalPath = reconstruirCamino(predecesores, endNodeIndex);
  const finalDistance = distancias[endNodeIndex];
  const pathString = finalPath.map(index => graph.nodes[index].id).join(' → ');

  pasosGenerados.push({
    distancias: [...distancias],
    predecesores: [...predecesores],
    visitados: [...visitados],
    verticeActual: null,
    fase: 'Finalizado',
    descripcion: finalDistance === Infinity ? 'No se encontró una ruta.' : `Ruta más corta encontrada: ${pathString} con una distancia total de ${finalDistance} km.`
  });

  return pasosGenerados;
}

function reconstruirCamino(predecesores, endNodeIndex) {
  const path = [];
  let u = endNodeIndex;
  while (u !== null && u !== undefined) {
    path.unshift(u);
    u = predecesores[u];
  }
  return path;
}

// --- FUNCIONES DE ACTUALIZACIÓN DE UI ---
function actualizarUI(paso) {
  stepTitle.html(paso.fase);
  stepDescription.html(paso.descripcion);
  stepCounter.html(`Paso: ${pasoActual + 1} / ${pasos.length}`);
  crearTabla(paso);
}

function crearTabla(paso) {
  let tablaHTML = '<table><thead><tr><th>Vértice</th><th>Estado</th><th>Distancia</th><th>Predecesor</th></tr></thead><tbody>';
  for (let i = 0; i < graph.nodes.length; i++) {
    const node = graph.nodes[i];
    const estado = paso.visitados[i] ? '✔️ Visitado' : '❌ No Visitado';
    const distancia = paso.distancias[i] === Infinity ? '∞' : paso.distancias[i];
    const predecesor = paso.predecesores[i] !== null ? graph.nodes[paso.predecesores[i]].id : '-';
    
    let rowClass = '';
    if (paso.visitados[i]) rowClass = 'visited-row';
    if (paso.verticeActual === i) rowClass = 'current-row';

    tablaHTML += `<tr class="${rowClass}"><td>${node.id}</td><td>${estado}</td><td>${distancia}</td><td>${predecesor}</td></tr>`;
  }
  tablaHTML += '</tbody></table>';
  tableContainer.html(tablaHTML);
}

// --- FUNCIONES DE DIBUJO ---
function drawMapBackground() {
  fill('rgba(44, 62, 80, 0.7)');
  noStroke();
  beginShape();
  vertex(340, 40); vertex(780, 40); vertex(800, 150); vertex(860, 250);
  vertex(820, 350); vertex(520, 560); vertex(350, 560); vertex(180, 480);
  vertex(150, 350); vertex(300, 280);
  endShape(CLOSE);
}

function drawGraph(paso) {
    // Dibujar aristas (carreteras)
    stroke('rgba(255, 255, 255, 0.3)'); // Blanco semitransparente
    strokeWeight(2);
    graph.edges.forEach(edge => {
        const fromNode = graph.nodes.find(n => n.id === edge.from);
        const toNode = graph.nodes.find(n => n.id === edge.to);
        line(fromNode.x, fromNode.y, toNode.x, toNode.y);

        // Dibujar peso de la arista
        fill('#f0f0f0');
        noStroke();
        textSize(12);
        textAlign(CENTER, CENTER);
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;
        text(`${edge.weight}km`, midX, midY - 10);
    });

    // Dibujar nodos y etiquetas
    graph.nodes.forEach((node, i) => {
        let nodeColor = '#3498db'; // Azul por defecto
        let nodeSize = 45;

        if (paso) {
            if (paso.visitados[i]) nodeColor = '#2ecc71'; // Verde si está visitado
            if (paso.verticeActual === i) nodeColor = '#f1c40f'; // Amarillo si es el actual
        }

        stroke(nodeColor);
        strokeWeight(4);
        fill('#1E1E1E');
        ellipse(node.x, node.y, nodeSize, nodeSize);

        // Dibujar nombre de la ciudad
        noStroke();
        fill('#FFFFFF');
        textSize(14);
        textAlign(CENTER, CENTER);
        text(node.name, node.x, node.y + 38);

        // Dibujar etiqueta de Dijkstra (distancia, predecesor)
        if (paso) {
            const dist = paso.distancias[i] === Infinity ? '∞' : paso.distancias[i];
            const pred = paso.predecesores[i] !== null ? graph.nodes[paso.predecesores[i]].id.substring(0, 1) : '-';
            fill(nodeColor);
            textSize(12);
            text(`(${dist}, ${pred})`, node.x, node.y);
        }
    });
}

function highlightPath(pathIndices) {
  // Resaltar aristas del camino
  for (let i = 0; i < pathIndices.length - 1; i++) {
    const fromNode = graph.nodes[pathIndices[i]];
    const toNode = graph.nodes[pathIndices[i + 1]];
    stroke('#e74c3c'); // Rojo brillante para el camino final
    strokeWeight(5);
    line(fromNode.x, fromNode.y, toNode.x, toNode.y);
  }

  // Resaltar nodos del camino (hacerlos un poco más grandes)
  pathIndices.forEach(nodeIndex => {
    const node = graph.nodes[nodeIndex];
    stroke('#e74c3c');
    strokeWeight(4);
    fill('#1E1E1E');
    ellipse(node.x, node.y, 50, 50);

    // Redibujar la etiqueta del nodo final para que se vea
    const paso = pasos[pasoActual];
    const dist = paso.distancias[nodeIndex] === Infinity ? '∞' : paso.distancias[nodeIndex];
    const pred = paso.predecesores[nodeIndex] !== null ? graph.nodes[paso.predecesores[nodeIndex]].id.substring(0, 1) : '-';
    fill('#e74c3c');
    textSize(12);
    text(`(${dist}, ${pred})`, node.x, node.y);

    // Redibujar nombre
    noStroke();
    fill('#FFFFFF');
    textSize(14);
    textAlign(CENTER, CENTER);
    text(node.name, node.x, node.y + 38);
  });
}