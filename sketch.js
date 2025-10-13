// --- VARIABLES GLOBALES ---
let inputA, inputB, button;
let originalA, originalB;
let mcd = 0;
let pasos = [];
let pasoActual = 0;
let calculando = false;
let intervalo; // Para controlar la animación

// --- CONFIGURACIÓN INICIAL ---
function setup() {
  // Creamos el canvas y lo metemos dentro del div 'canvas-container'
  let canvasContainer = select('#canvas-container');
  let canvas = createCanvas(800, 500); // Tamaño fijo para el layout
  canvas.parent(canvasContainer);
  
  background('#1E1E1E'); // Un fondo oscuro para el canvas
  noLoop();

  // --- CONECTAMOS CON LOS ELEMENTOS HTML ---
  inputA = select('#input-a');
  inputB = select('#input-b');
  button = select('#submit-btn');
  
  // Asignamos la función al evento 'click' del botón
  button.mousePressed(iniciarVisualizacion);
}

// El resto del código (draw, iniciarVisualizacion, etc.) es EXACTAMENTE EL MISMO que te di antes.
// ¡Solo tienes que copiar y pegar el resto de las funciones de la versión anterior aquí abajo!

// --- DIBUJO PRINCIPAL ---
function draw() {
  if (calculando) {
    background('#1E1E1E');
    mostrarPaso(pasoActual);
    
    // Muestra el resultado final
    if (pasoActual === pasos.length - 1 && mcd !== 0) {
      fill('#FFFFFF');
      textAlign(CENTER);
      textSize(32);
      text(`MCD de ${originalA} y ${originalB} es: ${mcd}`, width / 2, height - 50);
      noLoop();
    }
  }
}

// --- FUNCIÓN PARA INICIAR EL PROCESO ---
function iniciarVisualizacion() {
  // Limpia cualquier animación anterior
  if (intervalo) clearInterval(intervalo);

  a = parseInt(inputA.value());
  b = parseInt(inputB.value());
  originalA = a;
  originalB = b;
  
  if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) {
    alert("Por favor, ingresa dos números enteros positivos.");
    return;
  }

  pasos = [];
  pasoActual = 0;
  mcd = 0;
  calculando = true;
  
  let tempA = a;
  let tempB = b;
  while (tempB !== 0) {
    pasos.push({a: tempA, b: tempB});
    let temp = tempB;
    tempB = tempA % tempB;
    tempA = temp;
  }
  mcd = tempA;
  pasos.push({a: tempA, b: 0});

  loop();
  
  intervalo = setInterval(() => {
    if (pasoActual < pasos.length - 1) {
      pasoActual++;
      redraw();
    } else {
      clearInterval(intervalo);
    }
  }, 1500);
}

// --- FUNCIÓN PARA DIBUJAR CADA PASO ---
function mostrarPaso(index) {
  let paso = pasos[index];
  let numA = paso.a;
  let numB = paso.b;

  if (numB === 0) {
    dibujarRectanguloFinal(numA);
    return;
  }

  let escala = min((width * 0.9) / numA, (height * 0.7) / numB);
  let w = numA * escala;
  let h = numB * escala;
  let x_inicio = (width - w) / 2;
  let y_inicio = 40;
  
  noFill();
  stroke('#FFFFFF');
  strokeWeight(2);
  rect(x_inicio, y_inicio, w, h);
  
  let tamCuadrado = numB * escala;
  let cantidad = floor(numA / numB);
  
  for (let i = 0; i < cantidad; i++) {
    fill(52, 152, 219, 80); // Azul semitransparente
    stroke('#3498db');
    rect(x_inicio + i * tamCuadrado, y_inicio, tamCuadrado, tamCuadrado);
  }

  let restoW = (numA % numB) * escala;
  if (restoW > 0) {
    fill(231, 76, 60, 150); // Rojo/Naranja semitransparente
    stroke('#e74c3c');
    rect(x_inicio + cantidad * tamCuadrado, y_inicio, restoW, tamCuadrado);
  }
  
  fill('#FFFFFF');
  noStroke();
  textAlign(CENTER);
  textSize(20);
  text(`Paso ${index + 1}: Dividir ${numA} entre ${numB}`, width / 2, y_inicio + h + 50);
  if (numA % numB !== 0) {
    text(`El resto es ${numA % numB}. El siguiente cálculo será MCD(${numB}, ${numA % numB}).`, width / 2, y_inicio + h + 80);
  } else {
     text(`La división es exacta.`, width / 2, y_inicio + h + 80);
  }
}

function dibujarRectanguloFinal(lado) {
  let escala = min((width * 0.8) / lado, (height * 0.6) / lado);
  let tam = lado * escala;
  let x = (width - tam) / 2;
  let y = 50;
  
  fill(46, 204, 113, 150); // Verde para el resultado
  stroke('#2ecc71');
  strokeWeight(3);
  rect(x, y, tam, tam);
  
  fill('#FFFFFF');
  noStroke();
  textAlign(CENTER);
  textSize(24);
  text(`El último resto no nulo es ${lado}.`, width / 2, y + tam + 50);
}