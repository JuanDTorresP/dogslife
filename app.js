import { crearStore, ErrorConfiguracion } from './store.js';

/* ---------- Definiciones ---------- */
const PERROS = { klaus: { nombre: 'Klaus' }, limon: { nombre: 'Limón' } };
const IDS = Object.keys(PERROS);
const VISTAS = [...IDS, 'resumen'];

const CAMPOS_PERFIL = [
  { k: 'nombre', l: 'Nombre', t: 'text' },
  { k: 'raza', l: 'Raza', t: 'text' },
  { k: 'sexo', l: 'Sexo', t: 'select', ops: ['', 'Macho', 'Hembra'] },
  { k: 'nacimiento', l: 'Fecha de nacimiento', t: 'date' },
  { k: 'color', l: 'Color y señas', t: 'text' },
  { k: 'microchip', l: 'Microchip', t: 'text' },
  { k: 'esterilizado', l: 'Esterilizado', t: 'select', ops: ['', 'Sí', 'No'] },
  { k: 'alimento', l: 'Alimento y porción', t: 'text' },
  { k: 'veterinario', l: 'Veterinario de cabecera', t: 'text' },
  { k: 'telefonoVet', l: 'Teléfono del veterinario', t: 'tel' },
  { k: 'notas', l: 'Notas (alergias, carácter, cuidados)', t: 'textarea' },
];

const TIPOS = {
  vacuna: { titulo: 'Vacuna', campos: [
    { k: 'nombre', l: 'Vacuna', t: 'text', req: true },
    { k: 'fecha', l: 'Fecha aplicada', t: 'date', req: true },
    { k: 'proxima', l: 'Próxima dosis', t: 'date' },
    { k: 'notas', l: 'Notas', t: 'textarea' },
  ] },
  desparasitacion: { titulo: 'Desparasitación', campos: [
    { k: 'nombre', l: 'Producto', t: 'text', req: true },
    { k: 'fecha', l: 'Fecha', t: 'date', req: true },
    { k: 'proxima', l: 'Próxima', t: 'date' },
    { k: 'notas', l: 'Notas', t: 'textarea' },
  ] },
  peso: { titulo: 'Peso', campos: [
    { k: 'fecha', l: 'Fecha', t: 'date', req: true },
    { k: 'kg', l: 'Peso (kg)', t: 'number', req: true },
    { k: 'notas', l: 'Notas', t: 'textarea' },
  ] },
  cita: { titulo: 'Visita al veterinario', campos: [
    { k: 'fecha', l: 'Fecha', t: 'date', req: true },
    { k: 'motivo', l: 'Motivo', t: 'text', req: true },
    { k: 'veterinario', l: 'Veterinario o clínica', t: 'text' },
    { k: 'costo', l: 'Costo (COP)', t: 'number' },
    { k: 'notas', l: 'Diagnóstico y notas', t: 'textarea' },
  ] },
};

const SECCIONES = [
  { id: 'salud', titulo: 'Vacunas y desparasitación', tipos: ['vacuna', 'desparasitacion'],
    vacio: 'Aún no hay vacunas ni desparasitaciones. Al registrar la fecha de la próxima dosis, aparece en “Lo próximo”.' },
  { id: 'peso', titulo: 'Peso', tipos: ['peso'],
    vacio: 'Registra el peso cada vez que lo peses para ver cómo cambia con el tiempo.' },
  { id: 'citas', titulo: 'Veterinario', tipos: ['cita'],
    vacio: 'Aquí quedan las visitas al veterinario: motivo, diagnóstico y costo.' },
];

/* ---------- Estado ---------- */
const estado = {
  vista: 'klaus',
  seccion: { klaus: 'salud', limon: 'salud' },
  editando: false,
  cargando: true,
  usuario: null,
  perfiles: { klaus: {}, limon: {} },
  registros: { klaus: [], limon: [] },
  subs: [],
};
let store = null;
let dlgCtx = null;

/* ---------- Utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nombreDe = id => estado.perfiles[id]?.nombre || PERROS[id].nombre;
const inicial = id => esc([...nombreDe(id)][0] || '?');

function hoy() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
function hoyISO() { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
function aFecha(s) { const d = new Date(s + 'T00:00:00'); return isNaN(d) ? null : d; }
function fechaCorta(s) {
  const d = s && aFecha(s);
  return d ? d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : esc(s || '');
}
function diasHasta(s) { const d = aFecha(s); return d ? Math.round((d - hoy()) / 86400000) : NaN; }
function mesesDesde(s) {
  const n = s && aFecha(s); if (!n) return null;
  const h = new Date();
  let m = (h.getFullYear() - n.getFullYear()) * 12 + h.getMonth() - n.getMonth();
  if (h.getDate() < n.getDate()) m--;
  return m < 0 ? null : m;
}
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
function edad(s) {
  const m = mesesDesde(s); if (m == null) return '';
  const a = Math.floor(m / 12), r = m % 12;
  if (a === 0) return plural(r, 'mes', 'meses');
  return r ? `${plural(a, 'año', 'años')} y ${plural(r, 'mes', 'meses')}` : plural(a, 'año', 'años');
}
function edadCorta(s) {
  const m = mesesDesde(s); if (m == null) return '';
  return m < 12 ? plural(m, 'mes', 'meses') : plural(Math.floor(m / 12), 'año', 'años');
}
const kg = v => `${Number(v).toLocaleString('es-CO', { maximumFractionDigits: 1 })} kg`;
const cop = v => Number(v).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

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
  toast.timer = setTimeout(() => t.classList.remove('visible'), 2400);
}
function banner(html) {
  const b = $('#banner');
  if (!html) { b.hidden = true; b.innerHTML = ''; return; }
  b.innerHTML = html; b.hidden = false;
}

/* ---------- Consultas sobre los datos ---------- */
const registrosDe = (id, tipos) => estado.registros[id].filter(r => tipos.includes(r.tipo));
const ultimoPeso = id => registrosDe(id, ['peso']).find(r => r.kg !== '' && r.kg != null);
const ultimaCita = id => registrosDe(id, ['cita']).find(r => r.fecha && diasHasta(r.fecha) <= 0);

// Para cada vacuna o producto, toma su aplicación más reciente y su próxima fecha.
function pendientes(id) {
  const vistos = new Map();
  for (const r of registrosDe(id, ['vacuna', 'desparasitacion'])) {
    const k = r.tipo + '|' + (r.nombre || '').trim().toLowerCase();
    if (!vistos.has(k)) vistos.set(k, r);
  }
  return [...vistos.values()].filter(r => r.proxima).sort((a, b) => a.proxima.localeCompare(b.proxima));
}

/* ---------- Formularios ---------- */
function campoHTML(c, valor, pref) {
  const id = pref + c.k;
  const v = esc(valor ?? '');
  let ctl;
  if (c.t === 'textarea') {
    ctl = `<textarea id="${id}" name="${c.k}" rows="3">${v}</textarea>`;
  } else if (c.t === 'select') {
    ctl = `<select id="${id}" name="${c.k}">${c.ops.map(o =>
      `<option value="${esc(o)}"${o === (valor ?? '') ? ' selected' : ''}>${o || 'Sin especificar'}</option>`).join('')}</select>`;
  } else {
    const extra = c.t === 'number' ? ' step="any" min="0" inputmode="decimal"' : '';
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

/* ---------- Placas ---------- */
function renderPlacas() {
  for (const id of IDS) {
    const p = estado.perfiles[id];
    const peso = ultimoPeso(id);
    $(`#tag-nombre-${id}`).textContent = nombreDe(id);
    $(`#tag-meta-${id}`).textContent =
      [edadCorta(p.nacimiento), peso ? kg(peso.kg) : ''].filter(Boolean).join(', ') || 'Sin datos aún';
    $(`#tag-foto-${id}`).innerHTML = p.foto ? `<img src="${esc(p.foto)}" alt="">` : inicial(id);
  }
  document.querySelectorAll('.tag').forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.view === estado.vista)));
}

function renderSesion() {
  const u = estado.usuario, el = $('#sesion');
  if (!u) { el.innerHTML = ''; return; }
  el.innerHTML = u.demo
    ? `<span>Modo demo (sin Firebase)</span>`
    : `<span>${esc(u.nombre)}</span><button class="btn btn-sec btn-mini" data-accion="salir">Salir</button>`;
}

const MOTIVOS = {
  'lista-vacia': () => 'No hay correos autorizados configurados en firebase-config.js.',
  'sin-correo': () => 'La cuenta no tiene un correo asociado.',
  'proveedor': e => `La cuenta ${e} no entró con Google. Usa “Entrar con Google”.`,
  'no-verificado': e => `El correo ${e} no está verificado en Google.`,
  'no-autorizado': e => `La cuenta ${e} no está autorizada para ver estos perfiles.`,
};

/* ---------- Vista principal ---------- */
function render() {
  document.body.dataset.dog = estado.vista;
  renderPlacas();
  const main = $('#main');

  if (estado.cargando) { main.dataset.montado = ''; main.innerHTML = '<p class="cargando">Cargando…</p>'; return; }

  const u = estado.usuario;
  if (!u || !u.permitido) {
    main.dataset.montado = '';
    main.innerHTML = !u
      ? `<section class="login"><h1>Klaus y Limón</h1>
          <p>Entra con la cuenta de Google de la familia para ver y editar sus fichas.</p>
          <button class="btn btn-primario" data-accion="entrar">Entrar con Google</button></section>`
      : `<section class="login"><h1>Sin acceso</h1>
          <p>${MOTIVOS[u.motivo] ? MOTIVOS[u.motivo](esc(u.email)) : 'Esta sesión no tiene acceso.'}</p>
          <button class="btn btn-sec" data-accion="salir">Entrar con otra cuenta</button></section>`;
    return;
  }

  if (estado.vista === 'resumen') {
    main.dataset.montado = 'resumen';
    main.innerHTML = vistaResumen();
    return;
  }

  if (main.dataset.montado !== estado.vista) {
    main.innerHTML = `
      <div class="dog-layout">
        <aside class="ficha" aria-label="Ficha">
          <div id="ficha-foto"></div>
          <div id="ficha-cuerpo"></div>
        </aside>
        <div class="columna">
          <div class="stats" id="stats"></div>
          <div class="segment" role="tablist" aria-label="Secciones" id="segment"></div>
          <section class="panel" id="panel"></section>
        </div>
      </div>`;
    main.dataset.montado = estado.vista;
  }
  renderFoto();
  renderFicha();
  renderRegistros();
}

/* ---------- Ficha ---------- */
function renderFoto() {
  const id = estado.vista, el = $('#ficha-foto');
  if (!el || !IDS.includes(id)) return;
  const p = estado.perfiles[id];
  el.innerHTML = `
    <div class="foto">
      ${p.foto ? `<img src="${esc(p.foto)}" alt="Foto de ${esc(nombreDe(id))}">` : `<span aria-hidden="true">${inicial(id)}</span>`}
      <label class="btn btn-flotante">${p.foto ? 'Cambiar foto' : 'Subir foto'}
        <input type="file" accept="image/*" id="foto-input" class="sr-only">
      </label>
    </div>`;
}

function renderFicha(forzar = false) {
  const id = estado.vista, el = $('#ficha-cuerpo');
  if (!el || !IDS.includes(id)) return;
  // No pisar lo que se está escribiendo si llega una actualización.
  if (!forzar && estado.editando && el.dataset.modo === 'edicion') return;
  const p = estado.perfiles[id];

  if (estado.editando) {
    el.dataset.modo = 'edicion';
    el.innerHTML = `
      <form id="form-ficha" class="form-ficha">
        <h2 class="form-titulo">Editar ficha de ${esc(nombreDe(id))}</h2>
        ${CAMPOS_PERFIL.map(c => campoHTML(c, p[c.k] ?? (c.k === 'nombre' ? PERROS[id].nombre : ''), 'p-')).join('')}
        <div class="acciones">
          <button type="button" class="btn btn-sec" data-accion="cancelar-ficha">Cancelar</button>
          <button type="submit" class="btn btn-primario">Guardar ficha</button>
        </div>
      </form>`;
    $('#p-nombre')?.focus();
    return;
  }

  el.dataset.modo = 'lectura';
  const sub = [p.raza, edad(p.nacimiento)].filter(Boolean).join(', ');
  const filas = CAMPOS_PERFIL
    .filter(c => !['nombre', 'notas'].includes(c.k) && p[c.k])
    .map(c => {
      let v = c.t === 'date' ? fechaCorta(p[c.k]) : esc(p[c.k]);
      if (c.k === 'telefonoVet') v = `<a href="tel:${esc(p[c.k].replace(/\s/g, ''))}">${v}</a>`;
      return `<div class="dato"><dt>${c.l}</dt><dd>${v}</dd></div>`;
    }).join('');

  el.innerHTML = `
    <h1 class="ficha-nombre">${esc(nombreDe(id))}</h1>
    ${sub ? `<p class="ficha-sub">${esc(sub)}</p>` : ''}
    ${filas ? `<dl class="datos">${filas}</dl>`
            : `<p class="ficha-vacia">Completa la ficha con la raza, la fecha de nacimiento y los datos de su veterinario.</p>`}
    ${p.notas ? `<div class="notas"><h2>Notas</h2><p>${esc(p.notas).replace(/\n/g, '<br>')}</p></div>` : ''}
    <button class="btn btn-primario ancho" data-accion="editar-ficha">Editar ficha</button>`;
}

/* ---------- Registros ---------- */
function renderRegistros() {
  const id = estado.vista;
  if (!$('#panel') || !IDS.includes(id)) return;

  const peso = ultimoPeso(id), pend = pendientes(id)[0], cita = ultimaCita(id);
  $('#stats').innerHTML = `
    <div class="stat">
      <div class="stat-label">Peso más reciente</div>
      <div class="stat-valor">${peso ? kg(peso.kg) : '—'}</div>
      <div class="stat-nota">${peso ? fechaCorta(peso.fecha) : 'Sin registros'}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Lo próximo</div>
      <div class="stat-valor stat-valor-texto">${pend ? esc(pend.nombre) : 'Nada pendiente'}</div>
      <div class="stat-nota">${pend ? `${fechaCorta(pend.proxima)} ${chipPlazo(pend.proxima)}` : ''}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Última visita al veterinario</div>
      <div class="stat-valor stat-valor-texto">${cita ? fechaCorta(cita.fecha) : 'Sin visitas'}</div>
      <div class="stat-nota">${cita ? esc(cita.motivo || '') : ''}</div>
    </div>`;

  const secId = estado.seccion[id];
  $('#segment').innerHTML = SECCIONES.map(s =>
    `<button role="tab" aria-selected="${s.id === secId}" data-accion="seccion" data-id="${s.id}">${s.titulo}</button>`).join('');

  const s = SECCIONES.find(x => x.id === secId);
  const regs = registrosDe(id, s.tipos);
  const vigentes = new Set(pendientes(id).map(r => r.id));
  const botones = s.tipos.map(t =>
    `<button class="btn btn-primario" data-accion="agregar" data-tipo="${t}">Agregar ${TIPOS[t].titulo.toLowerCase()}</button>`).join('');

  $('#panel').innerHTML = `
    <div class="panel-cabeza"><h2>${s.titulo}</h2><div class="botones">${botones}</div></div>
    ${regs.length
      ? `${s.id === 'peso' ? grafica(regs) : ''}<ul class="lista">${regs.map(r => itemHTML(r, vigentes)).join('')}</ul>`
      : `<p class="vacio">${s.vacio}</p>`}`;
}

function itemHTML(r, vigentes) {
  const t = TIPOS[r.tipo] || { titulo: r.tipo };
  let titulo; const sub = [];
  if (r.tipo === 'peso') titulo = kg(r.kg);
  else if (r.tipo === 'cita') {
    titulo = esc(r.motivo || 'Visita');
    if (r.veterinario) sub.push(esc(r.veterinario));
    if (r.costo !== '' && r.costo != null) sub.push(cop(r.costo));
  } else titulo = esc(r.nombre || t.titulo);

  const tipo = ['vacuna', 'desparasitacion'].includes(r.tipo) ? `<span class="item-tipo">${t.titulo}</span>` : '';
  const prox = r.proxima
    ? `<div class="item-sub">Próxima: ${fechaCorta(r.proxima)}${vigentes.has(r.id) ? ' ' + chipPlazo(r.proxima) : ''}</div>` : '';

  return `<li class="item">
    <div class="item-fecha">${fechaCorta(r.fecha)}</div>
    <div>
      <div class="item-titulo">${tipo}${titulo}</div>
      ${sub.length ? `<div class="item-sub">${sub.join(', ')}</div>` : ''}
      ${prox}
      ${r.notas ? `<div class="item-notas">${esc(r.notas)}</div>` : ''}
    </div>
    <div class="item-acciones">
      <button class="btn btn-sec btn-mini" data-accion="editar-reg" data-rid="${esc(r.id)}">Editar</button>
      <button class="btn btn-sec btn-mini btn-peligro" data-accion="borrar-reg" data-rid="${esc(r.id)}">Borrar</button>
    </div>
  </li>`;
}

function grafica(regs) {
  const pts = regs.filter(r => r.fecha && r.kg !== '' && r.kg != null && aFecha(r.fecha))
    .map(r => ({ t: aFecha(r.fecha).getTime(), kg: Number(r.kg), f: r.fecha }))
    .sort((a, b) => a.t - b.t);
  if (pts.length < 2) return `<p class="grafica-nota">Con dos registros de peso aparece la curva.</p>`;

  const W = 600, H = 160, P = 12;
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
  let mn = Math.min(...pts.map(p => p.kg)), mx = Math.max(...pts.map(p => p.kg));
  if (mx - mn < 1) { mn -= 0.5; mx += 0.5; }
  const x = t => P + (t1 === t0 ? 0.5 : (t - t0) / (t1 - t0)) * (W - 2 * P);
  const y = k => H - P - ((k - mn) / (mx - mn)) * (H - 2 * P);
  const linea = pts.map(p => `${x(p.t).toFixed(1)},${y(p.kg).toFixed(1)}`).join(' ');
  const area = `${x(t0).toFixed(1)},${H} ${linea} ${x(t1).toFixed(1)},${H}`;

  return `<figure class="grafica">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución del peso de ${kg(pts[0].kg)} a ${kg(pts[pts.length - 1].kg)}">
      <polygon class="g-area" points="${area}"/>
      <polyline class="g-linea" points="${linea}"/>
      ${pts.map(p => `<circle class="g-punto" cx="${x(p.t).toFixed(1)}" cy="${y(p.kg).toFixed(1)}" r="5"><title>${fechaCorta(p.f)}: ${kg(p.kg)}</title></circle>`).join('')}
    </svg>
    <figcaption><span>${fechaCorta(pts[0].f)}</span><span>${fechaCorta(pts[pts.length - 1].f)}</span></figcaption>
  </figure>`;
}

/* ---------- Vista “Los dos” ---------- */
function vistaResumen() {
  const tarjetas = IDS.map(id => {
    const p = estado.perfiles[id];
    const peso = ultimoPeso(id), cita = ultimaCita(id), pend = pendientes(id).slice(0, 3);
    const filas = [
      ['Peso', peso ? `${kg(peso.kg)} (${fechaCorta(peso.fecha)})` : ''],
      ['Última visita', cita ? `${fechaCorta(cita.fecha)}, ${esc(cita.motivo || '')}` : ''],
      ['Alimento', esc(p.alimento || '')],
    ].filter(f => f[1]);
    return `<article class="res-perro" data-perro="${id}">
      <header class="res-cabeza">
        <span class="res-foto">${p.foto ? `<img src="${esc(p.foto)}" alt="">` : inicial(id)}</span>
        <div><h2>${esc(nombreDe(id))}</h2><p>${esc([p.raza, edad(p.nacimiento)].filter(Boolean).join(', ')) || 'Ficha sin completar'}</p></div>
      </header>
      ${filas.length ? `<dl class="datos">${filas.map(([l, v]) => `<div class="dato"><dt>${l}</dt><dd>${v}</dd></div>`).join('')}</dl>` : ''}
      <h3>Pendientes</h3>
      ${pend.length
        ? `<ul class="res-pend">${pend.map(r => `<li>${esc(r.nombre)}, ${fechaCorta(r.proxima)} ${chipPlazo(r.proxima)}</li>`).join('')}</ul>`
        : `<p class="ficha-vacia">Nada pendiente.</p>`}
      <button class="btn btn-sec" data-accion="abrir" data-dog="${id}">Abrir perfil de ${esc(nombreDe(id))}</button>
    </article>`;
  }).join('');

  const agenda = IDS.flatMap(id => pendientes(id).map(r => ({ ...r, perro: id })))
    .sort((a, b) => a.proxima.localeCompare(b.proxima));

  return `
    <h1 class="res-titulo">${esc(nombreDe('klaus'))} y ${esc(nombreDe('limon'))}</h1>
    <div class="res-grid">${tarjetas}</div>
    <section class="panel agenda">
      <div class="panel-cabeza">
        <h2>Lo que viene para los dos</h2>
        <button class="btn btn-sec" data-accion="exportar">Descargar respaldo</button>
      </div>
      ${agenda.length
        ? `<ul class="lista">${agenda.map(r => `<li class="item" data-perro="${r.perro}">
            <div class="item-fecha">${fechaCorta(r.proxima)}</div>
            <div><div class="item-titulo"><span class="punto"></span>${esc(nombreDe(r.perro))}: ${esc(r.nombre)}</div>
            <div class="item-sub">${TIPOS[r.tipo].titulo} ${chipPlazo(r.proxima)}</div></div></li>`).join('')}</ul>`
        : `<p class="vacio">Cuando registres vacunas o desparasitaciones con próxima fecha, aparecen aquí ordenadas.</p>`}
    </section>`;
}

/* ---------- Diálogo de registros ---------- */
function abrirDialogo(tipo, reg = null) {
  const t = TIPOS[tipo];
  dlgCtx = { tipo, rid: reg?.id || null, perro: estado.vista };
  const valores = reg || { fecha: hoyISO() };
  const dlg = $('#dlg');
  dlg.innerHTML = `
    <form id="form-reg">
      <h2>${reg ? 'Editar' : 'Agregar'} ${t.titulo.toLowerCase()} de ${esc(nombreDe(estado.vista))}</h2>
      <div class="campos">${t.campos.map(c => campoHTML(c, valores[c.k], 'r-')).join('')}</div>
      <div class="acciones">
        <button type="button" class="btn btn-sec" data-cerrar>Cancelar</button>
        <button type="submit" class="btn btn-primario">${reg ? 'Guardar cambios' : 'Agregar'}</button>
      </div>
    </form>`;
  dlg.showModal();
  dlg.querySelector('input, select, textarea')?.focus();
}

async function guardarDialogo(form) {
  const { tipo, rid, perro } = dlgCtx;
  const datos = leerForm(form, TIPOS[tipo].campos);
  try {
    if (rid) await store.actualizarRegistro(perro, rid, datos);
    else await store.agregarRegistro(perro, { ...datos, tipo });
    $('#dlg').close();
    toast(rid ? 'Cambios guardados' : 'Registro agregado');
  } catch (e) { errorAccion(e); }
}

/* ---------- Foto ---------- */
async function procesarFoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url;
    });
    const lado = Math.min(img.naturalWidth, img.naturalHeight);
    const c = document.createElement('canvas');
    c.width = c.height = Math.min(480, lado);
    c.getContext('2d').drawImage(img, (img.naturalWidth - lado) / 2, (img.naturalHeight - lado) / 2, lado, lado, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.82);
  } finally { URL.revokeObjectURL(url); }
}

/* ---------- Errores ---------- */
function errorAccion(e) {
  console.error(e);
  toast(e?.code === 'permission-denied' ? 'Sin permiso para guardar' : 'No se pudo guardar');
}
function errorDatos(e) {
  console.error(e);
  banner(`No se pudieron leer los datos (${esc(e?.code || e?.message || 'error')}). Revisa que tu correo esté en las reglas de Firestore y que las reglas estén publicadas.`);
}

/* ---------- Suscripciones ---------- */
function suscribir() {
  desuscribir();
  for (const id of IDS) {
    estado.subs.push(store.observarPerfil(id, p => { estado.perfiles[id] = p || {}; alCambiar(id, 'perfil'); }, errorDatos));
    estado.subs.push(store.observarRegistros(id, rs => { estado.registros[id] = rs; alCambiar(id, 'registros'); }, errorDatos));
  }
}
function desuscribir() {
  estado.subs.forEach(f => { try { f(); } catch {} });
  estado.subs = [];
}
function alCambiar(id, que) {
  renderPlacas();
  if (!estado.usuario?.permitido) return;
  if (estado.vista === 'resumen') { $('#main').innerHTML = vistaResumen(); return; }
  if (estado.vista !== id || $('#main').dataset.montado !== id) return;
  if (que === 'perfil') { renderFoto(); renderFicha(); renderRegistros(); }
  else renderRegistros();
}

/* ---------- Navegación ---------- */
function leerHash() {
  const h = decodeURIComponent(location.hash.slice(1));
  estado.vista = VISTAS.includes(h) ? h : 'klaus';
  estado.editando = false;
  render();
}

function exportar() {
  const blob = new Blob([JSON.stringify({ exportado: new Date().toISOString(), perfiles: estado.perfiles, registros: estado.registros }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `perros-respaldo-${hoyISO()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ---------- Eventos ---------- */
document.addEventListener('click', async e => {
  const tag = e.target.closest('.tag');
  if (tag) { location.hash = tag.dataset.view; return; }

  if (e.target.closest('[data-cerrar]')) { $('#dlg').close(); return; }

  const b = e.target.closest('[data-accion]');
  if (!b) return;
  const id = estado.vista;
  switch (b.dataset.accion) {
    case 'entrar':
      try { await store.auth.entrar(); } catch (err) { console.error(err); toast('No se pudo iniciar sesión'); }
      break;
    case 'salir': await store.auth.salir(); break;
    case 'editar-ficha': estado.editando = true; renderFicha(true); break;
    case 'cancelar-ficha': estado.editando = false; renderFicha(true); break;
    case 'seccion': estado.seccion[id] = b.dataset.id; renderRegistros(); $(`#segment [data-id="${b.dataset.id}"]`)?.focus(); break;
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
    case 'abrir': location.hash = b.dataset.dog; break;
    case 'exportar': exportar(); break;
  }
});

document.addEventListener('submit', async e => {
  if (e.target.id === 'form-ficha') {
    e.preventDefault();
    const id = estado.vista;
    const datos = leerForm(e.target, CAMPOS_PERFIL);
    if (!datos.nombre) datos.nombre = PERROS[id].nombre;
    try {
      await store.guardarPerfil(id, datos);
      estado.editando = false;
      renderFicha(true); renderPlacas();
      toast('Ficha guardada');
    } catch (err) { errorAccion(err); }
  } else if (e.target.id === 'form-reg') {
    e.preventDefault();
    await guardarDialogo(e.target);
  }
});

document.addEventListener('change', async e => {
  if (e.target.id !== 'foto-input' || !e.target.files?.[0]) return;
  const id = estado.vista;
  try {
    const foto = await procesarFoto(e.target.files[0]);
    await store.guardarPerfil(id, { foto });
    renderFoto(); renderPlacas();
    toast('Foto actualizada');
  } catch (err) { errorAccion(err); }
});

window.addEventListener('hashchange', leerHash);

/* ---------- App instalable ---------- */
const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const instalada = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
let avisoInstalar = null;

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(err => console.warn('Service worker:', err));
}
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  avisoInstalar = e;
  $('#btn-instalar').hidden = false;
});
window.addEventListener('appinstalled', () => { $('#btn-instalar').hidden = true; toast('App instalada'); });
if (esIOS && !instalada) $('#btn-instalar').hidden = false;

$('#btn-instalar').addEventListener('click', async () => {
  if (avisoInstalar) {
    avisoInstalar.prompt();
    await avisoInstalar.userChoice;
    avisoInstalar = null;
    $('#btn-instalar').hidden = true;
    return;
  }
  const dlg = $('#dlg');
  dlg.innerHTML = `
    <form id="form-instalar">
      <h2>Instalar en el iPhone</h2>
      <ol class="pasos">
        <li>Abre esta página en Safari.</li>
        <li>Toca el botón Compartir, el cuadro con la flecha hacia arriba.</li>
        <li>Elige “Agregar a pantalla de inicio” y luego “Agregar”.</li>
      </ol>
      <p class="ficha-vacia">Queda un ícono con el nombre Klaus y Limón que abre la app a pantalla completa.</p>
      <div class="acciones"><button type="button" class="btn btn-primario" data-cerrar>Entendido</button></div>
    </form>`;
  dlg.showModal();
});

/* ---------- Arranque ---------- */
(async function iniciar() {
  leerHash();
  try {
    store = await crearStore();
  } catch (e) {
    console.error(e);
    estado.cargando = false;
    $('#main').dataset.montado = '';
    $('#main').innerHTML = e instanceof ErrorConfiguracion
      ? `<section class="login"><h1>Falta configuración</h1>
          <p>Completa en firebase-config.js los valores de Firebase: ${e.faltantes.map(esc).join(', ')}.</p></section>`
      : `<section class="login"><h1>Sin conexión con Firebase</h1>
          <p>No se pudo cargar Firebase. Revisa tu conexión y la configuración en firebase-config.js.</p></section>`;
    return;
  }
  if (store.modo === 'demo') {
    banner('Modo demo: no hay sesión de Firebase y los datos se guardan solo en este navegador. Para usar Firebase, deja <code>modoDemo = false</code> en <code>firebase-config.js</code>.');
  }
  store.auth.observar(u => {
    estado.usuario = u;
    estado.cargando = false;
    if (u?.permitido) suscribir();
    else {
      // Sin sesión válida no queda ningún dato en pantalla ni en memoria.
      desuscribir();
      estado.perfiles = { klaus: {}, limon: {} };
      estado.registros = { klaus: [], limon: [] };
      $('#dlg').open && $('#dlg').close();
    }
    renderSesion();
    render();
  });
})();
