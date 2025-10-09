// ESM: exporta el plugin; no usa GoblinQueue
const plugin = {
  name: 'move-image-and-links-fa',
  idempotent: true,
  run({ utils, ctx }) {
    const forums = utils.qsa('.forum-inner', ctx);
    forums.forEach((forum) => {
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
    });
  }
};

export default plugin;
