/* ============================================================================
 *  app.js — reads assets/data.js and renders the page.
 *  You normally never need to touch this file. Edit assets/data.js instead.
 * ==========================================================================*/
(function () {
  "use strict";

  var STORAGE_KEY = "portfolio:data:v1";
  var THEME_KEY = "portfolio:theme";

  /* ---------------------------------------------------------------- utils */

  function $(id) { return document.getElementById(id); }

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  /** localStorage is unavailable in private mode / blocked-cookie setups. */
  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }
  function storageRemove(key) {
    try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  var ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return ESCAPES[c];
    });
  }

  /** Escapes everything, then re-allows a tiny set of inline formatting tags. */
  function rich(value) {
    return esc(value).replace(/&lt;(\/?)(strong|b|em|i|br\s*\/?)&gt;/gi, "<$1$2>");
  }

  /* Template placeholders that were never filled in. Treating them as empty
     means an un-edited copy of this site ships with zero broken links. */
  var PLACEHOLDER = /YOUR-USERNAME|YOUR-REPO|yourname|example\.com/i;

  /** Only lets through links we know are safe to put in an href. */
  function safeUrl(value) {
    var url = String(value == null ? "" : value).trim();
    if (!url || PLACEHOLDER.test(url)) return "";
    if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
    if (/^[#./]/.test(url)) return url;              // #anchor, ./file, /path
    if (/^[\w][\w.\-/]*$/.test(url)) return url;     // resume.pdf, docs/cv.pdf
    return "";                                       // javascript:, data:, ...
  }

  function initialsOf(name) {
    var parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "—";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function asList(value) {
    if (Array.isArray(value)) return value.filter(function (v) { return String(v).trim(); });
    if (typeof value === "string") {
      return value.split(",").map(function (v) { return v.trim(); }).filter(Boolean);
    }
    return [];
  }

  /* ----------------------------------------------------------------- data */

  var fileData = clone(window.PORTFOLIO_DATA) || {};
  var data = loadData();

  function loadData() {
    var raw = storageGet(STORAGE_KEY);
    if (raw) {
      try {
        var saved = JSON.parse(raw);
        if (saved && typeof saved === "object") return saved;
      } catch (e) { storageRemove(STORAGE_KEY); }
    }
    return clone(fileData);
  }

  /* ---------------------------------------------------------------- icons */

  var ICONS = {
    email:
      '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">' +
      '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/>' +
      '<path d="m3 7 8.1 5.6a1.6 1.6 0 0 0 1.8 0L21 7"/></svg>',
    github:
      '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">' +
      '<path d="M9 19c-4.5 1.4-4.5-2.3-6-2.8m12 5.3v-3.6a3 3 0 0 0-.9-2.4c2.9-.3 6-1.4 6-6.4a5 5 0 0 0-1.4-3.5 4.6 4.6 0 0 0-.1-3.5s-1.1-.3-3.6 1.4a12.3 12.3 0 0 0-6.4 0C6.1 1.8 5 2.1 5 2.1a4.6 4.6 0 0 0-.1 3.5A5 5 0 0 0 3.5 9.2c0 5 3 6.1 5.9 6.4a3 3 0 0 0-.9 2.3v3.6"/></svg>',
    linkedin:
      '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">' +
      '<rect x="2.5" y="2.5" width="19" height="19" rx="3"/>' +
      '<path d="M7 10.5V17M7 7.2v.1M11.5 17v-3.8a2.2 2.2 0 0 1 4.4 0V17"/></svg>',
    website:
      '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="9.2"/><path d="M3 12h18M12 2.8a15 15 0 0 1 0 18.4 15 15 0 0 1 0-18.4"/></svg>',
    code:
      '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">' +
      '<path d="m8.5 8.5-4 3.5 4 3.5M15.5 8.5l4 3.5-4 3.5M13.5 5.5l-3 13"/></svg>',
    demo:
      '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">' +
      '<path d="M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/></svg>',
  };

  /* ------------------------------------------------------------- renderers */

  function renderMeta(d) {
    var p = d.personal || {};
    var name = p.name || "Portfolio";
    var title = p.title ? name + " — " + p.title : name;
    // Strip the inline tags for the plain-text meta description.
    var desc = String(p.statement || "").replace(/<[^>]*>/g, "");

    document.title = title;
    setAttr("meta-description", "content", desc);
    setAttr("og-title", "content", title);
    setAttr("og-description", "content", desc);
  }

  function setAttr(id, attr, value) {
    var el = $(id);
    if (el) el.setAttribute(attr, value);
  }

  function renderHero(d) {
    var p = d.personal || {};
    $("brand-initials").textContent = initialsOf(p.name);
    $("brand-name").textContent = p.name || "";
    $("hero-location").textContent = p.location || "";
    $("hero-name").textContent = p.name || "";
    $("hero-title").textContent = p.title || "";
    $("hero-statement").innerHTML = rich(p.statement);
    $("footer-name").textContent = p.name || "";
    $("year").textContent = String(new Date().getFullYear());
  }

  function contactItems(contact) {
    var c = contact || {};
    var items = [];
    var email = String(c.email || "").trim();

    if (email) items.push({ key: "email", label: email, href: "mailto:" + email });
    if (c.github) items.push({ key: "github", label: "GitHub", href: c.github });
    if (c.linkedin) items.push({ key: "linkedin", label: "LinkedIn", href: c.linkedin });
    if (c.website) items.push({ key: "website", label: "Website", href: c.website });

    return items.filter(function (item) { return safeUrl(item.href); });
  }

  function renderContact(d) {
    var items = contactItems(d.contact);
    var html = items.map(function (item) {
      var external = !/^mailto:/i.test(item.href);
      return '<li><a href="' + esc(safeUrl(item.href)) + '"' +
        (external ? ' target="_blank" rel="noopener noreferrer"' : "") +
        ">" + ICONS[item.key] + "<span>" + esc(item.label) + "</span></a></li>";
    }).join("");

    $("contact-links").innerHTML = html;
    $("contact-links-footer").innerHTML = html;
    $("contact-lede").textContent = d.contactLede || "";

    // Résumé button — hidden unless a URL is set, so it is never a dead link.
    var resume = safeUrl((d.contact || {}).resumeUrl);
    var btn = $("resume-btn");
    if (resume) {
      btn.href = resume;
      btn.setAttribute("download", "");
      btn.hidden = false;
    } else {
      btn.hidden = true;
      btn.removeAttribute("href");
    }
  }

  function renderAbout(d) {
    var about = d.about || {};
    var paras = (about.paragraphs || []).filter(function (t) { return String(t).trim(); });
    var section = $("about");

    if (about.show === false || !paras.length) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    $("about-body").innerHTML = paras.map(function (t) {
      return "<p>" + rich(t) + "</p>";
    }).join("");
  }

  function renderSkills(d) {
    $("skills-lede").textContent = d.skillsLede || "";
    var groups = (d.skillGroups || []).filter(function (g) {
      return g && (String(g.title || "").trim() || asList(g.skills).length);
    });

    $("skills-grid").innerHTML = groups.map(function (group) {
      var pills = asList(group.skills).map(function (skill) {
        return '<li class="pill">' + esc(skill) + "</li>";
      }).join("");
      return '<article class="skill-card reveal">' +
        "<h3>" + esc(group.title) + "</h3>" +
        '<ul class="skill-pills">' + pills + "</ul>" +
        "</article>";
    }).join("");
  }

  function projectLinksHtml(project) {
    var code = safeUrl(project.codeUrl);
    var demo = safeUrl(project.demoUrl);
    var parts = [];

    if (demo) {
      parts.push('<a href="' + esc(demo) + '" target="_blank" rel="noopener noreferrer">' +
        ICONS.demo + "<span>Live demo</span></a>");
    }
    if (code) {
      parts.push('<a href="' + esc(code) + '" target="_blank" rel="noopener noreferrer">' +
        ICONS.code + "<span>View code</span></a>");
    }
    // No links at all? Show a note rather than an anchor that goes nowhere.
    if (!parts.length && project.linkNote) {
      parts.push('<span class="link-note">' + esc(project.linkNote) + "</span>");
    }
    return parts.join("");
  }

  function renderProjects(d) {
    $("projects-lede").textContent = d.projectsLede || "";
    var projects = (d.projects || []).filter(function (p) {
      return p && String(p.name || "").trim();
    });

    $("projects-grid").innerHTML = projects.map(function (project) {
      var tags = asList(project.tags).map(function (tag) {
        return '<li class="pill">' + esc(tag) + "</li>";
      }).join("");

      return '<article class="project-card reveal' +
        (project.featured ? " is-featured" : "") + '">' +
        '<div class="project-head">' +
          '<h3 class="project-name">' + esc(project.name) + "</h3>" +
          (project.year ? '<span class="project-year">' + esc(project.year) + "</span>" : "") +
        "</div>" +
        (project.badge ? '<span class="project-badge">' + esc(project.badge) + "</span>" : "") +
        (project.summary ? '<p class="project-summary">' + rich(project.summary) + "</p>" : "") +
        (project.description ? '<p class="project-desc">' + rich(project.description) + "</p>" : "") +
        (tags ? '<ul class="project-tags">' + tags + "</ul>" : "") +
        '<div class="project-links">' + projectLinksHtml(project) + "</div>" +
        "</article>";
    }).join("");
  }

  function render() {
    renderMeta(data);
    renderHero(data);
    renderContact(data);
    renderAbout(data);
    renderSkills(data);
    renderProjects(data);
    observeReveals();
  }

  /* ---------------------------------------------------------------- theme */

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function initTheme() {
    var saved = storageGet(THEME_KEY);
    var prefersDark = window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    applyTheme(saved || (prefersDark ? "dark" : "light"));

    $("theme-toggle").addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "dark"
        ? "light" : "dark";
      applyTheme(next);
      storageSet(THEME_KEY, next);
    });

    // Follow the OS only while the visitor has not made an explicit choice.
    if (!saved && window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onChange = function (e) {
        if (!storageGet(THEME_KEY)) applyTheme(e.matches ? "dark" : "light");
      };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  /* --------------------------------------------------- scroll behaviours */

  function initHeaderShadow() {
    var header = $("site-header");
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
    var sections = links
      .map(function (link) { return document.querySelector(link.getAttribute("href")); })
      .filter(Boolean);

    if (!sections.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === "#" + entry.target.id
          );
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  var revealObserver = null;
  function observeReveals() {
    var targets = document.querySelectorAll(".reveal:not(.is-in)");

    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(targets, function (el) { el.classList.add("is-in"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    }
    Array.prototype.forEach.call(targets, function (el) { revealObserver.observe(el); });
  }

  /* ------------------------------------------------------- public surface */

  window.Portfolio = {
    STORAGE_KEY: STORAGE_KEY,
    getData: function () { return data; },
    getFileData: function () { return clone(fileData); },
    setData: function (next) { data = next; render(); },
    /** True when the visitor is looking at locally-edited, unpublished content. */
    hasLocalEdits: function () { return storageGet(STORAGE_KEY) != null; },
    save: function () { return storageSet(STORAGE_KEY, JSON.stringify(data)); },
    discardLocalEdits: function () {
      storageRemove(STORAGE_KEY);
      data = clone(fileData);
      render();
    },
    render: render,
  };

  /* ------------------------------------------------------------------ go */

  initTheme();
  render();
  initHeaderShadow();
  initScrollSpy();
})();
