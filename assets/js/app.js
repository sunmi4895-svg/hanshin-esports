/* ============================================================================
 * app.js — 화면을 그리는 코드
 * data.js 의 내용을 읽어 각 페이지를 만들어 냅니다. 수정하지 않으셔도 됩니다.
 *
 * 동작 방식
 *   각 HTML 파일의 <body data-page="..."> 값을 보고 그 페이지에 필요한
 *   내용만 골라 그립니다. 상단바와 푸터는 모든 페이지에 공통으로 삽입되므로
 *   메뉴를 고치실 때는 data.js 의 NAV 만 수정하시면 됩니다.
 * ========================================================================== */

if (typeof SITE === "undefined") {
  document.body.innerHTML =
    '<pre style="padding:40px;font:15px/1.7 monospace">' +
    'data.js 를 불러오지 못했습니다.\n\n' +
    '확인해 주세요\n' +
    '  1. assets/js/data.js 파일이 있는지\n' +
    '  2. data.js 안에 쉼표나 중괄호를 빠뜨리지 않았는지 (F12 > Console 확인)' +
    '</pre>';
  throw new Error("data.js not loaded");
}

(function () {
  const $  = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ymd = d => d.slice(0, 7).replace("-", ".");
  const dot = d => d.replace(/-/g, ".");
  const isNew = d => (Date.now() - new Date(d + "T00:00:00").getTime()) < 30 * 864e5;

  const page = document.body.dataset.page || "home";

  /* ======================================================================
     공통 — 상단바 / 푸터
     ====================================================================== */
  function currentFile() {
    const f = location.pathname.split("/").pop();
    return (!f || f === "") ? "index.html" : f;
  }

  function navChild(c) {
    return '<a href="' + esc(c.href) + '">' + esc(c.label) + '</a>';
  }

  function renderHeader() {
    const el = $("#siteHeader");
    if (!el) return;
    const here = currentFile();

    el.innerHTML =
      '<div class="topbar-in">' +
        '<a class="brand" href="index.html" aria-label="' + esc(SITE.univ) + ' 홈">' +
          (SITE.logo
            ? '<img class="brand-logo' + (SITE.logoInvert ? ' brand-logo--invert' : '') +
              '" src="' + esc(SITE.logo) + '" alt="' + esc(SITE.univ) + ' 로고">'
            : '<span class="brand-mark">' + esc(SITE.mark) + '</span>') +
        '</a>' +
        '<button class="navtoggle" id="navToggle" aria-expanded="false" aria-controls="nav">메뉴</button>' +
        '<nav class="nav" id="nav" aria-label="주요 메뉴">' +
          NAV.map(n => {
            /* 하위 항목의 페이지에 있어도 상위 메뉴가 켜집니다 */
            const on = n.href.split("#")[0] === here ||
                       (n.children || []).some(c => c.href.split("#")[0] === here);
            return '<a href="' + esc(n.href) + '"' + (on ? ' class="on" aria-current="page"' : '') + '>' +
                   '<span class="nav-label">' + esc(n.label) + '</span>' +
                   (n.english ? '<span class="nav-english">(' + esc(n.english) + ')</span>' : '') + '</a>' +
                   (n.children
                     ? '<div class="nav-sub">' +
                         n.children.map(navChild).join("") +
                       '</div>'
                     : '');
          }).join("") +
        '</nav>' +
      '</div>' +
      '<div class="mega" id="mega" hidden><div class="mega-in" id="megaIn">' +
        NAV.map(n =>
          '<div class="mega-col">' +
            (n.children || []).map(navChild).join("") +
          '</div>').join("") +
      '</div></div>';

    /* 로고 파일이 없으면 글자 마크로 조용히 바꿔 줍니다 */
    const logo = $(".brand-logo");
    if (logo) logo.addEventListener("error", () => {
      const span = document.createElement("span");
      span.className = "brand-mark";
      span.textContent = SITE.mark;
      logo.replaceWith(span);
    });

    const btn = $("#navToggle"), nav = $("#nav");
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
    });
    nav.addEventListener("click", e => {
      if (e.target.closest("a")) { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
    });

    el.addEventListener("click", e => {
      if (e.target.closest('#mega a')) {
        $("#mega").hidden = true;
        el.classList.remove("is-open");
      }
    });
    initMega();
  }

  /* 전체 폭 메뉴판 — 각 열을 해당 메뉴의 폭과 위치에 정확히 맞춥니다 */
  function initMega() {
    const bar = $("#siteHeader"), mega = $("#mega"), inner = $("#megaIn");
    if (!bar || !mega || !inner) return;

    const links = $$("#nav > a");
    const cols  = $$(".mega-col", inner);

    function place() {
      const base = inner.getBoundingClientRect().left;
      links.forEach((a, i) => {
        if (!cols[i]) return;
        const r = a.getBoundingClientRect();
        cols[i].style.left  = Math.round(r.left - base) + "px";
        cols[i].style.width = Math.round(r.width) + "px";
      });
    }

    /* 마우스를 올린 메뉴의 열을 밝게 */
    function hot(i) {
      cols.forEach((c, k) => c.classList.toggle("is-hot", k === i));
      links.forEach((a, k) => a.classList.toggle("is-hot", k === i));
    }
    links.forEach((a, i) => {
      a.addEventListener("mouseenter", () => hot(i));
      a.addEventListener("focus", () => hot(i));
    });
    cols.forEach((c, i) => c.addEventListener("mouseenter", () => hot(i)));

    let timer;
    function open() {
      if (window.innerWidth <= 1180) return;
      clearTimeout(timer);
      mega.hidden = false;
      place();
      bar.classList.add("is-open");
    }
    function close() {
      timer = setTimeout(() => {
        mega.hidden = true;
        bar.classList.remove("is-open");
        hot(-1);
      }, 120);
    }

    bar.addEventListener("mouseenter", open);
    bar.addEventListener("mouseleave", close);
    bar.addEventListener("focusin", open);
    bar.addEventListener("focusout", e => { if (!bar.contains(e.relatedTarget)) close(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") { mega.hidden = true; bar.classList.remove("is-open"); hot(-1); }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 1180) {
        mega.hidden = true;
        bar.classList.remove("is-open");
        hot(-1);
      } else {
        $("#nav").classList.remove("open");
        $("#navToggle").setAttribute("aria-expanded", "false");
        if (!mega.hidden) place();
      }
    });
  }

  /* 같은 폭의 두 묶음을 이어 붙여 끊김 없이 흐르는 홈 후원기관 띠 */
  function partnerStrip() {
    if (typeof PARTNERS === "undefined" || !PARTNERS.length) return "";
    let list = PARTNERS.slice();
    while (list.length < 6) list = list.concat(PARTNERS);

    function row(copy) {
      return list.map((p, i) => {
        const repeated = copy || i >= PARTNERS.length;
        const attrs = repeated ? ' data-tick-copy aria-hidden="true"' : '';
        const inside = p.logo
          ? '<img src="' + esc(p.logo) + '" alt="' + esc(p.name) + '" loading="lazy">'
          : '<span>' + esc(p.name) + '</span>';
        return p.url
          ? '<a class="tick-item"' + attrs + (repeated ? ' tabindex="-1"' : '') +
            ' href="' + esc(p.url) + '" target="_blank" rel="noopener">' + inside + '</a>'
          : '<span class="tick-item"' + attrs + '>' + inside + '</span>';
      }).join("");
    }

    const label = typeof PARTNERS_LABEL !== "undefined" && PARTNERS_LABEL ? PARTNERS_LABEL : "후원기관";
    return '<section class="ticker" id="homePartners" aria-labelledby="partnerHeading">' +
      '<div class="wrap tick-heading"><h2 class="tick-label" id="partnerHeading">' + esc(label) + '</h2>' +
        '</div>' +
      '<div class="tick-view"><div class="tick-track">' +
        '<div class="tick-group">' + row(false) + '</div>' +
        '<div class="tick-group tick-duplicate" aria-hidden="true">' + row(true) + '</div>' +
      '</div></div>' +
    '</section>';
  }

  function renderFooter() {
    const el = $("#siteFooter");
    if (!el) return;
    el.innerHTML =
      '<div class="wrap footer-identity">' +
        '<img class="footer-logo' + (SITE.logoInvert ? ' brand-logo--invert' : '') +
          '" src="' + esc(SITE.logo) + '" alt="' + esc(SITE.univ) + ' 로고">' +
        '<p class="footer-address">주소(18101): ' + esc(SITE.address) + '</p>' +
      '</div>';

    if (page === "home" && !$("#homePartners")) {
      el.insertAdjacentHTML("beforebegin", partnerStrip());
      const strip = $("#homePartners");
      if (strip) {
        $$(".tick-item img", strip).forEach(img => img.addEventListener("error", () => {
          const text = document.createElement("span");
          text.textContent = img.alt;
          img.replaceWith(text);
        }));
      }
    }
  }

  /* 하위 페이지 공통 머리말 */
  function renderPageHead() {
    const el = $("#pageHead");
    const info = PAGES[page];
    if (!el || !info) return;
    if (page === "seminar") {
      el.innerHTML = '<div class="wrap"><h1 class="page-title">E.C.Seminar</h1>' +
        '<p class="seminar-ko">e스포츠 정기학술세미나</p>' +
        '<p class="seminar-en"><strong>E</strong>sports <strong>C</strong>onvergence <strong>S</strong>eminar</p></div>';
      document.title = "E.C.Seminar · " + SITE.univ;
      return;
    }
    el.innerHTML =
      '<div class="wrap">' +
        (page === "members" ? "" : '<p class="eyebrow">' + esc(info.eyebrow) + '</p>') +
        '<h1 class="page-title">' + esc(info.title) + '</h1>' +
        (page === "members" ? "" : '<p class="page-desc">' + esc(info.desc) + '</p>') +
      '</div>';
    document.title = info.title + " · " + SITE.name;
  }

  /* 사진 또는 이름 첫 글자 타일 */
  const pic = (p, n) => p
    ? '<img class="photo" src="' + esc(p) + '" alt="' + esc(n) + '" loading="lazy">'
    : '<div class="photo-ph" aria-hidden="true">' + esc(n.slice(0, 1)) + '</div>';

  /* ======================================================================
     홈 — 감성 문구 + 소개글 + 공지사항
     ====================================================================== */
  function renderHome() {
    document.title = SITE.name + " · " + SITE.univ;

    /* 큰 문구를 줄 단위로 나눠 순서대로 등장시킵니다 */
    const lines = esc(INTRO.headline).split("\n");
    const headline = lines
      .map((t, i) => '<span class="line" style="animation-delay:' + (0.18 + i * 0.13).toFixed(2) + 's">' + t + '</span>')
      .join("");
    const subDelay = (0.18 + lines.length * 0.13 + 0.1).toFixed(2);

    $("#homeHero").innerHTML =
      '<div class="wrap">' +
        '<h1 class="home-headline">' + headline + '</h1>' +
        '<p class="home-sub" style="animation-delay:' + subDelay + 's">' + esc(INTRO.sub) + '</p>' +
        '<div class="hero-controls" aria-label="메인 사진 넘기기">' +
          '<button class="hero-control" type="button" data-hero-direction="prev" aria-label="이전 사진">‹</button>' +
          '<button class="hero-control" type="button" data-hero-direction="next" aria-label="다음 사진">›</button>' +
        '</div>' +
      '</div>';

    /* 대표 사진이 있으면 큰 문구 뒤에 깔아 줍니다 */
    if (SITE.heroImage || SITE.heroImages?.length) {
      const hero = $("#homeHero");
      hero.classList.add("home-hero--photo");
      const sources = SITE.heroImages?.length ? SITE.heroImages : [SITE.heroImage];
      const slides = document.createElement("div");
      slides.className = "hero-slides";
      slides.setAttribute("aria-hidden", "true");
      const images = sources.map((src, i) => {
        const img = document.createElement("img");
        img.className = "hero-slide";
        img.alt = "";
        img.decoding = "async";
        if (i === 0) img.fetchPriority = "high";
        img.src = src;
        slides.append(img);
        return img;
      });
      hero.prepend(slides);
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      let current = -1;
      let timer;
      const interval = SITE.heroInterval || 5000;
      function show(index) {
        index = (index + images.length) % images.length;
        if (current >= 0) images[current].classList.remove("is-active");
        current = index;
        const img = images[index];
        img.classList.add("is-active");
        img.getAnimations().filter(a => a.effect?.getKeyframes().some(k => k.transform)).forEach(a => a.cancel());
        if (!motion.matches) img.animate(
          [{ transform: "scale(1.06)" }, { transform: "scale(1)" }],
          { duration: interval + 900, easing: "ease-out", fill: "forwards" }
        );
      }
      hero.querySelectorAll("[data-hero-direction]").forEach(button => {
        button.addEventListener("click", () => {
          if (images.length < 2) return;
          const direction = button.dataset.heroDirection === "next" ? 1 : -1;
          show(current + direction);
          schedule();
        });
      });
      function schedule() {
        clearInterval(timer);
        if (motion.matches || document.hidden || images.length < 2) return;
        timer = setInterval(() => {
          for (let step = 1; step < images.length; step++) {
            const next = (current + step) % images.length;
            if (images[next].complete && images[next].naturalWidth) { show(next); break; }
          }
        }, interval);
      }
      show(0);
      images.forEach((img, i) => img.addEventListener("load", () => {
        if (!images[current].naturalWidth) show(i);
      }));
      schedule();
      document.addEventListener("visibilitychange", schedule);
      motion.addEventListener("change", () => {
        if (motion.matches) images.forEach(img => img.getAnimations().forEach(a => a.cancel()));
        schedule();
      });
      hero.style.setProperty("--dim", SITE.heroDim != null ? SITE.heroDim : 0.9);
      if (SITE.heroCaption) {
        hero.insertAdjacentHTML("beforeend",
          '<span class="hero-credit">' + esc(SITE.heroCaption) + '</span>');
      }
    }

    const intro = $("#homeIntro");
    if (intro) intro.innerHTML =
      '<div class="wrap intro-grid">' +
        '<p class="intro-label">연구실 소개</p>' +
        '<div class="intro-body">' +
          INTRO.paragraphs.map(p => '<p class="reveal">' + esc(p) + '</p>').join("") +
          '<a class="btn btn--ghost" href="members.html">구성원 보기 &rarr;</a>' +
        '</div>' +
      '</div>';

    const areas = $("#homeAreas");
    if (areas && typeof AREAS !== "undefined" && AREAS.length) {
      areas.innerHTML = AREAS.map((a, i) =>
        '<article class="area reveal">' +
          '<span class="area-no">' + String(i + 1).padStart(2, "0") + '</span>' +
          '<h2 class="area-ko">' + esc(a.ko) + '</h2>' +
          '<p class="area-en">' + esc(a.en) + '</p>' +
          '<p class="area-d">' + esc(a.desc) + '</p>' +
        '</article>').join("");
    }

    renderNotices();
    renderSeminars();
  }

  function renderNotices() {
    const box = $("#noticeList");
    if (!box) return;

    const rows = [...NOTICES].sort((a, b) =>
      (b.pinned === true) - (a.pinned === true) || b.date.localeCompare(a.date));

    const SHOW = 4;
    let expanded = false;

    function draw() {
      const list = expanded ? rows : rows.slice(0, SHOW);
      box.innerHTML = rows.length
        ? list.map(n => {
            const inner =
              '<span class="nt-head">' +
                '<span class="nt-tag">' + esc(n.tag) + '</span>' +
                (n.pinned ? '<span class="nt-pin">고정</span>' : '') +
                (isNew(n.date) ? '<span class="nt-new">NEW</span>' : '') +
              '</span>' +
              '<span class="nt-title">' + esc(n.title) + '</span>' +
              '<time class="nt-date" datetime="' + esc(n.date) + '">' + esc(dot(n.date)) + '</time>' +
              (n.desc ? '<span class="nt-desc">' + esc(n.desc) + '</span>' : '');
            return n.url
              ? '<a class="nt reveal" href="' + esc(n.url) + '" target="_blank" rel="noopener">' + inner + '</a>'
              : '<div class="nt reveal">' + inner + '</div>';
          }).join("")
        : '<p class="empty">등록된 공지가 없습니다.</p>';
      observe();
    }
    draw();

    const more = $("#noticeMore");
    if (more && rows.length > SHOW) {
      more.hidden = false;
      more.textContent = "지난 공지 더 보기 (" + (rows.length - SHOW) + ")";
      more.addEventListener("click", () => {
        expanded = !expanded;
        more.setAttribute("aria-expanded", String(expanded));
        more.textContent = expanded ? "접기" : "지난 공지 더 보기 (" + (rows.length - SHOW) + ")";
        draw();
      });
    }
  }

  /* 세미나 — 예정은 가까운 날짜 순으로 위에, 완료는 최신순으로 아래에 */
  function renderSeminars() {
    const terms = $("#termList");
    if (terms) {
      terms.innerHTML = '<h2 class="seminar-board-title">학술세미나 일정</h2><div class="semester-board">' + SEMINARS.map(term =>
        '<details class="semester-entry"><summary><span class="semester-label">' + esc(term.term.replace(/^20/, "").replace("학기", "")) +
          '</span><span class="semester-title">학술세미나 일정</span><span class="semester-open" aria-hidden="true">+</span></summary>' +
          '<div class="semester-content">' + (term.note ? '<p>' + esc(term.note) + '</p>' : '') +
          (term.items.length ? '<ul class="semester-schedule">' + term.items.map(item =>
            '<li><time datetime="' + esc(item.date) + '">' + esc(item.date) + '</time><div><strong>' + esc(item.topic) +
            '</strong><p>발표자: ' + esc(item.speaker) + ' · ' + esc(item.status) + '</p></div></li>').join('') + '</ul>'
            : '<p class="semester-empty">등록된 일정이 없습니다.</p>') + '</div></details>').join('') + '</div>';
      return;
    }

    const box = $("#seminarList");
    if (!box || typeof SEMINARS === "undefined") return;

    const soon = SEMINARS.filter(x => x.status !== "완료").sort((a, b) => a.date.localeCompare(b.date));
    const done = SEMINARS.filter(x => x.status === "완료").sort((a, b) => b.date.localeCompare(a.date));
    const rows = [...soon, ...done];

    box.innerHTML = rows.length ? rows.map(x => {
      const isDone = x.status === "완료";
      return '<div class="sem reveal' + (isDone ? ' sem--done' : '') + '">' +
        '<span class="sem-round">' + esc(x.round) + '회</span>' +
        '<span class="sem-date">' + esc(dot(x.date)) + '</span>' +
        '<span class="sem-topic">' + esc(x.topic) + '</span>' +
        '<span class="sem-speaker">' + esc(x.speaker) + '</span>' +
        '<span class="sem-status' + (isDone ? '' : ' sem-status--soon') + '">' + esc(x.status) + '</span>' +
      '</div>';
    }).join("") : '<p class="empty">예정된 세미나가 없습니다.</p>';

    const note = $("#seminarNote");
    if (note && typeof SEMINAR_NOTE !== "undefined") note.textContent = SEMINAR_NOTE;
    observe();
  }

  /* ======================================================================
     역사·연혁
     ====================================================================== */
  function renderHistory() {
    const intro = $("#homeIntro");
    if (intro) {
      const welcome = GRADUATE_WELCOME;
      intro.innerHTML = '<div class="wrap graduate-welcome">' +
        '<div class="graduate-welcome-copy"><p class="welcome-label">대학원소개</p>' +
          '<h2>한신대학교 일반대학원<br>e스포츠융합(협)</h2>' +
          (welcome.paragraphs.length
            ? '<div class="welcome-prose">' + welcome.paragraphs.map(p => '<p>' + esc(p) + '</p>').join('') + '</div>'
            : '<div class="welcome-copy-placeholder"><p>대학원 소개 글 준비 중입니다.</p><p>최은경 교수님의 소개 글이 이곳에 들어갈 예정입니다.</p></div>') +
        '</div><figure class="graduate-welcome-photo">' +
          (welcome.photo ? '<img src="' + esc(welcome.photo) + '" alt="최은경 교수님">'
            : '<div class="welcome-photo-placeholder"><span>최은경 교수님</span><span>사진 준비 중</span></div>') +
          '<figcaption class="welcome-caption"><p>e스포츠 융합(협)</p>' +
            '<div class="welcome-sign-row"><span>주임교수 <strong>최은경</strong></span>' +
              (welcome.signature ? '<img class="welcome-sign-image" src="' + esc(welcome.signature) + '" alt="최은경 교수님 서명">'
                : '<span class="welcome-sign-placeholder">사인 이미지 준비 중</span>') +
            '</div></figcaption>' +
        '</figure></div>';
    }
    const address = $("#directionsAddress");
    if (address) address.textContent = "주소(18101): " + SITE.address;

    $("#historyRail").innerHTML = HISTORY.map((h, i) =>
      '<div class="rail-item reveal' + (i === 0 ? ' is-first' : '') + '">' +
        '<div class="rail-y">' + esc(h.year) + '</div>' +
        '<h3 class="rail-t">' + esc(h.title) + '</h3>' +
        '<p class="rail-d">' + esc(h.desc) + '</p>' +
      '</div>').join("");

    /* 사진 + 설명 블록 */
    const box = $("#programList");
    if (!box || typeof PROGRAMS === "undefined") return;
    box.innerHTML = PROGRAMS.map(p =>
      '<article class="pgm reveal' + (p.image ? '' : ' pgm--notext') + '">' +
        (p.image
          ? '<div class="pgm-photo"><img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy"></div>'
          : '') +
        '<div class="pgm-body">' +
          (p.tag ? '<span class="pgm-tag">' + esc(p.tag) + '</span>' : '') +
          '<h3 class="pgm-title">' + esc(p.title) + '</h3>' +
          '<p class="pgm-desc">' + esc(p.desc) + '</p>' +
        '</div>' +
      '</article>').join("");
  }

  /* ======================================================================
     학술 활동
     ====================================================================== */
  function renderResearch() {
    const years = {};
    PUBLICATIONS.forEach(p => years[p.year] = (years[p.year] || 0) + 1);
    const ys = Object.keys(years).sort((a, b) => b.localeCompare(a)).slice(0, 6);
    const max = Math.max(1, ...ys.map(y => years[y]));
    $("#barChart").innerHTML = ys.map(y =>
      '<div class="bar-row"><span class="bar-y">' + y + '</span>' +
      '<span class="bar-track"><span class="bar-fill" data-w="' + Math.round(years[y] / max * 100) + '"></span></span>' +
      '<span class="bar-n">' + years[y] + '</span></div>').join("");

    const TYPE_BY_HASH = { conference:"학회 발표", journal:"학술지 등재", award:"수상" };
    let pType = TYPE_BY_HASH[location.hash.replace("#", "")] || "all";
    const pubYears = [...new Set(PUBLICATIONS.map(p => p.year))].sort((a, b) => b.localeCompare(a));
    $("#pubYear").innerHTML = '<option value="all">모든 연도</option>' + pubYears.map(y => '<option>' + y + '</option>').join("");

    function draw() {
      const y = $("#pubYear").value;
      const q = $("#pubSearch").value.trim().toLowerCase();
      const rows = PUBLICATIONS
        .filter(p => (pType === "all" || p.type === pType) && (y === "all" || p.year === y) &&
                     (!q || (p.title + p.venue + p.authors).toLowerCase().includes(q)))
        .sort((a, b) => b.year.localeCompare(a.year));

      $("#pubCount").textContent = "총 " + rows.length + "건";
      $("#pubList").innerHTML = rows.length ? rows.map(p => {
        const cls = p.type === "수상" ? "badge badge--award" : p.type === "학술지 등재" ? "badge badge--journal" : "badge";
        return '<article class="rec reveal">' +
          '<div class="rec-y">' + esc(p.year) + '</div>' +
          '<div><h3 class="rec-t">' + esc(p.title) + '</h3>' +
          '<p class="rec-m"><b>' + esc(p.authors) + '</b> &middot; ' + esc(p.venue) + (p.pages ? ' &middot; ' + esc(p.pages) : '') + '</p>' +
          '<div class="badges"><span class="' + cls + '">' + esc(p.type) + '</span>' +
          (p.award ? '<span class="badge badge--award">' + esc(p.award) + '</span>' : '') + '</div></div></article>';
      }).join("") : '<p class="empty">조건에 맞는 기록이 없습니다. 필터를 바꿔 보세요.</p>';
      observe();
    }

    $$('[data-ptype]').forEach(b => {
      b.classList.toggle("on", b.dataset.ptype === pType);
      b.addEventListener("click", () => {
        $$('[data-ptype]').forEach(x => x.classList.remove("on"));
        b.classList.add("on"); pType = b.dataset.ptype;
        history.replaceState(null, "", location.pathname); draw();
      });
    });
    $("#pubYear").addEventListener("change", draw);
    $("#pubSearch").addEventListener("input", draw);
    draw();
    setTimeout(() => $$(".bar-fill").forEach(b => b.style.width = b.dataset.w + "%"), 350);
  }

  /* ======================================================================
     대외 활동
     ====================================================================== */
  function renderOutreach() {
    const GROUPS = {
      news:     { data: NEWS,     subs: ["전체", "학교", "플레이브릿지"] },
      campus:   { data: CAMPUS,   subs: ["전체", "ECS", "베리어프리", "총장배", "기타"] },
      external: { data: EXTERNAL, subs: ["전체", "학회", "장애인 e스포츠", "현장 답사", "MT", "기타"] }
    };
    let gKey = "news", sKey = "전체";

    function drawSubs() {
      $("#subTabs").innerHTML = GROUPS[gKey].subs.map(s =>
        '<button class="chip' + (s === sKey ? ' on' : '') + '" data-sub="' + esc(s) + '">' + esc(s) + '</button>').join("");
      $$('[data-sub]').forEach(b => b.addEventListener("click", () => { sKey = b.dataset.sub; drawSubs(); drawActs(); }));
    }

    function drawActs() {
      const rows = GROUPS[gKey].data
        .filter(a => sKey === "전체" || a.sub === sKey)
        .sort((a, b) => b.date.localeCompare(a.date));
      $("#actCount").textContent = "총 " + rows.length + "건";
      $("#actList").innerHTML = rows.length ? rows.map(a =>
        '<article class="card reveal">' +
          (a.image ? '<img class="card-img" src="' + esc(a.image) + '" alt="' + esc(a.title) + '" loading="lazy">' : '') +
          '<div class="card-top"><span class="card-date">' + esc(ymd(a.date)) + '</span>' +
          '<span class="card-tag">' + esc(a.sub) + '</span></div>' +
          '<h3>' + esc(a.title) + '</h3><p>' + esc(a.desc) + '</p>' +
          (a.url ? '<a class="more" href="' + esc(a.url) + '" target="_blank" rel="noopener">자세히 보기 &rarr;</a>' : '') +
        '</article>').join("") : '<p class="empty">아직 등록된 활동이 없습니다.</p>';
      observe();
    }

    $$('[data-group]').forEach(b => b.addEventListener("click", () => {
      $$('[data-group]').forEach(x => x.setAttribute("aria-selected", "false"));
      b.setAttribute("aria-selected", "true");
      gKey = b.dataset.group; sKey = "전체"; drawSubs(); drawActs();
    }));
    drawSubs(); drawActs();
  }

  /* ======================================================================
     구성원
     ====================================================================== */
  function facultySubjects(person) {
    return '<div class="faculty-subjects"><strong>담당과목</strong>' +
      (person.subjects?.length ? '<ul>' + person.subjects.map(subject => '<li>' + esc(subject) + '</li>').join('') + '</ul>'
        : '<div class="faculty-subjects-blank" aria-label="담당과목 미등록"></div>') + '</div>';
  }

  function renderMembers() {
    /* 졸업생 항목을 아직 안 만드셨어도 오류가 나지 않도록 */
    const ALUM = (typeof ALUMNI !== "undefined") ? ALUMNI : [];
    const byName = list => list.map((person, index) => ({person, index}))
      .sort((a, b) => a.person.name.localeCompare(b.person.name, 'ko'));

    /* 교수진 — 원래 인덱스를 유지해 상세 프로필과 연결합니다. */
    function drawFaculty(group) {
    const rows = byName(FACULTY).filter(({person}) => group === 'all' || person.facultyGroup === group);
    $("#facultyList").innerHTML = rows.length ? rows.map(({person: f, index: i}) =>
      '<article class="prof reveal is-clickable" tabindex="0" role="button" data-mkey="faculty" data-midx="' + i + '"><div>' + (f.photo ? pic(f.photo, f.name) : '<div class="photo-ph" aria-label="사진 미등록"></div>') + '</div><div>' +
        '<span class="prof-role">' + esc(f.role) + '</span>' +
        '<h3 class="prof-name">' + esc(f.name) + '</h3>' +
        '<p class="prof-en">' + esc(f.nameEn.toUpperCase()) + '</p>' +
        facultySubjects(f) +
      '</div></article>').join("") : '<p class="empty">등록된 교수진이 없습니다.</p>';
    $$('[data-faculty]').forEach(button => {
      const active = button.dataset.faculty === group;
      button.classList.toggle('on', active);
      button.setAttribute('aria-pressed', String(active));
    });
    observe();
    }
    $$('[data-faculty]').forEach(button => button.addEventListener('click', () => drawFaculty(button.dataset.faculty)));
    drawFaculty('all');

    /* 대학원생 · 졸업생 — 카드 모양이 같아 한 함수로 만듭니다 */
    const card = (p, key, i) =>
      '<article class="st reveal is-clickable" tabindex="0" role="button" data-mkey="' + key + '" data-midx="' + i + '">' +
        (p.profilePending && !p.photo ? '<div class="photo-ph" aria-label="사진 미등록"></div>' : pic(p.photo, p.name)) +
        '<h4 class="st-name">' + esc(p.name) + '</h4>' +
        (p.nameEn ? '<p class="st-en">' + esc(p.nameEn.toUpperCase()) + '</p>' : '') +
        '<p class="st-course">' + esc(p.course) + '</p>' +
        (p.interest || p.now ? '<p class="st-int">' + esc(p.interest || p.now) + '</p>' : '') +
      '</article>';

    function drawStudents(course) {
      const rows = byName(STUDENTS).map(({person: student, index}) => ({student, index})).filter(({student}) => {
        const value = (student.course || "").replace(/\s/g, "");
        const group = value.includes("통합") ? "integrated" : value.includes("박사") ? "doctoral" : value.includes("석사") ? "masters" : "other";
        return course === "all" ? group !== "other" : group === course;
      });
      $("#studentList").innerHTML = rows.length
        ? rows.map(({student, index}) => card(student, "students", index)).join("")
        : '<p class="empty">등록된 대학원생이 없습니다.</p>';
      $$('[data-course]').forEach(b => b.setAttribute("aria-pressed", String(b.dataset.course === course)));
      $$('[data-course]').forEach(b => b.classList.toggle("on", b.dataset.course === course));
      observe();
    }
    $$('[data-course]').forEach(b => b.addEventListener("click", () => { history.replaceState(null, "", "#students-" + b.dataset.course); drawStudents(b.dataset.course); }));
    drawStudents("all");

    $("#alumniList").innerHTML = ALUM.length
      ? byName(ALUM).map(({person: s, index: i}) => card(s, "alumni", i)).join("")
      : '<p class="empty">등록된 졸업생이 없습니다.</p>';

    /* 탭 전환 */
    const panels = {
      faculty:  $("#panelFaculty"),
      students: $("#panelStudents"),
      alumni:   $("#panelAlumni")
    };

    function show(key) {
      if (!panels[key]) key = "faculty";
      $$('[data-mtab]').forEach(b => b.setAttribute("aria-selected", b.dataset.mtab === key));
      Object.keys(panels).forEach(k => { if (panels[k]) panels[k].hidden = (k !== key); });
      observe();
    }

    /* 주소 끝의 #students / #alumni / #faculty 로 처음 열릴 탭이 정해집니다 */
    const keyFromHash = () => {
      const h = location.hash.replace("#", "");
      if (h.startsWith("students-")) {
        const course = h.slice(9);
        drawStudents(["all", "doctoral", "integrated", "masters"].includes(course) ? course : "all");
        return "students";
      }
      if (h === "students" || !panels[h]) drawStudents("all");
      return panels[h] ? h : "students";
    };

    $$('[data-mtab]').forEach(b => b.addEventListener("click", () => {
      history.replaceState(null, "", "#" + b.dataset.mtab);
      if (b.dataset.mtab === "students") drawStudents("all");
      show(b.dataset.mtab);
    }));
    window.addEventListener("hashchange", () => show(keyFromHash()));
    show(keyFromHash());

    initMemberModal();
  }

  /* ---------------------------------------------------------------------
     구성원 상세 창
     --------------------------------------------------------------------- */
  function initMemberModal() {
    const modal = $("#memberModal");
    if (!modal) return;
    const body = $("#modalBody");
    const data = {
      faculty:  FACULTY,
      students: STUDENTS,
      alumni:   (typeof ALUMNI !== "undefined") ? ALUMNI : []
    };
    let lastFocus = null;

    function bioRow(line) {
      const m = /^(\d{4}(?:[.\-]\d{1,2})?)\s+(.+)$/.exec(String(line).trim());
      return m
        ? '<li><span class="bio-y">' + esc(m[1]) + '</span><span>' + esc(m[2]) + '</span></li>'
        : '<li><span class="bio-y"></span><span>' + esc(line) + '</span></li>';
    }

    function profileDate(value, status) {
      const date = String(value || '').trim();
      // 2026-1 등의 학기 표기는 기간 구분자로 취급하지 않습니다.
      const range = /^(.*?)\s*(?:[–—~～]|\s-\s|-(?=\s*\d{4})|-\s*$)\s*(.*?)$/.exec(date);
      if (status === 'current') return date ? esc(range ? range[1].trim() : date) + ' ~ 현재' : '현재';
      if (!range) return esc(date);
      if (!range[2] && status !== 'former') return esc(range[1].trim()) + ' ~ 현재';
      return esc(range[1].trim()) + ' ~' +
        (range[2] ? '<span class="profile-date-end">' + esc(range[2].trim()) + '</span>' : '');
    }

    /* 상세 이력은 구성원 프로필 안에서만 표시합니다. */
    function unifiedProfileSections(person) {
      const titles = ['학력', '교내 학술활동', '대외 학술활동 및 연구', '논문', '저서', '경력', '수상', '자격증'];
      const groups = new Map(titles.map(title => [title, []]));
      for (const section of person.profileSections || []) {
        const title = section.title || '';
        const category = title.includes('학력') ? '학력'
          : title.includes('경력') ? '경력'
          : /학술|연구/.test(title) ? (title.includes('교내') ? '교내 학술활동' : '대외 학술활동 및 연구')
          : titles.includes(title) ? title : '경력';
        groups.get(category).push(...(section.items || []));
      }
      for (const line of person.bio || []) {
        const match = /^(\d{4}(?:[.\-]\d{1,2})?)\s+(.+)$/.exec(String(line).trim());
        const item = { date: match ? match[1] : '', text: match ? match[2] : String(line) };
        const category = /(?:학사|석사|박사|입학|졸업)/.test(item.text) ? '학력'
          : /발표|연구|학술대회/.test(item.text) ? (item.text.includes('교내') ? '교내 학술활동' : '대외 학술활동 및 연구') : '경력';
        groups.get(category).push(item);
      }
      return titles.map(title => ({ title, items: groups.get(title) }));
    }

    function profileSections(sections) {
      return sections.map(s =>
        '<section class="profile-section">' +
          '<h3>' + esc(s.title) + '</h3>' +
          '<ul class="profile-history">' + s.items.map(item =>
            '<li><span class="profile-date">' + profileDate(item.date, item.status) + '</span>' +
              '<span class="profile-detail">' + esc(item.text) + '</span></li>'
          ).join('') + '</ul>' +
          (!s.items.length ? '<div class="profile-blank" aria-label="' + esc(s.title) + ' 미등록"></div>' : '') +
        '</section>'
      ).join('');
    }

    function open(key, idx) {
      const p = data[key] && data[key][idx];
      if (!p) return;
      lastFocus = document.activeElement;

      body.innerHTML =
        '<div class="modal-head">' +
          '<div class="modal-photo">' + (p.profilePending && !p.photo ? '<div class="photo-ph" aria-label="사진 미등록"></div>' : pic(p.photo, p.name)) + '</div>' +
          '<div>' +
            '<span class="prof-role">' + esc(p.role || p.course || "") + '</span>' +
            '<h2 class="modal-name" id="modalName">' + esc(p.name) + '</h2>' +
            (p.nameEn ? '<p class="modal-en">' + esc(p.nameEn.toUpperCase()) + '</p>' : '') +
            (key === 'faculty' ? facultySubjects(p) : '') +
            '<p class="modal-field"><strong>소속</strong> &middot; 한신대학교 일반대학원 e스포츠융합(협)</p>' +
            (key !== 'faculty' && (p.field || p.interest || p.now)
              ? '<p class="modal-field"><strong>' +
                (p.field ? '연구 분야' : p.interest ? '관심 분야' : '현재') + '</strong> &middot; ' +
                esc(p.field || p.interest || p.now) + '</p>' : '') +
            (key !== 'faculty' && p.email ? '<p class="modal-field"><a href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a></p>' : '') +
          '</div>' +
        '</div>' +
        (p.intro ? '<p class="modal-intro">' + esc(p.intro) + '</p>' : '') +
        profileSections(key === 'faculty'
          ? ['논문', '경력', '저서'].map(title => unifiedProfileSections(p).find(section => section.title === title))
          : unifiedProfileSections(p));

      modal.hidden = false;
      $('#modalPanel').scrollTop = 0;
      document.body.style.overflow = "hidden";
      $("#modalClose").focus();
    }

    function close() {
      modal.hidden = true;
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }

    /* 카드 클릭 · 키보드 */
    document.addEventListener("click", e => {
      const card = e.target.closest("[data-mkey]");
      if (card) open(card.dataset.mkey, Number(card.dataset.midx));
    });
    document.addEventListener("keydown", e => {
      const card = e.target.closest && e.target.closest("[data-mkey]");
      if (card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(card.dataset.mkey, Number(card.dataset.midx)); }
      if (e.key === "Escape" && !modal.hidden) close();
    });

    /* 닫기 : X 버튼 · 바깥 여백 클릭 */
    $("#modalClose").addEventListener("click", close);
    modal.addEventListener("click", e => { if (e.target === modal) close(); });
  }

  /* ======================================================================
     Q&A
     ====================================================================== */
  function renderQna() {
    $("#faqList").innerHTML = FAQ.map(f =>
      '<details class="faq reveal"><summary>' + esc(f.q) + '</summary><p class="a">' + esc(f.a) + '</p></details>').join("");

    $("#qSend").addEventListener("click", () => {
      if (SITE.formUrl) { window.open(SITE.formUrl, "_blank", "noopener"); return; }
      const name = $("#qName").value.trim(), from = $("#qFrom").value.trim();
      const type = $("#qType").value, body = $("#qBody").value.trim();
      if (!name || !body) { alert("이름과 문의 내용을 적어 주세요."); return; }
      const text = "[문의 유형] " + type + "\n[이름] " + name + "\n[회신 이메일] " + from + "\n\n" + body;
      location.href = "mailto:" + SITE.email +
        "?subject=" + encodeURIComponent("[" + SITE.name + " 문의] " + type) +
        "&body=" + encodeURIComponent(text);
    });

    const addr = $("#contactAddr"), mail = $("#contactMail");
    if (addr) addr.textContent = SITE.address;
    if (mail) mail.innerHTML = '<a href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + '</a>';
  }

  /* ======================================================================
     스크롤 등장 효과
     ====================================================================== */
  let io;
  function observe() {
    if (!("IntersectionObserver" in window)) { $$(".reveal").forEach(e => e.classList.add("in")); return; }
    io = io || new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .12 });
    $$(".reveal:not(.in)").forEach(e => io.observe(e));
  }

  /* ======================================================================
     실행
     ====================================================================== */
  renderHeader();
  renderPageHead();

  ({
    home:     renderHome,
    history:  renderHistory,
    seminar:  renderSeminars,
    research: renderResearch,
    outreach: renderOutreach,
    members:  renderMembers,
    qna:      renderQna
  }[page] || function () {})();

  renderFooter();
  observe();
})();
