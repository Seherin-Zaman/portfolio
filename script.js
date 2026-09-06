/* =========================================================
   Seherin Zaman - Portfolio
   Plain JavaScript, no dependencies.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var body = document.body;

  /* ---------------- Entrance ----------------
     Held one frame so the hero's starting state paints
     before the transition to its resting state begins. */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      body.classList.add("is-ready");
    });
  });

  /* ---------------- Section reveals ---------------- */
  var revealItems = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (el) { el.classList.add("in"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------- Header state + scroll progress ---------------- */
  var head = document.getElementById("siteHead");
  var progressBar = document.getElementById("progressBar");
  var ticking = false;

  function onScrollFrame() {
    var y = window.pageYOffset || document.documentElement.scrollTop;

    if (head) head.classList.toggle("is-stuck", y > 12);

    if (progressBar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(1, y / max) : 0;
      progressBar.style.transform = "scaleX(" + ratio + ")";
    }

    ticking = false;
  }

  function requestScrollFrame() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScrollFrame);
  }

  window.addEventListener("scroll", requestScrollFrame, { passive: true });
  window.addEventListener("resize", requestScrollFrame);
  onScrollFrame();

  /* ---------------- Mobile menu ---------------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  function setMenu(open) {
    if (!burger || !nav) return;
    body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      setMenu(!body.classList.contains("menu-open"));
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) setMenu(false);
    });
  }

  /* ---------------- Anchor scrolling ----------------
     A section waiting to reveal is offset by its own transform,
     which the browser's native anchor scroll measures. offsetTop
     ignores transforms, so the landing position stays accurate
     whatever the reveal animation is doing. */
  function documentTop(el) {
    var y = 0;
    while (el) {
      y += el.offsetTop;
      el = el.offsetParent;
    }
    return y;
  }

  function goToSection(hash) {
    if (!hash || hash === "#") return false;

    var target;
    try {
      target = document.querySelector(hash);
    } catch (err) {
      return false;
    }
    if (!target) return false;

    var offset = (head ? head.offsetHeight : 0) + 24;
    var top = Math.max(0, documentTop(target) - offset);

    window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });

    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });

    return true;
  }

  document.querySelectorAll("a[href^='#']").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var hash = link.getAttribute("href");
      if (!goToSection(hash)) return;

      e.preventDefault();
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", hash);
      }
    });
  });

  if (window.location.hash) {
    window.addEventListener("load", function () {
      goToSection(window.location.hash);
    });
  }

  /* ---------------- Card spotlight ----------------
     Cards carry a soft radial highlight that follows the cursor.
     Pointer-only, motion-safe, and throttled to one write per frame. */
  var fineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!reduceMotion && fineHover) {
    document.querySelectorAll(".project, .skill-card").forEach(function (card) {
      var frame = null;
      var x = 0;
      var y = 0;

      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;

        if (frame) return;
        frame = window.requestAnimationFrame(function () {
          frame = null;
          card.style.setProperty("--mx", x + "px");
          card.style.setProperty("--my", y + "px");
        });
      });

      card.addEventListener("pointerleave", function () {
        card.style.removeProperty("--mx");
        card.style.removeProperty("--my");
      });
    });
  }

  /* ---------------- Active nav link ---------------- */
  var navAnchors = Array.prototype.slice.call(nav ? nav.querySelectorAll("a[href^='#']") : []);

  var sections = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }
})();
