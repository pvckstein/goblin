(function(root, factory){
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else (root.GoblinQueue = root.GoblinQueue || []).push(factory());
}(typeof self !== 'undefined' ? self : this, function(){
  'use strict';

  const NAME = 'move-image-and-links-fa';

  function moveOneForum(forum, utils) {
    // 1) Mover .forum_links / .forum-links → .links
    const linksSrc = forum.querySelector('.forum_links, .forum-links');
    const linksDst = forum.querySelector('.links');
    if (linksSrc && linksDst && utils.once(linksSrc, 'moved-links')) {
      linksDst.appendChild(linksSrc);
      // opcional: eliminar <br> suelto que quedara en la descripción
      const br = forum.querySelector('.descripcion > br');
      if (br) br.remove();
    }

    // 2) Mover primera imagen de .descripcion → .forumimg
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
      utils.qsa('.forum', ctx).forEach(f => moveOneForum(f, utils));
    }
  };
}));
