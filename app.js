(() => {
  'use strict';

  const BUILTIN = Array.isArray(window.ECHO_QUESTIONS) ? window.ECHO_QUESTIONS : [];
  const STORAGE_KEY = 'echo-board-progress-v3';
  const CUSTOM_KEY = 'echo-board-custom-questions-v3';
  const LETTERS = ['A','B','C','D','E','F','G'];
  const $ = id => document.getElementById(id);

  const state = {
    mode: null,
    questions: [],
    index: 0,
    answers: [],
    secondsPerQuestion: 60,
    remaining: 60,
    timerId: null,
    selectedCategories: new Set(),
    difficulty: 'all',
    desiredCount: 10,
    sessionStartedAt: 0,
    questionStartedAt: 0,
    reviewIds: null,
    elapsed: 0
  };

  function esc(value = '') {
    return String(value).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function customQuestions() {
    try {
      const value = JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  }

  function allQuestions() { return [...BUILTIN, ...customQuestions()]; }

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch (_) { return {}; }
  }

  function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function recordAnswer(question, correct, timeSpent, selected) {
    const progress = loadProgress();
    progress.records = progress.records || {};
    const previous = progress.records[question.id] || { attempts: 0, correct: 0, wrong: 0, last: null };
    previous.attempts += 1;
    previous.last = correct ? 'correct' : 'wrong';
    previous.lastSelected = selected;
    previous.lastTime = timeSpent;
    if (correct) previous.correct += 1; else previous.wrong += 1;
    progress.records[question.id] = previous;
    saveProgress(progress);
  }

  function statusOf(question) {
    return loadProgress().records?.[question.id]?.last || 'unseen';
  }

  function showView(id) {
    document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === id));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.view === id));
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (id === 'homeView') updateDashboard();
    if (id === 'bankView') renderBank();
  }

  function formatTime(seconds) {
    seconds = Math.max(0, Math.round(seconds || 0));
    return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
  }

  function categories() {
    return [...new Set(allQuestions().map(q => q.category).filter(Boolean))].sort((a,b) => a.localeCompare(b));
  }

  function updateDashboard() {
    const qs = allQuestions();
    const records = loadProgress().records || {};
    const seen = Object.values(records).filter(r => r && r.attempts);
    const answered = seen.reduce((n,r) => n + (r.attempts || 0), 0);
    const correct = seen.reduce((n,r) => n + (r.correct || 0), 0);
    const wrong = seen.reduce((n,r) => n + (r.wrong || 0), 0);

    $('statAnswered').textContent = answered;
    $('statCorrect').textContent = correct;
    $('statWrong').textContent = wrong;
    $('statAccuracy').textContent = answered ? Math.round(correct / answered * 100) + '%' : '—';
    $('heroQuestionCount').textContent = qs.length;
    $('wrongCountText').textContent = qs.filter(q => statusOf(q) === 'wrong').length + ' questions';
    $('correctCountText').textContent = qs.filter(q => statusOf(q) === 'correct').length + ' questions';

    const map = {};
    qs.forEach(q => {
      const r = records[q.id];
      if (r?.attempts) {
        map[q.category] ??= { a: 0, c: 0 };
        map[q.category].a += r.attempts;
        map[q.category].c += r.correct || 0;
      }
    });

    $('categoryPreview').innerHTML = Object.keys(map).length
      ? Object.entries(map).sort((a,b) => a[0].localeCompare(b[0])).map(([cat,x]) => {
          const pct = Math.round(x.c / x.a * 100);
          return `<div class="cat-row"><div><div class="cat-name">${esc(cat)} <span style="color:#64758d">(${x.c}/${x.a})</span></div><div class="cat-track"><div class="cat-fill" style="width:${pct}%"></div></div></div><div class="cat-score">${pct}%</div></div>`;
        }).join('')
      : '<div class="empty">Aún no hay rendimiento por categoría.</div>';
  }

  function openSetup(mode, reviewIds = null) {
    state.mode = mode;
    state.reviewIds = reviewIds;
    state.selectedCategories = new Set();
    state.difficulty = 'all';
    state.desiredCount = Math.min(10, Math.max(1, allQuestions().length));
    $('setupEyebrow').textContent = mode === 'training' ? 'TRAINING MODE' : 'REAL TEST';
    $('setupTitle').textContent = mode === 'training' ? 'Build your session' : 'Simulate the board';
    $('setupDescription').textContent = mode === 'training'
      ? 'Feedback inmediato, explicación de todas las opciones y guardado automático.'
      : 'Examen cronometrado: 60 segundos por pregunta, sin feedback hasta finalizar.';
    renderCategoryFilters();
    $('trainingTimeGrid').style.display = mode === 'training' ? 'grid' : 'none';
    $('testTimeInfo').textContent = mode === 'training' ? 'Choose your pace.' : 'Test timing: 60 seconds per question.';
    updateCount();
    showView('setupView');
  }

  function renderCategoryFilters() {
    const container = $('categoryFilters');
    if (!container) return;
    const cats = categories();
    container.innerHTML = '<button class="chip active" data-cat="all">All</button>' + cats.map(c => `<button class="chip" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
    container.querySelectorAll('[data-cat]').forEach(btn => btn.addEventListener('click', () => {
      if (btn.dataset.cat === 'all') {
        state.selectedCategories.clear();
        container.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
      } else {
        const allBtn = container.querySelector('[data-cat="all"]');
        allBtn?.classList.remove('active');
        if (state.selectedCategories.has(btn.dataset.cat)) state.selectedCategories.delete(btn.dataset.cat);
        else state.selectedCategories.add(btn.dataset.cat);
        btn.classList.toggle('active', state.selectedCategories.has(btn.dataset.cat));
        if (!state.selectedCategories.size) allBtn?.classList.add('active');
      }
      updateCount();
    }));
  }

  function updateCount() {
    const n = filteredQuestions().length;
    state.desiredCount = Math.max(1, Math.min(state.desiredCount, n || 1));
    $('questionCount').textContent = state.desiredCount;
  }

  function filteredQuestions() {
    let qs = allQuestions();
    if (Array.isArray(state.reviewIds)) qs = qs.filter(q => state.reviewIds.includes(q.id));
    if (state.selectedCategories.size) qs = qs.filter(q => state.selectedCategories.has(q.category));
    if (state.difficulty !== 'all') qs = qs.filter(q => q.difficulty === state.difficulty);
    return qs;
  }

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function startSession() {
    let qs = filteredQuestions();
    if (!qs.length) { alert('No hay preguntas con estos filtros.'); return; }
    qs = shuffle(qs).slice(0, Math.min(state.desiredCount, qs.length));
    state.questions = qs;
    state.index = 0;
    state.answers = [];
    state.sessionStartedAt = Date.now();
    state.elapsed = 0;
    if (state.mode === 'test') state.secondsPerQuestion = 60;
    showView('quizView');
    renderQuestion();
  }

  function startTimer() {
    clearInterval(state.timerId);
    state.remaining = state.secondsPerQuestion;
    state.questionStartedAt = Date.now();
    updateTimer();
    state.timerId = setInterval(() => {
      state.remaining -= 1;
      updateTimer();
      if (state.remaining <= 0) {
        clearInterval(state.timerId);
        timeOut();
      }
    }, 1000);
  }

  function updateTimer() {
    const timer = $('timer');
    timer.textContent = formatTime(state.remaining);
    timer.classList.toggle('warning', state.remaining <= 20 && state.remaining > 10);
    timer.classList.toggle('danger', state.remaining <= 10);
  }

  function timeOut() {
    if (state.mode === 'training') answerQuestion(null, true);
    else submitCurrent(null, true);
  }

  function renderQuestion() {
    const q = state.questions[state.index];
    if (!q) return;
    $('modeBadge').textContent = state.mode === 'training' ? 'TRAINING' : 'REAL TEST';
    $('progressText').textContent = `${state.index + 1} / ${state.questions.length}`;
    $('progressBar').style.width = ((state.index + 1) / state.questions.length * 100) + '%';
    $('categoryTag').textContent = q.category || 'Uncategorized';
    $('difficultyTag').textContent = q.difficulty || 'Core';
    $('questionId').textContent = q.id || '';
    $('questionText').textContent = q.question || '';
    $('feedback').classList.add('hidden');
    $('nextBtn').disabled = true;
    $('skipBtn').disabled = false;

    const options = Array.isArray(q.options) ? q.options : [];
    $('options').innerHTML = options.map((o,i) => `<button class="option" data-i="${i}"><span class="option-letter">${LETTERS[i] || ''}</span><span class="option-copy">${esc(o.text)}</span></button>`).join('');
    $('options').querySelectorAll('.option').forEach(btn => btn.addEventListener('click', () => answerQuestion(Number(btn.dataset.i), false)));

    if (state.answers[state.index]) restoreAnswer(state.answers[state.index]);
    else startTimer();
  }

  function restoreAnswer(answer) {
    const q = state.questions[state.index];
    const btns = [...$('options').querySelectorAll('.option')];
    btns.forEach((btn,i) => {
      btn.disabled = true;
      btn.classList.toggle('correct', i === q.answer);
      btn.classList.toggle('incorrect', i === answer.selected && i !== q.answer);
    });
    $('nextBtn').disabled = false;
    $('skipBtn').disabled = true;
    if (state.mode === 'training') showFeedback(q, answer.selected, answer.selected === null);
  }

  function answerQuestion(selected, timedOut = false) {
    if (state.answers[state.index]) return;
    const q = state.questions[state.index];
    const timeSpent = Math.min(state.secondsPerQuestion, Math.max(0, Math.round((Date.now() - state.questionStartedAt) / 1000)));
    const correct = selected !== null && selected === q.answer;
    state.answers[state.index] = { selected, correct, timeSpent };
    recordAnswer(q, correct, timeSpent, selected);
    clearInterval(state.timerId);

    [...$('options').querySelectorAll('.option')].forEach((btn,i) => {
      btn.disabled = true;
      btn.classList.toggle('correct', i === q.answer);
      btn.classList.toggle('incorrect', i === selected && i !== q.answer);
    });
    $('nextBtn').disabled = false;
    $('skipBtn').disabled = true;
    if (state.mode === 'training') showFeedback(q, selected, timedOut);
  }

  function submitCurrent(selected, timedOut = false) {
    if (state.answers[state.index]) return;
    const q = state.questions[state.index];
    const timeSpent = selected === null ? state.secondsPerQuestion : Math.round((Date.now() - state.questionStartedAt) / 1000);
    const correct = selected !== null && selected === q.answer;
    state.answers[state.index] = { selected, correct, timeSpent };
    recordAnswer(q, correct, timeSpent, selected);
    clearInterval(state.timerId);
    if (timedOut) nextQuestion();
  }

  function showFeedback(q, selected, timedOut = false) {
    const title = timedOut ? 'Time expired' : selected === q.answer ? 'Correct' : 'Incorrect';
    $('feedback').innerHTML = `<div class="feedback-title">${title} · ${esc(q.concept || 'Key concept')}</div><div class="feedback-grid">${q.options.map((o,i) => `<div class="feedback-item ${i === q.answer ? 'correct' : ''} ${i === selected && i !== q.answer ? 'user-wrong' : ''}"><strong>${LETTERS[i]} · ${i === q.answer ? 'CORRECT ANSWER' : 'OPTION'}</strong><p>${esc(o.explanation || '')}</p></div>`).join('')}</div>`;
    $('feedback').classList.remove('hidden');
  }

  function nextQuestion() {
    if (state.index >= state.questions.length - 1) { finishSession(); return; }
    state.index += 1;
    renderQuestion();
  }

  function finishSession() {
    clearInterval(state.timerId);
    state.elapsed = Math.round((Date.now() - state.sessionStartedAt) / 1000);
    showResults();
  }

  function showResults() {
    const total = state.questions.length || 1;
    const correct = state.answers.filter(a => a?.correct).length;
    const wrong = state.answers.filter(a => a && !a.correct).length;
    const unanswered = total - correct - wrong;
    const pct = Math.round(correct / total * 100);

    $('resultsTitle').textContent = state.mode === 'training' ? 'Training complete' : 'Test complete';
    $('scorePercent').textContent = pct + '%';
    $('resultCorrect').textContent = correct;
    $('resultWrong').textContent = wrong;
    $('resultUnanswered').textContent = unanswered;
    $('resultTime').textContent = formatTime(state.elapsed);

    const map = {};
    state.questions.forEach((q,i) => {
      map[q.category] ??= { total: 0, correct: 0 };
      map[q.category].total += 1;
      if (state.answers[i]?.correct) map[q.category].correct += 1;
    });
    $('categoryResults').innerHTML = Object.entries(map).map(([cat,c]) => {
      const p = Math.round(c.correct / c.total * 100);
      return `<div class="cat-row"><div><div class="cat-name">${esc(cat)} <span style="color:#64758d">(${c.correct}/${c.total})</span></div><div class="cat-track"><div class="cat-fill" style="width:${p}%"></div></div></div><div class="cat-score">${p}%</div></div>`;
    }).join('');

    $('questionResults').innerHTML = state.questions.map((q,i) => {
      const a = state.answers[i];
      const good = !!a?.correct;
      return `<div class="review-item"><span class="review-icon ${good ? 'good' : 'bad'}">${good ? '✓' : '×'}</span><span class="review-q">${i+1}. ${esc(q.question)}</span><span class="review-time">${a?.timeSpent ?? 0}s</span></div>`;
    }).join('');
    showView('resultsView');
  }

  function renderBank() {
    const qs = allQuestions();
    const records = loadProgress().records || {};
    $('bankTotal').textContent = qs.length;
    $('bankCustom').textContent = customQuestions().length;
    $('bankWrong').textContent = qs.filter(q => records[q.id]?.last === 'wrong').length;
    $('bankCorrect').textContent = qs.filter(q => records[q.id]?.last === 'correct').length;

    const select = $('bankCategory');
    const current = select.value;
    select.innerHTML = '<option value="all">All categories</option>' + categories().map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    select.value = categories().includes(current) ? current : 'all';

    const search = $('bankSearch').value.toLowerCase().trim();
    const category = select.value;
    const status = $('bankStatus').value;
    const filtered = qs.filter(q => {
      const hit = !search || `${q.id} ${q.question} ${q.concept || ''} ${q.category}`.toLowerCase().includes(search);
      return hit && (category === 'all' || q.category === category) && (status === 'all' || statusOf(q) === status);
    });

    $('bankList').innerHTML = filtered.length ? filtered.map(q => {
      const st = statusOf(q);
      return `<div class="bank-item"><div class="bank-badge">${esc(q.id)}</div><div><div class="bank-title">${esc(q.question)}</div><div class="bank-meta">${esc(q.category)} · ${esc(q.difficulty || '')} · ${st === 'wrong' ? 'Needs review' : st === 'correct' ? 'Correct' : 'Unseen'}</div></div><div class="bank-item-actions"><button class="mini" data-review="${esc(q.id)}">Practice</button></div></div>`;
    }).join('') : '<div class="empty">No questions match your filters.</div>';

    $('bankList').querySelectorAll('[data-review]').forEach(btn => btn.addEventListener('click', () => startReview(btn.dataset.review)));
  }

  function startReview(id) {
    state.mode = 'training';
    state.reviewIds = [id];
    state.selectedCategories.clear();
    state.difficulty = 'all';
    state.desiredCount = 1;
    state.secondsPerQuestion = 60;
    startSession();
  }

  function exportBank() {
    const payload = { version: 3, createdAt: new Date().toISOString(), questions: allQuestions() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'echo-board-question-bank-v3.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function validQuestion(q) {
    return !!(q && q.id && q.category && q.difficulty && q.question && Array.isArray(q.options) && q.options.length >= 3 && q.options.length <= 7 && q.options.every(o => o && o.text && o.explanation) && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length);
  }

  function importBank(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result);
        const incoming = Array.isArray(raw) ? raw : raw.questions;
        if (!Array.isArray(incoming)) throw new Error('Formato inválido');
        const valid = incoming.filter(validQuestion);
        const existing = customQuestions();
        const map = new Map([...existing, ...valid].map(q => [q.id, q]));
        localStorage.setItem(CUSTOM_KEY, JSON.stringify([...map.values()]));
        alert(`${valid.length} preguntas importadas/actualizadas.`);
        renderBank(); updateDashboard();
      } catch (error) { alert('No se pudo importar: ' + error.message); }
    };
    reader.readAsText(file);
  }

  function renderOptionEditor(count = 4) {
    count = Math.max(3, Math.min(7, Number(count) || 4));
    $('optionEditor').innerHTML = LETTERS.slice(0, count).map(letter => `<div class="option-row"><span>${letter}</span><input data-opt-text="${letter}" placeholder="Option ${letter}" required><input data-opt-exp="${letter}" placeholder="Why is this option correct/incorrect?" required></div>`).join('');
    $('answerSelect').innerHTML = LETTERS.slice(0, count).map((letter,i) => `<option value="${i}">${letter}</option>`).join('');
  }

  function openModal() {
    const id = 'CUSTOM-' + String(customQuestions().length + 1).padStart(3, '0');
    $('questionForm').reset();
    $('questionForm').elements.id.value = id;
    $('optionCount').value = '4';
    renderOptionEditor(4);
    $('questionModal').classList.remove('hidden');
  }

  function closeModal() { $('questionModal').classList.add('hidden'); }

  function bindEvents() {
    $('beginSession').onclick = startSession;
    $('setupBack').onclick = () => showView('homeView');
    $('quizQuit').onclick = () => { clearInterval(state.timerId); showView('homeView'); };
    $('skipBtn').onclick = () => {
      if (state.mode === 'training') answerQuestion(null, false);
      else submitCurrent(null, false);
      nextQuestion();
    };
    $('nextBtn').onclick = nextQuestion;
    $('resultsHome').onclick = () => showView('homeView');
    $('resultsAgain').onclick = () => openSetup(state.mode);
    $('countMinus').onclick = () => { state.desiredCount -= 1; updateCount(); };
    $('countPlus').onclick = () => { state.desiredCount += 1; updateCount(); };

    document.querySelectorAll('[data-difficulty]').forEach(btn => btn.onclick = () => {
      state.difficulty = btn.dataset.difficulty;
      document.querySelectorAll('[data-difficulty]').forEach(x => x.classList.toggle('active', x === btn));
      updateCount();
    });
    document.querySelectorAll('[data-mode]').forEach(btn => btn.onclick = () => openSetup(btn.dataset.mode));
    document.querySelectorAll('[data-view]').forEach(btn => btn.onclick = () => showView(btn.dataset.view));

    $('reviewWrong').onclick = () => {
      const ids = allQuestions().filter(q => statusOf(q) === 'wrong').map(q => q.id);
      ids.length ? openSetup('training', ids) : alert('No hay preguntas incorrectas guardadas.');
    };
    $('reviewCorrect').onclick = () => {
      const ids = allQuestions().filter(q => statusOf(q) === 'correct').map(q => q.id);
      ids.length ? openSetup('training', ids) : alert('No hay preguntas correctas guardadas.');
    };
    $('resetProgress').onclick = () => {
      if (confirm('Reset all progress and custom questions?')) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CUSTOM_KEY);
        updateDashboard(); renderBank();
      }
    };
    $('toggleTheme').onclick = () => document.body.classList.toggle('light');
    $('bankSearch').oninput = renderBank;
    $('bankCategory').onchange = renderBank;
    $('bankStatus').onchange = renderBank;
    $('openAddQuestion').onclick = openModal;
    $('closeQuestionModal').onclick = closeModal;
    $('importBankBtn').onclick = () => $('importBankInput').click();
    $('importBankInput').onchange = e => { if (e.target.files[0]) importBank(e.target.files[0]); };
    $('exportBank').onclick = exportBank;
    document.querySelectorAll('.time-option').forEach(btn => btn.onclick = () => {
      state.secondsPerQuestion = Number(btn.dataset.seconds) || 60;
      document.querySelectorAll('.time-option').forEach(x => x.classList.toggle('active', x === btn));
    });
    $('optionCount').onchange = e => renderOptionEditor(Number(e.target.value));

    $('questionForm').onsubmit = e => {
      e.preventDefault();
      const form = new FormData(e.target);
      const count = Number(form.get('optionCount') || 4);
      const options = LETTERS.slice(0, count).map(letter => ({
        text: document.querySelector(`[data-opt-text="${letter}"]`).value.trim(),
        explanation: document.querySelector(`[data-opt-exp="${letter}"]`).value.trim()
      }));
      const q = {
        id: String(form.get('id') || '').trim(),
        category: String(form.get('category') || '').trim(),
        difficulty: String(form.get('difficulty') || 'Core'),
        question: String(form.get('question') || '').trim(),
        options,
        answer: Number(form.get('answer')),
        concept: String(form.get('concept') || '').trim() || 'Custom question',
        sourceNote: 'User-added question'
      };
      if (!validQuestion(q)) { alert('Completa todos los campos y verifica la respuesta correcta.'); return; }
      if (allQuestions().some(x => x.id === q.id)) { alert('Ese ID ya existe. Usa otro ID.'); return; }
      const custom = customQuestions();
      custom.push(q);
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom));
      closeModal(); renderBank(); updateDashboard();
    };
  }

  function init() {
    bindEvents();
    renderOptionEditor(4);
    updateDashboard();
    renderBank();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
