// Aplica columns="..." a .forum-wrap según el id de .category
// Config vía window.GoblinCategoryColumns = { c1: "grid threecol", c2: ["grid","twocol"], ... }

const plugin = {
  name: 'category-columns',
  // Opcional: defaults/sobrescritura por si más adelante quieres pasarlos al registrar
  defaults: {
    selectorCategory: '.category',
    selectorWrap: '.forum-wrap',
    columnsMap: {} // { c1: "grid threecol" | ["grid","threecol"], ... }
  },

  _toColumns(v) {
    return Array.isArray(v) ? v.join(' ').trim() : String(v ?? '').trim();
  },

  _getConfig() {
    // Mezcla defaults + cualquier override en plugin + config global en window
    const globalMap =
      (typeof window !== 'undefined' && window.GoblinCategoryColumns && typeof window.GoblinCategoryColumns === 'object')
        ? window.GoblinCategoryColumns
        : {};

    const merged = {
      ...this.defaults,
      ...(this.options || {}),
    };
    merged.columnsMap = {
      ...(this.defaults.columnsMap || {}),
      ...((this.options && this.options.columnsMap) || {}),
      ...globalMap
    };
    return merged;
  },

  run({ utils, ctx }) {
    const cfg = this._getConfig();
    const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

    utils.qsa(cfg.selectorCategory, ctx).forEach(cat => {
      const id = cat.id;
      if (!id || !hasOwn(cfg.columnsMap, id)) return;

      const value = this._toColumns(cfg.columnsMap[id]);
      utils.qsa(cfg.selectorWrap, cat).forEach(wrap => {
        // Idempotente: re-asignar mismo valor no rompe nada
        if (value) wrap.setAttribute('columns', value);
        else wrap.removeAttribute('columns');
      });
    });
  }
};

export default plugin;
