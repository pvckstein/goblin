// Codebox Copy Only — ForoActivo phpBB3
// ESM plugin para Goblin: añade un botón "Copiar" en cada <dl class="codebox">.
// Clases que genera: .codebox-btn.codebox-copy  (estílalas en tu CSS)

function getTexts(config) {
  // Puedes definir en el foro: window.GoblinCodeboxCopy = { copy: 'Copiar', copied: '¡Copiado!' }
  const fromGlobal = (typeof window !== 'undefined' && window.GoblinCodeboxCopy) || {};
  const fromConfig = (config && config.codeboxCopy) || {};
  const t = { copy: 'Copiar', copied: '¡Copiado!' };
  return {
    copy:   String(fromGlobal.copy   || fromConfig.copy   || t.copy),
    copied: String(fromGlobal.copied || fromConfig.copied || t.copied)
  };
}

// Convierte HTML del <code> en texto plano
function codeToText(codeEl) {
  if (!codeEl) return '';
  const clone = codeEl.cloneNode(true);
  clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
  let txt = clone.textContent || '';
  return txt.replace(/\u00A0/g, ' ').replace(/\r\n/g, '\n');
}

async function copyText(text) {
  if (!text) return;
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback legacy
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  ta.setAttribute('readonly', '');
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

function flash(btn, msg, restoreMs = 1200) {
  const prev = btn.textContent;
  btn.textContent = msg;
  btn.classList.add('codebox-flash');
  setTimeout(() => {
    btn.textContent = prev;
    btn.classList.remove('codebox-flash');
  }, restoreMs);
}

function enhanceOne(dl, texts) {
  // Evita duplicados
  if (dl.dataset.gbCopyEnhanced === '1') return;

  // Asegura <dt>
  const dt = dl.querySelector('dt') || dl.insertBefore(document.createElement('dt'), dl.firstChild);

  // Botón
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'codebox-btn codebox-copy';
  btn.textContent = texts.copy;

  btn.addEventListener('click', async () => {
    const code = dl.querySelector('dd code, dd pre, code');
    try {
      await copyText(codeToText(code));
      flash(btn, texts.copied);
    } catch (e) {
      console.error('[Goblin:codebox-copy] Copy failed:', e);
      flash(btn, 'Error');
    }
  });

  dt.appendChild(btn);
  dl.dataset.gbCopyEnhanced = '1';
}

const plugin = {
  name: 'codebox-copy',
  idempotent: true,
  run({ utils, ctx, doc, config }) {
    const texts = getTexts(config);
    const root = ctx || doc;
    utils.qsa('dl.codebox', root).forEach(dl => enhanceOne(dl, texts));
  }
};

export default plugin;
