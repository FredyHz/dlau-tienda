/* ═══════════════════════════════════════════════════════════
   D'LAU — admin.js
   Panel de administración conectado a Firebase (tiempo real)
   Contraseña por defecto: lau87
═══════════════════════════════════════════════════════════ */

/* ── CONFIGURACIÓN DE FIREBASE ─────────────────────────── */
const firebaseConfig = {
  apiKey: "AIzaSyCd56xyniNRwmb3c2Tg9wObPTOLf0L_n1E",
  authDomain: "tienda-d-lau.firebaseapp.com",
  projectId: "tienda-d-lau",
  storageBucket: "tienda-d-lau.firebasestorage.app",
  messagingSenderId: "92517852240",
  appId: "1:92517852240:web:bec0840d89dc048e281d55",
  measurementId: "G-GTTYDCVMWE"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const siteRef = db.collection('dlau').doc('site');

/* ── FILTRO DE CATEGORÍA ACTIVO EN LA VITRINA PÚBLICA ─────── */
let filtroActivo = "todas";

/* ── CONTRASEÑA (se guarda dentro de siteData.adminPass) ── */
let ADMIN_PASS = "lau87";

/* ═══════════════════════════════════════════════════════════
   ESTADO GLOBAL DE LA TIENDA (se sincroniza con Firebase)
═══════════════════════════════════════════════════════════ */
let siteData = {
  adminPass:   "lau87",
  topbar:      "ENVÍO GRATIS EN PEDIDOS MAYORES A $1,500 · NUEVA COLECCIÓN DISPONIBLE",
  navSlogan:   "Ropa, zapatos y accesorios",
  instagram:   "Instagram",
  logo:        "",
  heroEyebrow: "Nueva Temporada · 2026",
  heroSlogan:  "Ropa, zapatos y accesorios · Moda que te define",
  heroBg:      "",
  ofertaPct:   "30",
  ofertaTitulo:"En toda la colección de temporada",
  ofertaDesc:  "Piezas exclusivas con el estilo que te define.<br>Tiempo limitado · Solo esta semana.",
  ofertaImg:   "",
  categorias: [
    { id: "ropa-mujer",     nombre: "Ropa Mujer",     sub: "Nueva colección",     img: "" },
    { id: "ropa-hombre",    nombre: "Ropa Hombre",    sub: "Estilo y actitud",    img: "" },
    { id: "zapatos-mujer",  nombre: "Zapatos Mujer",  sub: "Primavera · Verano",  img: "" },
    { id: "zapatos-hombre", nombre: "Zapatos Hombre", sub: "Comodidad y estilo",  img: "" },
    { id: "accesorios",     nombre: "Accesorios",     sub: "Detalles que marcan", img: "" },
    { id: "ofertas",        nombre: "Ofertas",        sub: "Precios especiales",  img: "" }
  ],
  productos: [
    { n: "Blusa Perla",       p: "$890",   po: "",       b: "nuevo",  catId: "ropa-mujer",   img: "" },
    { n: "Falda Midi Satén",  p: "$1,200", po: "$1,600", b: "oferta", catId: "ofertas",      img: "" },
    { n: "Bolso Tote Piel",   p: "$2,400", po: "",       b: "",       catId: "accesorios",   img: "" },
    { n: "Sandalias Doradas", p: "$1,100", po: "",       b: "nuevo",  catId: "zapatos-mujer",img: "" }
  ],
  catalogos: []
};

/* Almacén temporal para archivos subidos en el panel (antes de guardar) */
let tmp = {};

/* ═══════════════════════════════════════════════════════════
   CONEXIÓN CON FIREBASE — TIEMPO REAL
═══════════════════════════════════════════════════════════ */
siteRef.onSnapshot((doc) => {
  if (doc.exists) {
    siteData = doc.data();
    ADMIN_PASS = siteData.adminPass || ADMIN_PASS;
  } else {
    /* Primera vez: no existe el documento, lo creamos con los valores por defecto */
    siteRef.set(siteData);
  }
  renderAll();
}, (error) => {
  console.error("Error de conexión con Firebase:", error);
  showToast('⚠ Sin conexión a la base de datos, verifica tu internet');
});

/* ── Guardar el estado actual en Firebase (se llama tras cada cambio) ── */
function guardarEnNube() {
  siteRef.set(siteData).catch((error) => {
    console.error("Error al guardar:", error);
    showToast('⚠ No se pudo guardar, revisa tu conexión');
  });
}

/* ═══════════════════════════════════════════════════════════
   RENDER GENERAL — actualiza toda la parte pública de la página
═══════════════════════════════════════════════════════════ */
function renderAll() {
  /* Topbar y navbar */
  const topbarEl = document.getElementById('el-topbar');
  if (topbarEl) topbarEl.textContent = siteData.topbar;

  const navSlogEl = document.getElementById('nav-slogan-el');
  if (navSlogEl) navSlogEl.textContent = siteData.navSlogan;

  const footIg = document.getElementById('foot-ig');
  if (footIg) footIg.textContent = siteData.instagram;

  /* Logo */
  if (siteData.logo) {
    const logoNav = document.getElementById('logo-nav');
    const logoHero = document.getElementById('hero-logo-img');
    if (logoNav)  logoNav.src  = siteData.logo;
    if (logoHero) { logoHero.src = siteData.logo; logoHero.style.display = ''; }
  }

  /* Hero */
  const eyebrowEl = document.getElementById('h-eyebrow');
  if (eyebrowEl) eyebrowEl.textContent = siteData.heroEyebrow;

  const sloganEl = document.getElementById('h-slogan');
  if (sloganEl) sloganEl.textContent = siteData.heroSlogan;

  if (siteData.heroBg) {
    const hero = document.getElementById('hero-section');
    if (hero) {
      hero.style.backgroundImage    = `url(${siteData.heroBg})`;
      hero.style.backgroundSize     = 'cover';
      hero.style.backgroundPosition = 'center';
    }
  }

  /* Oferta */
  const pctEl  = document.getElementById('o-pct-el');
  const titEl  = document.getElementById('o-tit-el');
  const descEl = document.getElementById('o-desc-el');
  if (pctEl)  pctEl.textContent  = siteData.ofertaPct;
  if (titEl)  titEl.textContent  = siteData.ofertaTitulo;
  if (descEl) descEl.innerHTML   = siteData.ofertaDesc;

  if (siteData.ofertaImg) {
    const vis = document.getElementById('oferta-vis');
    if (vis) {
      vis.style.position = 'relative';
      vis.innerHTML = `<img src="${siteData.ofertaImg}" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;">`;
    }
  }

  /* Categorías, productos y catálogos */
  renderCategoriasPub();
  renderFiltrosPub();
  renderProductos();
  renderCatalogosPub();

  /* Listas del panel admin (solo lectura, seguro refrescarlas siempre) */
  renderAdminProductos();
  renderAdminCatalogos();
}

/* ═══════════════════════════════════════════════════════════
   UTILIDAD — obtener el nombre de una categoría por su id
═══════════════════════════════════════════════════════════ */
function nombreCategoria(catId) {
  const cat = siteData.categorias.find(c => c.id === catId);
  return cat ? cat.nombre : "";
}

/* ═══════════════════════════════════════════════════════════
   RENDERIZADO DE CATEGORÍAS EN LA PÁGINA PÚBLICA
═══════════════════════════════════════════════════════════ */
function renderCategoriasPub() {
  const grid = document.getElementById('cats-grid');
  if (!grid) return;

  const iconos = ["👗", "🧥", "👠", "👞", "💍", "🏷"];

  grid.innerHTML = siteData.categorias.map((cat, i) => `
    <div class="cat" id="cat-${i}" onclick="filtrarPorCategoria('${cat.id}')">
      ${cat.img ? `<img class="cat-img-loaded" src="${cat.img}">` : ''}
      <div class="cat-ph" id="cat-ph-${i}" style="${cat.img ? 'display:none;' : ''}">
        <span class="cat-ph-icon">${iconos[i % iconos.length]}</span>
        <span class="cat-ph-txt">Sube foto desde el panel admin</span>
      </div>
      <div class="cat-overlay">
        <div class="cat-name" id="cat-name-${i}">${cat.nombre}</div>
        <div class="cat-sub2" id="cat-sub-${i}">${cat.sub}</div>
        <div class="cat-line"></div>
      </div>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════════════════════
   FILTRO DE PRODUCTOS POR CATEGORÍA (VITRINA PÚBLICA)
═══════════════════════════════════════════════════════════ */
function renderFiltrosPub() {
  const cont = document.getElementById('filtros-cat');
  if (!cont) return;

  let html = `<button class="filtro-btn ${filtroActivo === 'todas' ? 'activo' : ''}" onclick="filtrarPorCategoria('todas')">Todas</button>`;
  html += siteData.categorias.map(cat => `
    <button class="filtro-btn ${filtroActivo === cat.id ? 'activo' : ''}" onclick="filtrarPorCategoria('${cat.id}')">${cat.nombre}</button>
  `).join('');

  cont.innerHTML = html;
}

function filtrarPorCategoria(catId) {
  filtroActivo = catId;
  renderFiltrosPub();
  renderProductos();

  const prodSection = document.getElementById('productos');
  if (prodSection) prodSection.scrollIntoView({ behavior: 'smooth' });
}

/* ═══════════════════════════════════════════════════════════
   RENDERIZADO DE PRODUCTOS EN LA PÁGINA PÚBLICA
═══════════════════════════════════════════════════════════ */
function renderProductos() {
  const grid = document.getElementById('prods-grid');
  if (!grid) return;

  const lista = filtroActivo === 'todas'
    ? siteData.productos
    : siteData.productos.filter(p => p.catId === filtroActivo);

  if (lista.length === 0) {
    grid.innerHTML = '<div class="prods-vacio">No hay productos en esta categoría todavía.</div>';
    return;
  }

  grid.innerHTML = lista.map((p) => `
    <div class="prod">
      <div class="prod-visual">
        ${p.img
          ? `<img src="${p.img}" alt="${p.n}">`
          : `<span class="prod-visual-icon">🛍</span>
             <span class="prod-visual-txt">Foto del producto</span>`
        }
        ${p.b ? `<div class="prod-badge badge-${p.b}">${p.b === 'nuevo' ? 'Nuevo' : 'Oferta'}</div>` : ''}
        <div class="prod-fav">♡</div>
      </div>
      <div class="prod-info">
        <div class="prod-cat">${nombreCategoria(p.catId)}</div>
        <div class="prod-name">${p.n}</div>
        <div class="prod-precios">
          ${p.po ? `<span class="prod-precio-old">${p.po}</span>` : ''}
          <span class="prod-precio">${p.p}</span>
        </div>
      </div>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════════════════════
   RENDERIZADO DE PRODUCTOS EN EL PANEL ADMIN
═══════════════════════════════════════════════════════════ */
function renderAdminProductos() {
  const lista = document.getElementById('adm-prods-list');
  if (!lista) return;

  if (siteData.productos.length === 0) {
    lista.innerHTML = '<p style="font-size:11px;color:#888;letter-spacing:1px;">No hay productos aún.</p>';
    return;
  }

  lista.innerHTML = siteData.productos.map((p, i) => `
    <div class="adm-prod">
      ${p.img ? `<img src="${p.img}" style="width:100%;height:60px;object-fit:cover;margin-bottom:8px;">` : ''}
      <div class="adm-prod-n">${p.n}</div>
      <div class="adm-prod-p">${p.p}</div>
      <div class="adm-prod-c">${nombreCategoria(p.catId)}</div>
      <button class="adm-prod-del" onclick="eliminarProducto(${i})" title="Eliminar">✕</button>
    </div>
  `).join('');
}

/* ── Eliminar producto ─────────────────────────────────── */
function eliminarProducto(i) {
  if (confirm(`¿Eliminar "${siteData.productos[i].n}"?`)) {
    siteData.productos.splice(i, 1);
    renderAll();
    guardarEnNube();
    showToast('Producto eliminado');
  }
}

/* ── Llenar el <select> de categorías del formulario de productos ── */
function renderSelectCategoriasProducto() {
  const sel = document.getElementById('p-c');
  if (!sel) return;
  sel.innerHTML = siteData.categorias.map(cat => `<option value="${cat.id}">${cat.nombre}</option>`).join('');
}

/* ── Agregar producto nuevo (sin límite de cantidad) ───── */
function addProd() {
  const n  = document.getElementById('p-n').value.trim();
  const p  = document.getElementById('p-p').value.trim();
  const po = document.getElementById('p-po').value.trim();
  const b  = document.getElementById('p-b').value;
  const catId = document.getElementById('p-c').value;

  if (!n || !p) {
    alert('El nombre y el precio son obligatorios.');
    return;
  }

  siteData.productos.push({ n, p, po, b, catId, img: tmp.prodImg || '' });
  tmp.prodImg = '';

  /* Limpiar campos */
  ['p-n', 'p-p', 'p-po'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('p-b').value = '';
  document.getElementById('prev-prod-img').innerHTML = '';

  renderAll();
  guardarEnNube();
  showToast('¡Producto agregado y publicado en la nube! ✓');
}

/* ═══════════════════════════════════════════════════════════
   RENDERIZADO DE CATÁLOGOS EN LA PÁGINA PÚBLICA
═══════════════════════════════════════════════════════════ */
function renderCatalogosPub() {
  const contenedor = document.getElementById('cats-pub-list');
  if (!contenedor) return;

  if (siteData.catalogos.length === 0) {
    contenedor.innerHTML = '<div class="cat-empty-msg">Los catálogos aparecerán aquí cuando el administrador los suba.</div>';
    return;
  }

  contenedor.innerHTML = siteData.catalogos.map((cat) => `
    <a class="cat-pub-item" href="${cat.url || '#'}" target="_blank" ${cat.url ? '' : 'onclick="return false"'}>
      <span class="cat-pub-icon">📄</span>
      <div>
        <div class="cat-pub-name">${cat.n}</div>
        <div class="cat-pub-sub">${cat.url ? 'Ver / Descargar' : 'Próximamente'}</div>
      </div>
    </a>
  `).join('');
}

/* ── Renderizar catálogos en el panel admin ────────────── */
function renderAdminCatalogos() {
  const lista = document.getElementById('adm-cats-lista');
  if (!lista) return;

  if (siteData.catalogos.length === 0) {
    lista.innerHTML = '<p style="font-size:11px;color:#888;letter-spacing:1px;">No hay catálogos aún.</p>';
    return;
  }

  lista.innerHTML = siteData.catalogos.map((cat, i) => `
    <div class="adm-cat-item">
      <span>📄 ${cat.n}</span>
      <button class="adm-cat-del" onclick="eliminarCatalogo(${i})">✕</button>
    </div>
  `).join('');
}

/* ── Agregar catálogo ──────────────────────────────────── */
function addCat() {
  const n = document.getElementById('c-n').value.trim();
  if (!n) { alert('Escribe el nombre del catálogo.'); return; }

  siteData.catalogos.push({ n, url: tmp.catUrl || '' });
  tmp.catUrl = '';

  document.getElementById('c-n').value = '';
  document.getElementById('cat-fname').textContent = '';

  renderAll();
  guardarEnNube();
  showToast('Catálogo agregado ✓');
}

/* ── Eliminar catálogo ─────────────────────────────────── */
function eliminarCatalogo(i) {
  siteData.catalogos.splice(i, 1);
  renderAll();
  guardarEnNube();
  showToast('Catálogo eliminado');
}

/* ═══════════════════════════════════════════════════════════
   CATEGORÍAS — ADMIN (editar las 6 fijas + agregar nuevas)
═══════════════════════════════════════════════════════════ */
function renderCamposCategorias() {
  const contenedor = document.getElementById('cats-admin-fields');
  if (!contenedor) return;

  contenedor.innerHTML = siteData.categorias.map((cat, i) => `
    <div class="cat-admin-block">
      ${i >= 6 ? `<button class="cat-admin-del" onclick="eliminarCategoria(${i})" title="Eliminar categoría">✕</button>` : ''}
      <div class="cat-admin-block-title">Categoría ${i + 1}${i < 6 ? ' (fija)' : ' (extra)'}</div>
      <div class="fg">
        <label class="flbl">Nombre</label>
        <input class="fi" id="cat-n-${i}" value="${cat.nombre}" placeholder="Ej: Ropa Mujer">
      </div>
      <div class="fg">
        <label class="flbl">Subtítulo</label>
        <input class="fi" id="cat-s-${i}" value="${cat.sub}" placeholder="Ej: Nueva colección">
      </div>
      <div class="fg">
        <label class="flbl">Foto de la categoría</label>
        <div class="upl" onclick="document.getElementById('inp-cat-img-${i}').click()">
          <div style="font-size:24px;">📷</div>
          <p>Subir foto para esta categoría</p>
          <input type="file" id="inp-cat-img-${i}" accept="image/*" onchange="uploadCatImg(this, ${i})">
        </div>
        <div class="upl-prev" id="prev-cat-${i}">
          ${cat.img ? `<div class="upl-thumb"><img src="${cat.img}"></div>` : ''}
        </div>
      </div>
      <button class="btn-save" onclick="guardarCategoria(${i})">Guardar Categoría ${i + 1}</button>
    </div>
  `).join('');
}

/* ── Guardar una categoría ─────────────────────────────── */
function guardarCategoria(i) {
  const nombre = document.getElementById(`cat-n-${i}`).value.trim();
  const sub    = document.getElementById(`cat-s-${i}`).value.trim();

  if (nombre) siteData.categorias[i].nombre = nombre;
  if (sub)    siteData.categorias[i].sub    = sub;

  renderAll();
  renderSelectCategoriasProducto();
  guardarEnNube();

  showToast(`Categoría "${siteData.categorias[i].nombre}" guardada y publicada ✓`);
}

/* ── Agregar categoría nueva (además de las 6 fijas) ───── */
function addCategoria() {
  const base = "nueva-categoria-" + Date.now();
  siteData.categorias.push({ id: base, nombre: "Nueva Categoría", sub: "Descripción breve", img: "" });
  renderCamposCategorias();
  renderAll();
  renderSelectCategoriasProducto();
  guardarEnNube();
  showToast('Categoría agregada, edítala abajo ✓');
}

/* ── Eliminar categoría extra (no permite borrar las 6 fijas) ── */
function eliminarCategoria(i) {
  if (i < 6) {
    alert('Las 6 categorías principales no se pueden eliminar, solo editar.');
    return;
  }
  if (confirm(`¿Eliminar la categoría "${siteData.categorias[i].nombre}"?`)) {
    siteData.categorias.splice(i, 1);
    renderCamposCategorias();
    renderAll();
    renderSelectCategoriasProducto();
    guardarEnNube();
    showToast('Categoría eliminada');
  }
}

/* ═══════════════════════════════════════════════════════════
   GUARDAR — HERO
═══════════════════════════════════════════════════════════ */
function saveHero() {
  const eyebrow = document.getElementById('a-eyebrow').value.trim();
  const slogan  = document.getElementById('a-slogan').value.trim();

  if (eyebrow) siteData.heroEyebrow = eyebrow;
  if (slogan)  siteData.heroSlogan  = slogan;

  renderAll();
  guardarEnNube();
  showToast('Hero actualizado y publicado ✓');
}

/* ═══════════════════════════════════════════════════════════
   GUARDAR — OFERTA
═══════════════════════════════════════════════════════════ */
function saveOferta() {
  const pct  = document.getElementById('a-opct').value.trim();
  const tit  = document.getElementById('a-otit').value.trim();
  const desc = document.getElementById('a-odesc').value.trim();

  if (pct)  siteData.ofertaPct    = pct;
  if (tit)  siteData.ofertaTitulo = tit;
  if (desc) siteData.ofertaDesc   = desc.replace(/\n/g, '<br>');

  renderAll();
  guardarEnNube();
  showToast('Oferta actualizada y publicada ✓');
}

/* ═══════════════════════════════════════════════════════════
   GUARDAR — INFO GENERAL
═══════════════════════════════════════════════════════════ */
function saveInfo() {
  const topbar    = document.getElementById('a-topbar').value.trim();
  const navSlogan = document.getElementById('a-nav-slogan').value.trim();
  const ig        = document.getElementById('a-ig').value.trim();
  const newpass   = document.getElementById('a-newpass').value.trim();

  if (topbar)    siteData.topbar    = topbar;
  if (navSlogan) siteData.navSlogan = navSlogan;
  if (ig)        siteData.instagram = ig;

  /* Cambiar contraseña si se escribió una nueva */
  if (newpass) {
    if (newpass.length < 4) {
      alert('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    siteData.adminPass = newpass;
    ADMIN_PASS = newpass;
    document.getElementById('a-newpass').value = '';
  }

  renderAll();
  guardarEnNube();
  showToast('Información guardada y publicada ✓');
}

/* ═══════════════════════════════════════════════════════════
   SUBIDA DE IMÁGENES — FUNCIONES HELPER
═══════════════════════════════════════════════════════════ */

/* Lee un archivo y llama al callback con el base64.
   Nota: las imágenes se guardan como texto base64 dentro del documento
   de Firebase. Para que todo funcione bien, usa fotos ligeras (ideal:
   menos de 300-400 KB cada una). */
function leerArchivo(input, callback) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => callback(e.target.result, file.name);
  reader.readAsDataURL(file);
}

/* Genera el HTML de miniatura de previsualización */
function thumbHTML(src) {
  return `<div class="upl-thumb"><img src="${src}"></div>`;
}

/* ── Logo ──────────────────────────────────────────────── */
function uploadLogo(input) {
  leerArchivo(input, (data) => {
    siteData.logo = data;
    document.getElementById('prev-logo').innerHTML = thumbHTML(data);
    renderAll();
    guardarEnNube();
    showToast('Logo actualizado y publicado ✓');
  });
}

/* ── Fondo del hero ────────────────────────────────────── */
function uploadHeroBg(input) {
  leerArchivo(input, (data) => {
    siteData.heroBg = data;
    document.getElementById('prev-hero-bg').innerHTML = thumbHTML(data);
    renderAll();
    guardarEnNube();
    showToast('Fondo del hero actualizado y publicado ✓');
  });
}

/* ── Foto de producto (pendiente hasta que se agregue el producto) ── */
function uploadProdImg(input) {
  leerArchivo(input, (data) => {
    tmp.prodImg = data;
    document.getElementById('prev-prod-img').innerHTML = thumbHTML(data);
  });
}

/* ── Imagen de la oferta ───────────────────────────────── */
function uploadOfertaImg(input) {
  leerArchivo(input, (data) => {
    siteData.ofertaImg = data;
    document.getElementById('prev-oferta-img').innerHTML = thumbHTML(data);
    renderAll();
    guardarEnNube();
    showToast('Imagen de oferta actualizada y publicada ✓');
  });
}

/* ── Catálogo (PDF o imagen) — se guarda como URL temporal local ── */
function uploadCat(input) {
  const file = input.files[0];
  if (!file) return;

  /* Nota: esta URL solo funciona en el navegador donde se subió.
     Para que el catálogo sea visible en todos los dispositivos,
     lo ideal es subir el PDF a un servicio externo (Google Drive,
     Dropbox) y pegar aquí el link de descarga en el futuro. */
  tmp.catUrl = URL.createObjectURL(file);
  document.getElementById('cat-fname').textContent = '✓ ' + file.name;
}

/* ── Imagen de categoría ───────────────────────────────── */
function uploadCatImg(input, idx) {
  leerArchivo(input, (data) => {
    siteData.categorias[idx].img = data;
    document.getElementById(`prev-cat-${idx}`).innerHTML = thumbHTML(data);
    renderAll();
    guardarEnNube();
    showToast('Foto de categoría actualizada y publicada ✓');
  });
}

/* ═══════════════════════════════════════════════════════════
   CONTROL DEL PANEL ADMIN — ABRIR / CERRAR / LOGIN
═══════════════════════════════════════════════════════════ */
function openAdmin() {
  const overlay = document.getElementById('admOverlay');
  overlay.classList.add('open');

  /* Mostrar login, ocultar panel */
  document.getElementById('loginBox').style.display    = 'block';
  document.getElementById('admContent').style.display  = 'none';
  document.getElementById('passInp').value             = '';
  document.getElementById('loginErr').style.display    = 'none';

  /* Foco automático en el campo de contraseña */
  setTimeout(() => document.getElementById('passInp').focus(), 200);
}

function closeAdmin() {
  document.getElementById('admOverlay').classList.remove('open');
}

function checkPass() {
  const val = document.getElementById('passInp').value;

  if (val === ADMIN_PASS) {
    document.getElementById('loginBox').style.display   = 'none';
    document.getElementById('admContent').style.display = 'block';

    /* Cargar valores actuales en los formularios */
    cargarFormularios();
    renderSelectCategoriasProducto();
    renderAdminProductos();
    renderAdminCatalogos();
    renderCamposCategorias();

  } else {
    document.getElementById('loginErr').style.display = 'block';
    document.getElementById('passInp').value          = '';
    document.getElementById('passInp').focus();
  }
}

/* Cerrar panel al presionar Escape */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAdmin();
});

/* ── Cargar valores actuales de siteData en los campos del panel ── */
function cargarFormularios() {
  document.getElementById('a-eyebrow').value    = siteData.heroEyebrow  || '';
  document.getElementById('a-slogan').value     = siteData.heroSlogan   || '';
  document.getElementById('a-opct').value       = siteData.ofertaPct    || '';
  document.getElementById('a-otit').value       = siteData.ofertaTitulo || '';
  document.getElementById('a-odesc').value      = (siteData.ofertaDesc || '').replace(/<br>/g, '\n');
  document.getElementById('a-topbar').value     = siteData.topbar       || '';
  document.getElementById('a-nav-slogan').value = siteData.navSlogan    || '';
  document.getElementById('a-ig').value         = siteData.instagram    || '';
}

/* ═══════════════════════════════════════════════════════════
   CAMBIAR PESTAÑA DEL PANEL
═══════════════════════════════════════════════════════════ */
function switchTab(id, btn) {
  /* Desactivar todas las pestañas y secciones */
  document.querySelectorAll('.tab-s').forEach(t  => t.classList.remove('on'));
  document.querySelectorAll('.adm-tab').forEach(b => b.classList.remove('on'));

  /* Activar la seleccionada */
  document.getElementById('tab-' + id).classList.add('on');
  btn.classList.add('on');

  /* Refrescar datos frescos de esa pestaña (por si otro dispositivo cambió algo) */
  if (id === 'categorias') renderCamposCategorias();
  if (id === 'prods')      { renderSelectCategoriasProducto(); renderAdminProductos(); }
  if (id === 'cats')       renderAdminCatalogos();
  if (id === 'hero' || id === 'oferta' || id === 'info') cargarFormularios();
}

/* ═══════════════════════════════════════════════════════════
   TOAST — NOTIFICACIÓN FLOTANTE
═══════════════════════════════════════════════════════════ */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg || 'Guardado ✓';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/* ═══════════════════════════════════════════════════════════
   NEWSLETTER — SUSCRIPCIÓN
═══════════════════════════════════════════════════════════ */
function suscribir() {
  const email = document.getElementById('nl-email').value.trim();
  if (!email || !email.includes('@')) {
    alert('Por favor ingresa un correo válido.');
    return;
  }
  document.getElementById('nl-email').value = '';
  showToast('¡Gracias por suscribirte! 👑');
}