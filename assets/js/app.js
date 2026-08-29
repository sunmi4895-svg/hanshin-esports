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

  function renderHeader() {
    const el = $("#siteHeader");
    if (!el) return;
    const here = currentFile();
    el.innerHTML =
      '<div class="topbar-in">' +
        '<a class="brand" href="index.html">' +
          (SITE.logo
            ? '<img class="brand-logo' + (SITE.logoInvert ? ' brand-logo--invert' : '') +
              '" src="' + esc(SITE.logo) + '" alt="' + esc(SITE.univ) + ' 로고">'
            : '<span class="brand-mark">' + esc(SITE.mark) + '</span>') +
          '<span class="brand-text"><b>' + esc(SITE.name) + '</b><em>' + esc(SITE.nameEn) + '</em></span>' +
        '</a>' +
        '<button class="navtoggle" id="navToggle" aria-expanded="false" aria-controls="nav">메뉴</button>' +
        '<nav class="nav" id="nav" aria-label="주요 메뉴">' +
          NAV.map(n => {
            const on = n.href === here;
            return '<a href="' + esc(n.href) + '"' + (on ? ' class="on" aria-current="page"' : '') + '>' + esc(n.label) + '</a>';
          }).join("") +
        '</nav>' +
      '</div>';

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
      if (e.target.tagName === "A") { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
    });
  }

  function renderFooter() {
    const el = $("#siteFooter");
    if (!el) return;
    el.innerHTML =
      '<div class="wrap cols">' +
        '<div><h3>' + esc(SITE.name) + '</h3><p>' + esc(SITE.nameEn) + ', ' + esc(SITE.univ) + '</p></div>' +
        '<div><p><strong>바로 가기</strong></p>' +
          NAV.filter(n => n.href !== "index.html")
             .map(n => '<p><a href="' + esc(n.href) + '">' + esc(n.label) + '</a></p>').join("") +
        '</div>' +
        '<div><p><strong>찾아오시는 길</strong></p><p>' + esc(SITE.address) + '</p>' +
          '<p><a href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + '</a></p></div>' +
      '</div>' +
      '<div class="wrap"><p class="fine">&copy; ' + new Date().getFullYear() + ' ' + esc(SITE.name) +
      ' &middot; 최종 업데이트 ' + esc(SITE.updated) + '</p></div>';
  }

  /* 하위 페이지 공통 머리말 */
  function renderPageHead() {
    const el = $("#pageHead");
    const info = PAGES[page];
    if (!el || !info) return;
    el.innerHTML =
      '<div class="wrap">' +
        '<p class="eyebrow">' + esc(info.eyebrow) + '</p>' +
        '<h1 class="page-title">' + esc(info.title) + '</h1>' +
        '<p class="page-desc">' + esc(info.desc) + '</p>' +
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

    const opened = HISTORY.length ? HISTORY[HISTORY.length - 1].year : "—";

    $("#homeHero").innerHTML =
      '<div class="wrap">' +
        '<p class="eyebrow">' + esc(SITE.univ) + ' / ' + esc(SITE.nameEn) + '</p>' +
        '<h1 class="home-headline">' + headline + '</h1>' +
        '<p class="home-sub" style="animation-delay:' + subDelay + 's">' + esc(INTRO.sub) + '</p>' +
        '<div class="home-stats">' +
          '<div><b>' + opened + '</b><span>연구실 개설</span></div>' +
          '<div><b>' + PUBLICATIONS.length + '</b><span>학술 기록</span></div>' +
          '<div><b>' + (NEWS.length + CAMPUS.length + EXTERNAL.length) + '</b><span>대외 활동</span></div>' +
          '<div><b>' + (FACULTY.length + STUDENTS.length) + '</b><span>구성원</span></div>' +
        '</div>' +
      '</div>';

       /* 대표 사진이 있으면 큰 문구 뒤에 깔아 줍니다 */
    if (SITE.heroImage) {
      const hero = $("#homeHero");
      hero.classList.add("home-hero--photo");
      hero.style.backgroundImage = "url('" + SITE.heroImage + "')";
      hero.style.setProperty("--dim", SITE.heroDim != null ? SITE.heroDim : 0.9);
      if (SITE.heroCaption) {
        hero.insertAdjacentHTML("beforeend",
          '<span class="hero-credit">' + esc(SITE.heroCaption) + '</span>');
      }
    }

    $("#homeIntro").innerHTML =
      '<div class="wrap intro-grid">' +
        '<p class="intro-label">연구실 소개</p>' +
        '<div class="intro-body">' +
          INTRO.paragraphs.map(p => '<p class="reveal">' + esc(p) + '</p>').join("") +
          '<a class="btn btn--ghost" href="members.html">구성원 보기 &rarr;</a>' +
        '</div>' +
      '</div>';

    if (typeof AREAS !== "undefined" && AREAS.length) {
      $("#homeAreas").innerHTML = AREAS.map((a, i) =>
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

    const SHOW = 6;
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
              '<span class="nt-date">' + esc(dot(n.date)) + '</span>';
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
        more.textContent = expanded ? "접기" : "지난 공지 더 보기 (" + (rows.length - SHOW) + ")";
        draw();
      });
    }
  }

  /* 세미나 — 예정은 가까운 날짜 순으로 위에, 완료는 최신순으로 아래에 */
  function renderSeminars() {
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
    $("#historyRail").innerHTML = HISTORY.map((h, i) =>
      '<div class="rail-item reveal' + (i === 0 ? ' is-first' : '') + '">' +
        '<div class="rail-y">' + esc(h.year) + '</div>' +
        '<h3 class="rail-t">' + esc(h.title) + '</h3>' +
        '<p class="rail-d">' + esc(h.desc) + '</p>' +
      '</div>').join("");
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

    let pType = "all";
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

    $$('[data-ptype]').forEach(b => b.addEventListener("click", () => {
      $$('[data-ptype]').forEach(x => x.classList.remove("on"));
      b.classList.add("on"); pType = b.dataset.ptype; draw();
    }));
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
      external: { data: EXTERNAL, subs: ["전체", "학회", "장애인 이스포츠", "현장 답사", "MT", "기타"] }
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
  function renderMembers() {
    $("#facultyList").innerHTML = FACULTY.map(f =>
      '<article class="prof reveal"><div>' + pic(f.photo, f.name) + '</div><div>' +
        '<span class="prof-role">' + esc(f.role) + '</span>' +
        '<h3 class="prof-name">' + esc(f.name) + '</h3>' +
        '<p class="prof-en">' + esc(f.nameEn) + '</p>' +
        '<p><strong>연구 분야</strong> &middot; ' + esc(f.field) + '</p>' +
        (f.email ? '<p><a href="mailto:' + esc(f.email) + '">' + esc(f.email) + '</a></p>' : '') +
      '</div></article>').join("");

    $("#studentList").innerHTML = STUDENTS.map(s =>
      '<article class="st reveal">' + pic(s.photo, s.name) +
        '<h4 class="st-name">' + esc(s.name) + '</h4>' +
        '<p class="st-en">' + esc(s.nameEn) + '</p>' +
        '<p class="st-course">' + esc(s.course) + '</p>' +
        '<p class="st-int">' + esc(s.interest) + '</p>' +
      '</article>').join("");
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
    research: renderResearch,
    outreach: renderOutreach,
    members:  renderMembers,
    qna:      renderQna
  }[page] || function () {})();

  renderFooter();
  observe();
})();
