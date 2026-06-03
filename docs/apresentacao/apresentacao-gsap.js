(function () {
  const slides = Array.from(document.querySelectorAll("[data-slide]"));
  const progressEl = document.getElementById("progress");
  const slideNumEl = document.getElementById("slideNum");
  let index = 0;
  let isAnimating = false;

  function slideContent(slide) {
    const blocks = slide.querySelectorAll(
      ".kicker, h1, h2, .lead, ul, .tag-row, .grid-2, .logo-mark, .big-number"
    );
    return blocks.length ? blocks : [slide];
  }

  function updateChrome() {
    const pct = ((index + 1) / slides.length) * 100;
    progressEl.style.width = pct + "%";
    slideNumEl.textContent = index + 1 + " / " + slides.length;
  }

  function animateIn(slide) {
    const parts = slideContent(slide);
    gsap.set(parts, { opacity: 0, y: 24 });
    return gsap.to(parts, {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.07,
      ease: "power3.out",
    });
  }

  function animateOut(slide) {
    const parts = slideContent(slide);
    return gsap.to(parts, {
      opacity: 0,
      y: -16,
      duration: 0.28,
      stagger: 0.03,
      ease: "power2.in",
    });
  }

  function goTo(next) {
    const n = Math.max(0, Math.min(slides.length - 1, next));
    if (n === index || isAnimating) return;
    isAnimating = true;
    const prev = slides[index];
    index = n;
    const curr = slides[index];
    updateChrome();

    animateOut(prev).then(() => {
      prev.style.visibility = "hidden";
      prev.classList.remove("is-active");
      curr.style.visibility = "visible";
      curr.classList.add("is-active");
      curr.style.opacity = "1";
      animateIn(curr).then(() => {
        isAnimating = false;
      });
    });
  }

  function next() {
    goTo(index + 1);
  }
  function prev() {
    goTo(index - 1);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      prev();
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    }
  });

  slides.forEach((s, i) => {
    if (i !== 0) {
      s.style.visibility = "hidden";
      s.style.opacity = "0";
    } else {
      s.classList.add("is-active");
      s.style.opacity = "1";
    }
  });
  updateChrome();
  animateIn(slides[0]);
})();
