(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else (root.GoblinQueue = root.GoblinQueue || []).push(factory());
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const NAME = 'add-forum-ids';

  return {
    name: NAME,
    run({ utils, ctx }) {
      const items = utils.qsa('.forum', ctx);
      items.forEach((el, i) => {
        if (!el.id) el.id = 'f' + i;
      });
    }
  };
}));
