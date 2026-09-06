/* ============================================================
   EchoBoard — motor de la aplicación
   Modos: Entrenamiento (feedback por opción) y Examen real.
   Cronómetro, progreso en localStorage, análisis por categoría.
   ============================================================ */
(function () {
  'use strict';

  const { CATEGORIES, STATIC_QUESTIONS, GENERATORS } = window.ECHO_DATA;
  const CAT = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
  const ALL_SOURCES = [...STATIC_QUESTIONS, ...GENERATORS];
  const ALL_CAT_IDS = CATEGORIES.map(c => c.id);

  /* ---------------- almacenamiento (con respaldo en memoria) ---------------- */
  const store = (function () {
    let ok = true;
    try { const k = '__eb'; localStorage.setItem(k, '1'); localStorage.removeItem(k); }
    catch (e) { ok = false; }
    const mem = {};
    return {
      persistent: ok,
      get(k) { try { return ok ? localStorage.getItem(k) : (k in mem ? mem[k] : null); } catch (e) { return k in mem ? mem[k] : null; } },
      set(k, v) { try { ok ? localStorage.setItem(k, v) : (mem[k] = v); } catch (e) { mem[k] = v; } },
      remove(k) { try { ok ? localStorage.removeItem(k) : delete mem[k]; } catch (e) { delete mem[k]; } },
    };
  })();

  const K = { stats: 'eb.stats.v1', book: 'eb.bookmarks.v1', hist: 'eb.history.v1', theme: 'eb.theme.v1' };

  function loadJSON(key, fallback) {
    const raw = store.get(key);
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }
  function saveJSON(key, val) { store.set(key, JSON.stringify(val)); }

  function getStats() { return loadJSON(K.stats, { overall: { seen: 0, correct: 0 }, byCat: {}, byQ: {} }); }
  function recordAnswer(qid, cat, correct) {
    const s = getStats();
    s.overall.seen++; if (correct) s.overall.correct++;
    if (!s.byCat[cat]) s.byCat[cat] = { seen: 0, correct: 0 };
    s.byCat[cat].seen++; if (correct) s.byCat[cat].correct++;
    if (!s.byQ[qid]) s.byQ[qid] = { seen: 0, correct: 0, last: null };
    s.byQ[qid].seen++; if (correct) s.byQ[qid].correct++; s.byQ[qid].last = correct;
    saveJSON(K.stats, s);
  }
  function getBookmarks() { return new Set(loadJSON(K.book, [])); }
  function toggleBookmark(qid) {
    const b = getBookmarks();
    b.has(qid) ? b.delete(qid) : b.add(qid);
    saveJSON(K.book, [...b]); return b.has(qid);
  }
  function getHistory() { return loadJSON(K.hist, []); }
  function pushHistory(entry) {
    const h = getHistory(); h.unshift(entry);
    saveJSON(K.hist, h.slice(0, 25));
  }
  function resetProgress() { store.remove(K.stats); store.remove(K.book); store.remove(K.hist); }

  /* ---------------- utilidades ---------------- */
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
  function sampleN(a, n) { return shuffle(a).slice(0, n); }
  function uid() { return Math.random().toString(36).slice(2, 9); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function fmtTime(sec) { sec = Math.max(0, Math.round(sec)); const m = Math.floor(sec / 60), s = sec % 60; return m + ':' + String(s).padStart(2, '0'); }
  const KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

  function instantiate(source) {
    let base;
    if (source.build) { const g = source.build(); base = { id: source.id, cat: source.cat, dif: source.dif || '', q: g.q, opts: g.opts, ref: g.ref || '', generated: true }; }
    else { base = { id: source.id, cat: source.cat, dif: source.dif || '', q: source.q, opts: source.opts, ref: source.ref || '', generated: false }; }
    const opts = shuffle(base.opts.map(o => ({ t: o.t, ok: o.ok, e: o.e })));
    return { runId: uid(), id: base.id, cat: base.cat, dif: base.dif, q: base.q, opts, ref: base.ref, generated: base.generated, correctIdx: opts.findIndex(o => o.ok) };
  }
  function sourcesForCats(catSet) { return ALL_SOURCES.filter(s => catSet.has(s.cat)); }

  /* ---------------- estado ---------------- */
  const state = {
    view: 'home',
    trainingCats: new Set(ALL_CAT_IDS),
    testCats: new Set(ALL_CAT_IDS),
    testCount: 20,
    testMinutes: 'auto',
    session: null,
    tick: null,       // intervalo del cronómetro
    reviewFilter: 'all',
  };

  const app = document.getElementById('app');

  /* ============================================================
     ICONOS
     ============================================================ */
  const I = {
    check: '<svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 5.5A2 2 0 016 4h5v14H6a2 2 0 00-2 1.2M20 5.5A2 2 0 0018 4h-5v14h5a2 2 0 012 1.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 21V4M5 4h11l-1.5 3.5L16 11H5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ref: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 11v5M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="2"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none"><path d="M21 13A9 9 0 1111 3a7 7 0 0010 10z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>',
  };

  const LOGO = '<svg viewBox="0 0 32 32"><path d="M3 17h5l2-6 3 12 3-9 2 4h9" fill="none" stroke="#38bdf8" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"/></svg>';

  /* ============================================================
     COMPONENTES
     ============================================================ */
  function topbar() {
    const dark = document.documentElement.getAttribute('data-theme') !== 'light';
    return `<header class="topbar">
      <div class="brandmark" data-action="go-home">
        <span class="logo">${LOGO}</span>
        <span class="name">Echo<b>Board</b></span>
      </div>
      <span class="sub">Simulador de examen de ecocardiografía</span>
      <span class="spacer"></span>
      <button class="iconbtn" data-action="toggle-theme" title="Cambiar tema" aria-label="Cambiar tema">${dark ? I.sun : I.moon}</button>
    </header>`;
  }

  function scoreClass(pct) { return pct >= 70 ? 'pass' : pct >= 55 ? 'mid' : 'low'; }
  function pctColor(pct) { return pct >= 70 ? 'g' : pct >= 55 ? 'm' : 'b'; }

  function catBars(byCat, opts) {
    opts = opts || {};
    const rows = CATEGORIES
      .map(c => ({ c, d: byCat[c.id] }))
      .filter(x => x.d && x.d.seen > 0)
      .map(x => ({ ...x, pct: Math.round(x.d.correct / x.d.seen * 100) }))
      .sort((a, b) => a.pct - b.pct);
    if (!rows.length) return `<p class="emptynote">${opts.empty || 'Aún no hay datos por categoría.'}</p>`;
    return `<div class="catbars">` + rows.map(x => `
      <div class="catbar">
        <span class="cname" title="${esc(x.c.name)}">${esc(x.c.name)}</span>
        <span class="track"><span class="fill" style="width:${x.pct}%;background:${x.c.color}"></span></span>
        <span class="cnt readout">${x.d.correct}/${x.d.seen} · ${x.pct}%</span>
      </div>`).join('') + `</div>`;
  }

  /* ============================================================
     HOME
     ============================================================ */
  function renderHome() {
    state.session = null; stopTick();
    const stats = getStats();
    const book = getBookmarks();
    const hist = getHistory();
    const overallPct = stats.overall.seen ? Math.round(stats.overall.correct / stats.overall.seen * 100) : 0;

    const missedSources = ALL_SOURCES.filter(s => { const q = stats.byQ[s.id]; return q && q.correct < q.seen; });
    const bookedSources = ALL_SOURCES.filter(s => book.has(s.id));

    const trainAvail = sourcesForCats(state.trainingCats).length;
    const testAvail = sourcesForCats(state.testCats).length;
    if (state.testCount > testAvail) state.testCount = testAvail;

    const trainChips = CATEGORIES.map(c =>
      `<button class="chip mini" data-action="toggle-cat" data-scope="training" data-cat="${c.id}" aria-pressed="${state.trainingCats.has(c.id)}">${esc(c.name)}</button>`
    ).join('');
    const testChips = CATEGORIES.map(c =>
      `<button class="chip mini" data-action="toggle-cat" data-scope="test" data-cat="${c.id}" aria-pressed="${state.testCats.has(c.id)}">${esc(c.name)}</button>`
    ).join('');

    const countOpts = [10, 20, 30, 50].filter(n => n < testAvail);
    countOpts.push(testAvail);
    const countSelect = countOpts.map(n =>
      `<option value="${n}" ${n === state.testCount ? 'selected' : ''}>${n === testAvail ? `Todas (${testAvail})` : n + ' preguntas'}</option>`
    ).join('');
    const autoMin = Math.max(5, Math.round(state.testCount * 1.5));
    const minSelect = [['auto', `Automático (~${autoMin} min)`], ['10', '10 min'], ['20', '20 min'], ['30', '30 min'], ['45', '45 min'], ['60', '60 min']]
      .map(([v, l]) => `<option value="${v}" ${String(state.testMinutes) === v ? 'selected' : ''}>${l}</option>`).join('');

    const persistWarn = store.persistent ? '' :
      `<div class="weakflag" style="margin-top:16px">Tu navegador está bloqueando el almacenamiento local: el progreso <b>no se guardará</b> entre sesiones. En GitHub Pages (https) funciona con normalidad.</div>`;

    app.innerHTML = topbar() + `<main class="wrap">
      <section class="hero">
        <h1>Entrena para el board de ecocardiografía</h1>
        <p class="lede">Practica con retroalimentación por cada opción, cronométrate como en el examen real y descubre en qué categorías necesitas reforzar. Las preguntas de cálculo generan valores nuevos cada vez.</p>
        <div class="trace" aria-hidden="true">
          <svg viewBox="0 0 1000 66" preserveAspectRatio="none">
            <path class="ecg" d="M0 40 L120 40 L150 38 L175 44 L230 40 L250 12 L268 40 L360 40 L420 40 L450 38 L470 40 L560 40 L590 20 L610 40 L700 40 L760 40 L790 38 L812 44 L860 40 L882 14 L900 40 L1000 40"/>
          </svg>
        </div>
      </section>

      <section class="modes">
        <div class="mode">
          <span class="tag">${I.book} Estudio guiado</span>
          <h2>Entrenamiento</h2>
          <p class="desc">Una pregunta a la vez. Al responder, se muestra la explicación de <b>todas</b> las opciones —por qué cada una es o no la correcta— con cronómetro por pregunta. Tus aciertos y fallos quedan guardados.</p>
          <div class="field">
            <label>Categorías (${state.trainingCats.size}/${CATEGORIES.length})</label>
            <div class="chips">${trainChips}</div>
            <div class="chips-tools">
              <button class="linkbtn" data-action="cats-all" data-scope="training">Todas</button>
              <button class="linkbtn muted" data-action="cats-none" data-scope="training">Ninguna</button>
            </div>
          </div>
          <button class="btn btn-primary block" data-action="start-training" ${trainAvail ? '' : 'disabled'}>Empezar entrenamiento${trainAvail ? ` · ${trainAvail}` : ''}</button>
        </div>

        <div class="mode exam">
          <span class="tag">${I.clock} Condiciones de examen</span>
          <h2>Examen real</h2>
          <p class="desc">Todas las preguntas seguidas, con tiempo total. Sin pistas durante la prueba: al terminar obtienes tu puntuación, el desglose de aciertos y fallos y el análisis por categoría.</p>
          <div class="field">
            <label>Categorías (${state.testCats.size}/${CATEGORIES.length})</label>
            <div class="chips">${testChips}</div>
            <div class="chips-tools">
              <button class="linkbtn" data-action="cats-all" data-scope="test">Todas</button>
              <button class="linkbtn muted" data-action="cats-none" data-scope="test">Ninguna</button>
            </div>
          </div>
          <div class="row">
            <div class="field"><label>Número de preguntas</label><select data-action="set-count">${countSelect}</select></div>
            <div class="field"><label>Tiempo</label><select data-action="set-minutes">${minSelect}</select></div>
          </div>
          <button class="btn btn-primary warm block" data-action="start-test" ${testAvail ? '' : 'disabled'}>Empezar examen</button>
        </div>
      </section>

      <section class="panel">
        <h3>Tu progreso</h3>
        <p class="hint">Se guarda en este dispositivo. Los fallos alimentan el repaso dirigido.</p>
        <div class="progress-head">
          <div class="donut" style="--pct:${overallPct}"><span class="val">${overallPct}%<small>ACIERTO</small></span></div>
          <div class="kpis">
            <div class="kpi"><div class="n readout">${stats.overall.seen}</div><div class="l">respuestas</div></div>
            <div class="kpi"><div class="n readout" style="color:var(--good)">${stats.overall.correct}</div><div class="l">correctas</div></div>
            <div class="kpi"><div class="n readout" style="color:var(--bad)">${stats.overall.seen - stats.overall.correct}</div><div class="l">falladas</div></div>
            <div class="kpi"><div class="n readout" style="color:var(--warm)">${book.size}</div><div class="l">marcadas</div></div>
          </div>
        </div>
        ${catBars(stats.byCat, { empty: 'Responde algunas preguntas para ver tu rendimiento por categoría.' })}
        <div class="actionrow">
          <button class="btn btn-ghost sm" data-action="review-missed" ${missedSources.length ? '' : 'disabled'}>Repasar mis falladas${missedSources.length ? ` (${missedSources.length})` : ''}</button>
          ${bookedSources.length ? `<button class="btn btn-ghost sm" data-action="practice-booked">Practicar marcadas (${bookedSources.length})</button>` : ''}
          ${hist.length ? `<button class="btn btn-outline sm" data-action="show-history">Ver historial (${hist.length})</button>` : ''}
          <span style="flex:1"></span>
          <button class="btn btn-outline sm" data-action="reset-progress" ${stats.overall.seen || book.size ? '' : 'disabled'}>Reiniciar progreso</button>
        </div>
        ${persistWarn}
      </section>

      <p class="footnote">${ALL_SOURCES.length} fuentes de pregunta · ${STATIC_QUESTIONS.length} conceptuales + ${GENERATORS.length} calculadoras que se regeneran.<br><b>Contenido educativo original.</b> No sustituye las guías ASE ni el juicio clínico.</p>
    </main>`;
  }

  /* ============================================================
     HISTORIAL
     ============================================================ */
  function renderHistory() {
    const hist = getHistory();
    const rows = hist.map(h => {
      const pc = pctColor(h.pct);
      const date = new Date(h.date);
      const ds = date.toLocaleDateString('es', { day: '2-digit', month: 'short' }) + ' · ' + date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
      return `<div class="histrow">
        <span class="hp ${pc} readout">${h.pct}%</span>
        <span class="hmeta"><b>${h.score}/${h.total}</b> correctas · ${fmtTime(h.durationSec)} · ${h.total} preguntas</span>
        <span class="hdate">${ds}</span>
      </div>`;
    }).join('');
    app.innerHTML = topbar() + `<main class="wrap">
      <div class="backlink" data-action="go-home">${I.back} Volver al inicio</div>
      <section class="panel" style="margin-top:8px">
        <h3>Historial de exámenes</h3>
        <p class="hint">Tus últimas ${hist.length} pruebas en este dispositivo.</p>
        ${rows || '<p class="emptynote">Todavía no has completado ningún examen.</p>'}
      </section>
    </main>`;
  }

  /* ============================================================
     ENTRENAMIENTO
     ============================================================ */
  function startTraining(sources, label) {
    if (!sources.length) return;
    state.session = {
      mode: 'training', label: label || null,
      queue: shuffle(sources), instances: [], answers: {},
      index: 0, answered: 0, correct: 0, streak: 0,
    };
    state.view = 'training';
    renderTraining();
  }

  function currentInstance() {
    const s = state.session;
    if (!s.instances[s.index]) s.instances[s.index] = instantiate(s.queue[s.index]);
    return s.instances[s.index];
  }

  function renderTraining() {
    const s = state.session;
    const inst = currentInstance();
    const answer = s.answers[s.index];
    const total = s.queue.length;
    const cat = CAT[inst.cat];
    const booked = getBookmarks().has(inst.id);
    const pct = Math.round((s.index + (answer ? 1 : 0)) / total * 100);

    const optsHtml = inst.opts.map((o, i) => {
      let cls = 'opt', badge = '', expCls = 'oexp', showExp = '';
      if (answer) {
        showExp = 'show';
        if (o.ok) { cls += ' correct'; badge = `<span class="badge">${I.check}</span>`; expCls += ' good'; }
        else if (i === answer.chosen) { cls += ' wrong'; badge = `<span class="badge">${I.x}</span>`; expCls += ' bad'; }
      }
      return `<div class="optwrap">
        <button class="${cls}" data-action="answer" data-opt="${i}" ${answer ? 'disabled' : ''}>
          <span class="key">${KEYS[i]}</span>
          <span class="otext">${esc(o.t)}</span>
          ${badge || '<span class="badge"></span>'}
        </button>
        <div class="${expCls} ${showExp}">${esc(o.e)}</div>
      </div>`;
    }).join('');

    app.innerHTML = topbar() + `<main class="wrap">
      <div class="sess-top">
        <span class="catlabel">${esc(cat ? cat.name : inst.cat)}</span>
        ${s.label ? `<span class="pill">${esc(s.label)}</span>` : ''}
        <span class="spacer"></span>
        <span class="scoretag">Sesión: <b class="g">${s.correct}</b>/${s.answered}${s.streak > 1 ? ` · racha ${s.streak}` : ''}</span>
        <span class="timer" id="stopwatch">${I.clock}<span class="readout" id="sw">0:00</span></span>
      </div>
      <div class="pbar"><span class="pfill" style="width:${pct}%"></span></div>

      <div class="qcard">
        <div class="qmeta">
          <span class="counter">Pregunta <b class="readout">${s.index + 1}</b> / ${total}</span>
          ${inst.generated ? '<span class="pill gen">valores generados</span>' : ''}
          ${inst.dif ? `<span class="pill">${esc(inst.dif)}</span>` : ''}
        </div>
        <p class="qstem">${esc(inst.q)}</p>
        <div class="opts">${optsHtml}</div>
        ${answer ? `<div class="refline">${I.ref}<span>${esc(inst.ref || 'Concepto')}</span></div>` : ''}
        <div class="qfoot">
          <button class="btn sm ${booked ? 'btn-ghost bookmark on' : 'btn-outline bookmark'}" data-action="bookmark">${I.flag}${booked ? 'Marcada' : 'Marcar'}</button>
          <span class="spacer"></span>
          ${answer ? (s.index < total - 1
            ? `<button class="btn btn-primary" data-action="train-next">Siguiente pregunta</button>`
            : `<button class="btn btn-primary" data-action="train-finish">Terminar sesión</button>`)
            : `<button class="btn btn-outline" data-action="go-home">Salir</button>`}
        </div>
      </div>
    </main>`;

    if (!answer) startStopwatch(); else stopTick();
  }

  function answerTraining(optIdx) {
    const s = state.session;
    if (s.answers[s.index]) return;
    const inst = currentInstance();
    const correct = inst.opts[optIdx].ok;
    s.answers[s.index] = { chosen: optIdx, correct };
    s.answered++; if (correct) { s.correct++; s.streak++; } else { s.streak = 0; }
    recordAnswer(inst.id, inst.cat, correct);
    renderTraining();
  }

  function trainNext() { const s = state.session; if (s.index < s.queue.length - 1) { s.index++; renderTraining(); } }

  function finishTrainingSession() {
    const s = state.session;
    if (s.answered === 0) { renderHome(); return; }
    // Resumen ligero de la sesión de entrenamiento (sin guardar en historial de exámenes)
    const byCat = {};
    Object.keys(s.answers).forEach(i => {
      const inst = s.instances[i]; const a = s.answers[i];
      if (!byCat[inst.cat]) byCat[inst.cat] = { seen: 0, correct: 0 };
      byCat[inst.cat].seen++; if (a.correct) byCat[inst.cat].correct++;
    });
    const pct = Math.round(s.correct / s.answered * 100);
    app.innerHTML = topbar() + `<main class="wrap">
      <div class="backlink" data-action="go-home">${I.back} Volver al inicio</div>
      <section class="result-hero">
        <div class="big ${scoreClass(pct)} readout">${pct}%</div>
        <div class="sub">Sesión de entrenamiento · ${s.correct} de ${s.answered} correctas</div>
      </section>
      <div class="section-title">Rendimiento por categoría</div>
      ${catBars(byCat, { empty: 'Sin datos.' })}
      <div class="actionrow" style="justify-content:center;margin-top:24px">
        <button class="btn btn-primary" data-action="go-home">Volver al inicio</button>
      </div>
    </main>`;
    stopTick();
  }

  /* ============================================================
     EXAMEN
     ============================================================ */
  function startTest() {
    const sources = sourcesForCats(state.testCats);
    if (!sources.length) return;
    const count = Math.min(state.testCount, sources.length);
    const picked = sampleN(sources, count).map(instantiate);
    const minutes = state.testMinutes === 'auto' ? Math.max(5, Math.round(count * 1.5)) : parseInt(state.testMinutes, 10);
    state.session = {
      mode: 'test', instances: picked, answers: {}, index: 0,
      total: count, remaining: minutes * 60, totalSec: minutes * 60, startTs: Date.now(),
    };
    state.view = 'test';
    renderTest();
    startCountdown();
  }

  function renderTest() {
    const s = state.session;
    const inst = s.instances[s.index];
    const answer = s.answers[s.index];
    const cat = CAT[inst.cat];
    const pct = Math.round((s.index + 1) / s.total * 100);

    const optsHtml = inst.opts.map((o, i) => `
      <div class="optwrap">
        <button class="opt ${answer && answer.chosen === i ? 'chosen' : ''}" data-action="test-answer" data-opt="${i}">
          <span class="key">${KEYS[i]}</span>
          <span class="otext">${esc(o.t)}</span>
          <span class="badge"></span>
        </button>
      </div>`).join('');

    const nav = s.instances.map((_, i) => {
      const a = s.answers[i];
      const cls = 'navcell' + (i === s.index ? ' current' : '') + (a != null ? ' answered' : '');
      return `<button class="${cls}" data-action="test-goto" data-idx="${i}">${i + 1}</button>`;
    }).join('');

    const answeredCount = Object.keys(s.answers).length;

    app.innerHTML = topbar() + `<main class="wrap">
      <div class="sess-top">
        <span class="catlabel">Examen</span>
        <span class="pill">${answeredCount}/${s.total} respondidas</span>
        <span class="spacer"></span>
        <span class="timer" id="countdown">${I.clock}<span class="readout" id="cd">${fmtTime(s.remaining)}</span></span>
      </div>
      <div class="pbar"><span class="pfill" style="width:${pct}%"></span></div>

      <div class="qcard">
        <div class="qmeta">
          <span class="counter">Pregunta <b class="readout">${s.index + 1}</b> / ${s.total}</span>
          <span class="pill">${esc(cat ? cat.name : inst.cat)}</span>
        </div>
        <p class="qstem">${esc(inst.q)}</p>
        <div class="opts">${optsHtml}</div>
        <div class="qfoot">
          <button class="btn btn-outline sm" data-action="test-prev" ${s.index === 0 ? 'disabled' : ''}>Anterior</button>
          <span class="spacer"></span>
          ${s.index < s.total - 1
            ? `<button class="btn btn-ghost" data-action="test-next">Siguiente</button>`
            : `<button class="btn btn-primary warm" data-action="test-finish">Finalizar examen</button>`}
        </div>
      </div>

      <section class="panel" style="margin-top:16px">
        <h3 style="font-size:.95rem;margin-bottom:12px">Navegación</h3>
        <div class="navgrid">${nav}</div>
        <div class="navlegend">
          <span><i class="dot"></i> sin responder</span>
          <span><i class="dot a"></i> respondida</span>
          <span><i class="dot c"></i> actual</span>
        </div>
        <div style="margin-top:16px;text-align:right">
          <button class="btn btn-primary warm sm" data-action="test-finish">Finalizar examen ahora</button>
        </div>
      </section>
    </main>`;

    updateCountdownEl();
  }

  function testAnswer(optIdx) {
    const s = state.session;
    s.answers[s.index] = { chosen: optIdx };
    if (s.index < s.total - 1) { s.index++; renderTest(); }
    else renderTest();
  }
  function testGoto(i) { state.session.index = i; renderTest(); }
  function testPrev() { const s = state.session; if (s.index > 0) { s.index--; renderTest(); } }
  function testNext() { const s = state.session; if (s.index < s.total - 1) { s.index++; renderTest(); } }

  function finishTest(auto) {
    const s = state.session;
    stopTick();
    const durationSec = Math.round((Date.now() - s.startTs) / 1000);
    const byCat = {};
    let correct = 0;
    const items = s.instances.map((inst, i) => {
      const a = s.answers[i];
      const chosen = a ? a.chosen : -1;
      const isCorrect = chosen === inst.correctIdx;
      if (isCorrect) correct++;
      if (!byCat[inst.cat]) byCat[inst.cat] = { seen: 0, correct: 0 };
      byCat[inst.cat].seen++; if (isCorrect) byCat[inst.cat].correct++;
      recordAnswer(inst.id, inst.cat, isCorrect);
      return { inst, chosen, isCorrect };
    });
    const total = s.total;
    const pct = Math.round(correct / total * 100);
    pushHistory({ date: Date.now(), mode: 'test', score: correct, total, pct, durationSec, byCat });

    state.session = { mode: 'results', items, byCat, correct, total, pct, durationSec, auto: !!auto };
    state.view = 'results';
    state.reviewFilter = 'all';
    renderResults();
  }

  function renderResults() {
    const r = state.session;
    // categoría más débil (con al menos 2 preguntas)
    let weak = null;
    CATEGORIES.forEach(c => {
      const d = r.byCat[c.id];
      if (d && d.seen >= 2) {
        const p = d.correct / d.seen;
        if (!weak || p < weak.p) weak = { c, p, d };
      }
    });
    const weakHtml = weak && weak.p < 1
      ? `<div class="weakflag">Área a reforzar: <b>${esc(weak.c.name)}</b> — ${weak.d.correct}/${weak.d.seen} correctas (${Math.round(weak.p * 100)}%).</div>`
      : '';

    const filtered = r.items.filter(it => state.reviewFilter === 'wrong' ? !it.isCorrect : true);
    const reviewHtml = filtered.map((it, idx) => {
      const n = r.items.indexOf(it) + 1;
      const cat = CAT[it.inst.cat];
      const opts = it.inst.opts.map((o, i) => {
        let cls = 'ro', mark = '';
        if (i === it.inst.correctIdx) { cls += ' c'; mark = `<span class="mark">Correcta</span>`; }
        else if (i === it.chosen) { cls += ' w'; mark = `<span class="mark">Tu respuesta</span>`; }
        return `<div class="${cls}"><span class="rk">${KEYS[i]}</span>${esc(o.t)}${mark}</div>`;
      }).join('');
      const correctExp = it.inst.opts[it.inst.correctIdx].e;
      const chosenExp = (it.chosen >= 0 && it.chosen !== it.inst.correctIdx) ? it.inst.opts[it.chosen].e : '';
      return `<div class="rev">
        <div class="rhead">
          <span class="rnum ${it.isCorrect ? 'ok' : 'no'}">${n}</span>
          <div><div class="rq">${esc(it.inst.q)}</div><div class="rcat">${esc(cat ? cat.name : it.inst.cat)}</div></div>
        </div>
        <div class="rbody">
          ${opts}
          <div class="rexp"><b>Por qué:</b> ${esc(correctExp)}${chosenExp ? ` <br><b>Tu opción:</b> ${esc(chosenExp)}` : ''}</div>
        </div>
      </div>`;
    }).join('');

    const wrongCount = r.items.filter(it => !it.isCorrect).length;

    app.innerHTML = topbar() + `<main class="wrap">
      <div class="backlink" data-action="go-home">${I.back} Volver al inicio</div>
      <section class="result-hero">
        <div class="big ${scoreClass(r.pct)} readout">${r.pct}%</div>
        <div class="sub">${r.correct} de ${r.total} correctas${r.auto ? ' · se acabó el tiempo' : ''}</div>
        <div class="result-stats">
          <div class="s"><div class="n g readout">${r.correct}</div><div class="l">correctas</div></div>
          <div class="s"><div class="n b readout">${r.total - r.correct}</div><div class="l">incorrectas</div></div>
          <div class="s"><div class="n readout">${fmtTime(r.durationSec)}</div><div class="l">tiempo</div></div>
        </div>
      </section>

      ${weakHtml}

      <div class="section-title">Análisis por categoría</div>
      ${catBars(r.byCat, { empty: 'Sin datos.' })}

      <div class="actionrow" style="margin:18px 0 4px">
        ${wrongCount ? `<button class="btn btn-ghost sm" data-action="review-these">Repasar las ${wrongCount} falladas en entrenamiento</button>` : ''}
        <button class="btn btn-primary warm sm" data-action="start-test">Nuevo examen</button>
        <button class="btn btn-outline sm" data-action="go-home">Inicio</button>
      </div>

      <div class="section-title">Revisión de preguntas</div>
      <div class="reviewfilter">
        <button class="chip ${state.reviewFilter === 'all' ? '' : ''}" data-action="review-filter" data-filter="all" aria-pressed="${state.reviewFilter === 'all'}">Todas (${r.total})</button>
        <button class="chip" data-action="review-filter" data-filter="wrong" aria-pressed="${state.reviewFilter === 'wrong'}">Solo incorrectas (${wrongCount})</button>
      </div>
      ${reviewHtml || '<p class="emptynote">¡Sin fallos para revisar!</p>'}
    </main>`;
  }

  /* ============================================================
     CRONÓMETROS
     ============================================================ */
  function stopTick() { if (state.tick) { clearInterval(state.tick); state.tick = null; } }

  function startStopwatch() {
    stopTick();
    const start = Date.now();
    const el = document.getElementById('sw');
    state.tick = setInterval(() => {
      const el2 = document.getElementById('sw');
      if (!el2) { stopTick(); return; }
      el2.textContent = fmtTime((Date.now() - start) / 1000);
    }, 500);
  }

  function startCountdown() {
    stopTick();
    state.tick = setInterval(() => {
      const s = state.session;
      if (!s || s.mode !== 'test') { stopTick(); return; }
      s.remaining -= 1;
      updateCountdownEl();
      if (s.remaining <= 0) { stopTick(); finishTest(true); }
    }, 1000);
  }

  function updateCountdownEl() {
    const s = state.session;
    if (!s || s.mode !== 'test') return;
    const cd = document.getElementById('cd');
    const wrap = document.getElementById('countdown');
    if (!cd || !wrap) return;
    cd.textContent = fmtTime(s.remaining);
    wrap.classList.remove('warn', 'danger');
    const frac = s.remaining / s.totalSec;
    if (s.remaining <= 30) wrap.classList.add('danger');
    else if (frac <= 0.2) wrap.classList.add('warn');
  }

  /* ============================================================
     TEMA + TOASTS
     ============================================================ */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'light' ? '#eef2f8' : '#0b111c');
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = cur === 'light' ? 'dark' : 'light';
    applyTheme(next); saveJSON(K.theme, next); rerender();
  }
  let toastTimer = null;
  function toast(msg) {
    let el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
    el.textContent = msg; requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function rerender() {
    if (state.view === 'home') renderHome();
    else if (state.view === 'training') renderTraining();
    else if (state.view === 'test') renderTest();
    else if (state.view === 'results') renderResults();
    else if (state.view === 'history') renderHistory();
  }

  /* ============================================================
     EVENTOS
     ============================================================ */
  function scopeSet(scope) { return scope === 'test' ? state.testCats : state.trainingCats; }

  app.addEventListener('click', function (e) {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    const a = t.dataset.action;

    switch (a) {
      case 'go-home': state.view = 'home'; renderHome(); break;
      case 'toggle-theme': toggleTheme(); break;

      case 'toggle-cat': {
        const set = scopeSet(t.dataset.scope);
        const id = t.dataset.cat;
        set.has(id) ? set.delete(id) : set.add(id);
        renderHome();
        break;
      }
      case 'cats-all': { const set = scopeSet(t.dataset.scope); ALL_CAT_IDS.forEach(id => set.add(id)); renderHome(); break; }
      case 'cats-none': { const set = scopeSet(t.dataset.scope); set.clear(); renderHome(); break; }

      case 'start-training': startTraining(sourcesForCats(state.trainingCats)); break;
      case 'answer': answerTraining(parseInt(t.dataset.opt, 10)); break;
      case 'train-next': trainNext(); break;
      case 'train-finish': finishTrainingSession(); break;
      case 'bookmark': {
        const inst = currentInstance();
        const on = toggleBookmark(inst.id);
        toast(on ? 'Pregunta marcada' : 'Marca retirada');
        renderTraining();
        break;
      }

      case 'start-test': startTest(); break;
      case 'test-answer': testAnswer(parseInt(t.dataset.opt, 10)); break;
      case 'test-goto': testGoto(parseInt(t.dataset.idx, 10)); break;
      case 'test-prev': testPrev(); break;
      case 'test-next': testNext(); break;
      case 'test-finish': finishTest(false); break;

      case 'review-filter': state.reviewFilter = t.dataset.filter; renderResults(); break;
      case 'review-these': {
        const ids = new Set(state.session.items.filter(it => !it.isCorrect).map(it => it.inst.id));
        const sources = ALL_SOURCES.filter(s => ids.has(s.id));
        startTraining(sources, 'Repaso de falladas');
        break;
      }
      case 'review-missed': {
        const stats = getStats();
        const sources = ALL_SOURCES.filter(s => { const q = stats.byQ[s.id]; return q && q.correct < q.seen; });
        startTraining(sources, 'Mis falladas');
        break;
      }
      case 'practice-booked': {
        const book = getBookmarks();
        const sources = ALL_SOURCES.filter(s => book.has(s.id));
        startTraining(sources, 'Marcadas');
        break;
      }
      case 'show-history': state.view = 'history'; renderHistory(); break;

      case 'reset-progress': {
        if (confirm('¿Borrar todo tu progreso, marcas e historial de este dispositivo? No se puede deshacer.')) {
          resetProgress(); toast('Progreso reiniciado'); renderHome();
        }
        break;
      }
    }
  });

  app.addEventListener('change', function (e) {
    const t = e.target.closest('[data-action]');
    if (!t) return;
    if (t.dataset.action === 'set-count') { state.testCount = parseInt(t.value, 10); }
    else if (t.dataset.action === 'set-minutes') { state.testMinutes = t.value; }
  });

  document.addEventListener('keydown', function (e) {
    const s = state.session;
    if (!s) return;
    const k = e.key.toUpperCase();
    if (s.mode === 'training') {
      const inst = s.instances[s.index];
      if (!s.answers[s.index] && inst && KEYS.slice(0, inst.opts.length).includes(k)) { answerTraining(KEYS.indexOf(k)); }
      else if ((e.key === 'Enter' || e.key === 'ArrowRight') && s.answers[s.index]) {
        if (s.index < s.queue.length - 1) trainNext(); else finishTrainingSession();
      }
    } else if (s.mode === 'test') {
      const inst = s.instances[s.index];
      if (inst && KEYS.slice(0, inst.opts.length).includes(k)) testAnswer(KEYS.indexOf(k));
      else if (e.key === 'ArrowRight') testNext();
      else if (e.key === 'ArrowLeft') testPrev();
    }
  });

  window.addEventListener('beforeunload', function (e) {
    if (state.session && state.session.mode === 'test') { e.preventDefault(); e.returnValue = ''; }
  });

  /* ---------------- init ---------------- */
  applyTheme(loadJSON(K.theme, 'dark'));
  renderHome();
})();
