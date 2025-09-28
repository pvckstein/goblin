(function (root, factory) {
  'use strict';
  var plugin = factory();

  // ✅ Si Goblin ya existe, registra el plugin ahora mismo
  if (typeof window !== 'undefined' && window.Goblin && typeof window.Goblin.use === 'function') {
    window.Goblin.use(plugin);
  } else {
    // Fallback: encola el plugin para cuando cargue el core
    (root.GoblinQueue = root.GoblinQueue || []).push(plugin);
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const NAME = 'move-image-and-links-fa';

  function moveOneForum(forum, utils) {
    // 1) .forum_links / .forum-links → .links
    const linksSrc = forum.querySelector('.forum_links, .forum-links');
    const linksDst = forum.querySelector('.links');
    if (linksSrc && linksDst && utils.once(linksSrc, 'moved-links')) {
      linksDst.appendChild(linksSrc);
      const br = forum.querySelector('.descripcion > br');
      if (br) br.remove();
    }

    // 2) primera imagen de .descripcion → .forumimg
    const img = forum.querySelector('.descripcion img');
    const imgDst = forum.querySelector('.forumimg');
    if (img && imgDst && utils.once(img, 'moved-img')) {
      imgDst.appendChild(img);
    }
  }

  return {
    name: NAME,
    idempotent: true,
    run({ utils, ctx }) {
      const forums = utils.qsa('.forum', ctx);
      // Log de ayuda (puedes quitarlo luego)
      console.log('[Goblin] move-image-fa running on', forums.length, 'forums');
      forums.forEach(f => moveOneForum(f, utils));
    }
  };
}));
