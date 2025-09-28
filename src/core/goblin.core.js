/* goblin.core.js — core vanilla con registro de plugins y rehidratación */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Goblin = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const state = {
    started: false,
    plugins: [],
    config: {
      observe: true,               // reactiva plugins ante cambios dinámicos
      observeOptions: { subtree: true, childList: true }
    },
    doc: typeof document !== 'undefined' ? document : null,
    observer: null
  };

  // Utils comunes para plugins
  const utils = {
    ready(fn) {
      const d = state.doc;
      if (!d) return;
      if (d.readyState === 'complete' || d.readyState === 'interactive') queueMicrotask(fn);
      else d.addEventListener('DOMContentLoaded', fn, { once: true });
    },
    qs(sel, ctx) { return (ctx || state.doc).querySelector(sel); },
    qsa(sel, ctx) { return Array.from((ctx || state.doc).querySelectorAll(sel)); },
    closest(el, sel) { return el && el.closest ? el.closest(sel) : null; },
    once(el, key) {                 // evita doble ejecución por elemento
      const flag = `data-gb-${key}`;
      if (el.hasAttribute(flag)) return false;
      el.setAttribute(flag, '1');
      return true;
    },
    inDoc(el) { return !!(el && el.isConnected); },
    onMutations(cb) {               // engancha callbacks a mutations
      if (!state.config.observe || !state.doc) return () => {};
      const obs = new MutationObserver(cb);
      obs.observe(state.doc.documentElement, state.config.observeOptions);
      return () => obs.disconnect();
    },
    setConfig(next={}) { Object.assign(state.config, next); return state.config; }
  };

  function use(plugin) {
    if (!plugin || typeof plugin.run !== 'function' || !plugin.name) {
      console.warn('[Goblin] Plugin inválido:', plugin);
      return;
    }
    state.plugins.push(plugin);
    if (state.started) safeRun(plugin);
  }

  function safeRun(plugin, ctxNode) {
    try {
      plugin.run({ doc: state.doc, utils, config: state.config, ctx: ctxNode || state.doc });
    } catch (e) {
      console.error(`[Goblin] Error en plugin "${plugin.name}":`, e);
    }
  }

  function start() {
    if (state.started) return;
    state.started = true;

    utils.ready(() => {
      // Ejecuta todos los plugins una vez con el DOM inicial
      state.plugins.forEach(p => safeRun(p));

      // Observa cambios dinámicos (páginas que inyectan trozos)
      if (state.config.observe) {
        state.observer = new MutationObserver((mutList) => {
          // Ejecuta plugins cuando aparezcan nodos relevantes
          // Los plugins deben ser idempotentes y usar utils.once()
          for (const p of state.plugins) safeRun(p);
        });
        state.observer.observe(state.doc.documentElement, state.config.observeOptions);
      }
    });
  }

  // Si se cargaron plugins antes que el core, intégralos
  if (typeof window !== 'undefined' && Array.isArray(window.GoblinQueue)) {
    window.GoblinQueue.forEach(p => { try { use(p); } catch(e){} });
    window.GoblinQueue = [];
  }

  return {
    version: '0.2.0',
    use, start,
    config(next){ return utils.setConfig(next); },
    // por si quieres exponer utils a tests o plugins avanzados
    _utils: utils
  };
}));
