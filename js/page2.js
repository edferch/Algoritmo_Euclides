let categoryFilter, endNodeSelect, submitBtn, prevBtn, nextBtn, stepTitle, stepDescription, tableContainer, stepCounter, navControls;
let startNodeId;

let pasos = [];
let pasoActual = 0;
let calculando = false;

let network = null;
let nodesDataSet = new vis.DataSet();
let edgesDataSet = new vis.DataSet();

const COLOR_POI = { border: '#e67e22', background: '#e67e22' };
const COLOR_NORMAL = { border: '#82bceeff', background: '#82bceeff' };
const COLOR_VISITADO = { border: '#2ecc71', background: 'rgba(46, 204, 113, 0.5)' };
const COLOR_ACTUAL = { border: '#0ff15aff', background: '#0ff15aff' };
const COLOR_CAMINO = '#e74c3c';
const COLOR_ARISTA = '#D8E0E7';

let nodeMap = {};
let adjacencyMatrix = [];

function generarGrafoCuadricula() {
  const filas = 7;
  const columnas = 8;
  const escala = 0.8; // Factor para hacer el mapa más pequeño
  
  const nuevasCoordenadas = {
    // Coordenadas originales escaladas
    'A1': { x: 51*escala, y: 38*escala }, 'B1': { x: 208*escala, y: 37*escala }, 'C1': { x: 315*escala, y: 36*escala }, 'D1': { x: 425*escala, y: 34*escala }, 'E1': { x: 536*escala, y: 34*escala }, 'F1': { x: 648*escala, y: 34*escala }, 'G1': { x: 755*escala, y: 29*escala }, 'H1': { x: 914*escala, y: 24*escala },
    'A2': { x: 47*escala, y: 197*escala }, 'B2': { x: 211*escala, y: 197*escala }, 'C2': { x: 315*escala, y: 197*escala }, 'D2': { x: 425*escala, y: 194*escala }, 'E2': { x: 535*escala, y: 192*escala }, 'F2': { x: 641*escala, y: 187*escala }, 'G2': { x: 755*escala, y: 187*escala }, 'H2': { x: 913*escala, y: 183*escala },
    'A3': { x: 43*escala, y: 305*escala }, 'B3': { x: 211*escala, y: 306*escala }, 'C3': { x: 315*escala, y: 303*escala }, 'D3': { x: 427*escala, y: 305*escala }, 'E3': { x: 536*escala, y: 302*escala }, 'F3': { x: 643*escala, y: 300*escala }, 'G3': { x: 755*escala, y: 296*escala }, 'H3': { x: 913*escala, y: 292*escala },
    'A4': { x: 43*escala, y: 414*escala }, 'B4': { x: 209*escala, y: 414*escala }, 'C4': { x: 315*escala, y: 411*escala }, 'D4': { x: 429*escala, y: 408*escala }, 'E4': { x: 536*escala, y: 407*escala }, 'F4': { x: 643*escala, y: 404*escala }, 'G4': { x: 755*escala, y: 404*escala }, 'H4': { x: 913*escala, y: 401*escala },
    'A5': { x: 39*escala, y: 535*escala }, 'B5': { x: 208*escala, y: 528*escala }, 'C5': { x: 315*escala, y: 525*escala }, 'D5': { x: 427*escala, y: 517*escala }, 'E5': { x: 536*escala, y: 519*escala }, 'F5': { x: 643*escala, y: 514*escala }, 'G5': { x: 755*escala, y: 510*escala }, 'H5': { x: 910*escala, y: 506*escala },
    'A6': { x: 37*escala, y: 642*escala }, 'B6': { x: 207*escala, y: 638*escala }, 'C6': { x: 316*escala, y: 635*escala }, 'D6': { x: 427*escala, y: 628*escala }, 'E6': { x: 537*escala, y: 625*escala }, 'F6': { x: 645*escala, y: 619*escala }, 'G6': { x: 755*escala, y: 615*escala }, 'H6': { x: 910*escala, y: 611*escala },
    'A7': { x: 33*escala, y: 750*escala }, 'B7': { x: 207*escala, y: 745*escala }, 'C7': { x: 316*escala, y: 739*escala }, 'D7': { x: 425*escala, y: 730*escala }, 'E7': { x: 537*escala, y: 725*escala }, 'F7': { x: 646*escala, y: 725*escala }, 'G7': { x: 755*escala, y: 722*escala }, 'H7': { x: 908*escala, y: 713*escala },
  };
  
  const nodos = [];
  const aristas = [];
  
  const puntosDeInteres = {
    'A4': { label: 'Pollo Campero', category: 'Comida Rápida' },
    'A7': { label: 'Entrada', category: 'Punto de Partida' },
    'B4': { label: 'Mcdonalds', category: 'Comida Rápida' },
    'C3': { label: 'El viejo cafe', category: 'Cafés' },
    'D3': { label: 'Subway', category: 'Comida Rápida' },
    'D4': { label: 'Cafe condesa', category: 'Cafés' },
    'F2': { label: 'La cuevita de los Urquizu', category: 'Comida Tradicional' },
    'G6': { label: 'El adobe', category: 'Comida Tradicional' },
    'H6': { label: 'Café Sky', category: 'Cafés' },
    'G4': { label: 'Doña Luisa Xicotencatl', category: 'Comida Tradicional'},
    'G7': { label: 'La cabaña 22', category: 'Comida Extranjera'},
    'D6': { label: 'Miso Korean Restaurant', category: 'Comida Extranjera'},
    'B6': { label: 'El cazador Italiano Winebar', category: 'Comida Extranjera'}
  };
  
  for (let r = 0; r < filas; r++) {
    for (let c = 0; c < columnas; c++) {
      const id = `${String.fromCharCode('A'.charCodeAt(0) + c)}${r + 1}`;
      const esPOI = puntosDeInteres.hasOwnProperty(id);
      const coords = nuevasCoordenadas[id] || { x: 0, y: 0 };
      
      nodos.push({
        id: id,
        label: esPOI ? puntosDeInteres[id].label : id, // Mostrar ID en nodos normales
        x: coords.x,
        y: coords.y,
        category: esPOI ? puntosDeInteres[id].category : null,
        type: esPOI ? 'poi' : 'normal',
        shape: esPOI ? 'dot' : 'circle',
        size: esPOI ? 12 : 15,
        color: esPOI ? COLOR_POI : COLOR_NORMAL,
      });

    }
  }

  for (let r = 0; r < filas; r++) {
    for (let c = 0; c < columnas; c++) {
      const fromId = `${String.fromCharCode('A'.charCodeAt(0) + c)}${r + 1}`;
      if (c < columnas - 1) {
        const toId = `${String.fromCharCode('A'.charCodeAt(0) + c + 1)}${r + 1}`;
        const weight = ((r * 13 + c * 7) % 4) + 1;
        aristas.push({ 
          id: `${fromId}_${toId}`, from: fromId, to: toId, weight: weight,
          label: `${weight}km`,
          color: { color: COLOR_ARISTA, highlight: COLOR_CAMINO },
          width: 4,
        });
      }
      if (r < filas - 1) {
        const toId = `${String.fromCharCode('A'.charCodeAt(0) + c)}${r + 2}`;
        const weight = ((r * 17 + c * 5) % 5) + 1;
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

function prepararGrafo() {
  const n = graph.nodes.length;
  graph.nodes.forEach((node, i) => {
    nodeMap[node.id] = i;
  });

  // Inicializar matriz de adyacencia con Infinito
  adjacencyMatrix = Array(n).fill(null).map(() => Array(n).fill(Infinity));

  for (let i = 0; i < n; i++) {
    adjacencyMatrix[i][i] = 0;
  }

  graph.edges.forEach(edge => {
    const fromIndex = nodeMap[edge.from];
    const toIndex = nodeMap[edge.to];
    adjacencyMatrix[fromIndex][toIndex] = edge.weight;
    adjacencyMatrix[toIndex][fromIndex] = edge.weight;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  categoryFilter = document.getElementById('category-filter');
  endNodeSelect = document.getElementById('end-node');
  submitBtn = document.getElementById('submit-btn');
  prevBtn = document.getElementById('prev-btn');
  nextBtn = document.getElementById('next-btn');
  stepTitle = document.getElementById('step-title');
  stepDescription = document.getElementById('step-description');
  tableContainer = document.getElementById('table-container');
  stepCounter = document.getElementById('step-counter');
  navControls = document.getElementById('navigation-controls');

  populateCategoryFilter();
  populateDestinationFilter('Todos');
  categoryFilter.addEventListener('change', (e) => populateDestinationFilter(e.target.value));
  
  submitBtn.addEventListener('click', iniciarVisualizacion);
  prevBtn.addEventListener('click', pasoAnterior);
  nextBtn.addEventListener('click', siguientePaso);
  prepararGrafo();
  inicializarRed();
});

function populateCategoryFilter() {
  const categorias = ['Todos', 'Cafés', 'Comida Rápida', 'Comida Tradicional', 'Comida Extranjera'];
  categorias.forEach(cat => {
    const option = new Option(cat, cat);
    categoryFilter.add(option);
  });
}

function populateDestinationFilter(categoria) {
  endNodeSelect.innerHTML = '';
  
  const puntosDeInteres = graph.nodes.filter(n => n.type === 'poi' && n.label !== 'Entrada');
  const nodosFiltrados = (categoria === 'Todos')
    ? puntosDeInteres
    : puntosDeInteres.filter(n => n.category === categoria);

  nodosFiltrados.forEach(node => {
    const option = new Option(node.label, node.id);
    endNodeSelect.add(option);
  });

  if (endNodeSelect.options.length > 0) {
    endNodeSelect.selectedIndex = 0;
  }

  applyVisualHighlights();

  endNodeSelect.onchange = applyVisualHighlights;
}

function resetAllNodeColors() {
  const nodeUpdates = graph.nodes.map(n => ({
    id: n.id,
    color: n.type === 'poi' ? COLOR_POI : COLOR_NORMAL,
    size: n.type === 'poi' ? 12 : 5,
  }));
  nodesDataSet.update(nodeUpdates);
}

function applyVisualHighlights() {
  resetAllNodeColors(); // Empezar con todos los nodos en su estado base

  const currentCategory = categoryFilter.value;
  const puntosDeInteres = graph.nodes.filter(n => n.type === 'poi' && n.label !== 'Entrada');
  const nodosFiltrados = (currentCategory === 'Todos')
    ? puntosDeInteres
    : puntosDeInteres.filter(n => n.category === currentCategory);

  const categoryHighlightUpdates = nodosFiltrados.map(n => ({ id: n.id, color: COLOR_ACTUAL, size: 15 }));
  if (categoryHighlightUpdates.length > 0) nodesDataSet.update(categoryHighlightUpdates);

  const entradaNode = graph.nodes.find(node => node.label === 'Entrada');
  const destinoId = endNodeSelect.value;

  if (entradaNode && destinoId) {
    nodesDataSet.update([
      { id: entradaNode.id, color: COLOR_CAMINO, size: 18 },
      { id: destinoId, color: COLOR_CAMINO, size: 18 }
    ]);
  }
}

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
      dragNodes: false,
      dragView: false,
      zoomView: false,
      selectConnectedEdges: false,
    },
    layout: {
      hierarchical: false
    },
    autoResize: false,
    nodes: {
      font: { color: '#000000', size: 10, face: 'Poppins' },
      shapeProperties: {
        interpolation: false
      }
    },
    edges: {
      font: { color: '#000000', strokeWidth: 0, align: 'middle', size: 10 }
    }
  };
  network = new vis.Network(container, data, options);

  network.moveTo({
    position: { x: 400, y: 314 }, // Centrado para el nuevo tamaño
    scale: 1.0, // Mantenemos la escala de zoom
    offset: { x: 0, y: 0 }
  });

  network.on('click', function (params) {
    if (params.nodes.length > 0) {
      const nodeId = params.nodes[0];
      const clickedNode = graph.nodes.find(n => n.id === nodeId);
      
      if (clickedNode && clickedNode.label !== 'Entrada') {
        categoryFilter.value = clickedNode.category;
        populateDestinationFilter(clickedNode.category);
        endNodeSelect.value = nodeId;
        
        // Si el nodo clicado no es un POI, lo añadimos temporalmente al selector de destino
        if (clickedNode.type !== 'poi') {
          const tempOption = new Option(`Intersección (${nodeId})`, nodeId); // Crear una opción temporal
          endNodeSelect.innerHTML = '';
          endNodeSelect.add(tempOption);
          endNodeSelect.value = nodeId;
        }
        applyVisualHighlights();
      }
    }
  });
}

function iniciarVisualizacion() {
  const entradaNode = graph.nodes.find(node => node.label === 'Entrada');
  if (!entradaNode) {
    alert('Error: No se pudo encontrar el nodo de "Entrada".');
    return;
  }
  startNodeId = entradaNode.id;
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

function generarPasosDijkstra(startId, endId) {
  const pasosGenerados = [];
  
  const labels = {};
  graph.nodes.forEach(node => {
    labels[node.id] = {
      distance: Infinity,
      predecessors: [],
      status: 'temporal'
    };
  });

  labels[startId].distance = 0;
  labels[startId].predecessors = ['-'];

  pasosGenerados.push({
    labels: JSON.parse(JSON.stringify(labels)),
    currentVertexId: startId,
    fase: 'Inicialización',
    descripcion: `Se establece la etiqueta del origen <strong>${graph.nodes.find(n => n.id === startId).label}</strong> a [-, 0]. Todas las demás son [-, ∞].`
  });

  let currentVertexId = startId;

  while (currentVertexId) {
    const currentLabel = labels[currentVertexId];
    const currentVertexNode = graph.nodes.find(n => n.id === currentVertexId);
    let stepSummary = `Se selecciona el vértice temporal con menor etiqueta: <strong>${currentVertexNode.label.trim() || currentVertexId}</strong>.`;
    let stepLog = '';

    const neighbors = graph.edges.filter(edge => edge.from === currentVertexId || edge.to === currentVertexId);
    let updatesMade = false;

    for (const edge of neighbors) {
      const neighborId = edge.from === currentVertexId ? edge.to : edge.from;
      const neighborLabel = labels[neighborId];

      if (neighborLabel.status === 'temporal') {
        const newDistance = currentLabel.distance + edge.weight;
        const neighborNode = graph.nodes.find(n => n.id === neighborId);

        if (newDistance < neighborLabel.distance) {
          stepLog += `<tr><td>${neighborNode.label.trim() || neighborId}</td><td>${newDistance} &lt; ${neighborLabel.distance === Infinity ? '∞' : neighborLabel.distance}</td><td><strong>Sustituir</strong></td></tr>`;
          neighborLabel.distance = newDistance;
          neighborLabel.predecessors = [currentVertexId];
          updatesMade = true;
        } 
        else if (newDistance === neighborLabel.distance) {
          stepLog += `<tr><td>${neighborNode.label.trim() || neighborId}</td><td>${newDistance} = ${neighborLabel.distance}</td><td><strong>Marcar</strong></td></tr>`;
          neighborLabel.predecessors.push(currentVertexId);
          updatesMade = true;
        }
        else {
            stepLog += `<tr><td>${neighborNode.label.trim() || neighborId}</td><td>${newDistance} &gt; ${neighborLabel.distance}</td><td>Ignorar</td></tr>`;
        }
      }
    }

    if (!updatesMade && neighbors.every(e => labels[e.from === currentVertexId ? e.to : e.from].status === 'permanente')) {
        stepLog = "<tr><td colspan='3'>Todos los vecinos ya son permanentes. No hay etiquetas que actualizar.</td></tr>";
    }

    labels[currentVertexId].status = 'permanente';
    stepSummary += `<br>Se exploran sus vecinos y el vértice <strong>${currentVertexNode.label.trim() || currentVertexId}</strong> ahora es <strong>permanente</strong>.`;

    pasosGenerados.push({
      labels: JSON.parse(JSON.stringify(labels)),
      currentVertexId: currentVertexId,
      fase: `Procesando: ${currentVertexNode.label.trim() || currentVertexId}`,
      descripcion: stepSummary,
      log: stepLog
    });

    if (currentVertexId === endId) {
      currentVertexId = null;
    } else {
      let nextVertexId = null;
      let minDistance = Infinity;
      for (const nodeId in labels) {
        if (labels[nodeId].status === 'temporal' && labels[nodeId].distance < minDistance) {
          minDistance = labels[nodeId].distance;
          nextVertexId = nodeId;
        }
      }
      currentVertexId = nextVertexId;
    }
  }

  const finalLabel = labels[endId];
  const finalPath = reconstruirCaminoDesdeEtiquetas(labels, startId, endId);
  const pathString = finalPath.map(id => graph.nodes.find(n => n.id === id).label).join(' → ');

  pasosGenerados.push({
    labels: JSON.parse(JSON.stringify(labels)),
    currentVertexId: endId,
    fase: 'Finalizado',
    descripcion: finalLabel.distance === Infinity ? 'No se encontró una ruta.' : `Ruta más corta encontrada: ${pathString} con una distancia total de ${finalLabel.distance} km.`
  });

  return pasosGenerados;
}

function reconstruirCaminoDesdeEtiquetas(labels, startId, endId) {
  const path = [];
  let currentId = endId;
  while (currentId && currentId !== startId) {
    path.unshift(currentId);
    const label = labels[currentId];
    if (label && label.predecessors.length > 0) {
      currentId = label.predecessors[0];
    } else {
      currentId = null;
    }
  }
  if (currentId === startId) {
    path.unshift(startId);
  }
  return path;
}

function actualizarUI(paso) {
  stepTitle.innerHTML = paso.fase;
  stepDescription.innerHTML = paso.descripcion;
  stepCounter.innerHTML = `Paso: ${pasoActual + 1} / ${pasos.length}`;
  crearTabla(paso);
}

function crearTabla(paso) {
  if (!paso.log) {
    tableContainer.innerHTML = '';
    return;
  }

  let tablaHTML = '<table><thead><tr><th>Vecino Analizado</th><th>Comparación</th><th>Acción</th></tr></thead><tbody>';
  tablaHTML += paso.log;
  tablaHTML += '</tbody></table>';
  tableContainer.innerHTML = tablaHTML;
}

function actualizarVisualizacion() {
  const paso = pasos[pasoActual];
  actualizarUI(paso);

  const nodeUpdates = graph.nodes.map(n => ({
    id: n.id,
    color: n.type === 'poi' ? COLOR_POI : COLOR_NORMAL,
    size: n.type === 'poi' ? 12 : 15,
  }));
  nodesDataSet.update(nodeUpdates);

  const edgeUpdates = graph.edges.map(e => ({
    id: e.id,
    color: { color: COLOR_ARISTA, highlight: COLOR_CAMINO },
    width: 4,
  }));
  edgesDataSet.update(edgeUpdates);

  const updates = [];
  for (const nodeId in paso.labels) {
    const label = paso.labels[nodeId];
    if (label.status === 'permanente') {
      updates.push({ id: nodeId, color: COLOR_VISITADO });
    }
  }
  
  if (paso.currentVertexId && paso.labels[paso.currentVertexId].status !== 'permanente') {
    const actualNodeId = paso.currentVertexId;
    updates.push({ id: actualNodeId, color: { border: '#f1c40f', background: '#f1c40f' }, size: 15 });
  }

  nodesDataSet.update(updates);

  if (paso.fase === 'Finalizado') {
    const finalPath = reconstruirCaminoDesdeEtiquetas(paso.labels, startNodeId, endNodeSelect.value);
    highlightPath(finalPath);
  }
}

function highlightPath(pathIndices) {
  const edgeUpdates = [];
  for (let i = 0; i < pathIndices.length - 1; i++) {
    const fromId = pathIndices[i];
    const toId = pathIndices[i+1];
    let edgeId = `${fromId}_${toId}`;
    if (!edgesDataSet.get(edgeId)) {
      edgeId = `${toId}_${fromId}`;
    }
    edgeUpdates.push({ id: edgeId, color: { color: COLOR_CAMINO }, width: 7 });
  }
  edgesDataSet.update(edgeUpdates);

  const nodeUpdates = pathIndices.map(nodeId => {
    const node = graph.nodes.find(n => n.id === nodeId);
    return {
      id: nodeId,
      color: { border: COLOR_CAMINO, background: COLOR_CAMINO },
      size: node.type === 'poi' ? 18 : 20,
    };
  });
  nodesDataSet.update(nodeUpdates);
}
