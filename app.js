import { crearStore, ErrorConfiguracion } from './store.js';

/* =========================================================
   Definiciones
   ========================================================= */
const PERROS = { klaus: { nombre: 'Klaus' }, limon: { nombre: 'Limón' } };
const IDS = Object.keys(PERROS);
const SECCIONES = ['dashboard', 'perfil', 'crecimiento', 'salud', 'veterinario'];

const CAMPOS_PERFIL = [
  { k: 'nombre', l: 'Nombre', t: 'text' },
  { k: 'raza', l: 'Raza', t: 'text' },
  { k: 'sexo', l: 'Sexo', t: 'select', ops: ['', 'Macho', 'Hembra'] },
  { k: 'nacimiento', l: 'Fecha de nacimiento', t: 'date' },
  { k: 'llegada', l: 'Llegada a casa', t: 'date' },
  { k: 'color', l: 'Color y señas', t: 'text' },
  { k: 'microchip', l: 'Microchip', t: 'text' },
  { k: 'esterilizado', l: 'Esterilizado', t: 'select', ops: ['', 'Sí', 'No'] },
  { k: 'condicion', l: 'Condición corporal (1 a 9)', t: 'number', min: 1, max: 9, step: 0.5 },
  { k: 'alimento', l: 'Alimento actual', t: 'text' },
  { k: 'consumo', l: 'Consumo diario (g)', t: 'number' },
  { k: 'costoAlimento', l: 'Costo mensual del alimento (COP)', t: 'number' },
  { k: 'veterinario', l: 'Veterinario de cabecera', t: 'text' },
  { k: 'telefonoVet', l: 'Teléfono del veterinario', t: 'tel' },
  { k: 'notas', l: 'Notas (alergias, carácter, cuidados)', t: 'textarea' },
];

const TIPOS = {
  vacuna: { titulo: 'Vacuna', icono: 'jeringa', campos: [
    { k: 'nombre', l: 'Vacuna', t: 'text', req: true },
    { k: 'fecha', l: 'Fecha aplicada', t: 'date', req: true },
    { k: 'proxima', l: 'Próxima dosis', t: 'date' },
    { k: 'notas', l: 'Notas', t: 'textarea' },
  ] },
  desparasitacion: { titulo: 'Desparasitación', icono: 'gota', campos: [
    { k: 'nombre', l: 'Producto', t: 'text', req: true },
    { k: 'fecha', l: 'Fecha', t: 'date', req: true },
    { k: 'proxima', l: 'Próxima', t: 'date' },
    { k: 'notas', l: 'Notas', t: 'textarea' },
  ] },
  peso: { titulo: 'Medición', icono: 'pesa', campos: [
    { k: 'fecha', l: 'Fecha', t: 'date', req: true },
    { k: 'kg', l: 'Peso (kg)', t: 'number' },
    { k: 'altura', l: 'Altura a la cruz (cm)', t: 'number' },
    { k: 'notas', l: 'Notas', t: 'textarea' },
  ] },
  cita: { titulo: 'Visita al veterinario', icono: 'estetoscopio', campos: [
    { k: 'fecha', l: 'Fecha', t: 'date', req: true },
    { k: 'motivo', l: 'Motivo', t: 'text', req: true },
    { k: 'veterinario', l: 'Veterinario o clínica', t: 'text' },
    { k: 'costo', l: 'Costo (COP)', t: 'number' },
    { k: 'proxima', l: 'Próximo control', t: 'date' },
    { k: 'notas', l: 'Diagnóstico y notas', t: 'textarea' },
  ] },
};

/* Íconos de línea (trazo con currentColor) */
const P = {
  casa: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-5h4v5"/>',
  huella: '<ellipse cx="12" cy="16" rx="4.2" ry="3.4"/><circle cx="6.2" cy="10.2" r="1.9"/><circle cx="9.8" cy="6.6" r="1.9"/><circle cx="14.2" cy="6.6" r="1.9"/><circle cx="17.8" cy="10.2" r="1.9"/>',
  tendencia: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  corazon: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20Z"/>',
  estetoscopio: '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v2a5 5 0 0 0 10 0v-1"/><circle cx="20" cy="12" r="2"/>',
  dos: '<circle cx="8.5" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 19c.8-3 3-4.5 5.5-4.5S13.2 16 14 19"/><path d="M13 15.2c.9-.5 1.9-.7 3-.7 2.5 0 4.7 1.5 5.5 4.5"/>',
  campana: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  calendario: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h2M12 14h2M16 14h0M8 17h2M12 17h2"/>',
  regla: '<rect x="2.5" y="8" width="19" height="8" rx="1.5" transform="rotate(-35 12 12)"/><path d="M8.2 9.4l1.4 2M10.6 7.7l.9 1.3M13 6l1.4 2M15.4 4.3l.9 1.3"/>',
  pesa: '<path d="M6.5 8h11l2 12h-15Z"/><path d="M9.5 8a2.5 2.5 0 1 1 5 0"/>',
  pastel: '<path d="M4 20h16v-7H4Z"/><path d="M4 16c2 1.2 4 1.2 5.3 0 1.3 1.2 4 1.2 5.4 0 1.3 1.2 3.3 1.2 5.3 0"/><path d="M8 13v-3M12 13v-3M16 13v-3"/><path d="M8 7.5c-.6-.6-.6-1.4 0-2.5.6 1.1.6 1.9 0 2.5ZM12 7.5c-.6-.6-.6-1.4 0-2.5.6 1.1.6 1.9 0 2.5ZM16 7.5c-.6-.6-.6-1.4 0-2.5.6 1.1.6 1.9 0 2.5Z"/>',
  perro: '<path d="M5 19v-5.5L7 10h7.5l2.5-3.5h2.6l1.4 2-1.2 1.6H18V19"/><path d="M9 19v-4.5M15 19v-4.5"/><path d="M5 13.5 3 11.5"/><circle cx="18.6" cy="8.2" r=".4" fill="currentColor"/>',
  plato: '<path d="M3 12h18a9 9 0 0 1-18 0Z"/><path d="M7 12c.4-2 2.2-3 5-3s4.6 1 5 3"/>',
  jeringa: '<path d="M18 2l4 4M20 4l-3 3M17 7l-9.5 9.5-3-3L14 4Z"/><path d="M10.5 10.5l1.5 1.5M8.5 12.5l1.5 1.5M4.5 16.5 2 22l5.5-2.5"/>',
  gota: '<path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11Z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
  camara: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4Z"/><circle cx="12" cy="13" r="3.5"/>',
  cubiertos: '<path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10"/><path d="M17 21V3c-2 1.5-3 4-3 7h3"/>',
  lapiz: '<path d="M4 20h4L19 9l-4-4L4 16Z"/><path d="M13.5 6.5l4 4"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  salir: '<path d="M14 4h5v16h-5"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
  descarga: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M4 20h16"/>',
};
const ico = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

const PERRO_LINEA = `<svg viewBox="0 0 120 104" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M40 30c-6-10-18-12-24-6-5 6-2 20 6 30 3 4 8 4 10 0"/>
  <path d="M40 30c6-8 18-12 30-10 14 2 22 12 26 22 3 8 10 10 14 14 3 3 2 8-3 10-6 2-14 1-20-2"/>
  <path d="M93 64c-4 6-12 8-20 6"/>
  <circle cx="70" cy="42" r="2.5" fill="currentColor"/>
  <path d="M106 58c2 0 4 1 4 3"/>
  <path d="M38 52c0 14 4 26 12 36M60 74c-2 8 0 16 4 22M50 88c-6 4-14 6-24 6"/>
</svg>`;

/* =========================================================
   Estado
   ========================================================= */
const estado = {
  perro: 'klaus', seccion: 'dashboard', resumen: false,
  editando: false, editarAlLlegar: false, cargando: true, usuario: null,
  grafica: 'kg',
  perfiles: { klaus: {}, limon: {} },
  registros: { klaus: [], limon: [] },
  subs: [],
};
let store = null;
let dlgCtx = null;

/* =========================================================
   Utilidades
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nombreDe = id => estado.perfiles[id]?.nombre || PERROS[id].nombre;
const inicial = id => esc([...nombreDe(id)][0] || '?');
const tiene = v => v !== '' && v != null && !Number.isNaN(Number(v));

function hoy() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
function hoyISO() { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
function aFecha(s) { if (!s) return null; const d = new Date(s + 'T00:00:00'); return isNaN(d) ? null : d; }
function fechaCorta(s) {
  const d = aFecha(s);
  return d ? d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '') : esc(s || '');
}
function fechaNum(s) {
  const d = aFecha(s);
  return d ? `${String(d.getDate()).padStart(2, '0')} / ${String(d.getMonth() + 1).padStart(2, '0')} / ${d.getFullYear()}` : '';
}
function diasHasta(s) { const d = aFecha(s); return d ? Math.round((d - hoy()) / 86400000) : NaN; }
function cuandoRelativo(s) {
  const d = diasHasta(s);
  if (isNaN(d)) return '';
  if (d === 0) return 'Hoy';
  if (d === -1) return 'Ayer';
  if (d < 0 && d > -7) return `Hace ${-d} días`;
  return fechaCorta(s);
}
function mesesDesde(s) {
  const n = aFecha(s); if (!n) return null;
  const h = new Date();
  let m = (h.getFullYear() - n.getFullYear()) * 12 + h.getMonth() - n.getMonth();
  if (h.getDate() < n.getDate()) m--;
  return m < 0 ? null : m;
}
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
const num = (v, dec = 1) => Number(v).toLocaleString('es-CO', { maximumFractionDigits: dec });
const kg = v => `${num(v)} kg`;
const cm = v => `${num(v)} cm`;
const cop = v => Number(v).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

function edad(s) {
  const m = mesesDesde(s); if (m == null) return '';
  const a = Math.floor(m / 12), r = m % 12;
  if (a === 0) return plural(r, 'mes', 'meses');
  return r ? `${plural(a, 'año', 'años')} y ${plural(r, 'mes', 'meses')}` : plural(a, 'año', 'años');
}
function edadKPI(s) {
  const n = aFecha(s); if (!n) return null;
  const dias = Math.floor((hoy() - n) / 86400000);
  if (dias < 0) return null;
  const m = mesesDesde(s);
  if (m < 24) return { valor: `${num(dias / 30.4375)} <small>meses</small>`, nota: `≈ ${num(dias, 0)} días` };
  const a = Math.floor(m / 12), r = m % 12;
  return { valor: `${a} <small>${a === 1 ? 'año' : 'años'}</small>`, nota: r ? `y ${plural(r, 'mes', 'meses')}` : '' };
}

function chipPlazo(s) {
  const d = diasHasta(s);
  if (isNaN(d)) return '';
  if (d < 0) return `<span class="chip mal">Vencida hace ${plural(-d, 'día', 'días')}</span>`;
  if (d === 0) return `<span class="chip aviso">Es hoy</span>`;
  if (d <= 14) return `<span class="chip aviso">En ${plural(d, 'día', 'días')}</span>`;
  return `<span class="chip bien">En ${d} días</span>`;
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('visible'), 2600);
}
function banner(html) {
  const b = $('#banner');
  if (!html) { b.hidden = true; b.innerHTML = ''; return; }
  b.innerHTML = html; b.hidden = false;
}

/* =========================================================
   Consultas sobre los datos
   ========================================================= */
const registrosDe = (id, tipos) => estado.registros[id].filter(r => tipos.includes(r.tipo));
const mediciones = (id, campo) => registrosDe(id, ['peso']).filter(r => tiene(r[campo]) && aFecha(r.fecha));
const ultimaCita = id => registrosDe(id, ['cita']).find(r => r.fecha && diasHasta(r.fecha) <= 0);

// La aplicación más reciente de cada vacuna, producto o control, con su próxima fecha.
function pendientes(id) {
  const vistos = new Map();
  for (const r of registrosDe(id, ['vacuna', 'desparasitacion', 'cita'])) {
    const k = r.tipo === 'cita' ? 'cita' : r.tipo + '|' + (r.nombre || '').trim().toLowerCase();
    if (!vistos.has(k)) vistos.set(k, r);
  }
  return [...vistos.values()].filter(r => r.proxima).sort((a, b) => a.proxima.localeCompare(b.proxima));
}
const nombrePendiente = r => r.tipo === 'cita' ? 'Control veterinario' : `${TIPOS[r.tipo].titulo} ${r.nombre || ''}`.trim();
const urgentes = id => pendientes(id).filter(r => diasHasta(r.proxima) <= 14).length;

function descripcion(r) {
  if (r.tipo === 'peso') {
    const partes = [tiene(r.kg) ? kg(r.kg) : '', tiene(r.altura) ? cm(r.altura) : ''].filter(Boolean);
    return `Registro de medición: ${partes.join(', ')}`;
  }
  if (r.tipo === 'cita') return `Visita al veterinario: ${r.motivo || ''}`;
  return `${TIPOS[r.tipo]?.titulo || r.tipo}: ${r.nombre || ''}`;
}

/* =========================================================
   Formularios
   ========================================================= */
function campoHTML(c, valor, pref) {
  const id = pref + c.k;
  const v = esc(valor ?? '');
  let ctl;
  if (c.t === 'textarea') ctl = `<textarea id="${id}" name="${c.k}" rows="3">${v}</textarea>`;
  else if (c.t === 'select') {
    ctl = `<select id="${id}" name="${c.k}">${c.ops.map(o =>
      `<option value="${esc(o)}"${o === (valor ?? '') ? ' selected' : ''}>${o || 'Sin especificar'}</option>`).join('')}</select>`;
  } else {
    const extra = c.t === 'number'
      ? ` step="${c.step ?? 'any'}" min="${c.min ?? 0}"${c.max ? ` max="${c.max}"` : ''} inputmode="decimal"` : '';
    ctl = `<input id="${id}" name="${c.k}" type="${c.t}" value="${v}"${c.req ? ' required' : ''}${extra}>`;
  }
  return `<div class="campo${c.t === 'textarea' ? ' campo-ancho' : ''}"><label for="${id}">${c.l}</label>${ctl}</div>`;
}
function leerForm(form, campos) {
  const fd = new FormData(form), out = {};
  for (const c of campos) {
    const v = String(fd.get(c.k) ?? '').trim();
    out[c.k] = c.t === 'number' && v !== '' ? Number(v.replace(',', '.')) : v;
  }
  return out;
}

/* =========================================================
   Barra lateral y barra superior
   ========================================================= */
const rutaDe = (perro, seccion) => seccion === 'dashboard' ? perro : `${perro}-${seccion}`;

function renderSidebar() {
  const id = estado.perro;
  const actual = s => !estado.resumen && estado.seccion === s ? ' aria-current="page"' : '';
  const nav = [
    ['dashboard', 'casa', 'Dashboard'],
    ['perfil', 'huella', `Perfil de ${esc(nombreDe(id))}`],
    ['crecimiento', 'tendencia', 'Crecimiento'],
    ['salud', 'corazon', 'Salud'],
    ['veterinario', 'estetoscopio', 'Veterinario'],
  ];
  $('#sidebar').innerHTML = `
    <div class="marca">
      ${PERRO_LINEA}
      <div><div class="marca-nombre">KLAUS LIFE</div><div class="marca-lema">Canine Health &amp; Lifestyle</div></div>
    </div>
    <div class="perros" role="group" aria-label="Elegir perro">
      ${IDS.map(p => `<button class="perro-btn" data-ir="${rutaDe(p, estado.resumen ? 'dashboard' : estado.seccion)}" aria-pressed="${!estado.resumen && p === id}">
        <span class="avatar">${estado.perfiles[p].foto ? `<img src="${esc(estado.perfiles[p].foto)}" alt="">` : inicial(p)}</span>
        <span>${esc(nombreDe(p))}</span></button>`).join('')}
    </div>
    <nav class="nav">
      ${nav.map(([s, i, t]) => `<a href="#${rutaDe(id, s)}"${actual(s)}>${ico(i)}<span>${t}</span></a>`).join('')}
      <div class="nav-sep"></div>
      <a href="#resumen"${estado.resumen ? ' aria-current="page"' : ''}>${ico('dos')}<span>${esc(nombreDe('klaus'))} y ${esc(nombreDe('limon'))}</span></a>
    </nav>
    <div class="lema-card">
      ${ico('huella', 'huella')}
      Un gran compañero,<br>una gran historia.
      <svg class="montes" viewBox="0 0 200 70" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 70V52l30-20 18 12 34-34 26 22 20-14 30 26 22-10 20 14v22Z" fill="rgba(237,230,214,.10)"/>
        <path d="M0 70V60l26-12 22 8 30-22 28 18 22-8 30 16 24-6 18 8v8Z" fill="rgba(237,230,214,.16)"/>
      </svg>
    </div>`;
}

function renderSesion() {
  const u = estado.usuario, el = $('#sesion');
  if (!u) { el.innerHTML = ''; return; }
  const n = u.permitido && !estado.resumen ? urgentes(estado.perro) : 0;
  const campana = u.permitido
    ? `<button class="icono-btn" data-ir="${rutaDe(estado.perro, 'salud')}" aria-label="Recordatorios${n ? `: ${n} próximos` : ''}">${ico('campana')}${n ? `<span class="insignia">${n}</span>` : ''}</button>`
    : '';
  el.innerHTML = u.demo
    ? `${campana}<span class="usuario">Modo demo (sin Firebase)</span>`
    : `${campana}<span class="usuario"><span class="avatar">${esc([...(u.nombre || '?')][0])}</span></span>
       <button class="btn btn-claro btn-mini" data-accion="salir">${ico('salir')}Salir</button>`;
}

/* =========================================================
   Render principal
   ========================================================= */
function render() {
  renderSidebar();
  renderSesion();
  const main = $('#main');

  if (estado.cargando) { main.innerHTML = '<p class="cargando">Cargando…</p>'; return; }

  const u = estado.usuario;
  if (!u || !u.permitido) {
    main.innerHTML = !u
      ? `<section class="card login">${PERRO_LINEA}<h1>KLAUS LIFE</h1>
          <p>Entra con la cuenta de Google de la familia para ver y cuidar a Klaus y Limón.</p>
          <button class="btn btn-primario" data-accion="entrar">Entrar con Google</button></section>`
      : `<section class="card login">${PERRO_LINEA}<h1>Sin acceso</h1>
          <p>${MOTIVOS[u.motivo] ? MOTIVOS[u.motivo](esc(u.email)) : 'Esta sesión no tiene acceso.'}</p>
          <button class="btn btn-sec" data-accion="salir">Entrar con otra cuenta</button></section>`;
    return;
  }

  if (estado.resumen) { main.innerHTML = vistaResumen(); return; }
  const vistas = { dashboard: vistaDashboard, perfil: vistaPerfil, crecimiento: vistaCrecimiento, salud: vistaSalud, veterinario: vistaVeterinario };
  // No borrar lo que se está escribiendo en la ficha si llega una actualización.
  if (estado.seccion === 'perfil' && estado.editando && $('#form-ficha')) return;
  main.innerHTML = vistas[estado.seccion](estado.perro);
  if (estado.seccion === 'perfil' && estado.editando) $('#p-nombre')?.focus();
}

const MOTIVOS = {
  'lista-vacia': () => 'No hay correos autorizados configurados en firebase-config.js.',
  'sin-correo': () => 'La cuenta no tiene un correo asociado.',
  'proveedor': e => `La cuenta ${e} no entró con Google. Usa “Entrar con Google”.`,
  'no-verificado': e => `El correo ${e} no está verificado en Google.`,
  'no-autorizado': e => `La cuenta ${e} no está autorizada para ver estos perfiles.`,
};

/* =========================================================
   Dashboard
   ========================================================= */
function vistaDashboard(id) {
  return `${heroHTML(id)}${kpisHTML(id)}
    <div class="fila-media">${evolucionHTML(id)}${saludCardHTML(id)}${fotoCardHTML(id)}</div>
    <div class="fila-baja">${nutricionHTML(id)}${actividadHTML(id)}${recordatoriosHTML(id)}</div>`;
}

function heroHTML(id) {
  const p = estado.perfiles[id];
  const portada = p.portada || p.foto;
  const datos = [
    ['calendario', 'Nacimiento', fechaNum(p.nacimiento)],
    ['casa', 'Llegada a casa', fechaNum(p.llegada)],
    ['perro', 'Raza', esc(p.raza || '')],
  ].filter(d => d[2]);
  return `<section class="hero" aria-label="Portada de ${esc(nombreDe(id))}">
    <div class="hero-foto">${portada ? `<img src="${esc(portada)}" alt="Foto de ${esc(nombreDe(id))}">` : `<div class="hero-vacia">${PERRO_LINEA}</div>`}</div>
    <label class="btn btn-mini hero-portada">${ico('camara')}${p.portada ? 'Cambiar portada' : 'Poner portada'}
      <input type="file" accept="image/*" class="sr-only" data-foto="portada"></label>
    <div class="hero-texto">
      <p class="hero-pre">Bienvenido a</p>
      <h1>${esc(nombreDe(id))} Life</h1>
      <p class="hero-lema">Su salud, crecimiento y felicidad, en un solo lugar.</p>
      <div class="hero-adorno">${ico('huella')}</div>
    </div>
    ${datos.length
      ? `<div class="hero-ficha">${datos.map(([i, l, v]) => `<div class="hero-dato">${ico(i)}<div><small>${l}</small><strong>${v}</strong></div></div>`).join('')}</div>`
      : `<div class="hero-ficha"><div class="hero-dato">${ico('lapiz')}<div><small>Ficha sin completar</small><button class="enlace" data-ir="${rutaDe(id, 'perfil')}" data-editar>Completar perfil ${ico('flecha')}</button></div></div></div>`}
  </section>`;
}

function sparkline(valores) {
  if (valores.length < 2) return '';
  const mn = Math.min(...valores), mx = Math.max(...valores), r = mx - mn || 1;
  const pts = valores.map((v, i) => `${(i / (valores.length - 1) * 66 + 2).toFixed(1)},${(27 - (v - mn) / r * 23).toFixed(1)}`).join(' ');
  return `<svg class="sparkline" viewBox="0 0 70 30" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}
function delta(lista, campo, fmt) {
  if (lista.length < 2) return lista.length ? fechaCorta(lista[0].fecha) : 'Sin registros';
  const d = Number(lista[0][campo]) - Number(lista[1][campo]);
  const signo = d > 0 ? '+' : d < 0 ? '−' : '±';
  const cls = d > 0 ? 'sube' : d < 0 ? 'baja' : '';
  return `<span class="${cls}">${d > 0 ? '↑' : d < 0 ? '↓' : ''} ${signo}${fmt(Math.abs(d))}</span><br>vs. medición anterior`;
}

function kpisHTML(id) {
  const p = estado.perfiles[id];
  const pesos = mediciones(id, 'kg'), alturas = mediciones(id, 'altura');
  const e = edadKPI(p.nacimiento);
  const cc = tiene(p.condicion) ? Math.min(9, Math.max(1, Number(p.condicion))) : null;
  const tarjeta = (icono, label, cuerpo) =>
    `<div class="card kpi"><div class="kpi-icono">${ico(icono)}</div><div>${`<div class="kpi-label">${label}</div>`}${cuerpo}</div></div>`;
  return `<section class="kpis" aria-label="Indicadores">
    ${tarjeta('pesa', 'Peso actual', pesos.length
      ? `<div class="kpi-fila"><div class="kpi-valor">${num(pesos[0].kg)} <small>kg</small></div>${sparkline(pesos.slice(0, 6).reverse().map(r => Number(r.kg)))}</div><div class="kpi-nota">${delta(pesos, 'kg', kg)}</div>`
      : `<div class="kpi-valor">—</div><div class="kpi-nota"><button class="enlace" data-accion="agregar" data-tipo="peso">Registrar peso</button></div>`)}
    ${tarjeta('regla', 'Altura actual', alturas.length
      ? `<div class="kpi-fila"><div class="kpi-valor">${num(alturas[0].altura)} <small>cm</small></div>${sparkline(alturas.slice(0, 6).reverse().map(r => Number(r.altura)))}</div><div class="kpi-nota">${delta(alturas, 'altura', cm)}</div>`
      : `<div class="kpi-valor">—</div><div class="kpi-nota"><button class="enlace" data-accion="agregar" data-tipo="peso">Registrar altura</button></div>`)}
    ${tarjeta('pastel', 'Edad', e
      ? `<div class="kpi-valor">${e.valor}</div><div class="kpi-nota">${e.nota ? `(${e.nota})` : ''}</div>`
      : `<div class="kpi-valor">—</div><div class="kpi-nota">Agrega su fecha de nacimiento</div>`)}
    ${tarjeta('perro', 'Condición corporal', cc
      ? `<div class="kpi-valor">${num(cc)} <small>/ 9</small></div><div class="barra-prog" role="img" aria-label="${num(cc)} de 9"><i style="width:${(cc / 9 * 100).toFixed(0)}%"></i></div>`
      : `<div class="kpi-valor">—</div><div class="kpi-nota">Escala de 1 a 9</div>`)}
    ${tarjeta('plato', 'Alimento actual', p.alimento
      ? `<div class="kpi-valor texto">${esc(p.alimento)}</div><div class="kpi-nota"><button class="enlace" data-ir="${rutaDe(id, 'perfil')}">Ver detalles ${ico('flecha')}</button></div>`
      : `<div class="kpi-valor">—</div><div class="kpi-nota"><button class="enlace" data-ir="${rutaDe(id, 'perfil')}" data-editar>Agregar alimento</button></div>`)}
  </section>`;
}

/* Gráfica de evolución con ejes */
function pasoBonito(rango) {
  const bruto = rango / 4, pot = 10 ** Math.floor(Math.log10(bruto || 1)), n = bruto / pot;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pot;
}
function graficaHTML(id, campo) {
  const unidad = campo === 'kg' ? 'kg' : 'cm';
  const pts = mediciones(id, campo).map(r => ({ t: aFecha(r.fecha).getTime(), v: Number(r[campo]), f: r.fecha })).sort((a, b) => a.t - b.t);
  if (pts.length < 2) {
    return `<p class="grafica-vacia">Con dos mediciones de ${campo === 'kg' ? 'peso' : 'altura'} aparece la curva de crecimiento.
      <button class="enlace" data-accion="agregar" data-tipo="peso">Agregar medición ${ico('flecha')}</button></p>`;
  }
  const W = 460, H = 240, L = 36, R = 12, T = 12, B = 28;
  const vals = pts.map(p => p.v);
  const paso = pasoBonito(Math.max(...vals) - Math.min(0, ...vals) || 1);
  const ymin = Math.min(0, Math.floor(Math.min(...vals) / paso) * paso);
  const ymax = Math.ceil(Math.max(...vals) / paso) * paso || paso;
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
  const x = t => L + (t - t0) / (t1 - t0 || 1) * (W - L - R);
  const y = v => T + (1 - (v - ymin) / (ymax - ymin)) * (H - T - B);
  let rejilla = '';
  for (let v = ymin; v <= ymax + 1e-9; v += paso) {
    rejilla += `<line class="g-rejilla" x1="${L}" x2="${W - R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/>
      <text class="g-eje" x="${L - 8}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end">${num(v)}</text>`;
  }
  // Etiquetas de mes: una por mes distinto, máximo 7.
  const meses = [];
  for (const p of pts) {
    const d = new Date(p.t), k = d.getFullYear() * 12 + d.getMonth();
    if (!meses.some(m => m.k === k)) meses.push({ k, t: p.t, txt: d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '') });
  }
  const cada = Math.ceil(meses.length / 7);
  const etiquetas = meses.filter((_, i) => i % cada === 0).map(m =>
    `<text class="g-eje" x="${x(m.t).toFixed(1)}" y="${H - 8}" text-anchor="middle">${m.txt.charAt(0).toUpperCase() + m.txt.slice(1)}</text>`).join('');
  const linea = pts.map(p => `${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const area = `${x(t0).toFixed(1)},${y(ymin).toFixed(1)} ${linea} ${x(t1).toFixed(1)},${y(ymin).toFixed(1)}`;
  return `<div class="leyenda"><i></i>${campo === 'kg' ? 'Peso (kg)' : 'Altura (cm)'}</div>
    <div class="grafica-envoltura"><figure class="grafica" style="margin:0">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución de ${campo === 'kg' ? 'peso' : 'altura'}: de ${num(pts[0].v)} a ${num(pts[pts.length - 1].v)} ${unidad}">
        ${rejilla}
        <polygon class="g-area" points="${area}"/>
        <polyline class="g-linea" points="${linea}"/>
        ${pts.map(p => `<circle class="g-punto" cx="${x(p.t).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="5"><title>${fechaCorta(p.f)}: ${num(p.v)} ${unidad}</title></circle>`).join('')}
        ${etiquetas}
      </svg></figure></div>`;
}
function evolucionHTML(id) {
  return `<section class="card evolucion">
    <div class="card-cabeza">
      <h2 class="card-titulo">Evolución de ${esc(nombreDe(id))}</h2>
      <div class="pestanas" role="tablist" aria-label="Variable">
        <button role="tab" aria-selected="${estado.grafica === 'kg'}" data-accion="grafica" data-campo="kg">Peso</button>
        <button role="tab" aria-selected="${estado.grafica === 'altura'}" data-accion="grafica" data-campo="altura">Altura</button>
      </div>
    </div>
    <div id="grafica">${graficaHTML(id, estado.grafica)}</div>
  </section>`;
}

function saludCardHTML(id) {
  const p = estado.perfiles[id];
  const eventos = registrosDe(id, ['vacuna', 'desparasitacion', 'cita'])
    .filter(r => r.fecha && diasHasta(r.fecha) <= 0)
    .map(r => ({ fecha: r.fecha, icono: TIPOS[r.tipo].icono, texto: esc(r.tipo === 'cita' ? r.motivo || 'Visita al veterinario' : `${TIPOS[r.tipo].titulo}: ${r.nombre || ''}`) }));
  if (p.llegada && diasHasta(p.llegada) <= 0) eventos.push({ fecha: p.llegada, icono: 'casa', texto: 'Llegada a casa' });
  eventos.sort((a, b) => b.fecha.localeCompare(a.fecha));
  const recientes = eventos.slice(0, 3).reverse();
  const prox = pendientes(id)[0];
  const items = recientes.map(e => `<li class="lt-item"><span class="lt-check">${ico('check')}</span><span class="lt-icono">${ico(e.icono)}</span>
      <div class="lt-cuerpo"><div class="lt-fecha">${fechaCorta(e.fecha)}</div><div class="lt-texto">${e.texto}</div></div></li>`).join('');
  const proximo = prox ? `<li class="lt-item proximo"><span class="lt-check pendiente"></span><span class="lt-icono">${ico('calendario')}</span>
      <div class="lt-cuerpo"><div class="lt-fecha">Próximo: ${esc(nombrePendiente(prox))} ${chipPlazo(prox.proxima)}</div><div class="lt-texto">${fechaCorta(prox.proxima)}</div></div></li>` : '';
  return `<section class="card">
    <div class="card-cabeza"><h2 class="card-titulo">${ico('corazon')}Salud y controles</h2>
      <button class="enlace" data-ir="${rutaDe(id, 'salud')}">Ver historial ${ico('flecha')}</button></div>
    ${items || proximo ? `<ul class="linea-tiempo">${items}${proximo}</ul>`
      : `<p class="vacio">Registra vacunas, desparasitaciones y visitas para ver aquí su historia de salud.</p>`}
  </section>`;
}

function fotoCardHTML(id) {
  const p = estado.perfiles[id];
  return `<section class="card foto-card" aria-label="Foto de ${esc(nombreDe(id))}">
    ${p.foto ? `<img src="${esc(p.foto)}" alt="Foto de ${esc(nombreDe(id))}">` : `<div class="vacia">${PERRO_LINEA}</div>`}
    <label class="btn btn-mini btn-foto">${ico('camara')}${p.foto ? 'Cambiar foto' : 'Subir foto'}
      <input type="file" accept="image/*" class="sr-only" data-foto="foto"></label>
    <div class="foto-nombre">${esc(nombreDe(id))} ${ico('corazon')}</div>
  </section>`;
}

function nutricionHTML(id) {
  const p = estado.perfiles[id];
  const hay = p.alimento || tiene(p.consumo) || tiene(p.costoAlimento);
  return `<section class="card">
    <div class="card-cabeza"><h2 class="card-titulo">${ico('cubiertos')}Nutrición</h2>
      <button class="enlace" data-ir="${rutaDe(id, 'perfil')}" data-editar>${hay ? 'Editar' : 'Completar'} ${ico('flecha')}</button></div>
    ${hay ? `<div class="nutri"><div class="nutri-icono">${ico('plato')}</div><div>
        ${p.alimento ? `<div class="nutri-alimento">${esc(p.alimento)}</div>` : ''}
        <div class="nutri-label">Consumo diario</div>
        <div class="nutri-valor">${tiene(p.consumo) ? `${num(p.consumo, 0)} g/día` : '—'}</div>
        <div class="nutri-label" style="margin-top:10px">Costo mensual</div>
        <div class="nutri-costo">${tiene(p.costoAlimento) ? cop(p.costoAlimento) : '—'}</div>
      </div></div>`
      : `<p class="vacio">Agrega el alimento, la porción diaria y su costo mensual en el perfil.</p>`}
  </section>`;
}

function actividadHTML(id) {
  const recientes = [...estado.registros[id]]
    .sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''))
    .slice(0, 4);
  return `<section class="card">
    <div class="card-cabeza"><h2 class="card-titulo">${ico('lapiz')}Actividad reciente</h2></div>
    ${recientes.length ? `<ul class="lista-simple">${recientes.map(r =>
      `<li>${ico(TIPOS[r.tipo]?.icono || 'huella')}<span>${esc(descripcion(r))}</span><span class="cuando">${cuandoRelativo(r.fecha)}</span></li>`).join('')}</ul>`
      : `<p class="vacio">Aquí aparecen los últimos registros de ${esc(nombreDe(id))}.</p>`}
  </section>`;
}

function recordatoriosHTML(id) {
  const lista = pendientes(id).slice(0, 4);
  return `<section class="card">
    <div class="card-cabeza"><h2 class="card-titulo">${ico('campana')}Próximos recordatorios</h2>
      <button class="enlace" data-ir="${rutaDe(id, 'salud')}">Ver salud ${ico('flecha')}</button></div>
    ${lista.length ? `<ul class="lista-simple">${lista.map(r =>
      `<li>${ico(TIPOS[r.tipo].icono)}<span>${esc(nombrePendiente(r))}</span>
        <span class="cuando">${fechaCorta(r.proxima)}<span class="punto ${diasHasta(r.proxima) < 0 ? 'vencido' : r.tipo}" title="${diasHasta(r.proxima) < 0 ? 'Vencido' : ''}"></span></span></li>`).join('')}</ul>`
      : `<p class="vacio">Cuando registres una próxima dosis o control, aparece aquí.</p>`}
  </section>`;
}

/* =========================================================
   Perfil
   ========================================================= */
function vistaPerfil(id) {
  const p = estado.perfiles[id];
  const cabeza = `<div class="seccion-cabeza"><div><h1 class="seccion-titulo">Perfil de ${esc(nombreDe(id))}</h1>
      <p class="seccion-sub">${esc([p.raza, edad(p.nacimiento)].filter(Boolean).join(', ')) || 'Completa sus datos básicos.'}</p></div>
      ${estado.editando ? '' : `<button class="btn btn-primario" data-accion="editar-ficha">${ico('lapiz')}Editar perfil</button>`}</div>`;
  let cuerpo;
  if (estado.editando) {
    cuerpo = `<form id="form-ficha" class="card">
      <div class="form-grid">${CAMPOS_PERFIL.map(c => campoHTML(c, p[c.k] ?? (c.k === 'nombre' ? PERROS[id].nombre : ''), 'p-')).join('')}</div>
      <p class="ayuda">Condición corporal: 1 muy delgado, 4 a 5 ideal, 9 obesidad.</p>
      <div class="acciones"><button type="button" class="btn btn-sec" data-accion="cancelar-ficha">Cancelar</button>
        <button type="submit" class="btn btn-primario">Guardar perfil</button></div></form>`;
  } else {
    const filas = CAMPOS_PERFIL.filter(c => !['nombre', 'notas'].includes(c.k) && (c.t === 'number' ? tiene(p[c.k]) : p[c.k])).map(c => {
      let v = p[c.k];
      if (c.t === 'date') v = fechaCorta(v);
      else if (c.k === 'costoAlimento') v = cop(v);
      else if (c.k === 'consumo') v = `${num(v, 0)} g/día`;
      else if (c.k === 'condicion') v = `${num(v)} / 9`;
      else v = esc(v);
      if (c.k === 'telefonoVet') v = `<a href="tel:${esc(String(p[c.k]).replace(/\s/g, ''))}">${v}</a>`;
      return `<div class="dato"><dt>${c.l.replace(/ \(.*\)$/, '')}</dt><dd>${v}</dd></div>`;
    }).join('');
    cuerpo = `<section class="card">
      ${filas ? `<dl class="datos">${filas}</dl>` : `<p class="vacio">Aún no hay datos. Toca “Editar perfil” para agregar raza, fechas, alimento y veterinario.</p>`}
      ${p.notas ? `<div class="notas">${esc(p.notas)}</div>` : ''}</section>`;
  }
  return `${cabeza}<div class="perfil">${fotoCardHTML(id)}${cuerpo}</div>`;
}

/* =========================================================
   Listas de registros
   ========================================================= */
function registroHTML(r, vigentes) {
  const t = TIPOS[r.tipo] || { titulo: r.tipo, icono: 'huella' };
  let titulo; const sub = [];
  if (r.tipo === 'peso') titulo = [tiene(r.kg) ? kg(r.kg) : '', tiene(r.altura) ? cm(r.altura) : ''].filter(Boolean).join(' · ');
  else if (r.tipo === 'cita') {
    titulo = esc(r.motivo || 'Visita');
    if (r.veterinario) sub.push(esc(r.veterinario));
    if (tiene(r.costo)) sub.push(cop(r.costo));
  } else titulo = `<span class="registro-tipo">${t.titulo}</span>${esc(r.nombre || '')}`;
  const prox = r.proxima
    ? `<div class="registro-sub">${r.tipo === 'cita' ? 'Próximo control' : 'Próxima'}: ${fechaCorta(r.proxima)}${vigentes.has(r.id) ? ' ' + chipPlazo(r.proxima) : ''}</div>` : '';
  return `<li class="registro">
    <span class="lt-icono">${ico(t.icono)}</span>
    <div class="registro-fecha">${fechaCorta(r.fecha)}</div>
    <div><div class="registro-titulo">${titulo}</div>
      ${sub.length ? `<div class="registro-sub">${sub.join(', ')}</div>` : ''}${prox}
      ${r.notas ? `<div class="registro-notas">${esc(r.notas)}</div>` : ''}</div>
    <div class="registro-acciones">
      <button class="btn btn-sec btn-mini" data-accion="editar-reg" data-rid="${esc(r.id)}">Editar</button>
      <button class="btn btn-sec btn-mini btn-peligro" data-accion="borrar-reg" data-rid="${esc(r.id)}">Borrar</button>
    </div></li>`;
}
function listaHTML(id, tipos, vacio) {
  const regs = registrosDe(id, tipos);
  const vigentes = new Set(pendientes(id).map(r => r.id));
  return regs.length ? `<ul class="registros">${regs.map(r => registroHTML(r, vigentes)).join('')}</ul>` : `<p class="vacio">${vacio}</p>`;
}
const botonAgregar = (tipo, texto) => `<button class="btn btn-primario" data-accion="agregar" data-tipo="${tipo}">${ico('mas')}${texto}</button>`;

function vistaCrecimiento(id) {
  return `<div class="seccion-cabeza"><div><h1 class="seccion-titulo">Crecimiento</h1>
      <p class="seccion-sub">Peso y altura de ${esc(nombreDe(id))} a lo largo del tiempo.</p></div>
      <div class="botones">${botonAgregar('peso', 'Agregar medición')}</div></div>
    ${evolucionHTML(id)}
    <section class="card"><div class="card-cabeza"><h2 class="card-titulo">Mediciones</h2></div>
      ${listaHTML(id, ['peso'], 'Registra el peso y la altura cada vez que lo midas.')}</section>`;
}
function vistaSalud(id) {
  return `<div class="seccion-cabeza"><div><h1 class="seccion-titulo">Salud</h1>
      <p class="seccion-sub">Vacunas y desparasitaciones de ${esc(nombreDe(id))}.</p></div>
      <div class="botones">${botonAgregar('vacuna', 'Agregar vacuna')}${botonAgregar('desparasitacion', 'Agregar desparasitación')}</div></div>
    ${recordatoriosHTML(id)}
    <section class="card"><div class="card-cabeza"><h2 class="card-titulo">Historial</h2></div>
      ${listaHTML(id, ['vacuna', 'desparasitacion'], 'Al registrar la fecha de la próxima dosis, aparece en los recordatorios.')}</section>`;
}
function vistaVeterinario(id) {
  const p = estado.perfiles[id];
  return `<div class="seccion-cabeza"><div><h1 class="seccion-titulo">Veterinario</h1>
      <p class="seccion-sub">${p.veterinario ? `${esc(p.veterinario)}${p.telefonoVet ? `, <a href="tel:${esc(String(p.telefonoVet).replace(/\s/g, ''))}">${esc(p.telefonoVet)}</a>` : ''}` : `Visitas y controles de ${esc(nombreDe(id))}.`}</p></div>
      <div class="botones">${botonAgregar('cita', 'Agregar visita')}</div></div>
    <section class="card"><div class="card-cabeza"><h2 class="card-titulo">Visitas</h2></div>
      ${listaHTML(id, ['cita'], 'Aquí quedan las visitas al veterinario: motivo, diagnóstico, costo y próximo control.')}</section>`;
}

/* =========================================================
   Klaus y Limón
   ========================================================= */
function vistaResumen() {
  const tarjetas = IDS.map(id => {
    const p = estado.perfiles[id];
    const peso = mediciones(id, 'kg')[0], alt = mediciones(id, 'altura')[0];
    const pend = pendientes(id).slice(0, 3);
    const portada = p.portada || p.foto;
    return `<article class="card dos-card">
      <div class="dos-portada">${portada ? `<img src="${esc(portada)}" alt="">` : ''}<div class="foto-nombre">${esc(nombreDe(id))}</div></div>
      <div class="dos-cuerpo">
        <div class="mini-kpis">
          <div><small>Peso</small><strong>${peso ? kg(peso.kg) : '—'}</strong></div>
          <div><small>Altura</small><strong>${alt ? cm(alt.altura) : '—'}</strong></div>
          <div><small>Edad</small><strong>${esc(edad(p.nacimiento)) || '—'}</strong></div>
        </div>
        ${pend.length ? `<ul class="lista-simple">${pend.map(r => `<li>${ico(TIPOS[r.tipo].icono)}<span>${esc(nombrePendiente(r))}</span><span class="cuando">${fechaCorta(r.proxima)} ${chipPlazo(r.proxima)}</span></li>`).join('')}</ul>`
          : `<p class="vacio">Nada pendiente.</p>`}
        <div><button class="btn btn-sec" data-ir="${id}">Abrir dashboard de ${esc(nombreDe(id))} ${ico('flecha')}</button></div>
      </div></article>`;
  }).join('');
  const agenda = IDS.flatMap(id => pendientes(id).map(r => ({ ...r, perro: id }))).sort((a, b) => a.proxima.localeCompare(b.proxima));
  return `<div class="seccion-cabeza"><div><h1 class="seccion-titulo">${esc(nombreDe('klaus'))} y ${esc(nombreDe('limon'))}</h1>
      <p class="seccion-sub">Los dos de un vistazo.</p></div>
      <button class="btn btn-sec" data-accion="exportar">${ico('descarga')}Descargar respaldo</button></div>
    <div class="dos">${tarjetas}</div>
    <section class="card"><div class="card-cabeza"><h2 class="card-titulo">${ico('calendario')}Lo que viene para los dos</h2></div>
      ${agenda.length ? `<ul class="lista-simple">${agenda.map(r => `<li>${ico(TIPOS[r.tipo].icono)}<span><strong>${esc(nombreDe(r.perro))}</strong>: ${esc(nombrePendiente(r))}</span><span class="cuando">${fechaCorta(r.proxima)} ${chipPlazo(r.proxima)}</span></li>`).join('')}</ul>`
        : `<p class="vacio">Cuando registres próximas dosis o controles, aparecen aquí ordenados.</p>`}
    </section>`;
}

/* =========================================================
   Diálogo de registros
   ========================================================= */
function abrirDialogo(tipo, reg = null) {
  const t = TIPOS[tipo];
  dlgCtx = { tipo, rid: reg?.id || null, perro: estado.perro };
  const valores = reg || { fecha: hoyISO() };
  const dlg = $('#dlg');
  dlg.innerHTML = `<form id="form-reg">
      <h2>${reg ? 'Editar' : 'Agregar'} ${t.titulo.toLowerCase()} de ${esc(nombreDe(estado.perro))}</h2>
      <div class="form-grid">${t.campos.map(c => campoHTML(c, valores[c.k], 'r-')).join('')}</div>
      <div class="acciones"><button type="button" class="btn btn-sec" data-cerrar>Cancelar</button>
        <button type="submit" class="btn btn-primario">${reg ? 'Guardar cambios' : 'Agregar'}</button></div>
    </form>`;
  dlg.showModal();
  dlg.querySelector('input, select, textarea')?.focus();
}
async function guardarDialogo(form) {
  const { tipo, rid, perro } = dlgCtx;
  const datos = leerForm(form, TIPOS[tipo].campos);
  if (tipo === 'peso' && !tiene(datos.kg) && !tiene(datos.altura)) {
    toast('Escribe el peso, la altura o ambos'); $('#r-kg')?.focus(); return;
  }
  try {
    if (rid) await store.actualizarRegistro(perro, rid, datos);
    else await store.agregarRegistro(perro, { ...datos, tipo });
    $('#dlg').close();
    toast(rid ? 'Cambios guardados' : 'Registro agregado');
  } catch (e) { errorAccion(e); }
}

/* =========================================================
   Fotos (se guardan reducidas dentro de la ficha)
   ========================================================= */
async function procesarFoto(file, lado) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const escala = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * escala); c.height = Math.round(img.naturalHeight * escala);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    let q = 0.82, out = c.toDataURL('image/jpeg', q);
    while (out.length > 330000 && q > 0.45) { q -= 0.08; out = c.toDataURL('image/jpeg', q); }
    return out;
  } finally { URL.revokeObjectURL(url); }
}

/* =========================================================
   Errores
   ========================================================= */
function errorAccion(e) {
  console.error(e);
  toast(e?.code === 'permission-denied' ? 'Sin permiso para guardar' : 'No se pudo guardar');
}
function errorDatos(e) {
  console.error(e);
  banner(`No se pudieron leer los datos (${esc(e?.code || e?.message || 'error')}). Revisa que tu correo esté en las reglas de Firestore y que las reglas estén publicadas.`);
}
const ERRORES_LOGIN = {
  'auth/unauthorized-domain': 'Este sitio no está autorizado en Firebase. Agrega el dominio en Authentication → Configuración → Dominios autorizados.',
  'auth/operation-not-allowed': 'El inicio de sesión con Google no está habilitado en Firebase (Authentication → Método de acceso).',
  'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Permite ventanas emergentes para este sitio.',
  'auth/popup-closed-by-user': 'Se cerró la ventana de Google antes de terminar.',
  'auth/cancelled-popup-request': 'Se cerró la ventana de Google antes de terminar.',
  'auth/network-request-failed': 'No hay conexión con Google. Revisa tu internet.',
  'auth/invalid-api-key': 'La apiKey de firebase-config.js no es válida.',
  'auth/configuration-not-found': 'Authentication no está activado en el proyecto de Firebase.',
  'auth/internal-error': 'Firebase devolvió un error interno. Revisa que Authentication esté activado.',
};
function errorLogin(e) {
  const codigo = e?.code || 'desconocido';
  banner(`${esc(ERRORES_LOGIN[codigo] || 'No se pudo iniciar sesión.')} <small>(código: <code>${esc(codigo)}</code>)</small>`);
  toast('No se pudo iniciar sesión');
}

/* =========================================================
   Suscripciones
   ========================================================= */
function suscribir() {
  desuscribir();
  for (const id of IDS) {
    estado.subs.push(store.observarPerfil(id, p => { estado.perfiles[id] = p || {}; render(); }, errorDatos));
    estado.subs.push(store.observarRegistros(id, rs => { estado.registros[id] = rs; render(); }, errorDatos));
  }
}
function desuscribir() {
  estado.subs.forEach(f => { try { f(); } catch {} });
  estado.subs = [];
}

/* =========================================================
   Navegación
   ========================================================= */
function leerHash() {
  const h = decodeURIComponent(location.hash.slice(1));
  estado.editando = estado.editarAlLlegar;
  estado.editarAlLlegar = false;
  if (h === 'resumen') { estado.resumen = true; }
  else {
    const [perro, seccion] = h.split('-');
    estado.resumen = false;
    estado.perro = IDS.includes(perro) ? perro : 'klaus';
    estado.seccion = SECCIONES.includes(seccion) ? seccion : 'dashboard';
  }
  render();
  window.scrollTo(0, 0);
}

function exportar() {
  const blob = new Blob([JSON.stringify({ exportado: new Date().toISOString(), perfiles: estado.perfiles, registros: estado.registros }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `klaus-life-respaldo-${hoyISO()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* =========================================================
   Eventos
   ========================================================= */
document.addEventListener('click', async e => {
  if (e.target.closest('[data-cerrar]')) { $('#dlg').close(); return; }

  const ir = e.target.closest('[data-ir]');
  if (ir) {
    const destino = ir.dataset.ir;
    estado.editarAlLlegar = ir.hasAttribute('data-editar');
    if (location.hash.slice(1) === destino) leerHash(); else location.hash = destino;
    return;
  }

  const b = e.target.closest('[data-accion]');
  if (!b) return;
  const id = estado.perro;
  switch (b.dataset.accion) {
    case 'entrar':
      try { await store.auth.entrar(); } catch (err) { console.error(err); errorLogin(err); }
      break;
    case 'salir': await store.auth.salir(); break;
    case 'editar-ficha': estado.editando = true; render(); break;
    case 'cancelar-ficha': estado.editando = false; render(); break;
    case 'grafica': estado.grafica = b.dataset.campo; render(); $(`[data-accion="grafica"][data-campo="${b.dataset.campo}"]`)?.focus(); break;
    case 'agregar': abrirDialogo(b.dataset.tipo); break;
    case 'editar-reg': {
      const r = estado.registros[id].find(x => x.id === b.dataset.rid);
      if (r) abrirDialogo(r.tipo, r);
      break;
    }
    case 'borrar-reg':
      if (confirm(`¿Borrar este registro de ${nombreDe(id)}? No se puede deshacer.`)) {
        try { await store.borrarRegistro(id, b.dataset.rid); toast('Registro borrado'); } catch (err) { errorAccion(err); }
      }
      break;
    case 'exportar': exportar(); break;
  }
});

document.addEventListener('submit', async e => {
  if (e.target.id === 'form-ficha') {
    e.preventDefault();
    const id = estado.perro;
    const datos = leerForm(e.target, CAMPOS_PERFIL);
    if (!datos.nombre) datos.nombre = PERROS[id].nombre;
    try {
      await store.guardarPerfil(id, datos);
      estado.editando = false;
      render();
      toast('Perfil guardado');
    } catch (err) { errorAccion(err); }
  } else if (e.target.id === 'form-reg') {
    e.preventDefault();
    await guardarDialogo(e.target);
  }
});

document.addEventListener('change', async e => {
  const campo = e.target.dataset?.foto;
  if (!campo || !e.target.files?.[0]) return;
  const id = estado.perro;
  try {
    const dato = await procesarFoto(e.target.files[0], campo === 'portada' ? 1400 : 1000);
    await store.guardarPerfil(id, { [campo]: dato });
    render();
    toast(campo === 'portada' ? 'Portada actualizada' : 'Foto actualizada');
  } catch (err) { errorAccion(err); }
});

window.addEventListener('hashchange', leerHash);

/* =========================================================
   App instalable
   ========================================================= */
const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const instalada = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
let avisoInstalar = null;

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(err => console.warn('Service worker:', err));
}
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); avisoInstalar = e; $('#btn-instalar').hidden = false; });
window.addEventListener('appinstalled', () => { $('#btn-instalar').hidden = true; toast('App instalada'); });
if (esIOS && !instalada) $('#btn-instalar').hidden = false;

$('#btn-instalar').addEventListener('click', async () => {
  if (avisoInstalar) {
    avisoInstalar.prompt(); await avisoInstalar.userChoice; avisoInstalar = null; $('#btn-instalar').hidden = true; return;
  }
  $('#dlg').innerHTML = `<form><h2>Instalar en el iPhone</h2>
      <ol class="pasos"><li>Abre esta página en Safari.</li><li>Toca el botón Compartir, el cuadro con la flecha hacia arriba.</li>
      <li>Elige “Agregar a pantalla de inicio” y luego “Agregar”.</li></ol>
      <div class="acciones"><button type="button" class="btn btn-primario" data-cerrar>Entendido</button></div></form>`;
  $('#dlg').showModal();
});

/* =========================================================
   Arranque
   ========================================================= */
(async function iniciar() {
  leerHash();
  try {
    store = await crearStore();
  } catch (e) {
    console.error(e);
    estado.cargando = false;
    renderSidebar();
    $('#main').innerHTML = e instanceof ErrorConfiguracion
      ? `<section class="card login"><h1>Falta configuración</h1><p>Completa en firebase-config.js: ${e.faltantes.map(esc).join(', ')}.</p></section>`
      : `<section class="card login"><h1>Sin conexión</h1><p>No se pudo cargar Firebase. Revisa tu conexión y vuelve a intentar.</p></section>`;
    return;
  }
  if (store.modo === 'demo') {
    banner('Modo demo: no hay sesión de Firebase y los datos se guardan solo en este navegador.');
  }
  store.auth.observar(u => {
    estado.usuario = u;
    estado.cargando = false;
    if (u?.permitido) suscribir();
    else {
      desuscribir();
      estado.perfiles = { klaus: {}, limon: {} };
      estado.registros = { klaus: [], limon: [] };
      if ($('#dlg').open) $('#dlg').close();
    }
    render();
  });
})();
