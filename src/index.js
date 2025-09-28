import './core/goblin.core.js';            // define window.Goblin (UMD)
import moveImageFA from './plugins/move-image-fa.js';
import addIds from './plugins/add-ids.js';

// Registro explícito: ESM-friendly (sin GoblinQueue)
if (window && window.Goblin) {
  window.Goblin.use(moveImageFA);
  window.Goblin.use(addIds);
  window.Goblin.start();
}
