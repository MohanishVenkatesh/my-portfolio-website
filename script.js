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
        el.textContent = `${Math.floor(progress * target)}`;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.35 }
);

counters.forEach((counter) => counterObserver.observe(counter));

