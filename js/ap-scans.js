/* Alineplane · #scans slideshow. No globals, no dependencies. */
(function () {
  "use strict";
  var RM = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var EASE = "cubic-bezier(.22,1,.36,1)";

  function init(root) {
    if (root.__apScans) return; root.__apScans = true;
    var vp = root.querySelector(".ap-scans-viewport");
    var stage = root.querySelector(".ap-scans-stage");
    var slides = [].slice.call(root.querySelectorAll(".ap-scans-slide"));
    var dots = [].slice.call(root.querySelectorAll(".ap-scans-dot"));
    var bar = root.querySelector(".ap-scans-bar i");
    var count = root.querySelector(".ap-scans-count");
    var playBtn = root.querySelector(".ap-scans-play");
    var fsBtn = root.querySelector(".ap-scans-fs");
    var n = slides.length, cur = 0, busy = false, prog = null;
    var autoplay = !RM.matches, inView = false, hover = false, started = false, typing = [];

    function pad(x) { return (x < 10 ? "0" : "") + x; }

    function svgs(s) { return [].slice.call(s.querySelectorAll("svg")); }

    function typeTerm(s) {
      typing.forEach(function (a) { a.cancel(); }); typing = [];
      var lines = [].slice.call(s.querySelectorAll(".ap-scans-tl"));
      if (!lines.length || RM.matches || !vp.animate) return;
      var t = 250;
      lines.forEach(function (el, i) {
        var len = Math.max(1, el.textContent.length), per = i === 0 ? 18 : 6.5;
        var dur = len * per;
        var wrapped = el.getClientRects().length > 1 || el.offsetHeight > parseFloat(getComputedStyle(el).lineHeight) * 1.5;
        if (wrapped) {
          dur = 260;
          typing.push(el.animate([{ opacity: 0, transform: "translateX(-6px)" }, { opacity: 1, transform: "none" }], { duration: dur, delay: t, easing: EASE, fill: "both" }));
        } else {
          typing.push(el.animate([{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
            { duration: dur, delay: t, easing: "steps(" + len + ", end)", fill: "both" }));
        }
        t += dur + (i === 0 ? 300 : 110);
      });
      var caret = s.querySelector(".ap-scans-caret");
      if (caret) typing.push(caret.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: t, fill: "both" }));
    }

    function play(s) {
      s.classList.remove("is-play"); void s.offsetWidth; s.classList.add("is-play");
      typeTerm(s);
      [].forEach.call(s.querySelectorAll(".ap-scans-pulse animateMotion"), function (m) {
        var d = parseInt(m.parentNode.style.getPropertyValue("--d"), 10) || 0;
        try { m.endElement(); } catch (e) {}
        try { m.beginElementAt(d / 1000); } catch (e) {}
      });
      svgs(s).forEach(function (v) { try { v.unpauseAnimations(); } catch (e) {} });
      [].forEach.call(s.querySelectorAll("[data-count]"), function (b) {
        if (RM.matches) return;
        var to = +b.getAttribute("data-count"), t0 = 0, delay = 600;
        b.textContent = "0";
        function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, Math.max(0, (ts - t0 - delay) / 900)); b.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
        requestAnimationFrame(step);
      });
    }

    function schedule() {
      if (prog) prog.cancel();
      var dur = +slides[cur].getAttribute("data-dur") || 8000;
      if (bar.animate) {
        prog = bar.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: dur, fill: "both" });
        prog.onfinish = function () { if (running()) go(cur + 1, false); };
      }
      sync();
    }
    function running() { return autoplay && inView && !hover && !document.hidden; }
    function sync() {
      var r = running();
      if (prog) { r ? prog.play() : prog.pause(); }
      root.classList.toggle("is-stopped", !autoplay);
      root.classList.toggle("is-paused-anim", !inView);
      vp.classList.toggle("is-on", inView);
      playBtn.setAttribute("aria-label", autoplay ? "Pause autoplay" : "Start autoplay");
      slides.forEach(function (s) { svgs(s).forEach(function (v) { try { inView ? v.unpauseAnimations() : v.pauseAnimations(); } catch (e) {} }); });
    }

    function setActive(i) {
      slides.forEach(function (s, k) {
        var on = k === i;
        s.classList.toggle("is-active", on);
        s.setAttribute("aria-hidden", on ? "false" : "true");
        if ("inert" in s) s.inert = !on;
        if (!on) s.classList.remove("is-play");
      });
      dots.forEach(function (d, k) { d.setAttribute("aria-current", k === i ? "true" : "false"); });
      count.textContent = pad(i + 1) + " / " + pad(n);
      count.setAttribute("aria-live", autoplay ? "off" : "polite");
    }

    // FLIP morph fallback for browsers without View Transitions
    function flipSwap(from, to, swap) {
      var olds = {}; [].forEach.call(slides[from].querySelectorAll(".ap-scans-vt"), function (e) { olds[e.getAttribute("data-vt")] = e.getBoundingClientRect(); });
      swap();
      var a = slides[from], b = slides[to];
      a.style.visibility = "visible";
      var dir = (to > from || (from === n - 1 && to === 0)) ? 1 : -1;
      var out = a.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(" + (-2.5 * dir) + "%)" }], { duration: 420, easing: EASE });
      b.animate([{ opacity: 0, transform: "translateX(" + (2.5 * dir) + "%)" }, { opacity: 1, transform: "none" }], { duration: 650, easing: EASE });
      [].forEach.call(b.querySelectorAll(".ap-scans-vt"), function (e) {
        var o = olds[e.getAttribute("data-vt")]; if (!o) return;
        var r = e.getBoundingClientRect(); if (!r.width || !r.height) return;
        e.animate([{ transformOrigin: "0 0", transform: "translate(" + (o.left - r.left) + "px," + (o.top - r.top) + "px) scale(" + (o.width / r.width) + "," + (o.height / r.height) + ")", opacity: .6 },
                   { transformOrigin: "0 0", transform: "none", opacity: 1 }], { duration: 750, easing: EASE });
      });
      return out.finished.then(function () { a.style.visibility = ""; });
    }

    function go(i, user) {
      i = (i + n) % n;
      if (i === cur || busy) return;
      var from = cur; cur = i; busy = true;
      var swap = function () { setActive(i); play(slides[i]); };
      var done = function () { if (!busy) return; busy = false; schedule(); };
      if (RM.matches || !vp.animate) {
        swap();
        if (vp.animate) slides[i].animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
        done(); return;
      }
      var vt = null;
      try {
        if (typeof vp.startViewTransition === "function") vt = vp.startViewTransition(swap);
        else if (user && typeof document.startViewTransition === "function") vt = document.startViewTransition(swap);
      } catch (e) { vt = null; }
      if (vt) { vt.finished.then(done, done); setTimeout(function () { if (busy) done(); }, 1500); }
      else flipSwap(from, i, swap).then(done, done);
    }

    // controls
    root.querySelectorAll(".ap-scans-nav").forEach(function (b) {
      b.addEventListener("click", function () { go(cur + (+b.getAttribute("data-dir")), true); });
    });
    dots.forEach(function (d, k) { d.addEventListener("click", function () { go(k, true); }); });
    playBtn.addEventListener("click", function () { autoplay = !autoplay; if (autoplay && prog && prog.playState === "finished") go(cur + 1, true); sync(); setActive(cur); });
    function fullscreen() {
      var d = document;
      if (d.fullscreenElement) { d.exitFullscreen && d.exitFullscreen(); }
      else if (stage.requestFullscreen) { stage.requestFullscreen().catch(function () {}); }
    }
    if (fsBtn) { if (!stage.requestFullscreen) fsBtn.hidden = true; fsBtn.addEventListener("click", fullscreen); }

    // keyboard: only while focus is inside the stage
    stage.addEventListener("keydown", function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var onButton = e.target.closest && e.target.closest("button,a");
      var k = e.key;
      if (k === "ArrowRight" || k === "PageDown") { go(cur + 1, true); e.preventDefault(); }
      else if (k === "ArrowLeft" || k === "PageUp") { go(cur - 1, true); e.preventDefault(); }
      else if (k === "Home") { go(0, true); e.preventDefault(); }
      else if (k === "End") { go(n - 1, true); e.preventDefault(); }
      else if ((k === " " || k === "Spacebar") && !onButton) { autoplay = !autoplay; if (autoplay && prog && prog.playState === "finished") go(cur + 1, true); sync(); setActive(cur); e.preventDefault(); }
      else if ((k === "f" || k === "F") && !onButton) { fullscreen(); e.preventDefault(); }
    });

    // hover pause (mouse only), tap toggles autoplay, swipe navigates
    vp.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { hover = true; sync(); } });
    vp.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { hover = false; sync(); } });
    var sx = 0, sy = 0, st = 0, ptype = "";
    vp.addEventListener("pointerdown", function (e) { sx = e.clientX; sy = e.clientY; st = Date.now(); ptype = e.pointerType; });
    vp.addEventListener("pointerup", function (e) {
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) { go(cur + (dx < 0 ? 1 : -1), true); return; }
      if (ptype !== "mouse" && Math.abs(dx) < 10 && Math.abs(dy) < 10 && Date.now() - st < 400 && !(e.target.closest && e.target.closest("a"))) {
        autoplay = !autoplay; sync(); setActive(cur);
      }
    });
    document.addEventListener("visibilitychange", sync);

    // lazy start when scrolled into view
    function onView(v) {
      inView = v;
      if (v && !started) { started = true; play(slides[cur]); schedule(); }
      sync();
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { es.forEach(function (en) { onView(en.isIntersecting && en.intersectionRatio >= 0.35); }); },
        { threshold: [0, 0.35, 0.6] }).observe(vp);
    } else onView(true);
    if (RM.addEventListener) RM.addEventListener("change", function () { if (RM.matches) { autoplay = false; sync(); } });

    setActive(0);
    root.classList.add("is-ready");
    sync();
  }

  function boot() { [].forEach.call(document.querySelectorAll("[data-ap-scans]"), init); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
