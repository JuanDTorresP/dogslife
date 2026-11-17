// Configuración de la app web "KLAUS LIFE" en el proyecto Firebase klaus-limon.
// Este archivo solo exporta datos: Firebase se inicializa una única vez en js/store.js.
// La apiKey de una app web no es secreta; los datos los protegen las reglas de Firestore.
export const firebaseConfig = {
  apiKey: "AIzaSyAfqbvkwQo1jeDIktGSV2y8lFTQURdZKxI",
  authDomain: "klaus-limon.firebaseapp.com",
  projectId: "klaus-limon",
  storageBucket: "klaus-limon.firebasestorage.app",
  messagingSenderId: "22505751730",
  appId: "1:22505751730:web:dd434be753da7b853f75ab"
};

// Administradores: los dos tienen exactamente los mismos permisos.
// Debe coincidir con la lista de firestore.rules.
export const correosPermitidos = [
  "juand.torrespa@gmail.com",
  "cmazmutis@gmail.com"
];

// Modo demo: guarda solo en este navegador, sin Firebase ni inicio de sesión.
// Debe quedar en false. Solo se activa si se cambia a true a propósito.
export const modoDemo = false;
