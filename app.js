let DATA = null;
let modeloActual = null;

const vistaModelos = document.getElementById("vistaModelos");
const vistaUnidades = document.getElementById("vistaUnidades");

const gridModelos = document.getElementById("gridModelos");
const gridUnidades = document.getElementById("gridUnidades");

const estadoModelos = document.getElementById("estadoModelos");
const estadoUnidades = document.getElementById("estadoUnidades");

const buscadorModelos = document.getElementById("buscadorModelos");
const buscadorUnidades = document.getElementById("buscadorUnidades");
const filtroTipo = document.getElementById("filtroTipo");

const tituloUnidades = document.getElementById("tituloUnidades");
const subtituloUnidades = document.getElementById("subtituloUnidades");

document.getElementById("btnInicio").onclick = () => mostrarModelos();
document.getElementById("btnRecargar").addEventListener("click", () => {
  window.location.href = window.location.pathname + "?reload=" + new Date().getTime();
});


buscadorModelos.oninput = () => renderModelos();
buscadorUnidades.oninput = () => renderUnidades();
filtroTipo.onchange = () => renderUnidades();

function slugModelo(texto){
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function rutaImagenModelo(modelo){
  const s = slugModelo(modelo);

  // casos especiales (para no renombrar imágenes)
  const mapa = {
    "sq5-sportback": "sq5",
  };

  const nombre = mapa[s] || s;
  return `img/${nombre}.jpg`;
}



async function cargarDatos(){
  try{
    estadoModelos.textContent = "Cargando datos...";
    const res = await fetch("demos.json?ts=" + Date.now());
    DATA = await res.json();

    document.getElementById("timestamp").textContent =
      new Date().toLocaleString("es-MX");

    poblarFiltroTipo();
    mostrarModelos();
  }catch(err){
    estadoModelos.textContent = "Error cargando datos";
    console.error(err);
  }
}

function poblarFiltroTipo(){
  const tipos = new Set();
  Object.values(DATA.modelos).forEach(lista => {
    lista.forEach(u => {
      if(u.tipo) tipos.add(u.tipo);
    });
  });

  filtroTipo.innerHTML =
    `<option value="">Tipo (todos)</option>` +
    [...tipos].sort().map(t =>
      `<option value="${t}">${t}</option>`
    ).join("");
}

function mostrarModelos(){
  modeloActual = null;
  vistaUnidades.classList.add("hidden");
  vistaModelos.classList.remove("hidden");
  renderModelos();
}

function mostrarUnidades(modelo){
  modeloActual = modelo;
  vistaModelos.classList.add("hidden");
  vistaUnidades.classList.remove("hidden");

  const total = DATA.modelos[modelo].length;
  tituloUnidades.textContent = `Unidades: ${modelo}`;
  subtituloUnidades.textContent = `${total} demo(s)`;

  renderUnidades();
}

function renderModelos(){
  const q = buscadorModelos.value.toLowerCase();
  const modelos = Object.keys(DATA.modelos);

  const filtrados = modelos.filter(m =>
    m.toLowerCase().includes(q)
  );

  gridModelos.innerHTML = filtrados.map(m => `
    <div class="card" onclick="mostrarUnidades('${m}')">
      <div class="thumb thumb-img">
        <img
          src="${rutaImagenModelo(m)}"
          alt="${m}"
          loading="lazy"
          onerror="this.src='img/otros.jpg';"
        />
      </div>
      <div class="card-title">${m}</div>
      <div class="card-meta">${DATA.modelos[m].length} demo(s)</div>
    </div>
  `).join("");

  estadoModelos.textContent =
    `Mostrando ${filtrados.length} de ${modelos.length} modelos`;
}


function renderUnidades(){
  const q = buscadorUnidades.value.toLowerCase();
  const tipo = filtroTipo.value;

  const lista = DATA.modelos[modeloActual];

  const filtradas = lista.filter(u => {
    const texto = `
      ${u.modelo} ${u.chasis} ${u.color} ${u.anio} ${u.km}
    `.toLowerCase();

    return (!q || texto.includes(q)) &&
           (!tipo || u.tipo === tipo);
  });

  gridUnidades.innerHTML = filtradas.map(u => `
    <div class="card">
      <div class="thumb">Imagen</div>
      <div class="card-title">${u.modelo}</div>

      <div class="unidad-row">
        <span class="badge">KM: ${u.km || "-"}</span>
        <span class="badge">Año: ${u.anio ? parseInt(u.anio) : "-"}</span>
      </div>

      <div class="unidad-row">
        <span class="badge">Color: ${u.color || "-"}</span>
        <span class="badge">Tipo: ${u.tipo || "-"}</span>
      </div>

      <div class="unidad-row">
        <span class="badge">Chasis: ${u.chasis || "-"}</span>
      </div>

      <div class="card-meta" style="margin-top:8px">
        Accesorios: ${u.accesorios || "-"}
      </div>
    </div>
  `).join("");

  estadoUnidades.textContent =
    `Mostrando ${filtradas.length} de ${lista.length} unidades`;
}

// Arranque
cargarDatos();

