// --- VARIABLES GLOBALES ---
let endNodeSelect, submitBtn, prevBtn, nextBtn, stepTitle, stepDescription, tableContainer, stepCounter, navControls;

let pasos = [];
let pasoActual = 0;
let calculando = false;

// Variables para Vis-Network
let network = null;
let nodesDataSet = new vis.DataSet();
let edgesDataSet = new vis.DataSet();

// Colores para la visualización
const COLOR_POI = { border: '#e67e22', background: '#e67e22' };
const COLOR_NORMAL = { border: '#3498db', background: '#3498db' };
const COLOR_VISITADO = { border: '#2ecc71', background: '#2ecc71' };
const COLOR_ACTUAL = { border: '#f1c40f', background: '#f1c40f' };
const COLOR_CAMINO = '#e74c3c';
const COLOR_ARISTA = '#ffffff'; // Cambiado a blanco para mejor contraste sobre un mapa

let nodeMap = {}; // Mapea ID de nodo a índice (ej: 'GUATEMALA' -> 0)
let adjacencyMatrix = []; // Matriz de adyacencia para los pesos

// --- GENERADOR DEL GRAFO EN CUADRÍCULA ---
function generarGrafoCuadricula() {
  const filas = 7; // Aumentado de 6 a 7 para añadir una fila arriba
  const columnas = 8; // Aumentado de 7 a 8 para añadir una columna a la derecha
  
  // Coordenadas finales proporcionadas por el usuario
  const nuevasCoordenadas = {
    'R0C0': { x: -20, y: 29 },
    'R0C1': { x: 97, y: 30 },
    'R0C2': { x: 182, y: 27 },
    'R0C3': { x: 271, y: 26 },
    'R0C4': { x: 358, y: 30 },
    'R0C5': { x: 450, y: 21 },
    'R0C6': { x: 536, y: 24 },
    'R0C7': { x: 667, y: 13 },
    'R1C0': { x: -34, y: 156 },
    'R1C1': { x: 99, y: 155 },
    'R1C2': { x: 185, y: 159 },
    'R1C3': { x: 272, y: 155 },
    'R1C4': { x: 358, y: 149 },
    'R1C5': { x: 448, y: 146 },
    'R1C6': { x: 541, y: 145 },
    'R1C7': { x: 664, y: 143 },
    'R2C0': { x: -33, y: 244 },
    'R2C1': { x: 100, y: 247 },
    'R2C2': { x: 184, y: 244 },
    'R2C3': { x: 270, y: 246 },
    'R2C4': { x: 355, y: 237 },
    'R2C5': { x: 448, y: 238 },
    'R2C6': { x: 534, y: 241 },
    'R2C7': { x: 663, y: 238 },
    'R3C0': { x: -36, y: 334 },
    'R3C1': { x: 100, y: 333 },
    'R3C2': { x: 183, y: 334 },
    'R3C3': { x: 272, y: 330 },
    'R3C4': { x: 361, y: 328 },
    'R3C5': { x: 450, y: 328 },
    'R3C6': { x: 535, y: 322 },
    'R3C7': { x: 662, y: 323 },
    'R4C0': { x: -39, y: 428 },
    'R4C1': { x: 95, y: 423 },
    'R4C2': { x: 182, y: 422 },
    'R4C3': { x: 272, y: 416 },
    'R4C4': { x: 353, y: 419 },
    'R4C5': { x: 450, y: 410 },
    'R4C6': { x: 536, y: 411 },
    'R4C7': { x: 662, y: 408 },
    'R5C0': { x: -39, y: 511 },
    'R5C1': { x: 94, y: 510 },
    'R5C2': { x: 184, y: 510 },
    'R5C3': { x: 272, y: 503 },
    'R5C4': { x: 361, y: 507 },
    'R5C5': { x: 445, y: 499 },
    'R5C6': { x: 532, y: 498 },
    'R5C7': { x: 660, y: 493 },
    'R6C0': { x: -42, y: 595 },
    'R6C1': { x: 97, y: 597 },
    'R6C2': { x: 184, y: 595 },
    'R6C3': { x: 270, y: 588 },
    'R6C4': { x: 361, y: 584 },
    'R6C5': { x: 447, y: 587 },
    'R6C6': { x: 570, y: 554 },
    'R6C7': { x: 655, y: 579 },
  };
  
  const nodos = [];
  const aristas = [];
  
  const puntosDeInteres = {
    // (fila, columna) - Se ha sumado 1 a cada fila para añadir una nueva fila arriba
    '3,0': 'Pollo Campero',
    '6,0': 'Entrada',
    '3,1': 'Mcdonalds',
    '2,2': 'El viejo cafe',
    '2,3': 'Subway',
    '3,3': 'Cafe condesa',
    '1,5': 'La cuevita de los Urquizu',
    '5,6': 'El adobe'
  };
  
  // Generar nodos
  for (let r = 0; r < filas; r++) {
    for (let c = 0; c < columnas; c++) {
      const id = `R${r}C${c}`;
      const esPOI = puntosDeInteres.hasOwnProperty(`${r},${c}`);
      const coords = nuevasCoordenadas[id] || { x: 0, y: 0 };
      
      nodos.push({
        id: id,
        label: esPOI ? puntosDeInteres[`${r},${c}`] : ' ', // Solo POIs tienen etiqueta visible
        x: coords.x,
        y: coords.y,
        type: esPOI ? 'poi' : 'normal',
        // Propiedades para Vis-Network
        shape: 'dot',
        size: esPOI ? 12 : 5,
        color: esPOI ? COLOR_POI : COLOR_NORMAL,
        font: { color: '#FFFFFF', size: 14 },
      });

    }
  }

  // Generar aristas (calles)
  for (let r = 0; r < filas; r++) {
    for (let c = 0; c < columnas; c++) {
      const fromId = `R${r}C${c}`;
      // Conexión a la derecha
      if (c < columnas - 1) {
        const toId = `R${r}C${c + 1}`;
        const weight = ((r * 13 + c * 7) % 4) + 1;
        aristas.push({ 
          id: `${fromId}_${toId}`, from: fromId, to: toId, weight: weight,
          // Propiedades para Vis-Network
          label: `${weight}km`,
          color: { color: COLOR_ARISTA, highlight: COLOR_CAMINO },
          width: 4,
        });
      }
      // Conexión hacia abajo
      if (r < filas - 1) {
        const toId = `R${r + 1}C${c}`;
        const weight = ((r * 17 + c * 5) % 5) + 1; // Fórmula determinista para pesos 1-5
        aristas.push({ 
          id: `${fromId}_${toId}`, from: fromId, to: toId, weight: weight,
          label: `${weight}km`,
          color: { color: COLOR_ARISTA, highlight: COLOR_CAMINO },
          width: 4,
        });
      }
    }
  }
  return { nodes: nodos, edges: aristas };
}

const graph = generarGrafoCuadricula();

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

// --- LÓGICA DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
  // Referencias a elementos del DOM
  endNodeSelect = document.getElementById('end-node');
  submitBtn = document.getElementById('submit-btn');
  prevBtn = document.getElementById('prev-btn');
  nextBtn = document.getElementById('next-btn');
  stepTitle = document.getElementById('step-title');
  stepDescription = document.getElementById('step-description');
  tableContainer = document.getElementById('table-container');
  stepCounter = document.getElementById('step-counter');
  navControls = document.getElementById('navigation-controls');

  // Poblar los menús desplegables
  const puntosDeInteres = graph.nodes.filter(n => n.type === 'poi');
  puntosDeInteres.forEach(node => {
    // Usamos el 'name' para el texto visible y el 'id' como valor
    const option2 = new Option(node.label, node.id);
    endNodeSelect.add(option2);
  });
  
  // Eventos de los botones
  submitBtn.addEventListener('click', iniciarVisualizacion);
  prevBtn.addEventListener('click', pasoAnterior);
  nextBtn.addEventListener('click', siguientePaso);

  prepararGrafo();
  inicializarRed();
});

function inicializarRed() {
  nodesDataSet.clear();
  edgesDataSet.clear();
  nodesDataSet.add(graph.nodes);
  edgesDataSet.add(graph.edges);

  const container = document.getElementById('network-container');
  const data = { nodes: nodesDataSet, edges: edgesDataSet };
  const options = {
    physics: false,
    interaction: {
      dragNodes: false,  // Deshabilitado para el uso normal
      dragView: false,  // Deshabilita el arrastre del lienzo (pan)
      zoomView: false,  // Deshabilita el zoom del lienzo
    },
    layout: {
      // Esto asegura que las coordenadas X, Y que definimos se usen directamente
      // sin que la librería intente aplicar ninguna física o diseño automático.
      hierarchical: false
    },
    // Desactiva el redimensionamiento automático para mantener la alineación con la imagen de fondo
    autoResize: false,
    nodes: {
      font: { color: '#FFFFFF' }
    },
    edges: {
      font: { color: '#FFFFFF', strokeWidth: 0, align: 'top' }
    }
  };
  network = new vis.Network(container, data, options);

  // Fijamos la vista inicial para que coincida exactamente con el fondo
  network.moveTo({
    position: { x: 379, y: 297.5 }, // Centro del canvas (758/2, 595/2)
    scale: 1.0
  });
}

function iniciarVisualizacion() {
  // Encontrar el nodo "Entrada" programáticamente
  const entradaNode = graph.nodes.find(node => node.label === 'Entrada');
  if (!entradaNode) {
    alert('Error: No se pudo encontrar el nodo de "Entrada".');
    return;
  }
  const startNodeId = entradaNode.id;
  const endNodeId = endNodeSelect.value;

  if (startNodeId === endNodeId) {
    alert('El origen y el destino no pueden ser el mismo.');
    return;
  }

  pasos = generarPasosDijkstra(startNodeId, endNodeId);
  pasoActual = 0;
  calculando = true;
  navControls.style.visibility = 'visible';
  actualizarVisualizacion();
}

function siguientePaso() {
  if (pasoActual < pasos.length - 1) {
    pasoActual++;
    actualizarVisualizacion();
  }
}

function pasoAnterior() {
  if (pasoActual > 0) {
    pasoActual--;
    actualizarVisualizacion();
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
    descripcion: `Se inicializan todas las distancias a infinito, excepto el origen (${graph.nodes[startIndex].label}) que es 0. Aún no hay predecesores.`
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
    const u_label = graph.nodes[u].label.trim() || u_id;
    pasosGenerados.push({
      distancias: [...distancias],
      predecesores: [...predecesores],
      visitados: [...visitados],
      verticeActual: u,
      fase: `Selección del Vértice ${u_label}`,
      descripcion: `Se selecciona el vértice no visitado con la menor distancia acumulada: ${u_label} (Distancia: ${distancias[u]}).`
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
      fase: `Actualización desde ${u_label}`,
      descripcion: `Se actualizan las distancias de los vecinos de ${u_label} y se marca como visitado.`
    });
  }

  // 5. Paso Final
  const endNodeIndex = nodeMap[endId];
  const finalPath = reconstruirCamino(predecesores, endNodeIndex);
  const finalDistance = distancias[endNodeIndex];
  const pathString = finalPath.map(index => graph.nodes[index].label).join(' → ');

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
  stepTitle.innerHTML = paso.fase;
  stepDescription.innerHTML = paso.descripcion;
  stepCounter.innerHTML = `Paso: ${pasoActual + 1} / ${pasos.length}`;
  crearTabla(paso);
}

function crearTabla(paso) {
  let tablaHTML = '<table><thead><tr><th>Vértice</th><th>Estado</th><th>Distancia</th><th>Predecesor</th></tr></thead><tbody>';
  for (let i = 0; i < graph.nodes.length; i++) {
    const node = graph.nodes[i]; // Usamos el `graph.nodes` original para la tabla
    if (node.type !== 'poi') continue; // Solo mostrar POIs en la tabla

    const estado = paso.visitados[i] ? '✔️ Visitado' : '❌ No Visitado';
    const distancia = paso.distancias[i] === Infinity ? '∞' : paso.distancias[i];
    const predecesor = paso.predecesores[i] !== null ? graph.nodes[paso.predecesores[i]].label : '-';

    let rowClass = '';
    if (paso.visitados[i]) rowClass = 'visited-row';
    if (paso.verticeActual === i) rowClass = 'current-row';

    tablaHTML += `<tr class="${rowClass}"><td>${node.label}</td><td>${estado}</td><td>${distancia}</td><td>${predecesor}</td></tr>`;
  }
  tablaHTML += '</tbody></table>';
  tableContainer.innerHTML = tablaHTML;
}

// --- FUNCIONES DE VISUALIZACIÓN CON VIS-NETWORK ---
function actualizarVisualizacion() {
  const paso = pasos[pasoActual];
  actualizarUI(paso);

  // 1. Resetear todos los nodos y aristas a su estado base
  const nodeUpdates = graph.nodes.map(n => ({
    id: n.id,
    color: n.type === 'poi' ? COLOR_POI : COLOR_NORMAL,
    size: n.type === 'poi' ? 12 : 5,
  }));
  nodesDataSet.update(nodeUpdates);

  const edgeUpdates = graph.edges.map(e => ({
    id: e.id,
    color: { color: COLOR_ARISTA, highlight: COLOR_CAMINO },
    width: 4,
  }));
  edgesDataSet.update(edgeUpdates);

  // 2. Colorear nodos según el estado del paso
  const updates = [];
  for (let i = 0; i < graph.nodes.length; i++) {
    const nodeId = graph.nodes[i].id;
    if (paso.visitados[i]) {
      updates.push({ id: nodeId, color: COLOR_VISITADO });
    }
  }
  if (paso.verticeActual !== null) {
    const actualNodeId = graph.nodes[paso.verticeActual].id;
    updates.push({ id: actualNodeId, color: COLOR_ACTUAL, size: 15 });
  }
  nodesDataSet.update(updates);

  // 3. Si es el paso final, resaltar el camino
  if (paso.fase === 'Finalizado') {
    const endNodeIndex = nodeMap[endNodeSelect.value];
    const finalPath = reconstruirCamino(paso.predecesores, endNodeIndex);
    highlightPath(finalPath);
  }
}

function highlightPath(pathIndices) {  
  // Resaltar aristas del camino final
  const edgeUpdates = [];
  for (let i = 0; i < pathIndices.length - 1; i++) {
    const fromId = graph.nodes[pathIndices[i]].id;
    const toId = graph.nodes[pathIndices[i+1]].id;
    // Buscar la arista en ambas direcciones
    let edgeId = `${fromId}_${toId}`;
    if (!edgesDataSet.get(edgeId)) {
      edgeId = `${toId}_${fromId}`;
    }
    edgeUpdates.push({ id: edgeId, color: { color: COLOR_CAMINO }, width: 7 });
  }
  edgesDataSet.update(edgeUpdates);

  // Resaltar nodos del camino final
  const nodeUpdates = pathIndices.map(nodeIndex => ({
    id: graph.nodes[nodeIndex].id,
    color: { border: COLOR_CAMINO, background: COLOR_CAMINO },
    size: graph.nodes[nodeIndex].type === 'poi' ? 15 : 8,
  }));
  nodesDataSet.update(nodeUpdates);
}
