// src/plugins/topic-prefixes.js
const normalize = (s) => {
  const inner = String(s || '').trim().replace(/^\[|\]$/g, '');
  return inner ? `[${inner}]` : '';
};

const getPrefixes = (config) => {
  let list = null;
  if (typeof window !== 'undefined' && Array.isArray(window.GoblinTopicPrefixes)) {
    list = window.GoblinTopicPrefixes;
  } else if (Array.isArray(config?.topicPrefixes)) {
    list = config.topicPrefixes;
  }
  return Array.isArray(list)
    ? list.map(p => ({ label: normalize(p.label), color: p.color || '' }))
    : [];
};

const isNewTopicPage = () => /(\?|&)mode=newtopic(&|$)/.test(location.search || '');

const colorOf = (tag, prefixes) => {
  const core = String(tag).replace(/^\[|\]$/g, '').toLowerCase();
  const hit = prefixes.find(p => p.label.replace(/^\[|\]$/g, '').toLowerCase() === core);
  return hit?.color || '';
};

function mountBoxes({ doc, utils, prefixes }) {
  if (!isNewTopicPage() || !prefixes.length) return false;
  const sub = doc.querySelector("input[name='subject']");
  if (!sub || !utils.once(sub, 'tp-mounted')) return false;

  const wrap = doc.createElement('div');
  wrap.className = 'topic-prefixes';

  prefixes.forEach((p, i) => {
    const id = `tp_chk_${i}`;

    const label = doc.createElement('label');
    label.setAttribute('for', id);

    const cb = doc.createElement('input');
    cb.type = 'checkbox';
    cb.id = id;
    cb.value = normalize(p.label);

    const chip = doc.createElement('span');
    chip.className = 'title_prefix';
    chip.textContent = p.label.replace(/^\[|\]$/g, '');
    if (p.color) chip.style.background = String(p.color).trim(); // única excepción: background

    label.appendChild(cb);
    label.appendChild(chip);
    wrap.appendChild(label);
  });

  sub.parentNode.insertBefore(wrap, sub);

  const form = sub.closest('form');
  if (form && utils.once(form, 'tp-submit-bind')) {
    form.addEventListener('submit', () => {
      const chosen = Array.from(wrap.querySelectorAll('input:checked')).map(i => i.value);
      if (!chosen.length) return;
      let title = sub.value || '';
      title = title.replace(/^\s*(\[[^\]]+\]\s*)+/, '');
      sub.value = (chosen.join(' ') + ' ' + title).trim();
    });
  }
  return true;
}

function paintLinks({ doc, utils, prefixes }) {
  if (!prefixes.length) return;
  const linkSel = "a.topictitle, a.topic-title, a[href^='/t']";

  doc.querySelectorAll(linkSel).forEach(a => {
    if (!utils.once(a, 'tp-painted')) return;

    const html = a.innerHTML;
    const head = html.match(/^\s*(\[[^\]]+\]\s*)+/);
    if (!head) return;

    const tags = head[0].match(/\[[^\]]+\]/g) || [];
    if (!tags.length) return;

    const group = doc.createElement('div');
    group.className = 'tema-prefixes';

    tags.forEach(t => {
      const chip = doc.createElement('span');
      chip.className = 'title_prefix';
      chip.textContent = t.replace(/^\[|\]$/g, '');
      const col = colorOf(t, prefixes);
      if (col) chip.style.background = col; // única excepción: background
      group.appendChild(chip);
    });

    a.innerHTML = html.replace(head[0], group.outerHTML + ' ');
  });
}

const plugin = {
  name: 'topic-prefixes',
  idempotent: true,
  run({ doc, utils, config /*, ctx */ }) {
    const prefixes = getPrefixes(config);
    mountBoxes({ doc, utils, prefixes });
    paintLinks({ doc, utils, prefixes });
  }
};

export default plugin;
