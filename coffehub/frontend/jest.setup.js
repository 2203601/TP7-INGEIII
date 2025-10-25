// ☕ jest.setup.js - Configuración inicial de Jest
// ===============================================
// Este archivo se ejecuta ANTES de cualquier test

import { TextEncoder, TextDecoder } from 'util';

// ✅ CRÍTICO: Polyfills globales para JSDOM
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// ⚠️ NO usar jest.fn() aquí - jest no está disponible en setupFiles
// Los mocks se crean en cada test con beforeEach

console.log('✅ Jest setup completado - Polyfills cargados');