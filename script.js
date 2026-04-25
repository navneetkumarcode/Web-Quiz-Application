(() => {
	"use strict";

	// Elements
	const el = {
		screens: {
			home: document.getElementById("screen-home"),
			quiz: document.getElementById("screen-quiz"),
			results: document.getElementById("screen-results")
		},
		home: {
			category: document.getElementById("select-category"),
			difficulty: document.getElementById("select-difficulty"),
			numQuestions: document.getElementById("input-num-questions"),
			timeLimit: document.getElementById("input-time-limit"),
			btnStart: document.getElementById("btn-start")
		},
		header: {
			btnHome: document.getElementById("btn-home"),
			btnSettings: document.getElementById("btn-settings"),
			btnLogout: document.getElementById("btn-logout")
		},
		settings: {
			panel: document.getElementById("settings-panel"),
			btnClose: document.getElementById("btn-close-settings"),
			shuffle: document.getElementById("setting-shuffle"),
			audio: document.getElementById("setting-audio"),
			contrast: document.getElementById("setting-contrast")
		},
		quiz: {
			progress: document.getElementById("progress"),
			timer: document.getElementById("timer"),
			questionText: document.getElementById("question-text"),
			answers: document.getElementById("answers"),
			btnPrev: document.getElementById("btn-prev"),
			btnNext: document.getElementById("btn-next"),
			btnSubmit: document.getElementById("btn-submit"),
			btnFlag: document.getElementById("btn-flag")
		},
		results: {
			summary: document.getElementById("results-summary"),
			btnReview: document.getElementById("btn-review"),
			btnRetry: document.getElementById("btn-retry"),
			reviewList: document.getElementById("review-list")
		},
		year: document.getElementById("year")
	};

	// Utilities
	const storageKey = "web-quiz-app:v1";
	function saveState(partial) {
		const current = loadState();
		localStorage.setItem(storageKey, JSON.stringify({ ...current, ...partial }));
	}
	function loadState() {
		try {
			return JSON.parse(localStorage.getItem(storageKey)) || {};
		} catch {
			return {};
		}
	}
	function shuffleInPlace(list) {
		for (let i = list.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[list[i], list[j]] = [list[j], list[i]];
		}
		return list;
	}
	function formatTime(totalSeconds) {
		if (totalSeconds == null || Number.isNaN(totalSeconds)) return "--:--";
		const m = Math.floor(totalSeconds / 60);
		const s = totalSeconds % 60;
		return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	}

	// App State
	const app = {
		settings: {
			shuffle: false,
			audio: false,
			highContrast: false
		},
		config: {
			category: "any",
			difficulty: "any",
			numQuestions: 10,
			timeLimitMinutes: 0
		},
		history: [],
		questions: [],
		currentIndex: 0,
		answers: [], // number | null (selected index)
		//flagged: new Set(),
		startTimestamp: null,
		remainingSeconds: null,
		timerId: null,
		completed: false
	};

	function applyHighContrast(enabled) {
		document.documentElement.classList.toggle("high-contrast", !!enabled);
	}

	function restoreFromStorage() {
		const state = loadState();
		if (state.settings) {
			app.settings = { ...app.settings, ...state.settings };
		}
		if (state.config) {
			app.config = { ...app.config, ...state.config };
		}
		if (state.history) {
			app.history = state.history;
		}
		// Apply UI from restored state
		el.settings.shuffle.checked = !!app.settings.shuffle;
		el.settings.audio.checked = !!app.settings.audio;
		el.settings.contrast.checked = !!app.settings.highContrast;
		el.home.category.value = app.config.category || "any";
		el.home.difficulty.value = app.config.difficulty || "any";
		el.home.numQuestions.value = String(app.config.numQuestions || 10);
		el.home.timeLimit.value = String(app.config.timeLimitMinutes || 0);
		applyHighContrast(app.settings.highContrast);
	}

	function screen(name) {
		for (const key of Object.keys(el.screens)) {
			el.screens[key].classList.toggle("hidden", key !== name);
		}
	}

	function filterQuestions(all) {
		let filtered = all.slice();
		if (app.config.category !== "any") {
			filtered = filtered.filter(q => q.category === app.config.category);
		}
		if (app.config.difficulty !== "any") {
			filtered = filtered.filter(q => q.difficulty === app.config.difficulty);
		}
		if (app.settings.shuffle) shuffleInPlace(filtered);
		return filtered.slice(0, app.config.numQuestions);
	}

	function startQuiz() {
		const all = Array.isArray(window.DEFAULT_QUESTIONS) ? window.DEFAULT_QUESTIONS : [];
		app.questions = filterQuestions(all);
		app.currentIndex = 0;
		app.answers = Array(app.questions.length).fill(null);
		app.flagged = new Set();
		app.completed = false;

		// Timer
		const limitMinutes = Number(el.home.timeLimit.value) || 0;
		app.config.timeLimitMinutes = limitMinutes;
		if (limitMinutes > 0) {
			app.remainingSeconds = limitMinutes * 60;
			if (app.timerId) clearInterval(app.timerId);
			app.timerId = setInterval(() => {
				app.remainingSeconds -= 1;
				updateTimer();
				if (app.remainingSeconds <= 0) {
					clearInterval(app.timerId);
					app.timerId = null;
					submitQuiz();
				}
			}, 1000);
		} else {
			if (app.timerId) clearInterval(app.timerId);
			app.timerId = null;
			app.remainingSeconds = null;
		}
		app.startTimestamp = Date.now();

		saveState({ config: app.config, settings: app.settings });
		updateQuizUI();
		screen("quiz");
	}

	function updateProgress() {
		el.quiz.progress.textContent = `Q ${app.currentIndex + 1}/${app.questions.length || 0}`;
	}
	function updateTimer() {
		el.quiz.timer.textContent = formatTime(app.remainingSeconds);
	}

	function renderQuestion() {
		const q = app.questions[app.currentIndex];
		if (!q) return;
		el.quiz.questionText.textContent = q.question;
		el.quiz.answers.innerHTML = "";
		el.quiz.answers.setAttribute("aria-activedescendant", "");
		const selectedIndex = app.answers[app.currentIndex];
		q.choices.forEach((choice, idx) => {
			const li = document.createElement("li");
			li.className = "answer";
			li.setAttribute("role", "option");
			li.setAttribute("tabindex", "0");
			li.setAttribute("data-index", String(idx));
			li.setAttribute("aria-selected", selectedIndex === idx ? "true" : "false");
			li.innerHTML = `
				<input type="radio" name="answer" ${selectedIndex === idx ? "checked" : ""} aria-hidden="true" />
				<div class="text">${choice}</div>
			`;
			li.addEventListener("click", () => selectAnswer(idx));
			li.addEventListener("keydown", onAnswerKeydown);
			el.quiz.answers.appendChild(li);
		});
	}

	function onAnswerKeydown(e) {
		const current = document.activeElement;
		if (!current || !current.classList.contains("answer")) return;
		const idx = parseInt(current.getAttribute("data-index"), 10);
		switch (e.key) {
			case " ":
			case "Enter":
				selectAnswer(idx);
				e.preventDefault();
				break;
			case "ArrowDown":
			case "ArrowRight":
				focusAnswer(Math.min(idx + 1, el.quiz.answers.children.length - 1));
				e.preventDefault();
				break;
			case "ArrowUp":
			case "ArrowLeft":
				focusAnswer(Math.max(idx - 1, 0));
				e.preventDefault();
				break;
		}
	}
	function focusAnswer(idx) {
		const target = el.quiz.answers.children[idx];
		if (target) target.focus();
	}

	function selectAnswer(idx) {
		app.answers[app.currentIndex] = idx;
		Array.from(el.quiz.answers.children).forEach((node, i) => {
			node.setAttribute("aria-selected", i === idx ? "true" : "false");
			const input = node.querySelector('input[type="radio"]');
			if (input) input.checked = i === idx;
		});
		updateNavButtons();
	}

	function updateNavButtons() {
		el.quiz.btnPrev.disabled = app.currentIndex === 0;
		const atLast = app.currentIndex === app.questions.length - 1;
		el.quiz.btnNext.classList.toggle("hidden", atLast);
		el.quiz.btnSubmit.classList.toggle("hidden", !atLast);
		el.quiz.btnFlag.setAttribute("aria-pressed", app.flagged.has(app.currentIndex) ? "true" : "false");
	}

	function updateQuizUI() {
		updateProgress();
		updateTimer();
		renderQuestion();
		updateNavButtons();
	}

	function prevQuestion() {
		if (app.currentIndex > 0) {
			app.currentIndex -= 1;
			updateQuizUI();
		}
	}
	function nextQuestion() {
		if (app.currentIndex < app.questions.length - 1) {
			app.currentIndex += 1;
			updateQuizUI();
		}
	}
	function toggleFlag() {
		if (app.flagged.has(app.currentIndex)) app.flagged.delete(app.currentIndex);
		else app.flagged.add(app.currentIndex);
		updateNavButtons();
	}

	function computeScore() {
		let correct = 0;
		app.questions.forEach((q, i) => {
			if (app.answers[i] === q.answerIndex) correct += 1;
		});
		return { correct, total: app.questions.length };
	}

	function submitQuiz() {
		if (app.completed) return;
		app.completed = true;
		if (app.timerId) {
			clearInterval(app.timerId);
			app.timerId = null;
		}
		const { correct, total } = computeScore();
		const percent = total ? Math.round((correct / total) * 100) : 0;
		el.results.summary.textContent = `You scored ${correct} out of ${total} (${percent}%).`;
		// Calculate time taken
		const timeTaken = app.startTimestamp ? Math.round((Date.now() - app.startTimestamp) / 1000) : 0;
		// Save to history
		const wrongQuestions = app.questions.map((q, i) => {
			if (app.answers[i] !== q.answerIndex) {
				return {
					question: q.question,
					correct: q.choices[q.answerIndex],
					user: app.answers[i] != null ? q.choices[app.answers[i]] : 'No answer',
					category: q.category
				};
			}
			return null;
		}).filter(item => item !== null);
		app.history.push({
			correct,
			total,
			percent,
			date: new Date().toISOString(),
			category: app.config.category,
			difficulty: app.config.difficulty,
			timeTaken,
			wrongQuestions
		});
		saveState({ history: app.history });
		screen("results");
		buildReview();
	}

	function buildReview() {
		el.results.reviewList.innerHTML = "";
		app.questions.forEach((q, i) => {
			const userIdx = app.answers[i];
			const correct = userIdx === q.answerIndex;
			const item = document.createElement("div");
			item.className = "review-item";
			const flagged = app.flagged.has(i) ? '<span class="flagged"> (flagged)</span>' : "";
			const userAnswer = userIdx != null ? q.choices[userIdx] : "No answer";
			item.innerHTML = `
				<div><strong>Q${i + 1}.</strong> ${q.question}${flagged}</div>
				<div class="meta">Your answer: ${userAnswer}</div>
				<div class="meta">Correct answer: ${q.choices[q.answerIndex]}</div>
			`;
			el.results.reviewList.appendChild(item);
		});
		el.results.reviewList.classList.remove("hidden");
	}

	// Event wiring
	function bindEvents() {
		// Header
		el.header.btnHome.addEventListener("click", () => screen("home"));
		el.header.btnSettings.addEventListener("click", () => {
			const expanded = el.header.btnSettings.getAttribute("aria-expanded") === "true";
			el.header.btnSettings.setAttribute("aria-expanded", expanded ? "false" : "true");
			el.settings.panel.classList.toggle("hidden", expanded);
		});
		el.header.btnLogout.addEventListener("click", () => {
			localStorage.removeItem('username');
			window.location.href = 'login.html';
		});

		// Settings
		el.settings.btnClose.addEventListener("click", () => {
			el.header.btnSettings.setAttribute("aria-expanded", "false");
			el.settings.panel.classList.add("hidden");
		});
		el.settings.shuffle.addEventListener("change", e => {
			app.settings.shuffle = e.target.checked;
			saveState({ settings: app.settings });
		});
		el.settings.audio.addEventListener("change", e => {
			app.settings.audio = e.target.checked;
			saveState({ settings: app.settings });
		});
		el.settings.contrast.addEventListener("change", e => {
			app.settings.highContrast = e.target.checked;
			saveState({ settings: app.settings });
			applyHighContrast(app.settings.highContrast);
		});

		// Home
		el.home.btnStart.addEventListener("click", () => {
			app.config.category = el.home.category.value;
			app.config.difficulty = el.home.difficulty.value;
			app.config.numQuestions = Math.max(3, Math.min(20, Number(el.home.numQuestions.value) || 10));
			app.config.timeLimitMinutes = Math.max(0, Math.min(60, Number(el.home.timeLimit.value) || 0));
			saveState({ config: app.config });
			startQuiz();
		});

		// Quiz controls
		el.quiz.btnPrev.addEventListener("click", prevQuestion);
		el.quiz.btnNext.addEventListener("click", nextQuestion);
		el.quiz.btnSubmit.addEventListener("click", submitQuiz);
		el.quiz.btnFlag.addEventListener("click", toggleFlag);

		// Results
		el.results.btnRetry.addEventListener("click", () => {
			screen("home");
		});
		el.results.btnReview.addEventListener("click", () => {
			el.results.reviewList.classList.toggle("hidden");
		});

		// Keyboard shortcuts
		document.addEventListener("keydown", e => {
			const onQuiz = !el.screens.quiz.classList.contains("hidden");
			if (!onQuiz || app.completed) return;
			if (e.key >= "1" && e.key <= "9") {
				const idx = Number(e.key) - 1;
				if (idx < (el.quiz.answers.children.length || 0)) {
					selectAnswer(idx);
				}
			} else if (e.key === "ArrowRight") {
				nextQuestion();
			} else if (e.key === "ArrowLeft") {
				prevQuestion();
			}
		});
	}

	function init() {
		el.year.textContent = String(new Date().getFullYear());
		restoreFromStorage();
		bindEvents();
		screen("home");
	}

	// Boot
	init();
})();


