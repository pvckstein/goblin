(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else (root.GoblinQueue = root.GoblinQueue || []).push(factory());
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const NAME = 'move-image-and-links';

  function moveOneForum(forum, { utils }) {
    // Mover .forum-links → .links
    const linksSrc = forum.querySelector('.forum-links');
    const linksDst = forum.querySelector('.links');
    if (linksSrc && linksDst && utils.once(linksSrc, 'moved-links')) {
      linksDst.appendChild(linksSrc);
    }

    // Mover primera imagen de .descripcion → .forumimg
    const img = forum.querySelector('.descripcion img');
    const imgDst = forum.querySelector('.forumimg');
    if (img && imgDst && utils.once(img, 'moved-img')) {
      imgDst.appendChild(img);
    }
  }

  return {
    name: NAME,
    run({ doc, utils, ctx }) {
      if (!doc) return;
      utils.qsa('.forum', ctx).forEach(f => moveOneForum(f, { utils }));
    }
  };
}));
