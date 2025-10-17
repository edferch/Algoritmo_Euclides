// --- VARIABLES GLOBALES ---
let inputA, inputB, inputC, submitBtn, prevBtn, nextBtn, stepCounter, navControls;
let originalA, originalB, originalC;
let mcd = 0;
let pasos = [];
let pasoActual = 0;
let calculando = false;

// --- COLORES ---
const COLOR_FONDO = '#1E1E1E';
const COLOR_TEXTO = '#FFFFFF';
const COLOR_CUADRADO = '#3498db'; // Azul
const COLOR_RESTO = '#e74c3c';   // Rojo
const COLOR_FINAL = '#2ecc71';   // Verde

// --- UTILIDAD: calcular pasos del algoritmo de Euclides ---
function euclidesPasos(a, b, etiqueta = '') {
  const lista = [];
  let x = a, y = b;
  while (y !== 0) {
    const resto = x % y;
    const cociente = Math.floor(x / y);
    lista.push({ a: x, b: y, resto, cociente, fase: etiqueta });
    const t = y;
    y = resto;
    x = t;
  }
  lista.push({ a: x, b: 0, resto: 0, cociente: 0, fase: etiqueta, final: true });
  return { pasos: lista, mcd: x };
}

// --- CONFIGURACIÓN INICIAL ---
function setup() {
  let canvasContainer = select('#canvas-container');
  let canvas = createCanvas(1000, 650);
  canvas.parent(canvasContainer);

  inputA = select('#input-a');
  inputB = select('#input-b');
  inputC = select('#input-c');
  submitBtn = select('#submit-btn');
  prevBtn = select('#prev-btn');
  nextBtn = select('#next-btn');
  stepCounter = select('#step-counter');
  navControls = select('#navigation-controls');

  submitBtn.mousePressed(iniciarVisualizacion);
  prevBtn.mousePressed(pasoAnterior);
  nextBtn.mousePressed(siguientePaso);

  background(COLOR_FONDO);
  noLoop();

  fill(COLOR_TEXTO);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(20);
  text('Ingresa dos o tres números y presiona "Visualizar"', width / 2, height / 2);
}

// --- DIBUJO PRINCIPAL ---
function draw() {
  if (!calculando) return;
  background(COLOR_FONDO);
  mostrarPaso(pasoActual);
  stepCounter.html(`Paso: ${pasoActual + 1} / ${pasos.length}`);
}

// --- LÓGICA DE CONTROL ---
function iniciarVisualizacion() {
  originalA = parseInt(inputA.value());
  originalB = parseInt(inputB.value());
  originalC = inputC ? parseInt(inputC.value()) : NaN;

  if (isNaN(originalA) || isNaN(originalB) || originalA <= 0 || originalB <= 0) {
    alert("Por favor, ingresa al menos dos números enteros positivos.");
    return;
  }

  pasos = [];
  pasoActual = 0;

  if (isNaN(originalC) || originalC <= 0) {
    // --- Caso: 2 números ---
    let numeros = [originalA, originalB].sort((a, b) => b - a);
    let A = numeros[0];
    let B = numeros[1];

    const faseAB = euclidesPasos(A, B, `MCD(${A}, ${B})`);
    mcd = faseAB.mcd;
    pasos.push(...faseAB.pasos);

    pasos.push({
      a: mcd, b: 0, resto: 0, cociente: 0,
      mensaje: `MCD(${originalA}, ${originalB}) = ${mcd}`,
      esFinal: true
    });

  } else {
    // --- Caso: 3 números ---
    let numeros = [originalA, originalB, originalC].sort((a, b) => b - a);
    let A = numeros[0];
    let B = numeros[1];
    let C = numeros[2];

    const faseAB = euclidesPasos(A, B, `Fase 1: MCD(${A}, ${B})`);
    const mcdAB = faseAB.mcd;
    pasos.push(...faseAB.pasos);

    pasos.push({
      a: mcdAB, b: 0, resto: 0, cociente: 0,
      mensaje: `MCD(${A}, ${B}) = ${mcdAB}. Continuamos con C = ${C}.`,
      esMensaje: true
    });

    // Ordenamos mcdAB y C de mayor a menor antes de la fase 2
    let numeros2 = [mcdAB, C].sort((a, b) => b - a);
    let X = numeros2[0];
    let Y = numeros2[1];

    const faseABC = euclidesPasos(X, Y, `Fase 2: MCD(${X}, ${Y})`);
    mcd = faseABC.mcd;
    pasos.push(...faseABC.pasos);

    pasos.push({
      a: mcd, b: 0, resto: 0, cociente: 0,
      mensaje: `MCD(${originalA}, ${originalB}, ${originalC}) = ${mcd}`,
      esFinal: true
    });
  }

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

// --- FUNCIÓN DE DIBUJO ---
function mostrarPaso(index) {
  const paso = pasos[index];

  // Mensajes intermedios y final sin geometría
  if (paso.esMensaje) {
    mostrarMensaje(paso.mensaje);
    return;
  }
  if (paso.esFinal) {
    mostrarFinal();
    return;
  }

  const numA = paso.a;
  const numB = paso.b;

  // Paso final de fase (b=0): mostrar cuadrado verde de esa fase
  if (paso.final && numB === 0) {
    mostrarCuadradoFinalFase(numA, paso.fase);
    return;
  }

  // --- Dibujo intermedio ---
  const escala = min((width * 0.9) / numA, (height * 0.65) / numB);
  const w = numA * escala;
  const h = numB * escala;
  const x_inicio = (width - w) / 2;
  const y_inicio = 70;

  // Contenedor
  noFill();
  stroke(COLOR_TEXTO);
  strokeWeight(2);
  rect(x_inicio, y_inicio, w, h);

  // Cuadrados azules (cociente)
  const tamCuadrado = numB * escala;
  for (let i = 0; i < paso.cociente; i++) {
    let x = x_inicio + i * tamCuadrado;

    // Cuadrado
    fill(COLOR_CUADRADO);
    stroke(COLOR_TEXTO);
    strokeWeight(2);
    rect(x, y_inicio, tamCuadrado, tamCuadrado);

    // Etiqueta centrada
    fill(COLOR_TEXTO);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text(`${paso.b}`, x + tamCuadrado / 2, y_inicio + tamCuadrado / 2);
  }

  // Rectángulo rojo (resto)
  if (paso.resto > 0) {
    const restoW = paso.resto * escala;
    let x = x_inicio + paso.cociente * tamCuadrado;

    fill(COLOR_RESTO);
    stroke(COLOR_TEXTO);
    strokeWeight(2);
    rect(x, y_inicio, restoW, tamCuadrado);

    // Etiqueta centrada
    fill(COLOR_TEXTO);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text(`${paso.resto}`, x + restoW / 2, y_inicio + tamCuadrado / 2);
  }

  // Textos explicativos
  fill(COLOR_TEXTO);
  noStroke();
  textAlign(CENTER);
  textSize(18);

  const tituloFase = paso.fase || '';
  if (tituloFase) {
    text(tituloFase, width / 2, 30);
  }

  let textoExplicativo = `Paso ${index + 1}: Dividimos ${numA} por ${numB}.`;
  if (paso.resto > 0) {
    textoExplicativo += ` Cabe ${paso.cociente} veces y sobran ${paso.resto}.`;
    text(`Siguiente: MCD(${numB}, ${paso.resto}).`, width / 2, y_inicio + h + 70);
  } else {
    textoExplicativo += ` La división es exacta.`;
  }
  text(textoExplicativo, width / 2, y_inicio + h + 40);
}

// --- Dibujo del cuadrado final de una fase ---
function mostrarCuadradoFinalFase(valor, etiqueta) {
  const escalaFinal = min(width * 0.35 / valor, height * 0.35 / valor);
  const tamFinal = valor * escalaFinal;
  const x = (width - tamFinal) / 2;
  const y = (height - tamFinal) / 2 - 40;

  // Cuadrado verde
  fill(COLOR_FINAL);
  stroke(COLOR_TEXTO);
  strokeWeight(3);
  rect(x, y, tamFinal, tamFinal);

  // Etiqueta dentro del cuadrado
  fill(COLOR_TEXTO);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(20);
  text(`${valor}`, x + tamFinal / 2, y + tamFinal / 2);

  // Texto explicativo debajo
  textAlign(CENTER);
  textSize(18);
  text(`${etiqueta} → MCD = ${valor}`, width / 2, y + tamFinal + 45);
}

// --- Mensaje intermedio ---
function mostrarMensaje(msg) {
  fill(COLOR_TEXTO);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(20);
  text(msg, width / 2, height / 2);
}

// --- Dibujo del resultado final global ---
function mostrarFinal() {
  const escalaFinal = min(width * 0.4 / mcd, height * 0.4 / mcd);
  const tamFinal = mcd * escalaFinal;
  const x = (width - tamFinal) / 2;
  const y = (height - tamFinal) / 2 - 40;

  // Cuadrado verde final
  fill(COLOR_FINAL);
  stroke(COLOR_TEXTO);
  strokeWeight(3);
  rect(x, y, tamFinal, tamFinal);

  // Etiqueta dentro
  fill(COLOR_TEXTO);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(22);
  text(`${mcd}`, x + tamFinal / 2, y + tamFinal / 2);

  // Texto explicativo debajo
  textAlign(CENTER);
  textSize(22);
  if (isNaN(originalC) || originalC <= 0) {
    text(`¡MCD(${originalA}, ${originalB}) = ${mcd}!`, width / 2, y + tamFinal + 45);
  } else {
    text(`¡MCD(${originalA}, ${originalB}, ${originalC}) = ${mcd}!`, width / 2, y + tamFinal + 45);
  }
}