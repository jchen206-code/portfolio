/* ============================================================================
 *  editor.js — the in-browser content editor.
 *
 *  Open it by adding ?edit=1 to the URL, clicking "Edit content" in the
 *  footer, or pressing Ctrl+Shift+E (Cmd+Shift+E on a Mac).
 *
 *  IMPORTANT: edits are saved in YOUR BROWSER only. To publish them, click
 *  "Export data.js", then replace assets/data.js in the repo and push.
 *  Visitors always see assets/data.js.
 * ==========================================================================*/
(function () {
  "use strict";

  var P = window.Portfolio;
  if (!P) return;

  /* ============================== SCHEMA ==================================
   * This drives the whole form. Add a field here and an input appears.
   *   type: text | url | textarea | csv | lines | checkbox
   * ====================================================================== */
  var SCHEMA = [
    {
      title: "Personal statement",
      hint: "Rubric: one clear sentence about who you are professionally.",
      fields: [
        { path: "personal.name", label: "Full name", type: "text" },
        { path: "personal.title", label: "Professional title", type: "text",
          hint: "Shown under your name, e.g. \"Full-Stack Developer\"." },
        { path: "personal.location", label: "Status line", type: "text",
          hint: "Small line above your name. Leave empty to hide." },
        { path: "personal.statement", label: "One-sentence statement", type: "textarea",
          rows: 4, hint: "<strong>bold</strong> and <em>italic</em> are allowed." },
      ],
    },
    {
      title: "About section",
      fields: [
        { path: "about.show", label: "Show the About section", type: "checkbox" },
        { path: "about.paragraphs", label: "Paragraphs", type: "lines", rows: 8,
          hint: "One paragraph per line." },
      ],
    },
    {
      title: "Contact & links",
      hint: "Leave a field empty and its button is hidden — never a broken link.",
      fields: [
        { path: "contact.email", label: "Email", type: "text" },
        { path: "contact.github", label: "GitHub URL", type: "url" },
        { path: "contact.linkedin", label: "LinkedIn URL", type: "url" },
        { path: "contact.website", label: "Personal site URL", type: "url" },
        { path: "contact.resumeUrl", label: "Résumé file", type: "text",
          hint: "Put resume.pdf in the project folder, then type: resume.pdf" },
        { path: "contactLede", label: "Contact section blurb", type: "textarea", rows: 3 },
      ],
    },
    {
      title: "Skills",
      list: {
        path: "skillGroups",
        itemLabel: "Skill group",
        nameFrom: "title",
        blank: { title: "New group", skills: [] },
        fields: [
          { key: "title", label: "Group name", type: "text" },
          { key: "skills", label: "Skills", type: "csv", rows: 3,
            hint: "Separate with commas." },
        ],
      },
      fields: [
        { path: "skillsLede", label: "Skills section blurb", type: "textarea", rows: 2 },
      ],
    },
    {
      title: "Projects",
      hint: "Rubric: at least 2–3 projects with descriptions and links.",
      list: {
        path: "projects",
        itemLabel: "Project",
        nameFrom: "name",
        blank: {
          name: "New project", year: "", badge: "", featured: false,
          summary: "", description: "", tags: [],
          codeUrl: "", demoUrl: "", linkNote: "",
        },
        fields: [
          { key: "name", label: "Project name", type: "text" },
          { key: "year", label: "Year", type: "text", hint: "e.g. 2025 – present" },
          { key: "summary", label: "One-line summary", type: "textarea", rows: 2 },
          { key: "description", label: "Description", type: "textarea", rows: 6,
            hint: "2–3 sentences on what you actually built." },
          { key: "tags", label: "Tech tags", type: "csv", rows: 3 },
          { key: "codeUrl", label: "Code / repo URL", type: "url" },
          { key: "demoUrl", label: "Live demo URL", type: "url" },
          { key: "linkNote", label: "Fallback note", type: "text",
            hint: "Shown only when both URLs are empty." },
          { key: "badge", label: "Badge", type: "text", hint: "e.g. Featured. Empty hides it." },
          { key: "featured", label: "Highlight this card", type: "checkbox" },
        ],
      },
      fields: [
        { path: "projectsLede", label: "Projects section blurb", type: "textarea", rows: 2 },
      ],
    },
  ];

  /* ============================== helpers ================================ */

  var ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return ESCAPES[c]; });
  }

  function getPath(obj, path) {
    return String(path).split(".").reduce(function (o, k) {
      return o == null ? undefined : o[k];
    }, obj);
  }

  function setPath(obj, path, value) {
    var keys = String(path).split(".");
    var last = keys.pop();
    var cur = obj;
    keys.forEach(function (k) {
      if (cur[k] == null || typeof cur[k] !== "object") {
        cur[k] = /^\d+$/.test(k) ? [] : {};
      }
      cur = cur[k];
    });
    cur[last] = value;
  }

  /** Turns the stored value into what the input shows. */
  function toInput(value, type) {
    if (type === "checkbox") return value !== false;
    if (type === "csv") return Array.isArray(value) ? value.join(", ") : String(value || "");
    if (type === "lines") return Array.isArray(value) ? value.join("\n") : String(value || "");
    return String(value == null ? "" : value);
  }

  /** Turns what the user typed back into the stored shape. */
  function fromInput(raw, type) {
    if (type === "checkbox") return !!raw;
    if (type === "csv") {
      return String(raw).split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    }
    if (type === "lines") {
      return String(raw).split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
    }
    return String(raw);
  }

  /* ============================== styles ================================= */

  var CSS = [
    // Wide screens keep the page scrollable next to the drawer so you can
    // watch edits land live; narrow screens lock behind the full-width panel.
    "@media (min-width: 1100px) { .pe-open body { padding-right: 420px; } }",
    "@media (max-width: 1099px) { .pe-open { overflow: hidden; } }",

    ".pe-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(420px, 100vw);",
    "  z-index: 300; display: flex; flex-direction: column;",
    "  background: var(--bg); border-left: 1px solid var(--border);",
    "  box-shadow: var(--shadow-lg); transform: translateX(100%);",
    "  transition: transform .28s cubic-bezier(.22,.8,.3,1); }",
    ".pe-drawer.is-open { transform: none; }",

    ".pe-head { flex: none; padding: 16px 18px; border-bottom: 1px solid var(--border); }",
    ".pe-head-row { display: flex; align-items: center; gap: 10px; }",
    ".pe-head h2 { font-size: 1.05rem; margin: 0; flex: 1; }",
    ".pe-note { margin-top: 10px; padding: 9px 11px; border-radius: 9px; font-size: 12.5px;",
    "  line-height: 1.5; background: var(--accent-soft); color: var(--text-muted); }",
    ".pe-note b { color: var(--text); }",

    ".pe-body { flex: 1; overflow-y: auto; padding: 8px 18px 24px; }",

    ".pe-section { border-bottom: 1px solid var(--border-soft); padding: 16px 0; }",
    ".pe-section:last-child { border-bottom: 0; }",
    ".pe-section > h3 { font-size: 12px; font-weight: 700; letter-spacing: .09em;",
    "  text-transform: uppercase; color: var(--accent); margin-bottom: 4px; }",
    ".pe-hint { font-size: 12px; color: var(--text-faint); line-height: 1.5; }",

    ".pe-field { margin-top: 13px; }",
    ".pe-field > label { display: block; font-size: 12.5px; font-weight: 600;",
    "  color: var(--text-muted); margin-bottom: 5px; }",
    ".pe-field input[type=text], .pe-field input[type=url], .pe-field textarea {",
    "  width: 100%; padding: 8px 11px; border-radius: 9px; font: inherit; font-size: 13.5px;",
    "  color: var(--text); background: var(--surface); border: 1px solid var(--border);",
    "  resize: vertical; }",
    ".pe-field textarea { line-height: 1.55; }",
    ".pe-field input:focus, .pe-field textarea:focus { outline: none; border-color: var(--accent);",
    "  box-shadow: 0 0 0 3px var(--accent-soft); }",
    ".pe-field .pe-hint { margin-top: 4px; }",
    ".pe-check { display: flex; align-items: center; gap: 9px; }",
    ".pe-check input { width: 16px; height: 16px; accent-color: var(--accent); }",
    ".pe-check label { margin: 0; }",

    ".pe-item { margin-top: 13px; border: 1px solid var(--border); border-radius: 12px;",
    "  background: var(--surface); overflow: hidden; }",
    ".pe-item-head { display: flex; align-items: center; gap: 4px; padding: 8px 8px 8px 12px;",
    "  background: var(--surface-2); border-bottom: 1px solid var(--border); }",
    ".pe-item-title { flex: 1; font-size: 12.5px; font-weight: 700; color: var(--text);",
    "  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }",
    ".pe-item-body { padding: 4px 12px 14px; }",

    ".pe-mini { display: grid; place-items: center; width: 26px; height: 26px; flex: none;",
    "  border: 1px solid transparent; border-radius: 7px; background: transparent;",
    "  cursor: pointer; color: var(--text-faint); font-size: 13px; line-height: 1; }",
    ".pe-mini:hover:not(:disabled) { background: var(--bg); border-color: var(--border); color: var(--text); }",
    ".pe-mini:disabled { opacity: .3; cursor: not-allowed; }",
    ".pe-mini.is-danger:hover { color: #e5484d; border-color: #e5484d; }",

    ".pe-add { margin-top: 12px; width: 100%; padding: 9px; border-radius: 10px;",
    "  border: 1px dashed var(--border); background: transparent; color: var(--text-muted);",
    "  font-size: 13px; font-weight: 600; cursor: pointer; }",
    ".pe-add:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }",

    ".pe-foot { flex: none; padding: 12px 18px; border-top: 1px solid var(--border);",
    "  display: flex; flex-wrap: wrap; gap: 8px; background: var(--bg); }",
    ".pe-btn { flex: 1; min-width: 120px; padding: 9px 12px; border-radius: 10px; cursor: pointer;",
    "  font-size: 13px; font-weight: 600; border: 1px solid var(--border); background: var(--surface); }",
    ".pe-btn:hover { background: var(--surface-2); }",
    ".pe-btn.is-primary { background: var(--accent); color: var(--accent-text); border-color: var(--accent); }",
    ".pe-btn.is-primary:hover { filter: brightness(1.07); }",
    ".pe-btn.is-quiet { flex: 0 0 auto; min-width: 0; color: var(--text-faint); }",

    ".pe-toast { position: fixed; left: 50%; bottom: 26px; transform: translate(-50%, 18px);",
    "  z-index: 400; padding: 10px 18px; border-radius: 10px; font-size: 13.5px; font-weight: 600;",
    "  background: var(--text); color: var(--bg); box-shadow: var(--shadow-lg);",
    "  opacity: 0; pointer-events: none; transition: opacity .2s ease, transform .2s ease; }",
    ".pe-toast.is-on { opacity: 1; transform: translate(-50%, 0); }",

    ".pe-banner { position: sticky; top: 66px; z-index: 90; display: flex; flex-wrap: wrap;",
    "  align-items: center; justify-content: center; gap: 6px 14px; padding: 9px 18px;",
    "  font-size: 13px; background: var(--accent-soft); color: var(--text-muted);",
    "  border-bottom: 1px solid var(--border); }",
    ".pe-banner button { background: none; border: 0; padding: 0; cursor: pointer;",
    "  font-size: 13px; font-weight: 600; color: var(--accent); text-decoration: underline;",
    "  text-underline-offset: 3px; }",
  ].join("\n");

  function injectStyles() {
    if (document.getElementById("pe-styles")) return;
    var style = document.createElement("style");
    style.id = "pe-styles";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  /* ============================== rendering ============================== */

  var drawer = null;
  var isOpen = false;

  function fieldHtml(field, path) {
    var data = P.getData();
    var value = toInput(getPath(data, path), field.type);
    var hint = field.hint ? '<p class="pe-hint">' + field.hint + "</p>" : "";
    var attrs = 'id="pe-' + esc(path) + '" data-path="' + esc(path) +
      '" data-type="' + esc(field.type) + '"';

    if (field.type === "checkbox") {
      return '<div class="pe-field pe-check">' +
        '<input type="checkbox" ' + attrs +
          (value ? " checked" : "") + " />" +
        '<label for="pe-' + esc(path) + '">' + esc(field.label) + "</label>" +
        "</div>" + hint;
    }

    var multiline = field.type === "textarea" || field.type === "lines" ||
      (field.type === "csv" && field.rows);
    var control = multiline
      ? '<textarea ' + attrs + ' rows="' + (field.rows || 3) + '">' + esc(value) + "</textarea>"
      : '<input type="' + (field.type === "url" ? "url" : "text") + '" ' + attrs +
        ' value="' + esc(value) + '" />';

    return '<div class="pe-field">' +
      '<label for="pe-' + esc(path) + '">' + esc(field.label) + "</label>" +
      control + hint + "</div>";
  }

  function listHtml(list) {
    var items = getPath(P.getData(), list.path) || [];

    var body = items.map(function (item, i) {
      var title = String(item[list.nameFrom] || "").trim() ||
        list.itemLabel + " " + (i + 1);

      var fields = list.fields.map(function (field) {
        return fieldHtml(field, list.path + "." + i + "." + field.key);
      }).join("");

      return '<div class="pe-item">' +
        '<div class="pe-item-head">' +
          '<span class="pe-item-title">' + esc(title) + "</span>" +
          '<button class="pe-mini" type="button" data-move="up" data-list="' + esc(list.path) +
            '" data-index="' + i + '" title="Move up" aria-label="Move up"' +
            (i === 0 ? " disabled" : "") + ">↑</button>" +
          '<button class="pe-mini" type="button" data-move="down" data-list="' + esc(list.path) +
            '" data-index="' + i + '" title="Move down" aria-label="Move down"' +
            (i === items.length - 1 ? " disabled" : "") + ">↓</button>" +
          '<button class="pe-mini is-danger" type="button" data-remove data-list="' + esc(list.path) +
            '" data-index="' + i + '" title="Delete" aria-label="Delete">✕</button>' +
        "</div>" +
        '<div class="pe-item-body">' + fields + "</div>" +
        "</div>";
    }).join("");

    return body +
      '<button class="pe-add" type="button" data-add data-list="' + esc(list.path) + '">' +
      "+ Add " + esc(list.itemLabel.toLowerCase()) + "</button>";
  }

  function bodyHtml() {
    return SCHEMA.map(function (section) {
      return '<section class="pe-section">' +
        "<h3>" + esc(section.title) + "</h3>" +
        (section.hint ? '<p class="pe-hint">' + section.hint + "</p>" : "") +
        (section.fields || []).map(function (f) { return fieldHtml(f, f.path); }).join("") +
        (section.list ? listHtml(section.list) : "") +
        "</section>";
    }).join("");
  }

  function build() {
    injectStyles();

    drawer = document.createElement("aside");
    drawer.className = "pe-drawer";
    drawer.setAttribute("aria-label", "Content editor");
    drawer.innerHTML =
      '<div class="pe-head">' +
        '<div class="pe-head-row">' +
          "<h2>Edit content</h2>" +
          '<button class="pe-mini" type="button" data-close title="Close editor" ' +
            'aria-label="Close editor">✕</button>' +
        "</div>" +
        '<p class="pe-note">Changes save to <b>this browser only</b>. ' +
        "To publish them, click <b>Export data.js</b> and replace " +
        "<b>assets/data.js</b> in your repo.</p>" +
      "</div>" +
      '<div class="pe-body" data-body></div>' +
      '<div class="pe-foot">' +
        '<button class="pe-btn is-primary" type="button" data-export>Export data.js</button>' +
        '<button class="pe-btn" type="button" data-copy>Copy to clipboard</button>' +
        '<button class="pe-btn is-quiet" type="button" data-reset ' +
          'title="Throw away local edits and reload assets/data.js">Discard</button>' +
      "</div>";

    document.body.appendChild(drawer);
    drawer.querySelector("[data-body]").innerHTML = bodyHtml();
    wire();
  }

  /** Re-renders the form itself (after add / delete / reorder). */
  function refreshForm() {
    var body = drawer.querySelector("[data-body]");
    var scroll = body.scrollTop;
    body.innerHTML = bodyHtml();
    body.scrollTop = scroll;
  }

  /* ============================== behaviour ============================== */

  var renderTimer = null;
  function schedulePageRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(function () {
      P.render();
      P.save();
    }, 140);
  }

  function wire() {
    // Typing: update data + repaint the page, but leave the form alone so
    // the caret stays where it is.
    drawer.addEventListener("input", function (e) {
      var el = e.target;
      var path = el.getAttribute && el.getAttribute("data-path");
      if (!path) return;

      var type = el.getAttribute("data-type");
      var raw = type === "checkbox" ? el.checked : el.value;
      setPath(P.getData(), path, fromInput(raw, type));

      // Keep a list item's header label in sync as you type its name.
      var item = el.closest(".pe-item");
      var section = SCHEMA.find(function (s) {
        return s.list && path.indexOf(s.list.path + ".") === 0;
      });
      if (item && section && path.split(".").pop() === section.list.nameFrom) {
        var index = Number(path.split(".")[1]);
        item.querySelector(".pe-item-title").textContent =
          String(el.value).trim() || section.list.itemLabel + " " + (index + 1);
      }
      schedulePageRender();
    });

    drawer.addEventListener("change", function (e) {
      if (e.target.getAttribute && e.target.getAttribute("data-type") === "checkbox") {
        schedulePageRender();
      }
    });

    drawer.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;

      if (btn.hasAttribute("data-close")) return close();
      if (btn.hasAttribute("data-export")) return exportFile();
      if (btn.hasAttribute("data-copy")) return copyToClipboard();
      if (btn.hasAttribute("data-reset")) return discard();

      var listPath = btn.getAttribute("data-list");
      if (!listPath) return;

      var section = SCHEMA.find(function (s) { return s.list && s.list.path === listPath; });
      if (!section) return;

      var data = P.getData();
      var arr = getPath(data, listPath);
      if (!Array.isArray(arr)) { arr = []; setPath(data, listPath, arr); }

      if (btn.hasAttribute("data-add")) {
        arr.push(JSON.parse(JSON.stringify(section.list.blank)));
      } else {
        var index = Number(btn.getAttribute("data-index"));
        if (btn.hasAttribute("data-remove")) {
          var label = String(arr[index] && arr[index][section.list.nameFrom] || "this item");
          if (!window.confirm("Delete “" + label + "”?")) return;
          arr.splice(index, 1);
        } else {
          var to = btn.getAttribute("data-move") === "up" ? index - 1 : index + 1;
          if (to < 0 || to >= arr.length) return;
          arr.splice(to, 0, arr.splice(index, 1)[0]);
        }
      }

      P.setData(data);   // re-renders the page
      P.save();
      refreshForm();     // structure changed, so rebuild the form too
    });
  }

  /* ============================== export ================================= */

  var HEADER = [
    "/* ============================================================================",
    " *  data.js  —  EVERYTHING ON THE SITE COMES FROM THIS FILE.",
    " *",
    " *  Exported from the in-browser editor. Edit the strings below directly,",
    " *  or reopen the editor with ?edit=1 at the end of the URL.",
    " *",
    " *  Leave a link \"\" (empty) and the site hides that button instead of",
    " *  rendering a broken link.",
    " * ==========================================================================*/",
    "",
  ].join("\n");

  function exportText() {
    return HEADER + "window.PORTFOLIO_DATA = " +
      JSON.stringify(P.getData(), null, 2) + ";\n";
  }

  function exportFile() {
    var blob = new Blob([exportText()], { type: "text/javascript;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "data.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast("Downloaded — replace assets/data.js with it");
  }

  function copyToClipboard() {
    var text = exportText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { toast("Copied — paste over assets/data.js"); },
        function () { toast("Copy failed — use Export instead"); }
      );
      return;
    }
    // Older browsers / non-secure origins.
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      toast("Copied — paste over assets/data.js");
    } catch (err) {
      toast("Copy failed — use Export instead");
    }
    ta.remove();
  }

  function discard() {
    if (!window.confirm(
      "Discard your local edits and reload the content from assets/data.js?"
    )) return;
    P.discardLocalEdits();
    refreshForm();
    updateBanner();
    toast("Reloaded from assets/data.js");
  }

  /* ============================== chrome ================================= */

  var toastEl = null;
  var toastTimer = null;
  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "pe-toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    requestAnimationFrame(function () { toastEl.classList.add("is-on"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2600);
  }

  /* A quiet reminder that what you are looking at is not what visitors see. */
  var banner = null;
  function updateBanner() {
    var needed = P.hasLocalEdits();

    if (!needed) {
      if (banner) { banner.remove(); banner = null; }
      return;
    }
    if (banner) return;

    injectStyles();
    banner = document.createElement("div");
    banner.className = "pe-banner";
    banner.innerHTML =
      "<span>You are viewing unpublished local edits.</span>" +
      '<button type="button" data-open>Open editor</button>' +
      '<button type="button" data-discard>Discard</button>';
    banner.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      if (btn.hasAttribute("data-open")) open();
      else discard();
    });
    document.body.insertBefore(banner, document.getElementById("main"));
  }

  function open() {
    if (!drawer) build();
    else refreshForm();
    isOpen = true;
    document.documentElement.classList.add("pe-open");
    requestAnimationFrame(function () { drawer.classList.add("is-open"); });
    var first = drawer.querySelector("input, textarea");
    if (first) first.focus({ preventScroll: true });
  }

  function close() {
    if (!drawer) return;
    isOpen = false;
    drawer.classList.remove("is-open");
    document.documentElement.classList.remove("pe-open");
    P.save();
    updateBanner();
  }

  function toggle() { isOpen ? close() : open(); }

  /* ============================== wiring ================================= */

  var openBtn = document.getElementById("open-editor");
  if (openBtn) openBtn.addEventListener("click", open);

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "E" || e.key === "e")) {
      e.preventDefault();
      toggle();
    }
    if (e.key === "Escape" && isOpen) close();
  });

  updateBanner();

  if (/[?&]edit=1\b/.test(window.location.search)) open();
})();
