const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
const bpmSlider = document.getElementById("bpm-slider");
const bpmValue = document.getElementById("bpm-value");
let currentBpm = Number(bpmSlider?.value || 118);
let beatFlip = false;
let beatTimer = null;

const revealItems = document.querySelectorAll(".reveal");
const sectionReveals = document.querySelectorAll("main .section.reveal");
sectionReveals.forEach((section, index) => {
  const baseDelay = Number(section.dataset.delay || 0);
  section.dataset.delay = String(baseDelay + index * 0.03);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay || 0) * 1000;
      setTimeout(() => entry.target.classList.add("visible"), delay);
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.2 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const spotlight = document.querySelector(".spotlight");
if (!reduceMotion && spotlight) {
  window.addEventListener("mousemove", (event) => {
    spotlight.style.left = `${event.clientX}px`;
    spotlight.style.top = `${event.clientY}px`;
  });
}

function motionRateFromBpm(bpm) {
  return Math.max(0.55, Math.min(1.8, bpm / 120));
}

function runBeatPulse() {
  beatFlip = !beatFlip;
  document.body.classList.toggle("beat-a", beatFlip);
  document.body.classList.toggle("beat-b", !beatFlip);
}

function restartBeatClock() {
  if (beatTimer) clearInterval(beatTimer);
  if (reduceMotion) return;
  const beatMs = Math.max(260, Math.round(60000 / currentBpm));
  beatTimer = setInterval(runBeatPulse, beatMs);
}

function applyTempo(bpm) {
  currentBpm = bpm;
  root.style.setProperty("--motion-rate", String(motionRateFromBpm(bpm)));
  if (bpmValue) bpmValue.textContent = `${bpm} BPM`;
  restartBeatClock();
}

if (bpmSlider) {
  if (reduceMotion) {
    bpmSlider.disabled = true;
    if (bpmValue) bpmValue.textContent = "Reduced Motion";
  } else {
    applyTempo(currentBpm);
    bpmSlider.addEventListener("input", () => {
      applyTempo(Number(bpmSlider.value));
    });
  }
}

if (!reduceMotion) {
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -7;
      const rotateY = ((x / rect.width) - 0.5) * 7;
      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0)";
    });
  });

  document.querySelectorAll(".boogie").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      item.classList.add("boogie-boost");
    });

    item.addEventListener("mouseleave", () => {
      item.classList.remove("boogie-boost");
    });
  });
}

const popupBackdrop = document.getElementById("popup-backdrop");
const popupClose = document.getElementById("popup-close");
const popupKicker = document.getElementById("popup-kicker");
const popupTitle = document.getElementById("popup-title");
const popupText = document.getElementById("popup-text");
const popupTags = document.getElementById("popup-tags");

const popupData = {
  manifesto: {
    kicker: "Manifesto",
    title: "Code With Rhythm",
    text: "I design backend architecture like a performance system: reliable timing, expressive structure, and zero compromise on delivery quality.",
    tags: ["Architecture", "Reliability", "Delivery", "Futurism"]
  },
  cms: {
    kicker: "Enterprise",
    title: "Case Management System",
    text: "Engineered validation-heavy backend flows, protected processing chains, and stable release support for operational teams.",
    tags: ["Spring Boot", "Oracle", "REST", "Production"]
  },
  ccms: {
    kicker: "Customer Systems",
    title: "CCMS Platform",
    text: "Built service-centric backend modules and optimized incident operations with enterprise-grade reliability goals.",
    tags: ["Java", "PL/SQL", "Tomcat", "Integrations"]
  },
  hims: {
    kicker: "Healthcare",
    title: "PCR + HIMS Systems",
    text: "Delivered transaction-safe healthcare services with robust persistence layers and disciplined deployment execution.",
    tags: ["Hibernate", "MySQL", "JUnit", "Maven"]
  }
};

function openPopup(key) {
  const data = popupData[key];
  if (!data) return;

  popupKicker.textContent = data.kicker;
  popupTitle.textContent = data.title;
  popupText.textContent = data.text;
  popupTags.innerHTML = data.tags.map((tag) => `<span>${tag}</span>`).join("");

  popupBackdrop.classList.add("open");
  popupBackdrop.setAttribute("aria-hidden", "false");
}

function closePopup() {
  popupBackdrop.classList.remove("open");
  popupBackdrop.setAttribute("aria-hidden", "true");
}

document.querySelectorAll(".popup-trigger").forEach((button) => {
  button.addEventListener("click", () => openPopup(button.dataset.popup));
});

popupClose.addEventListener("click", closePopup);
popupBackdrop.addEventListener("click", (event) => {
  if (event.target === popupBackdrop) closePopup();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePopup();
});

if (!reduceMotion) {
  setTimeout(() => openPopup("manifesto"), 900);
}

const counters = document.querySelectorAll(".counter");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const target = Number(el.dataset.target || 0);
      const duration = 1000;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = `${Math.floor(progress * target)}+`;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.35 }
);

counters.forEach((counter) => counterObserver.observe(counter));
