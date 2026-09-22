(function () {
  const panels = Array.from(document.querySelectorAll("[data-panel]"));
  const progressEl = document.getElementById("progress");
  const slideNumEl = document.getElementById("slideNum");
  const dotsEl = document.getElementById("dots");
  const hintEl = document.getElementById("hint");
  const deck = document.getElementById("deck");

  let index = 0;
  let busy = false;
  let wheelLock = false;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const pad = (n) => String(n).padStart(2, "0");

  function parts(panel) {
    return panel.querySelectorAll(".anim");
  }

  function buildDots() {
    panels.forEach((_, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", "Ir para seção " + (i + 1));
      btn.addEventListener("click", () => goTo(i));
      dotsEl.appendChild(btn);
    });
  }

  function updateChrome() {
    const pct = ((index + 1) / panels.length) * 100;
    progressEl.style.width = pct + "%";
    slideNumEl.textContent = pad(index + 1) + " / " + pad(panels.length);
    dotsEl.querySelectorAll("button").forEach((btn, i) => {
      btn.classList.toggle("is-active", i === index);
    });
    if (index > 0) hintEl.classList.add("is-hidden");
  }

  function enter(panel) {
    const items = parts(panel);
    if (reduceMotion) {
      gsap.set(panel, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(items, { opacity: 1, y: 0, filter: "none" });
      return Promise.resolve();
    }

    gsap.set(panel, { opacity: 1, clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(items, { opacity: 0, y: 36, filter: "blur(8px)" });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(panel, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55 }, 0);
    tl.to(
      items,
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.5,
        stagger: 0.08,
      },
      0.18
    );
    return tl.then();
  }

  function leave(panel) {
    const items = parts(panel);
    if (reduceMotion) {
      gsap.set(panel, { opacity: 0, clipPath: "inset(0% 0% 100% 0%)" });
      return Promise.resolve();
    }

    const tl = gsap.timeline({ defaults: { ease: "power2.in" } });
    tl.to(items, { opacity: 0, y: -18, filter: "blur(4px)", duration: 0.28, stagger: 0.03 }, 0);
    tl.to(panel, { clipPath: "inset(0% 0% 100% 0%)", opacity: 0.35, duration: 0.4 }, 0.05);
    return tl.then();
  }

  function goTo(next) {
    const n = Math.max(0, Math.min(panels.length - 1, next));
    if (n === index || busy) return;
    busy = true;

    const prev = panels[index];
    index = n;
    const curr = panels[index];
    updateChrome();

    leave(prev).then(() => {
      prev.classList.remove("is-active");
      prev.style.visibility = "hidden";
      prev.style.pointerEvents = "none";

      curr.style.visibility = "visible";
      curr.style.pointerEvents = "auto";
      curr.classList.add("is-active");

      return enter(curr);
    }).then(() => {
      busy = false;
    });
  }

  function next() {
    goTo(index + 1);
  }
  function prev() {
    goTo(index - 1);
  }

  document.addEventListener("keydown", (e) => {
    const keysNext = ["ArrowRight", "ArrowDown", " ", "PageDown"];
    const keysPrev = ["ArrowLeft", "ArrowUp", "PageUp"];
    if (keysNext.includes(e.key)) {
      e.preventDefault();
      next();
    } else if (keysPrev.includes(e.key)) {
      e.preventDefault();
      prev();
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(panels.length - 1);
    }
  });

  window.addEventListener(
    "wheel",
    (e) => {
      if (wheelLock || busy) return;
      const dy = e.deltaY;
      if (Math.abs(dy) < 18) return;
      e.preventDefault();
      wheelLock = true;
      if (dy > 0) next();
      else prev();
      window.setTimeout(() => {
        wheelLock = false;
      }, 650);
    },
    { passive: false }
  );

  let touchY = null;
  window.addEventListener(
    "touchstart",
    (e) => {
      touchY = e.changedTouches[0].clientY;
    },
    { passive: true }
  );
  window.addEventListener(
    "touchend",
    (e) => {
      if (touchY == null || busy) return;
      const dy = touchY - e.changedTouches[0].clientY;
      touchY = null;
      if (Math.abs(dy) < 48) return;
      if (dy > 0) next();
      else prev();
    },
    { passive: true }
  );

  buildDots();
  panels.forEach((panel, i) => {
    if (i === 0) {
      panel.classList.add("is-active");
      panel.style.visibility = "visible";
      panel.style.pointerEvents = "auto";
    } else {
      panel.style.visibility = "hidden";
      panel.style.opacity = "0";
    }
  });
  updateChrome();
  enter(panels[0]);
  deck.focus({ preventScroll: true });
})();
