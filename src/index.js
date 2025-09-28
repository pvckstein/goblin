import './core/goblin.core.js';
import './plugins/move-image.js';
import './plugins/add-ids.js';

if (window && window.Goblin) {
  window.Goblin.start(); // los plugins encolados ya están registrados
}
