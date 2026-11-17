// Capa de datos. Cada perro es un documento independiente en Firestore:
//   perros/klaus                 → ficha de Klaus
//   perros/klaus/registros/{id}  → vacunas, desparasitaciones, pesos y visitas de Klaus
//   perros/limon                 → ficha de Limón
//   perros/limon/registros/{id}  → registros de Limón
// Cambiar un documento de un perro nunca toca los del otro.

import { firebaseConfig, correosPermitidos, modoDemo } from './firebase-config.js';

const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
const PERROS = ['klaus', 'limon'];

const CAMPOS_CONFIG = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const esMarcador = v => typeof v !== 'string' || !v.trim() ||
  /^(PENDIENTE|TU_|PEGAR)/i.test(v.trim()) || /TU_PROYECTO/i.test(v) || /^[0:]+(web:)?0*$/.test(v.trim());

/** Campos de firebaseConfig que siguen vacíos o con valores de ejemplo. */
export const camposFaltantes = () => CAMPOS_CONFIG.filter(k => esMarcador(firebaseConfig?.[k]));

/** Lista de administradores normalizada (minúsculas, sin vacíos ni duplicados). */
export const administradores = () =>
  [...new Set((Array.isArray(correosPermitidos) ? correosPermitidos : [])
    .map(c => String(c ?? '').trim().toLowerCase())
    .filter(c => c.includes('@') && !c.startsWith('tu-correo')))];

/**
 * Decide si una sesión de Firebase puede entrar. Devuelve null sin sesión.
 * Reglas: lista no vacía, cuenta de Google, correo verificado y correo en la lista.
 */
export function evaluarSesion(u, lista = administradores()) {
  if (!u) return null;
  const email = String(u.email || '').trim().toLowerCase();
  const conGoogle = (u.providerData || []).some(p => p?.providerId === 'google.com');
  let motivo = null;
  if (lista.length === 0) motivo = 'lista-vacia';
  else if (!email) motivo = 'sin-correo';
  else if (!conGoogle) motivo = 'proveedor';
  else if (u.emailVerified !== true) motivo = 'no-verificado';
  else if (!lista.includes(email)) motivo = 'no-autorizado';
  return { nombre: u.displayName || email, email, permitido: motivo === null, motivo, demo: false };
}

export class ErrorConfiguracion extends Error {
  constructor(faltantes) {
    super('Configuración de Firebase incompleta: ' + faltantes.join(', '));
    this.faltantes = faltantes;
  }
}

export async function crearStore() {
  if (modoDemo === true) return crearLocal();
  const faltantes = camposFaltantes();
  if (faltantes.length) throw new ErrorConfiguracion(faltantes);
  return crearFirestore();
}

function ordenar(lista) {
  return [...lista].sort((a, b) =>
    (b.fecha || '').localeCompare(a.fecha || '') || (toMs(b.creado) - toMs(a.creado)));
}
function toMs(v) {
  if (!v) return 0;
  if (typeof v === 'number') return v;
  if (typeof v.toMillis === 'function') return v.toMillis();
  return 0;
}

/* ---------- Firebase ---------- */
async function crearFirestore() {
  const [appMod, authMod, fs] = await Promise.all([
    import(FB + 'firebase-app.js'),
    import(FB + 'firebase-auth.js'),
    import(FB + 'firebase-firestore.js'),
  ]);
  // Una sola app de Firebase: si ya existe (por ejemplo, tras recargar el módulo), se reutiliza.
  const app = appMod.getApps().length ? appMod.getApp() : appMod.initializeApp(firebaseConfig);
  const auth = authMod.getAuth(app);
  // Copia local en el teléfono: la app abre y muestra los datos aunque no haya señal,
  // y lo que se guarde sin conexión se sube solo cuando vuelve.
  let db;
  try {
    db = fs.initializeFirestore(app, {
      localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }),
    });
  } catch {
    db = fs.getFirestore(app);
  }
  authMod.getRedirectResult(auth).catch(() => {});

  return {
    modo: 'firebase',
    auth: {
      observar(cb) {
        return authMod.onAuthStateChanged(auth, u => cb(evaluarSesion(u)));
      },
      async entrar() {
        const prov = new authMod.GoogleAuthProvider();
        prov.setCustomParameters({ prompt: 'select_account' });
        try {
          await authMod.signInWithPopup(auth, prov);
        } catch (e) {
          // Si el teléfono bloquea la ventana emergente, se usa redirección.
          if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment'].includes(e?.code)) {
            await authMod.signInWithRedirect(auth, prov);
          } else throw e;
        }
      },
      salir: () => authMod.signOut(auth),
    },
    observarPerfil(id, cb, err) {
      return fs.onSnapshot(fs.doc(db, 'perros', id), s => cb(s.exists() ? s.data() : {}), err);
    },
    observarRegistros(id, cb, err) {
      return fs.onSnapshot(fs.collection(db, 'perros', id, 'registros'),
        s => cb(ordenar(s.docs.map(d => ({ id: d.id, ...d.data() })))), err);
    },
    guardarPerfil: (id, campos) =>
      fs.setDoc(fs.doc(db, 'perros', id), { ...campos, actualizado: fs.serverTimestamp() }, { merge: true }),
    agregarRegistro: (id, reg) =>
      fs.addDoc(fs.collection(db, 'perros', id, 'registros'), { ...reg, creado: fs.serverTimestamp() }),
    actualizarRegistro: (id, rid, campos) =>
      fs.updateDoc(fs.doc(db, 'perros', id, 'registros', rid), campos),
    borrarRegistro: (id, rid) =>
      fs.deleteDoc(fs.doc(db, 'perros', id, 'registros', rid)),
  };
}

/* ---------- Modo demo (solo este navegador) ---------- */
function crearLocal() {
  const KEY = 'perros-familia-demo';
  let data = null;
  try { data = JSON.parse(localStorage.getItem(KEY)); } catch { data = null; }
  if (!data) data = { perros: { klaus: {}, limon: {} }, registros: { klaus: [], limon: [] } };
  for (const id of PERROS) {
    data.perros[id] ??= {};
    data.registros[id] ??= [];
  }

  const subs = { perfil: { klaus: [], limon: [] }, reg: { klaus: [], limon: [] } };
  const guardar = () => {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch { throw new Error('El navegador no tiene espacio para guardar más datos.'); }
  };
  const emitirPerfil = id => subs.perfil[id].forEach(f => f({ ...data.perros[id] }));
  const emitirRegs = id => subs.reg[id].forEach(f => f(ordenar(data.registros[id])));
  const quitar = (lista, f) => () => { const i = lista.indexOf(f); if (i >= 0) lista.splice(i, 1); };
  const nuevoId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
  const usuario = { nombre: 'Modo demo (sin Firebase)', email: '', permitido: true, motivo: null, demo: true };

  return {
    modo: 'demo',
    auth: {
      observar(cb) { cb(usuario); return () => {}; },
      entrar: async () => {},
      salir: async () => {},
    },
    observarPerfil(id, cb) {
      subs.perfil[id].push(cb); cb({ ...data.perros[id] });
      return quitar(subs.perfil[id], cb);
    },
    observarRegistros(id, cb) {
      subs.reg[id].push(cb); cb(ordenar(data.registros[id]));
      return quitar(subs.reg[id], cb);
    },
    async guardarPerfil(id, campos) {
      data.perros[id] = { ...data.perros[id], ...campos };
      guardar(); emitirPerfil(id);
    },
    async agregarRegistro(id, reg) {
      data.registros[id].push({ ...reg, id: nuevoId(), creado: Date.now() });
      guardar(); emitirRegs(id);
    },
    async actualizarRegistro(id, rid, campos) {
      data.registros[id] = data.registros[id].map(r => (r.id === rid ? { ...r, ...campos } : r));
      guardar(); emitirRegs(id);
    },
    async borrarRegistro(id, rid) {
      data.registros[id] = data.registros[id].filter(r => r.id !== rid);
      guardar(); emitirRegs(id);
    },
  };
}
