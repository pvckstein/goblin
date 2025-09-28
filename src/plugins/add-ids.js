// ESM: exporta el plugin; no usa GoblinQueue
const plugin = {
  name: 'add-forum-ids',
  idempotent: true,
  run({ utils, ctx }) {
    const items = utils.qsa('.forum', ctx);
    items.forEach((el, i) => {
      if (!el.id) el.id = 'f' + i;
    });
  }
};

export default plugin;
