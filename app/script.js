/* ============================================================
   FILIPA'S TOWN — script.js
   ============================================================ */

/* ── 1. IMAGE MAP RESIZE ──────────────────────────────────── */
window.addEventListener("load", () => {
  applyImageMap();
});


/* ── 2. ELEMENTOS DO DOM ──────────────────────────────────── */
const desktop       = document.querySelector("#imagemap-desktop");
const idAboutMe     = document.querySelector("#aboutMeDesktop");
const idProjects    = document.querySelector("#projectsDesktop");
const idCurious     = document.querySelector("#curiousDesktop");
const aboutPop      = document.querySelector(".about-pop");
const projectsPop   = document.querySelector(".projects-pop");
const curiousPop    = document.querySelector(".curious-pop");
const preloaderEl   = document.getElementById("preloader");
const preloaderGif  = document.getElementById("preloader-gif");
const accessibilityBtn = document.querySelector("#accessibility-button");


/* ── 3. IMAGEMAP RESPONSIVO ───────────────────────────────── */

const BREAKPOINT = 1100;

const COORDS = {
  desktop: {
    aboutMe:  "285,561,287,303,293,293,514,292,548,375,550,561",
    projects: "807,946,807,799,896,676,1063,678,1062,738,1119,790,1121,946",
    curious:  "1318,592,1316,471,1360,341,1484,339,1543,471,1543,588",
    mapName:  "imagemap-desktop",
  },
  mobile: {
    aboutMe:  "411,1843,1104,1840,1104,1342,1017,1129,433,1129,411,1153",
    projects: "1905,3245,2627,3245,2627,2888,2497,2769,2497,2622,2111,2622,1905,2898",
    curious:  "433,4804,1104,4804,1104,4446,939,4051,557,4051,433,4446",
    mapName:  "imagemap-mobile",
  },
};

function applyImageMap() {
  const isMobile = window.innerWidth <= BREAKPOINT;
  const cfg = isMobile ? COORDS.mobile : COORDS.desktop;

  const bgDesktop = document.getElementById("background-desktop");
  const bgMobile  = document.getElementById("background-mobile");

  // Trocar imagem de fundo visível e sincronizar o atributo usemap
  bgDesktop.style.display = isMobile ? "none" : "block";
  bgMobile.style.display  = isMobile ? "block" : "none";

  // O resizer.js encontra a imagem via img[usemap="#mapName"].
  // Garantir que só a imagem visível tem o usemap correto —
  // assim a biblioteca escala sempre em relação à imagem certa.
  bgDesktop.setAttribute("usemap", isMobile ? "#__disabled__" : "#imagemap-desktop");
  bgMobile.setAttribute("usemap",  isMobile ? "#imagemap-mobile" : "#__disabled__");

  // Destruir estado interno do resizer.js para forçar reinicialização
  if (desktop._resize) delete desktop._resize;

  // Atualizar nome do map e coordenadas das áreas
  desktop.name      = cfg.mapName;
  idAboutMe.coords  = cfg.aboutMe;
  idProjects.coords = cfg.projects;
  idCurious.coords  = cfg.curious;

  // Reinicializar a biblioteca com as novas coordenadas
  if (typeof imageMapResize === "function") imageMapResize();
}

// Aplicar no load
applyImageMap();

// Aplicar no resize com debounce
let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(applyImageMap, 150);
});


/* ── 4. PRELOADER GIF ─────────────────────────────────────── */
preloaderGif.src = window.innerWidth <= BREAKPOINT
  ? "images/loading-mobile.gif"
  : "images/loading-web.gif";


/* ── 5. ANIMAÇÃO DE LOADING ───────────────────────────────── */
// O script corre com `defer`, o DOM já está pronto — não usar DOMContentLoaded.
setTimeout(() => {
  preloaderEl.style.transition = "opacity 1s";
  preloaderEl.style.opacity    = "0";
  setTimeout(() => {
    preloaderEl.style.display = "none";
  }, 1000);
}, 1200);


/* ── 6. SISTEMA DE MODAIS (genérico) ─────────────────────── */

function openModal(modalId, parentId = null) {
  if (parentId) {
    document.getElementById(parentId).style.display = "none";
  }
  const modal = document.getElementById(modalId);
  modal.style.display = "flex";
  document.body.classList.add("no-scroll");
}

function closeModal(modalId, parentId = null) {
  document.getElementById(modalId).style.display = "none";
  if (parentId) {
    document.getElementById(parentId).style.display = "flex";
  } else {
    document.body.classList.remove("no-scroll");
  }
}

const MODALS = [
  { id: "modal-about",        parentId: null             },
  { id: "modal-projects",     parentId: null             },
  { id: "modal-curious",      parentId: null             },
  { id: "modal-filipas-town", parentId: "modal-projects" },
  { id: "modal-vodafone",     parentId: "modal-projects" },
  { id: "modal-founders",     parentId: "modal-projects" },
];

MODALS.forEach(({ id, parentId }) => {
  const modal    = document.getElementById(id);
  const closeBtn = modal.querySelector(".btn-close");

  closeBtn.addEventListener("click", () => closeModal(id, parentId));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal(id, parentId);
  });
});

// Fechar com Escape
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const visibleModal = [...MODALS].reverse().find(
    ({ id }) => document.getElementById(id).style.display === "flex"
  );
  if (visibleModal) closeModal(visibleModal.id, visibleModal.parentId);
});


/* ── 7. POP-UPS DE HOVER ─────────────────────────────────── */
// Os listeners são sempre registados, mas o handler verifica
// o tamanho atual do ecrã — assim funcionam corretamente
// mesmo depois de redimensionar a janela.
const hoverPairs = [
  { area: idAboutMe,  popup: aboutPop    },
  { area: idProjects, popup: projectsPop },
  { area: idCurious,  popup: curiousPop  },
];

// Hint bar — desaparece ao primeiro hover numa área do mapa
const exploreHint = document.getElementById("explore-hint");
let hintDismissed = false;

function dismissHint() {
  if (hintDismissed || !exploreHint) return;
  hintDismissed = true;
  exploreHint.classList.add("hidden");
  // Remove o elemento do DOM após a transição
  exploreHint.addEventListener("transitionend", () => exploreHint.remove(), { once: true });
}

hoverPairs.forEach(({ area, popup }) => {
  area.addEventListener("mouseenter", () => {
    if (window.innerWidth > BREAKPOINT) {
      popup.style.display = "block";
    }
  });
  area.addEventListener("mouseleave", () => {
    popup.style.display = "none";
  });
  area.addEventListener("click", () => {
    dismissHint();
  });
});


/* ── 8. HOVER EM IMAGENS (swap de src) ───────────────────── */
function registerImageHover(target, srcDefault, srcHover) {
  if (!target) return;
  const elements = target instanceof NodeList ? [...target] : [target];
  elements.forEach((el) => {
    if (!el) return;
    const trigger = el.closest("a") || el;
    trigger.addEventListener("mouseenter", () => { el.src = srcHover;   });
    trigger.addEventListener("mouseleave", () => { el.src = srcDefault; });
  });
}

// Ícones sociais
registerImageHover(document.querySelector(".linkedin"),  "images/SVG/linkedin.svg",   "images/SVG/linkedin-ver.svg");
registerImageHover(document.querySelector(".github"),    "images/SVG/github.svg",     "images/SVG/github-ver.svg");
registerImageHover(document.querySelector(".behance"),   "images/SVG/behance.svg",    "images/SVG/behance-ver.svg");

// Logos de projetos
registerImageHover(document.querySelector(".filipasTown"), "images/SVG/filipastown.svg", "images/SVG/filipastown-ver.svg");
registerImageHover(document.querySelector(".vodafone"),    "images/SVG/vodafone.svg",    "images/SVG/vodafone-ver.svg");
registerImageHover(document.querySelector(".founders"),    "images/SVG/f2.svg",          "images/SVG/f2-ver.svg");

// Botão Let's Chat (modal Curious)

// Botões "Let's Chat"
registerImageHover(document.querySelectorAll(".img-chat"), "images/chat.svg", "images/chat-ver.svg");

// Widget de acessibilidade
registerImageHover(document.querySelector(".widget"), "images/accessibility.png", "images/accessibility-ver.png");


/* ── 9. ANO DINÂMICO NO FOOTER ───────────────────────────── */
document.getElementById("year").textContent = new Date().getFullYear();


/* ── 10. WIDGET DE ACESSIBILIDADE ────────────────────────── */

// Todos os modos disponíveis e se são exclusivos entre si
const A11Y_MODES = {
  // Vision — filtros de cor são mutuamente exclusivos
  "high-contrast": { group: "vision"  },
  "deuteranopia":  { group: "vision"  },
  "protanopia":    { group: "vision"  },
  "tritanopia":    { group: "vision"  },
  "monochrome":    { group: "vision"  },
  // Reading — independentes entre si
  "dyslexia":      { group: "reading" },
  "large-text":    { group: "reading" },
  "line-height":   { group: "reading" },
  // Motion & Focus — independentes
  "reduce-motion": { group: "motion"  },
  "focus-mode":    { group: "motion"  },
};

// Estado activo de cada modo
const a11yState = Object.fromEntries(
  Object.keys(A11Y_MODES).map((k) => [k, false])
);

/** Aplica ou remove um modo, respeitando exclusividade no grupo vision */
function toggleA11y(mode) {
  const isActive = a11yState[mode];
  const group    = A11Y_MODES[mode].group;

  // Carregar OpenDyslexic apenas quando necessário
  if (mode === "dyslexia" && !isActive && !document.querySelector('link[href*="opendyslexic"]')) {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.cdnfonts.com/css/opendyslexic";
    document.head.appendChild(link);
  }

  // Se é vision, desativar todos os outros do mesmo grupo primeiro
  if (group === "vision") {
    Object.entries(A11Y_MODES).forEach(([m, cfg]) => {
      if (cfg.group === "vision" && m !== mode) {
        document.body.classList.remove(m);
        a11yState[m] = false;
        updateBtnState(m, false);
      }
    });
  }

  // Alternar o modo pedido
  const nowActive = !isActive;
  a11yState[mode] = nowActive;
  document.body.classList.toggle(mode, nowActive);
  updateBtnState(mode, nowActive);

  // Persistir em sessionStorage para manter entre modais
  sessionStorage.setItem("a11y", JSON.stringify(a11yState));
}

/** Atualiza o estado visual (active) do botão correspondente */
function updateBtnState(mode, active) {
  const btn = document.querySelector(`.a11y-btn[data-mode="${mode}"]`);
  if (btn) {
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  }
}

/** Restaura todos os modos guardados em sessionStorage no load */
function restoreA11yState() {
  try {
    const saved = JSON.parse(sessionStorage.getItem("a11y") || "{}");
    Object.entries(saved).forEach(([mode, active]) => {
      if (active && A11Y_MODES[mode]) {
        a11yState[mode] = true;
        document.body.classList.add(mode);
        updateBtnState(mode, true);
      }
    });
  } catch (_) { /* ignorar erros de parse */ }
}

restoreA11yState();

// Manter compatibilidade com chamadas antigas (daltonismo)
function toggleDeuteranopia() { toggleA11y("deuteranopia"); }
function toggleProtanopia()   { toggleA11y("protanopia");   }
function toggleTritanopia()   { toggleA11y("tritanopia");   }
function toggleMonochrome()   { toggleA11y("monochrome");   }

/** Abre/fecha o menu de acessibilidade */
function toggleAccessibilityMenu() {
  const menu   = document.getElementById("accessibility-menu");
  const isOpen = menu.style.display === "flex";
  menu.style.display = isOpen ? "none" : "flex";
  accessibilityBtn.setAttribute("aria-expanded", String(!isOpen));
  if (!isOpen) {
    // Focar o primeiro botão do menu para acessibilidade de teclado
    const firstBtn = menu.querySelector(".a11y-btn");
    if (firstBtn) firstBtn.focus();
  }
}

// Fechar o menu ao clicar fora do widget
document.addEventListener("click", (e) => {
  const widget = document.getElementById("accessibility-widget");
  const menu   = document.getElementById("accessibility-menu");
  if (menu.style.display === "flex" && !widget.contains(e.target)) {
    menu.style.display = "none";
    accessibilityBtn.setAttribute("aria-expanded", "false");
  }
});

/** Fecha o menu e desativa todos os modos */
function resetAccessibility() {
  Object.keys(A11Y_MODES).forEach((mode) => {
    document.body.classList.remove(mode);
    a11yState[mode] = false;
    updateBtnState(mode, false);
  });
  sessionStorage.removeItem("a11y");
  document.getElementById("accessibility-menu").style.display = "none";
  accessibilityBtn.setAttribute("aria-expanded", "false");
}

// Adicionar aria-pressed a todos os botões de opção
document.querySelectorAll(".a11y-btn").forEach((btn) => {
  btn.setAttribute("aria-pressed", "false");
});


/* ── 11. ANIMAÇÃO DE SCROLL NAS MODAIS ───────────────────── */
// Cada elemento com .scroll-reveal fica invisível até entrar
// no viewport do modal — aí recebe .is-visible e anima.

const scrollObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        scrollObserver.unobserve(entry.target); // anima só uma vez
      }
    });
  },
  {
    // Observa dentro de cada modal-body (scroll container)
    root: null,
    threshold: 0.12,
  }
);

function initScrollReveal(modalEl) {
  // Não animar se o utilizador preferir movimento reduzido
  if (document.body.classList.contains("reduce-motion") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  const targets = modalEl.querySelectorAll(
    ".modal-body p, .modal-body h1, .modal-body h2, .modal-body img, .modal-body ul, .modal-body ol, .modal-body figure, .modal-body .stack-icons"
  );
  targets.forEach((el) => {
    el.classList.add("scroll-reveal");
    scrollObserver.observe(el);
  });
}

// Inicializar quando cada modal abre
MODALS.forEach(({ id }) => {
  const modal = document.getElementById(id);
  let initialised = false;
  const observer = new MutationObserver(() => {
    if (modal.style.display === "flex" && !initialised) {
      initialised = true;
      initScrollReveal(modal);
    }
  });
  observer.observe(modal, { attributes: true, attributeFilter: ["style"] });
});
