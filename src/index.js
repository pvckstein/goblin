import './core/goblin.core.js';

import moveImageFA from './plugins/move-image-fa.js';
import addIds from './plugins/add-ids.js';
import topicPrefixes from './plugins/topic-prefixes.js';
import codeboxCopy   from './plugins/codebox-copy.js';

if (window && window.Goblin) {
  const { Goblin } = window;
  Goblin.use(moveImageFA);
  Goblin.use(addIds);
  Goblin.use(topicPrefixes);
  Goblin.use(codeboxCopy); 
  Goblin.start();
}
