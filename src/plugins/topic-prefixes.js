// Topic Prefixes (varios, opcionales) — ESM + Goblin
// Fuentes de configuración, prioridad:
// 1) window.GoblinTopicPrefixes = [{ label:"[Help]", color:"#c39300" }, ...]
// 2) <script type="application/json" id="goblin-prefixes">[ ... ]</script>
// 3) Goblin.config({ topicPrefixes: [ ... ] })

function readJsonScript(doc, id) {
  try {
    const el = doc.getElementById(id);
    if (!el) return null;
    const raw = el.textContent || el.innerText || "";
    return JSON.parse(raw);
  } catch { return null; }
}

function normalizeLabel(s) {
  const inner = String(s || "").trim().replace(/^\[|\]$/g, "");
  return inner ? `[${inner}]` : "";
}

function getPrefixes({ config, doc }) {
  /** @type {{label:string,color?:string}[]|null} */
  let list = null;

  if (typeof window !== "undefined" && Array.isArray(window.GoblinTopicPrefixes)) {
    list = window.GoblinTopicPrefixes;
  } else {
    const json = readJsonScript(doc, "goblin-prefixes");
    if (Array.isArray(json)) list = json;
    else if (Array.isArray(config?.topicPrefixes)) list = config.topicPrefixes;
  }

  return Array.isArray(list)
    ? list.map(p => ({ label: normalizeLabel(p.label), color: p.color || "" }))
    : [];
}

function isNewTopicPage() {
  return /(\?|&)mode=newtopic(&|$)/.test(location.search || "");
}

function colorOf(tag, prefixes) {
  const core = String(tag).replace(/^\[|\]$/g, "").toLowerCase();
  const hit = prefixes.find(p => p.label.replace(/^\[|\]$/g, "").toLowerCase() === core);
  return hit?.color || "";
}

/* ----- Montar checkboxes en la página de “nuevo tema” ----- */
function mountBoxes({ utils, doc, prefixes }) {
  if (!isNewTopicPage() || !prefixes.length) return false;

  const sub = doc.querySelector("input[name='subject']");
  if (!sub || !utils.once(sub, "tp-mounted")) return false;

  const wrap = doc.createElement("div");
  wrap.className = "topic-prefixes";

  prefixes.forEach((p, i) => {
    const id = `tp_chk_${i}`;

    const label = doc.createElement("label");
    label.setAttribute("for", id);

    const cb = doc.createElement("input");
    cb.type = "checkbox";
    cb.id = id;
    cb.value = normalizeLabel(p.label);

    const chip = doc.createElement("span");
    chip.className = "title_prefix";
    chip.textContent = p.label.replace(/^\[|\]$/g, "");
    // única excepción: si hay color en config, úsalo como background
    const col = p.color ? String(p.color).trim() : "";
    if (col) chip.style.background = col;

    label.appendChild(cb);
    label.appendChild(chip);
    wrap.appendChild(label);
  });

  sub.parentNode.insertBefore(wrap, sub);

  // Al enviar: antepone los prefijos seleccionados (limpiando previos)
  const form = sub.closest("form");
  if (form && utils.once(form, "tp-submit-bind")) {
    form.addEventListener("submit", () => {
      const chosen = Array.from(wrap.querySelectorAll("input:checked")).map(i => i.value);
      if (!chosen.length) return;
      let title = sub.value || "";
      title = title.replace(/^\s*(\[[^\]]+\]\s*)+/, ""); // limpia prefijos previos al inicio
      sub.value = (chosen.join(" ") + " " + title).trim();
    });
  }

  return true;
}

/* ----- Pintar chips en listados/enlaces de temas ----- */
function paintLinks({ doc, utils, prefixes }) {
  if (!prefixes.length) return;
  const linkSel = "a.topictitle, a.topic-title, a[href^='/t']";

  doc.querySelectorAll(linkSel).forEach(a => {
    if (!utils.once(a, "tp-painted")) return;

    const html = a.innerHTML;
    const head = html.match(/^\s*(\[[^\]]+\]\s*)+/);
    if (!head) return;

    const tags = head[0].match(/\[[^\]]+\]/g) || [];
    if (!tags.length) return;

    // Genera solo <span class="title_prefix"> por cada tag (sin estilos salvo background)
    const frag = doc.createDocumentFragment();
    const group = doc.createElement("span");
    group.className = "tema-prefixes";
    tags.forEach(t => {
      const chip = doc.createElement("span");
      chip.className = "title_prefix";
      chip.textContent = t.replace(/^\[|\]$/g, "");
      const col = colorOf(t, prefixes);
      if (col) chip.style.background = col; // única excepción permitida
      group.appendChild(chip);
    });
    frag.appendChild(group);

    // Inserta los chips y elimina los [tags] del texto del título
    a.innerHTML = html.replace(head[0], group.outerHTML + " ");
  });
}

const plugin = {
  name: "topic-prefixes",
  idempotent: true,
  run({ doc, utils, config }) {
    const prefixes = getPrefixes({ config, doc });
    mountBoxes({ utils, doc, prefixes });
    paintLinks({ doc, utils, prefixes });
  }
};

export default plugin;
