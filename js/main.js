(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const cursorGlow = document.querySelector(".cursor-glow");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.addEventListener("click", (event) => {
      if (event.target.matches("a")) {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (cursorGlow && !reduceMotion) {
    window.addEventListener("pointermove", (event) => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;

      document.querySelectorAll(".depth-layer").forEach((element) => {
        const depth = Number(element.dataset.depth || 8);
        const x = ((event.clientX / window.innerWidth) - 0.5) * depth;
        const y = ((event.clientY / window.innerHeight) - 0.5) * depth;
        element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    }, { passive: true });
  }

  document.querySelectorAll("[data-compare]").forEach((widget) => {
    const overlay = widget.querySelector(".compare-overlay");
    const divider = widget.querySelector(".compare-divider");
    let isDragging = false;

    widget.querySelectorAll("img").forEach((image) => {
      image.setAttribute("draggable", "false");
      image.addEventListener("dragstart", (event) => event.preventDefault());
    });

    const syncOverlayImageWidth = () => {
      widget.style.setProperty("--compare-width", `${widget.getBoundingClientRect().width}px`);
    };

    const setPosition = (value) => {
      const position = Math.min(95, Math.max(5, value));
      overlay.style.width = `${position}%`;
      if (divider) {
        divider.style.left = `${position}%`;
      }
      widget.dataset.position = String(Math.round(position));
      widget.setAttribute("aria-valuenow", String(Math.round(position)));
    };

    const updateFromPointer = (event) => {
      const rect = widget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      setPosition((x / rect.width) * 100);
    };

    widget.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      isDragging = true;
      widget.setPointerCapture(event.pointerId);
      updateFromPointer(event);
    });

    widget.addEventListener("pointermove", (event) => {
      if (isDragging) {
        event.preventDefault();
        updateFromPointer(event);
      }
    });

    widget.addEventListener("pointerup", (event) => {
      isDragging = false;
      if (widget.hasPointerCapture(event.pointerId)) {
        widget.releasePointerCapture(event.pointerId);
      }
    });

    widget.addEventListener("pointercancel", () => {
      isDragging = false;
    });

    widget.addEventListener("keydown", (event) => {
      const current = Number(widget.dataset.position || 50);
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPosition(current - 4);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setPosition(current + 4);
      }
      if (event.key === "Home") {
        event.preventDefault();
        setPosition(5);
      }
      if (event.key === "End") {
        event.preventDefault();
        setPosition(95);
      }
    });

    window.addEventListener("resize", syncOverlayImageWidth);
    syncOverlayImageWidth();
    setPosition(Number(widget.dataset.position || 55));
  });

  const wireTextSwitcher = ({ buttonsSelector, titleSelector, textSelector, regionSelector, titleKey, textKey, regionKey }) => {
    const buttons = document.querySelectorAll(buttonsSelector);
    const title = document.querySelector(titleSelector);
    const text = document.querySelector(textSelector);
    const region = regionSelector ? document.querySelector(regionSelector) : null;

    if (!buttons.length || !title || !text) {
      return;
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");
        title.textContent = button.dataset[titleKey];
        text.textContent = button.dataset[textKey];
        if (region && regionKey) {
          region.textContent = button.dataset[regionKey];
        }

        if (window.gsap && !reduceMotion) {
          gsap.fromTo([title, text, region].filter(Boolean), {
            opacity: 0,
            y: 12,
            filter: "blur(6px)"
          }, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.45,
            ease: "power2.out",
            stagger: 0.05
          });
        }
      });
    });
  };

  wireTextSwitcher({
    buttonsSelector: ".story-choices button",
    titleSelector: "#story-title",
    textSelector: "#story-text",
    regionSelector: "#story-region",
    titleKey: "storyTitle",
    textKey: "storyText",
    regionKey: "storyRegion"
  });

  wireTextSwitcher({
    buttonsSelector: ".artifact-strip button",
    titleSelector: "#culture-title",
    textSelector: "#culture-text",
    titleKey: "cultureTitle",
    textKey: "cultureText"
  });

  if (window.gsap && !reduceMotion) {
    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    gsap.fromTo(".hero-media img", {
      scale: 1.16,
      opacity: 0.75
    }, {
      scale: 1.08,
      opacity: 1,
      duration: 2.4,
      ease: "power3.out"
    });

    gsap.fromTo(".hero-content > *", {
      opacity: 0,
      y: 34,
      filter: "blur(10px)"
    }, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.25,
      ease: "power3.out",
      stagger: 0.16,
      delay: 0.2
    });

    gsap.utils.toArray(".reveal").forEach((element) => {
      gsap.fromTo(element, {
        opacity: 0,
        y: 52,
        rotateX: 7,
        filter: "blur(8px)"
      }, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        filter: "blur(0px)",
        duration: 1.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
          once: true
        }
      });
    });

    gsap.to(".hero-orbit", {
      y: -18,
      duration: 4.4,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });

    gsap.to(".chapter-card, .culture-card, .info-card, .memory-node", {
      y: -12,
      duration: 3.6,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      stagger: 0.18
    });

    gsap.utils.toArray(".section").forEach((section) => {
      gsap.fromTo(section, {
        "--section-light": 0
      }, {
        "--section-light": 1,
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8
        }
      });
    });

    gsap.to(".particle-field", {
      yPercent: 18,
      ease: "none",
      scrollTrigger: {
        trigger: ".home-hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  } else {
    document.querySelectorAll(".reveal").forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });
  }
})();

document.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    }
});
