// Dice RollMap — ForoActivo (phpBB3)  |  ESM + Goblin
// Convierte el bloque “Lanzada de dados” en un layout estructurado.
// Lee el mapa de resultados desde el foro (window.GoblinRollMap) o via Goblin.config({ rollMap }).

const HR_RE    = /<hr\b[^>]*>/i;       // separa cabecera del cuerpo
const QUOTE_RE = /'([^']+)'/;          // título entre comillas simples:  'Título'

const trim = (s) => (s || '').trim();
const isUrl = (x) => /^https?:\/\//i.test(x || '');
const slug = (s) => trim(s).toLowerCase().replace(/\s+/g, '-');
const normKey = (s) =>
  trim(s).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase(); // quita tildes

function getRollMap(config) {
  // 1) Desde el foro (Gestor JS): window.GoblinRollMap = { ... }
  if (typeof window !== 'undefined' && window.GoblinRollMap && typeof window.GoblinRollMap === 'object') {
    return window.GoblinRollMap;
  }
  // 2) Desde código: Goblin.config({ rollMap: {...} })
  if (config && typeof config.rollMap === 'object') return config.rollMap;
  return {}; // fallback vacío
}

function codeToText(codeEl) {
  if (!codeEl) return '';
  const clone = codeEl.cloneNode(true);
  clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  let txt = clone.textContent || '';
  return txt.replace(/\u00A0/g, ' ').replace(/\r\n/g, '\n');
}

function buildItem(doc, v, cfg) {
  const item = doc.createElement('div');
  item.className = 'roll-result';

  if (!cfg) {
    item.textContent = v; // sin mapeo → crudo
    return item;
  }

  if (typeof cfg === 'string') {
    item.innerHTML = cfg; // ⚠️ usa solo si confías en el HTML
    return item;
  }

  // Objeto rico
  const row = doc.createElement('div');
  row.className = 'rr-head';

  // icono
  if (cfg.icono) {
    if (isUrl(cfg.icono)) {
      const img = doc.createElement('img');
      img.className = 'rr-icon';
      img.alt = '';
      img.src = cfg.icono;
      row.appendChild(img);
    } else {
      const span = doc.createElement('span');
      span.className = 'rr-icon';
      span.textContent = cfg.icono; // emoji/símbolo
      row.appendChild(span);
    }
  }

  // nombre
  const strong = doc.createElement('strong');
  strong.className = 'rr-name';
  strong.textContent = cfg.nombre || `Resultado ${v}`;
  row.appendChild(strong);

  // dificultad (opcional)
  if (cfg.dificultad != null) {
    const diff = doc.createElement('span');
    diff.className = 'rr-diff';
    const suf = (cfg.dificultadMax != null) ? `/${cfg.dificultadMax}` : '';
    diff.textContent = `Dificultad: ${cfg.dificultad}${suf}`;
    row.appendChild(diff);
  }

  item.appendChild(row);

  // descripción
  if (cfg.descripcion) {
    const d1 = doc.createElement('div');
    d1.className = 'rr-desc';
    d1.textContent = cfg.descripcion;
    item.appendChild(d1);
  }
  if (cfg.descripcionHtml) {
    const d2 = doc.createElement('div');
    d2.className = 'rr-desc';
    d2.innerHTML = cfg.descripcionHtml; // ⚠️ solo HTML de confianza
    item.appendChild(d2);
  }

  // imagen
  if (cfg.imagen) {
    const pic = doc.createElement('img');
    pic.className = 'rr-image';
    pic.alt = cfg.nombre || '';
    pic.src = cfg.imagen;
    item.appendChild(pic);
  }

  return item;
}

function enhanceContent(content, rollMap) {
  // Solo procesa si contiene el literal
  if ((content.textContent || '').indexOf('Lanzada de dados') === -1) return false;

  const html = content.innerHTML;
  const [headerHTML, bodyHTML = ''] = html.split(HR_RE);

  // Usuario: primer <strong> en la cabecera
  const headerTmp = document.createElement('div');
  headerTmp.innerHTML = headerHTML;
  const user = trim((headerTmp.querySelector('strong') || {}).textContent || '');

  // Segmentos separados por '#'
  let segments = bodyHTML.split('#').map(trim).filter(Boolean);
  if (!segments.length) segments = [bodyHTML];

  // Contenedor final
  const wrapper = document.createElement('div');
  wrapper.className = 'dice';

  const titleSpan = document.createElement('span');
  titleSpan.className = 'dice-header';
  titleSpan.textContent = 'Lanzada de dados';
  wrapper.appendChild(titleSpan);

  segments.forEach((seg) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = seg;

    const txt = tmp.textContent || '';
    const m = QUOTE_RE.exec(txt);
    const title = m ? trim(m[1]) : '';
    const key = normKey(title);

    const values = Array.from(tmp.querySelectorAll('strong')).map((el) => trim(el.textContent));

    const roll = document.createElement('div');
    roll.className = 'dice-roll roll-' + slug(key);

    const head = document.createElement('span');
    head.textContent = `${user} ha lanzado los dados "${title}"`;
    roll.appendChild(head);

    const results = document.createElement('div');
    results.className = 'dice-results';

    values.forEach((v) => {
      const cfg = rollMap[key] && rollMap[key][v] ? rollMap[key][v] : null;
      results.appendChild(buildItem(document, v, cfg));
    });

    roll.appendChild(results);
    wrapper.appendChild(roll);
  });

  // Reemplaza el contenido
  content.innerHTML = '';
  content.appendChild(wrapper);
  return true;
}

const plugin = {
  name: 'dice-rollmap',
  idempotent: true,
  run({ utils, ctx, doc, config }) {
    const rollMap = getRollMap(config);
    if (!rollMap || !Object.keys(rollMap).length) return;

    const root = ctx || doc;
    utils.qsa('.post .content', root).forEach((el) => {
      if (!utils.once(el, 'dice-enhanced')) {
        // si ya lo procesamos, salimos
        return;
      }
      // solo si realmente contiene el bloque
      if ((el.textContent || '').indexOf('Lanzada de dados') === -1) {
        // no marcar como “hecho” si no hay dados
        el.removeAttribute('data-gb-dice-enhanced');
        return;
      }
      // procesa
      const ok = enhanceContent(el, rollMap);
      if (!ok) {
        // si no transformó nada, quita la marca para permitir futuros intentos
        el.removeAttribute('data-gb-dice-enhanced');
      }
    });
  }
};

export default plugin;
