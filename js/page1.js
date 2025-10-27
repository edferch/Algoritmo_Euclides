let inputA, inputB, inputC, submitBtn, prevBtn, nextBtn;
let stepCounter, navControls, stepTitle, stepDescription;
let originalA, originalB, originalC;
let mcd = 0;
let pasos = [];
let pasoActual = 0;
let calculando = false;

const COLOR_FONDO = '#1E1E1E';
const COLOR_TEXTO = '#FFFFFF';
const COLOR_CUADRADO = '#3498db';
const COLOR_RESTO = '#e74c3c';
const COLOR_FINAL = '#2ecc71';

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

function setup() {
  let canvasContainer = select('#canvas-container');
  let canvas = createCanvas(800, 520);
  canvas.parent(canvasContainer);

  inputA = select('#input-a');
  inputB = select('#input-b');
  inputC = select('#input-c');
  submitBtn = select('#submit-btn');
  prevBtn = select('#prev-btn');
  nextBtn = select('#next-btn');
  stepCounter = select('#step-counter');
  navControls = select('#navigation-controls');
  stepTitle = select('#step-title');
  stepDescription = select('#step-description');

  submitBtn.mousePressed(iniciarVisualizacion);
  prevBtn.mousePressed(pasoAnterior);
  nextBtn.mousePressed(siguientePaso);

  background(COLOR_FONDO);
  noLoop();

  actualizarPanelInfo(null);
}

function draw() {
  if (!calculando) return;
  background(COLOR_FONDO);
  mostrarPaso(pasoActual);
  actualizarPanelInfo(pasos[pasoActual]);
}

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

function actualizarPanelInfo(paso) {
  stepCounter.html(`Paso: ${pasoActual + 1} / ${pasos.length}`);

  if (!paso) {
    stepTitle.html('Descripción del Paso');
    stepDescription.html('Ingresa dos o tres números y presiona "Visualizar" para comenzar.');
    return;
  }

  stepTitle.html(paso.fase || 'Resultado Final');

  let desc = '';
  if (paso.esMensaje) {
    desc = paso.mensaje;
  } else if (paso.esFinal) {
    desc = `¡Cálculo completado! ${paso.mensaje}`;
  } else if (paso.final && paso.b === 0) {
    desc = `El residuo es 0. El MCD para esta fase es ${paso.a}.`;
  } else {
    desc = `Dividimos ${paso.a} entre ${paso.b}.<br><br>`;
    desc += `El número ${paso.b} cabe <strong>${paso.cociente}</strong> veces en ${paso.a}.<br><br>`;
    if (paso.resto > 0) {
      desc += `Queda un residuo de <strong>${paso.resto}</strong>.<br><br>Ahora, el siguiente paso será calcular el MCD de ${paso.b} y ${paso.resto}.`;
    } else {
      desc += `La división es exacta (residuo 0).`;
    }
  }
  stepDescription.html(desc);
}

function mostrarPaso(index) {
  const paso = pasos[index];

  if (paso.esMensaje) {
    background(COLOR_FONDO);
    return;
  }
  if (paso.esFinal) {
    mostrarFinal();
    return;
  }

  const numA = paso.a;
  const numB = paso.b;

  if (paso.final && numB === 0) {
    mostrarCuadradoFinalFase(numA);
    return;
  }

  // --- Dibujo intermedio ---
  const escala = min((width * 0.9) / numA, (height * 0.8) / numB);
  const w = numA * escala;
  const h = numB * escala;
  const x_inicio = (width - w) / 2;
  const y_inicio = 70;

  noFill();
  stroke(COLOR_TEXTO);
  strokeWeight(2);
  rect(x_inicio, y_inicio, w, h);

  const tamCuadrado = numB * escala;
  const textoCuadradoSize = constrain(tamCuadrado / 3, 14, 50);

  for (let i = 0; i < paso.cociente; i++) {
    let x = x_inicio + i * tamCuadrado;

    fill(COLOR_CUADRADO);
    stroke(COLOR_TEXTO);
    strokeWeight(2);
    rect(x, y_inicio, tamCuadrado, tamCuadrado);

    fill(COLOR_TEXTO);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(textoCuadradoSize);
    text(paso.b, x + tamCuadrado / 2, y_inicio + tamCuadrado / 2);
  }

  if (paso.resto > 0) {
    const restoW = paso.resto * escala;
    let x = x_inicio + paso.cociente * tamCuadrado;

    fill(COLOR_RESTO);
    stroke(COLOR_TEXTO);
    strokeWeight(2);
    rect(x, y_inicio, restoW, tamCuadrado);

    const textoRestoSize = constrain(min(restoW, tamCuadrado) / 2.5, 14, 50);
    fill(COLOR_TEXTO);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(textoRestoSize);
    text(paso.resto, x + restoW / 2, y_inicio + tamCuadrado / 2);
  }
}

function mostrarCuadradoFinalFase(valor) {
  const escala = min((width * 0.5) / valor, (height * 0.5) / valor);
  const tamFinal = valor * escala;
  const x = (width - tamFinal) / 2;
  const y = (height - tamFinal) / 2 - 40;

  fill(COLOR_FINAL);
  stroke(COLOR_TEXTO);
  strokeWeight(3);
  rect(x, y, tamFinal, tamFinal);

  const textoSize = constrain(tamFinal / 3, 16, 80);
  fill(COLOR_TEXTO);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(textoSize);
  text(valor, x + tamFinal / 2, y + tamFinal / 2);
}

function mostrarFinal() {
  const escala = min((width * 0.5) / mcd, (height * 0.5) / mcd);
  const tamFinal = mcd * escala;
  const x = (width - tamFinal) / 2;
  const y = (height - tamFinal) / 2 - 40;

  fill(COLOR_FINAL);
  stroke(COLOR_TEXTO);
  strokeWeight(3);
  rect(x, y, tamFinal, tamFinal);

  const textoSize = constrain(tamFinal / 3, 16, 80);
  fill(COLOR_TEXTO);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(textoSize);
  text(mcd, x + tamFinal / 2, y + tamFinal / 2);
}