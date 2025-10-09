import './core/goblin.core.js';

import moveImageFA from './plugins/move-image-fa.js';
import addIds from './plugins/add-ids.js';
import topicPrefixes from './plugins/topic-prefixes.js';
import codeboxCopy   from './plugins/codebox-copy.js';
import diceRollMap from './plugins/dice-rollmap.js';
import categoryCols   from './plugins/category-columns.js'; 

if (window && window.Goblin) {
  const { Goblin } = window;
  Goblin.use(moveImageFA);
  Goblin.use(addIds);
  Goblin.use(categoryCols);
  Goblin.use(topicPrefixes);
  Goblin.use(codeboxCopy); 
  Goblin.use(diceRollMap);
  Goblin.start();
}
