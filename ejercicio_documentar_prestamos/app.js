const LIMITE_DE_PRESTAMOS_ACTIVOS = 5;
const LONGITUD_MINIMA_DEL_NOMBRE = 5;

const entradaEstudiante = document.querySelector("#entrada-estudiante");
const seleccionEquipo = document.querySelector("#seleccion-equipo");
const botonPrestar = document.querySelector("#boton-prestar");
const mensaje = document.querySelector("#mensaje");
const listado = document.querySelector("#listado");
const sinRegistros = document.querySelector("#sin-registros");
const contenedorFiltros = document.querySelector("#contenedor-filtros");
const totalPrestamos = document.querySelector("#total-prestamos");
const totalPendientes = document.querySelector("#total-pendientes");
const totalDevueltos = document.querySelector("#total-devueltos");
const botonLimpiar = document.querySelector("#boton-limpiar");

let filtroActual = "todos";
let consecutivo = 0;
//funcion para mostrar mensaje de error
function mostrarMensaje(texto) {
  mensaje.textContent = texto;
  mensaje.classList.add("visible");
}
//funcion para ocultar mensaje de error
function ocultarMensaje() {
  mensaje.textContent = "";
  mensaje.classList.remove("visible");
}
/**
 * Cuenta el número de préstamos por estado.
 * ciclo for que cuenta por diferentesestados 
 * prestamos
 * sin devolver
 * y devueltos
 * los retorna en la variable total
 */
function contarPorEstado(estado) {
  const filas = listado.children;
  let total = 0;

  for (let i = 0; i < filas.length; i = i + 1) {
    if (filas[i].dataset.estado === estado) {
      total = total + 1;
    }
  }

  return total;
}


/**
 * Verifica si un estudiante tiene un préstamo activo.
 * ciclo for que verifica si el estudiante tiene un prestamo activo
 * retorna true si lo tiene y false si no lo tiene
 */
function tienePrestamoActivo(nombre) {
  const filas = listado.children;

  for (let i = 0; i < filas.length; i = i + 1) {
    if (filas[i].dataset.titular === nombre.toLowerCase() &&
        filas[i].dataset.estado === "pendiente") {
      return true;
    }
  }

  return false;
}

/* funcion de 4 errores posbibles en el sistema
1- si el nombre se manda vacio, retorne un mensaje 
2- longuitud de los caracteres en el nombre 
3- si el equipo prestado se manda vacio 
4- busca si el estudiante tiene un prestamo activo y retorna un mensaje de error
5- si se supera el limite de prestamos activos, retorna un mensaje de error
*/

function obtenerError(nombre, equipo) {
  if (nombre === "") {
    return "Escriba el nombre del estudiante.";
  }

  if (nombre.length < LONGITUD_MINIMA_DEL_NOMBRE) {
    return "El nombre debe tener al menos " + LONGITUD_MINIMA_DEL_NOMBRE + " caracteres.";
  }

  if (equipo === "") {
    return "Seleccione el equipo que se va a prestar.";
  }

  if (tienePrestamoActivo(nombre)) {
    return nombre + " tiene un equipo sin devolver.";
  }

  if (contarPorEstado("pendiente") >= LIMITE_DE_PRESTAMOS_ACTIVOS) {
    return "No se permiten mas de " + LIMITE_DE_PRESTAMOS_ACTIVOS + " prestamos simultaneos.";
  }

  return "";
}

/**
 * Crea una fila en el listado para un nuevo préstamo.
 * creando cada elemento de la fila y agregandole las clases y atributos necesarios
 * @param {*} nombre 
 * @param {*} equipo 
 * @returns 
 */

function crearFila(nombre, equipo) {
  consecutivo = consecutivo + 1;

  const fila = document.createElement("li");
  fila.classList.add("prestamo", "pendiente");
  fila.dataset.estado = "pendiente";
  fila.dataset.titular = nombre.toLowerCase();

  const codigo = document.createElement("span");
  codigo.classList.add("codigo");
  codigo.textContent = "P-" + consecutivo;

  const titular = document.createElement("span");
  titular.classList.add("titular");
  titular.textContent = nombre;

  const recurso = document.createElement("span");
  recurso.classList.add("recurso");
  recurso.textContent = equipo;

  const estado = document.createElement("span");
  estado.classList.add("estado");
  estado.textContent = "Sin devolver";

  const boton = document.createElement("button");
  boton.setAttribute("type", "button");
  boton.classList.add("boton-devolver");
  boton.textContent = "Devolver";

  fila.append(codigo, titular, recurso, estado, boton);

  return fila;
}

/**
 * Registra la devolución de un préstamo.
 * cambia el estado del prestamo a devuelto y actualiza la interfaz
 * el boton de devolver se desactiva y cambia su texto a "Devolucion registrada"
 * @param {*} fila 
 */

function registrarDevolucion(fila) {
  fila.dataset.estado = "devuelto";
  fila.classList.remove("pendiente");
  fila.classList.add("devuelto");
  fila.querySelector(".estado").textContent = "Devuelto";

  const boton = fila.querySelector(".boton-devolver");
  boton.textContent = "Devolucion registrada";
  boton.disabled = true;

  actualizar();
}

/**
 * Retira los préstamos devueltos del listado.
 * ciclo for que recorre el listado de prestamos y elimina los que estan devueltos
 * el ciclo for va en secuencia inversa para evitar problemas al eliminar elementos del DOM mientras se itera
 * al final se llama a la funcion actualizar para actualizar los contadores y la interfaz
 */
function retirarDevueltos() {
  const filas = listado.children;

  for (let i = filas.length - 1; i >= 0; i = i - 1) {
    if (filas[i].dataset.estado === "devuelto") {
      filas[i].remove();
    }
  }

  actualizar();
}

/**
 * Aplica el filtro actual al listado de préstamos.
 * ciclo for que recorre el listado de prestamos y oculta los que no coinciden con el filtro actual
 * si el filtro es "todos", se muestran todos los prestamos
 */
function aplicarFiltro() {
  const filas = listado.children;

  for (let i = 0; i < filas.length; i = i + 1) {
    const coincide = filtroActual === "todos" || filas[i].dataset.estado === filtroActual;
    filas[i].classList.toggle("oculto", coincide === false);
  }
}

/**
 * Actualiza los contadores y la interfaz según el estado actual del listado.
 * llama a la funcion contarPorEstado para obtener el numero de prestamos pendientes y devueltos
 * actualiza los elementos del DOM con los valores obtenidos
 * muestra u oculta el mensaje de "sin registros" segun corresponda
 * llama a la funcion aplicarFiltro para actualizar la visualizacion del listado segun el filtro actual
 */
function actualizar() {
  const pendientes = contarPorEstado("pendiente");
  const devueltos = contarPorEstado("devuelto");

  totalPrestamos.textContent = listado.children.length;
  totalPendientes.textContent = pendientes;
  totalDevueltos.textContent = devueltos;

  sinRegistros.classList.toggle("oculto", listado.children.length > 0);
  aplicarFiltro();
}

/**
 * Registra un nuevo préstamo.
 * nombre y equipo se obtienen
 * se llama a la funcion obtenerError para validar los datos ingresados
 * si hay un error, se muestra el mensaje de error y se retorna
 * si no hay error, se oculta el mensaje de error, se crea una nueva fila en el listado y se actualiza la interfaz
 * trim() se utiliza para eliminar espacios en blanco al inicio y al final del nombre ingresado
 * focus() se utiliza para colocar el cursor en el campo de entrada del nombre despues de registrar un prestamo
 */

function registrarPrestamo() {
  const nombre = entradaEstudiante.value.trim();
  const equipo = seleccionEquipo.value;
  const error = obtenerError(nombre, equipo);

  if (error !== "") {
    mostrarMensaje(error);
    return;
  }

  ocultarMensaje();
  listado.append(crearFila(nombre, equipo));

  entradaEstudiante.value = "";
  seleccionEquipo.value = "";
  entradaEstudiante.focus();

  actualizar();
}

/**
 * Registra un nuevo préstamo.
 */
botonPrestar.addEventListener("click", function () {
  registrarPrestamo();
});

/**
 * registar prestamo al presionar la tecla enter
 */

entradaEstudiante.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    registrarPrestamo();
  }
});

/**
 * oculta el mensaje de error al escribir en el campo de entrada del nombre
 */
entradaEstudiante.addEventListener("input", function () {
  ocultarMensaje();
});

/**
 * Registra la devolución de un préstamo al hacer clic en el botón devolver
 * si el boton es nulo retorna
 * si no es nulo llama a la funcion registrarDevolucion con la fila correspondiente
 */

listado.addEventListener("click", function (event) {
  const boton = event.target.closest(".boton-devolver");

  if (boton === null) {
    return;
  }

  registrarDevolucion(boton.closest(".prestamo"));
});

/**
 * Aplica el filtro seleccionado al hacer clic en un botón de filtro
 * si el boton es nulo o no consigue el boton retorna
 * selecciona el boton clickeado y le agrega la clase activo
 * se actualiza el filtroActual con el estado del boton clickeado y se llama a la funcion aplicarFiltro
 */

contenedorFiltros.addEventListener("click", function (event) {
  const boton = event.target.closest(".filtro");

  if (boton === null) {
    return;
  }

  const botones = contenedorFiltros.children;

  for (let i = 0; i < botones.length; i = i + 1) {
    botones[i].classList.remove("activo");
  }

  boton.classList.add("activo");
  filtroActual = boton.dataset.estado;
  aplicarFiltro();
});


/**
 *  boton para limpiar los prestamos devueltos
 * si no hay prestamos devueltos, muestra un mensaje de error
 *  si hay prestamos devueltos, llama a la funcion retirarDevueltos y oculta el mensaje de error
 */

botonLimpiar.addEventListener("click", function () {
  if (contarPorEstado("devuelto") === 0) {
    mostrarMensaje("No hay prestamos devueltos que retirar.");
    return;
  }

  retirarDevueltos();
  ocultarMensaje();
});

actualizar();
