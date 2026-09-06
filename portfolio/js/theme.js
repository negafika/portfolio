/* ==========================================================================
   NEGAYE FIKADU — PORTFOLIO THEME JS
   Preloader · cursor · progress · nav · wow · particles · spotlight ·
   countups · skill bars · isotope filters · slick quotes · modals · form
   Requires: jquery, wow.min.js, particles.min.js, typer.js (auto-init),
             isotope.pkgd.min.js, slick.min.js
   ========================================================================== */
(function ($) {
  "use strict";

  var $w = $(window), $doc = $(document), body = document.body;
  var finePointer = window.matchMedia("(pointer:fine)").matches;

  /* ---------------- Preloader ---------------- */
  var pct = 0, done = false;
  var preTimer = setInterval(function () {
    pct += Math.random() * 16 + 7;
    if (pct >= 100) { pct = 100; finishLoad(); }
    $("#pre-fill").css("width", pct + "%");
    $("#pre-pct").text(Math.round(pct) + "%");
  }, 130);
  function finishLoad() {
    if (done) return; done = true;
    clearInterval(preTimer);
    setTimeout(function () { body.classList.add("loaded"); }, 320);
  }
  $w.on("load", function () { setTimeout(finishLoad, 500); });
  setTimeout(finishLoad, 4000); // fail-safe

  /* ---------------- Scroll progress + header + to-top ---------------- */
  var header = $("#site-header"), progress = $("#progress"), toTop = $("#to-top");
  var hideTimer = null;
  function onScroll() {
    var st = $w.scrollTop();
    var h = document.documentElement.scrollHeight - $w.height();
    progress.css("width", (h > 0 ? (st / h) * 100 : 0) + "%");
    header.toggleClass("scrolled", st > 40);
    toTop.toggleClass("show", st > 650);
    /* Auto-hide: while you scroll the bar stays; ~1.6s after scrolling
       stops it glides away so the page is unobstructed. Never hides at
       the very top or while the mobile menu is open. */
    header.removeClass("nav-idle-hidden");
    clearTimeout(hideTimer);
    if (st > 140 && !$(".m-menu").hasClass("open")) {
      hideTimer = setTimeout(function () { header.addClass("nav-idle-hidden"); }, 1600);
    }
  }
  /* Hovering where the bar lives keeps it pinned */
  header.on("mouseenter focusin", function () { clearTimeout(hideTimer); header.removeClass("nav-idle-hidden"); });
  $w.on("scroll", onScroll); onScroll();
  toTop.on("click", function () { $("html,body").animate({ scrollTop: 0 }, 700); });

  /* ---------------- Contact row actions: Gmail compose + copy ---------------- */
  $(document).on("click", ".js-gmail", function (e) {
    e.preventDefault(); e.stopPropagation();
    var to = $(this).data("to");
    window.open("https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(to) +
      "&su=" + encodeURIComponent("Portfolio inquiry"), "_blank", "noopener");
  });
  $(document).on("click", ".js-wa", function (e) {
    e.preventDefault(); e.stopPropagation();
    window.open("https://wa.me/" + $(this).data("wa"), "_blank", "noopener");
  });

  /* Social icons: guaranteed working clicks even inside sandboxed previews.
     1) try popup (user gesture) 2) if blocked, navigate top 3) else self. */
  $(document).on("click", ".f-social a[href^='http'], .social-rail a[href^='http']", function (e) {
    e.preventDefault();
    var url = this.href;
    var w = window.open(url, "_blank", "noopener");
    if (!w) {
      try { window.top.location.href = url; }
      catch (err) { window.location.href = url; }
    }
  });
  $(document).on("click", ".js-copy", function (e) {
    e.preventDefault(); e.stopPropagation();
    var txt = String($(this).data("copy")); var btn = $(this);
    function done() {
      btn.addClass("copied").contents().last().replaceWith(" Copied");
      setTimeout(function () { btn.removeClass("copied").contents().last().replaceWith(" Copy"); }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, done);
    } else {
      var ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta);
      ta.select(); try { document.execCommand("copy"); } catch (err) {} ta.remove(); done();
    }
  });

  /* ---------------- Scrollspy ---------------- */
  var spyMap = {};
  $(".nav-link[data-spy]").each(function () { spyMap[$(this).attr("href").slice(1)] = this; });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && spyMap[e.target.id]) {
          $(".nav-link").removeClass("active");
          $(spyMap[e.target.id]).addClass("active");
        }
      });
    }, { rootMargin: "-38% 0px -56% 0px" });
    ["home", "services", "projects", "about", "notes"].forEach(function (id) {
      var s = document.getElementById(id); if (s) spy.observe(s);
    });
  }

  /* ---------------- Mobile menu ---------------- */
  var burger = $("#burger"), mMenu = $("#m-menu");
  function setMenu(open) {
    mMenu.toggleClass("open", open);
    mMenu.attr("aria-hidden", !open);
    burger.toggleClass("open", open);
    burger.attr("aria-expanded", open);
    body.classList.toggle("locked", open);
  }
  burger.on("click", function () { setMenu(!mMenu.hasClass("open")); });
  mMenu.find("a").on("click", function () { setMenu(false); });

  /* ---------------- Custom cursor ---------------- */
  if (finePointer) {
    body.classList.add("cursor-on");
    var dot = $('<div class="cursor-dot"></div>').appendTo(body)[0];
    var ring = $('<div class="cursor-ring"></div>').appendTo(body)[0];
    var mx = -100, my = -100, rx = -100, ry = -100;
    $doc.on("mousemove", function (e) { mx = e.clientX; my = e.clientY; });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      dot.style.transform = "translate(" + (mx - 3.5) + "px," + (my - 3.5) + "px)";
      ring.style.transform = "translate(" + (rx - 19) + "px," + (ry - 19) + "px)";
      requestAnimationFrame(loop);
    })();
    $doc.on("mouseenter", "a,button,.filter,input,textarea,label,.bento-card", function () { ring.classList.add("is-hover"); });
    $doc.on("mouseleave", "a,button,.filter,input,textarea,label,.bento-card", function () { ring.classList.remove("is-hover"); });
  }

  /* ---------------- WOW.js (scroll reveals) ---------------- */
  if (window.WOW) new WOW({ offset: 70, mobile: true }).init();

  /* ---------------- Particles (hero) ---------------- */
  /* ---- Reduced motion: pause SMIL orbit, skip particle canvas ---- */
  var REDUCED = false;
  try { REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  if (REDUCED) {
    document.querySelectorAll(".orbit-diagram").forEach(function (s) {
      if (s.pauseAnimations) s.pauseAnimations();
    });
  }

  if (window.particlesJS && document.getElementById("particles") && !REDUCED) {
    window.particlesJS("particles", {
      particles: {
        number: { value: 36, density: { enable: true, value_area: 900 } },
        color: { value: ["#f2a53a", "#6ea8ff", "#97a0b4"] },
        shape: { type: "circle" },
        opacity: { value: 0.35, random: true },
        size: { value: 2.2, random: true },
        line_linked: { enable: true, distance: 140, color: "#f2a53a", opacity: 0.12, width: 1 },
        move: { enable: true, speed: 0.7, direction: "none", random: true, straight: false, out_mode: "out" }
      },
      interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: false }, resize: true },
        modes: { grab: { distance: 150, line_linked: { opacity: 0.28 } } }
      },
      retina_detect: true
    });
  }

  /* ---------------- Magnetic buttons ---------------- */
  if (finePointer) {
    $(".magnetic").each(function () {
      var el = this;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + x * 0.22 + "px," + y * 0.28 + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------------- Bento spotlight ---------------- */
  $doc.on("mousemove", ".spot", function (e) {
    var r = this.getBoundingClientRect();
    this.style.setProperty("--mx", (e.clientX - r.left) + "px");
    this.style.setProperty("--my", (e.clientY - r.top) + "px");
  });

  /* ---------------- Count-up stats ---------------- */
  function countUp(el) {
    var n = +el.getAttribute("data-n"), suf = el.getAttribute("data-s") || "";
    var t0 = performance.now(), dur = 1400;
    (function tick(t) {
      var p = Math.min(1, (t - t0) / dur), v = Math.round(n * (1 - Math.pow(1 - p, 3)));
      el.innerHTML = v + "<em>" + suf + "</em>";
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    $(".count-num").each(function () { cio.observe(this); });

    /* Skill bars */
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.width = e.target.getAttribute("data-p") + "%";
          sio.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    $(".skill-fill").each(function () { sio.observe(this); });
  } else {
    $(".skill-fill").each(function () { this.style.width = this.getAttribute("data-p") + "%"; });
  }

  /* ---------------- Isotope project filtering ---------------- */
  var iso = null;
  if (window.Isotope && document.getElementById("proj-grid")) {
    iso = new Isotope("#proj-grid", {
      itemSelector: ".proj-item",
      layoutMode: "fitRows",
      transitionDuration: "0.55s",
      hiddenStyle: { opacity: 0, transform: "scale(.94)" },
      visibleStyle: { opacity: 1, transform: "scale(1)" }
    });
    $(".filter").on("click", function () {
      $(".filter").removeClass("active");
      $(this).addClass("active");
      iso.arrange({ filter: $(this).data("filter") });
    });
  }

  /* Store link inside the clickable project card: navigate, don't open the modal.
     Bound BEFORE the modal delegate so stopImmediatePropagation wins. */
  $(document).on("click", ".proj-store-link", function (e) { e.stopImmediatePropagation(); });

  /* ---------------- Content data ---------------- */
  var CASES = {
    odoo: {
      img: "images/project-odoo.svg", title: "Time Off Accrual Expiry — Odoo",
      sub: "A published Odoo App Store module that automates leave-expiry processing for HR teams.",
      tags: ["Odoo", "Python", "ORM", "OWL", "PostgreSQL", "HR"],
      secs: [
        { h: "The Problem", p: "Odoo Community Edition had no functional way to expire unused accrual leave. HR teams were tracking expiry manually in spreadsheets — slow, error-prone and impossible to audit." },
        { h: "What I Built", p: "A complete module that follows Odoo's workflow and design philosophy end to end: automated expiry processing, carry-over rules, role-based access and full historical tracking for auditing.", list: ["Automated expiry & carry-over processing on schedule", "Role-based access for HR officers, managers and employees", "Independent balance reports: remaining, expired and upcoming expiry", "Integration with Odoo Time Off dashboards and remaining balances", "Full historical records for auditing and compliance"] },
        { h: "Outcome", p: "The module removes all manual expiry tracking and gives HR one clear, auditable view of leave balances — and it's published on the Odoo App Store for anyone to use." }
      ],
      mets: [["100%", "Manual expiry work removed"], ["2026", "Published on Odoo App Store"], ["3", "Independent balance reports"]],
      link: ["View on the Odoo App Store", "https://apps.odoo.com/apps/modules/17.0/hr_leave_accrual_expiry/"],
      repo: ["Source Code on GitHub", "https://github.com/negafika"]
    },
    auto: {
      img: "images/project-automation.svg", title: "Business Automation Tool",
      sub: "Python tooling that turns hours of repetitive Excel reporting into a one-click job.",
      tags: ["Python", "Pandas", "OpenPyXL", "Automation"],
      secs: [
        { h: "The Problem", p: "Monthly reports were assembled by hand from several raw Excel exports — hours of copy-paste, re-formatting and formula fixing every cycle, with plenty of room for human error." },
        { h: "What I Built", p: "A Python pipeline that ingests the raw exports and produces the finished report automatically.", list: ["Data ingestion, cleaning and validation with pandas", "KPI computation and cross-sheet reconciliation", "Formatted Excel output with charts via OpenPyXL", "One-click run with a simple log of every step"] },
        { h: "Outcome", p: "Reporting that used to take hours now takes minutes, with consistent formatting and far fewer errors." }
      ],
      mets: [["80%", "Less manual work"], ["Minutes", "Instead of hours"], ["1-click", "Fully automated run"]]
    },
    sales: {
      img: "images/project-sales.svg", title: "Sales Data Analysis",
      sub: "Exploratory analysis and visualization that turned raw sales records into decisions.",
      tags: ["Python", "Pandas", "Seaborn", "Jupyter", "Matplotlib"],
      secs: [
        { h: "The Problem", p: "Sales data lived across periods and product lines with no consolidated view — leadership couldn't see trends, seasonality or which categories actually drove growth." },
        { h: "What I Built", p: "A complete exploratory data analysis in Jupyter notebooks.", list: ["Data cleaning, deduplication and feature preparation with pandas", "Trend, seasonality and product-mix analysis", "Visualization dashboards with seaborn and matplotlib", "Repeat-purchase and customer-cohort views"] },
        { h: "Outcome", p: "The analysis surfaced top growth categories, slow movers and seasonal patterns — feeding directly into purchasing and promotion planning." }
      ],
      mets: [["Seasonality", "& trends uncovered"], ["Cohorts", "Repeat-purchase insight"], ["Clear", "Dashboards for decisions"]]
    },
    retail: {
      title: "Retail Distribution ERP Rollout",
      sub: "End-to-end Odoo implementation for a retail distribution company.",
      tags: ["ERP Implementation", "Supply Chain", "Odoo", "Training"],
      secs: [
        { h: "The Mission", p: "A retail distributor needed their whole operation — inventory, sales, warehousing — moved onto one system without stopping the business." },
        { h: "What I Did", list: ["Requirement workshops with every department", "Inventory and sales configuration, warehouse workflow mapping", "Carefully staged go-live with zero operational downtime", "Trained 40+ staff with hands-on sessions and documentation", "Post-go-live support through the critical first quarter"] },
        { h: "Outcome", p: "Operations ran smoothly through the first quarter after go-live — one system, one source of truth, a confident team." }
      ],
      mets: [["40+", "Staff trained"], ["0", "Downtime at go-live"], ["1", "Unified system"]]
    },
    finance: {
      title: "Finance Module Configuration",
      sub: "Finance configuration for an import-export firm, aligned with Ethiopian accounting practice.",
      tags: ["ERP", "Finance", "Configuration", "Reporting"],
      secs: [
        { h: "The Mission", p: "Month-end closing was slow, and management had no real-time view of cash flow." },
        { h: "What I Did", list: ["Configured chart of accounts, invoicing, payments and journals", "Aligned month-end close procedures with Ethiopian accounting practice", "Built real-time cash-flow visibility for management"] },
        { h: "Outcome", p: "The reconfiguration cut month-end closing time almost in half." }
      ],
      mets: [["~50%", "Faster month-end close"], ["Real-time", "Cash-flow visibility"], ["ET", "Accounting-aligned"]]
    },
    migration: {
      title: "Data Migration & Integrations",
      sub: "Legacy data migrated into Odoo + third-party and payment-gateway integrations.",
      tags: ["Integration", "Data Migration", "APIs", "Validation"],
      secs: [
        { h: "The Mission", p: "Years of legacy data had to move into Odoo without losing integrity — and the system had to talk to third-party tools and payment gateways." },
        { h: "What I Did", list: ["Data extraction, cleaning and mapping from legacy systems", "Validation scripts ensuring data integrity through the transition", "Third-party system and payment-gateway integrations", "Testing and post-deployment performance optimization"] },
        { h: "Outcome", p: "A smooth cut-over with data integrity intact and systems working as one." }
      ],
      mets: [["100%", "Data integrity kept"], ["APIs", "Gateways integrated"], ["Smooth", "Cut-over & go-live"]]
    }
  };

  var SERVICES = {
    ba: {
      title: "Business Analysis", sub: "Turning business needs into clear, buildable solutions.",
      tags: ["Requirement Analysis", "Process Mapping", "Documentation", "UAT"],
      secs: [
        { h: "What This Covers", list: ["Requirement-gathering workshops with every stakeholder", "Business process mapping and gap analysis", "Functional specifications and clear documentation", "User-acceptance testing and sign-off support"] },
        { h: "How I Work", p: "I start from how your business actually runs — not from what the software assumes. The result is a solution design everyone understands before a single line is configured or written." }
      ]
    },
    erp: {
      title: "ERP & Odoo", sub: "5+ years implementing, customizing and extending Odoo.",
      tags: ["Odoo Community & Enterprise", "Odoo Studio", "Custom Modules", "Data Migration", "Training"],
      secs: [
        { h: "What This Covers", list: ["End-to-end implementation of finance, supply chain and HR modules", "Configuration and customization with Odoo Studio and custom modules", "Data migration and third-party system integration", "User training and post-go-live support", "Custom module development — published on the Odoo App Store"] },
        { h: "Track Record", p: "I've delivered Odoo for distribution, import-export and service organizations across Ethiopia — from first workshop to long after go-live." }
      ]
    },
    soft: {
      title: "Software & Automation", sub: "Python tools that quietly remove repetitive work.",
      tags: ["Python", "Pandas", "OpenPyXL", "APIs", "Scheduled Jobs"],
      secs: [
        { h: "What This Covers", list: ["Custom Python tools and internal utilities", "Excel and report automation (pandas + OpenPyXL)", "API integrations between business systems", "Scheduled jobs, monitoring and alerting"] },
        { h: "Philosophy", p: "If a person does it the same way every week, a script should be doing it. Automation pays for itself the first month it runs." }
      ]
    },
    data: {
      title: "Data & Intelligence", sub: "From raw data to decisions — and towards ML & AI.",
      tags: ["Pandas", "Seaborn", "Matplotlib", "Jupyter", "IBM Data Science"],
      secs: [
        { h: "What This Covers", list: ["Data cleaning, exploration and validation", "Visualization and dashboard-style reporting", "Sales, operations and finance analysis", "Exploring machine-learning and AI use cases"] },
        { h: "Foundation", p: "Backed by IBM's Applied Data Science specialization and capstone, I bring a rigorous, honest approach to what data can — and can't — tell you." }
      ]
    },
    notes: {
      title: "Notes & Essays", sub: "Questions I keep coming back to outside of client work.",
      tags: ["Mathematics", "Physics", "Psychology", "Philosophy", "Intelligence"],
      secs: [
        { h: "Why I Write", p: "The same curiosity that makes me dig into a broken business process pushes me into books and questions far outside technology: how mathematics describes reality, what physics says about the universe, how minds work, and what intelligence even is." },
        { h: "Coming Soon", p: "I'm preparing a collection of short essays and study notes on these topics — written the way I wish more things were written: clearly, honestly, and from first principles. Check back soon." }
      ]
    }
  };
  Object.keys(SERVICES).forEach(function (k) { CASES["svc-" + k] = SERVICES[k]; });

  /* ---------------- Modal ---------------- */
  var ov = $("#modal-ov"), mContent = $("#modal-content"), lastFocus = null;
  function renderModal(d) {
    var h = "";
    if (d.img) h += '<img class="m-thumb" src="' + d.img + '" alt="">';
    h += '<div class="m-body"><h2>' + d.title + "</h2><p class='m-sub'>" + d.sub + "</p>";
    if (d.tags) h += '<div class="b-tags" style="margin-bottom:6px">' + d.tags.map(function (t) { return '<span class="b-tag">' + t + "</span>"; }).join("") + "</div>";
    (d.secs || []).forEach(function (s) {
      h += '<div class="m-sec"><h5>' + s.h + "</h5>";
      if (s.p) h += "<p>" + s.p + "</p>";
      if (s.list) h += '<ul class="m-list">' + s.list.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul>";
      h += "</div>";
    });
    if (d.mets) h += '<div class="m-sec"><h5>Key Results</h5><div class="m-metrics">' +
      d.mets.map(function (m) { return '<div class="m-metric"><b>' + m[0] + "</b><span>" + m[1] + "</span></div>"; }).join("") + "</div></div>";
    var ctas = "";
    if (d.link) ctas += '<a class="btn btn-primary m-cta" href="' + d.link[1] + '" target="_blank" rel="noopener">' + d.link[0] +
      ' <svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="8 7 17 7 17 16"/></svg></a>';
    if (d.repo) ctas += '<a class="btn btn-ghost m-cta" href="' + d.repo[1] + '" target="_blank" rel="noopener">' +
      '<svg class="arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg> ' +
      d.repo[0] + '</a>';
    if (ctas) h += '<div class="m-ctas">' + ctas + "</div>";
    return h + "</div>";
  }
  function openModal(key) {
    var d = CASES[key]; if (!d) return;
    lastFocus = document.activeElement;
    mContent.html(renderModal(d));
    ov.addClass("open"); body.classList.add("locked");
    ov.find(".modal").scrollTop(0);
    $("#modal-close").trigger("focus");
  }
  function closeModal() {
    if (!ov.hasClass("open")) return;
    ov.removeClass("open"); body.classList.remove("locked");
    if (lastFocus) $(lastFocus).trigger("focus");
  }
  window.NFopen = openModal;
  $doc.on("click", "[data-modal]", function () { openModal($(this).data("modal")); });
  $doc.on("keydown", "[data-modal]", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal($(this).data("modal")); }
  });
  $("#modal-close").on("click", closeModal);
  ov.on("click", function (e) { if (e.target === this) closeModal(); });
  $doc.on("keydown", function (e) { if (e.key === "Escape") { closeModal(); if (mMenu.hasClass("open")) setMenu(false); } });

  /* ---------------- Contact form ---------------- */
  var form = $("#contact-form");
  function markErr(id, bad) { $("#fg-" + id).toggleClass("err", bad); return !bad; }
  form.on("submit", function (e) {
    e.preventDefault();
    var name = $.trim($("#cf-name").val()), email = $.trim($("#cf-email").val()),
        subj = $.trim($("#cf-subject").val()), msg = $.trim($("#cf-msg").val());
    var ok = markErr("name", !name);
    ok = markErr("email", !/^\S+@\S+\.\S+$/.test(email)) && ok;
    ok = markErr("msg", msg.length < 10) && ok;
    var alert = $("#form-alert");
    alert.removeClass("show ok bad");
    if (!ok) { alert.addClass("show bad").find("span").text("Please fix the highlighted fields and try again."); return; }

    var btn = form.find("button[type=submit]");
    btn.prop("disabled", true).css({ opacity: 0.65, pointerEvents: "none" });
    function enable() { btn.prop("disabled", false).css({ opacity: "", pointerEvents: "" }); }

    function mailtoFallback() {
      var mailto = "mailto:negafika17@gmail.com?subject=" +
        encodeURIComponent(subj || ("Portfolio inquiry from " + name)) +
        "&body=" + encodeURIComponent("Hi Negaye,\n\n" + msg + "\n\n— " + name + " (" + email + ")");
      alert.addClass("show ok").find("span").text("Opening your email app — your message is pre-filled and ready to send.");
      window.location.href = mailto;
      form[0].reset(); enable();
    }

    fetch("api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, email: email, subject: subj, message: msg, website: $("#cf-website").val() || "" })
    })
      .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
      .then(function (res) {
        if (res && res.ok) {
          alert.addClass("show ok").find("span").text("Message sent — thank you! I'll get back to you within a day.");
          form[0].reset(); enable();
        } else {
          mailtoFallback();
        }
      })
      .catch(mailtoFallback);
  });
  form.find("input,textarea").on("input", function () { $(this).closest(".f-group").removeClass("err"); });

  /* ---------------- Footer year ---------------- */
  $("#year").text(new Date().getFullYear());

})(jQuery);
