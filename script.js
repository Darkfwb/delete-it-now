const QUIZ_QUESTIONS_COUNT = 10;
const QUICK_QUIZ_GRADES = 12;
const RANKED_UNLOCK_POINTS = 200;
const RANKED_POINT_VALUE = 15;
const MASTER_QUESTIONS_COUNT = 20;

let userName = "";
let userGrade = 1;
let score = 0;
let total = 0;
let currentTestQuestions = [];
let currentQuestionIndex = 0;
let currentQuestion = {};

let quickQuizQuestions = [];
let quickQuizIndex = 0;
let quickQuizScore = 0;

let rankedQuestions = [];
let rankedIndex = 0;
let rankedScore = 0;
let rankedActive = false;

let rankedTotalPoints = 0;

let masterRankedQuestions = [];
let masterRankedIndex = 0;
let masterRankedScore = 0;
let masterRankedActive = false;

function generateQuestionsForGrade(grade) {
  const questions = [];
  for (let i = 0; i < 50; i++) {
    let a = Math.floor(Math.random() * (10 + grade * 2)) + 1;
    let b = Math.floor(Math.random() * (10 + grade * 2)) + 1;
    if (grade <= 4) {
      questions.push({ q: `${a} + ${b} =`, a: (a + b).toString() });
      questions.push({ q: `${a + b} - ${a} =`, a: b.toString() });
    } else if (grade <= 6) {
      questions.push({ q: `${a} × ${b} =`, a: (a * b).toString() });
      questions.push({ q: `${a * b} ÷ ${a} =`, a: b.toString() });
    } else if (grade <= 8) {
      questions.push({ q: `What is ${a}²?`, a: (a * a).toString() });
      questions.push({ q: `√${a * a} =`, a: a.toString() });
    } else if (grade <= 10) {
      questions.push({ q: `Solve: x + ${a} = ${a + b}, x = ?`, a: b.toString() });
      questions.push({ q: `What is ${a} × ${b} - ${a}?`, a: (a * b - a).toString() });
    } else {
      questions.push({ q: `What is the derivative of x^${grade}?`, a: `${grade}x^${grade - 1}` });
      questions.push({ q: `What is the integral of ${grade}x dx?`, a: `${grade / 2}x^2 + C` });
    }
  }
  return questions.slice(0, 100);
}

const questionsByGrade = {};
for (let g = 1; g <= 12; g++) {
  questionsByGrade[g] = generateQuestionsForGrade(g);
}

function startQuickQuiz() {
  quickQuizQuestions = [];
  for (let g = 1; g <= QUICK_QUIZ_GRADES; g++) {
    const arr = shuffleArray(questionsByGrade[g]);
    if (arr.length > 0) quickQuizQuestions.push(arr[0]);
  }
  quickQuizIndex = 0;
  quickQuizScore = 0;
  hideSections();
  showSection("quickQuizSection");
  setText("quickQuizResult", "");
  nextQuickQuizQuestion();
}

function nextQuickQuizQuestion() {
  if (quickQuizIndex >= quickQuizQuestions.length) {
    endQuickQuiz();
    return;
  }
  const q = quickQuizQuestions[quickQuizIndex];
  setText("quickQuestion", `Grade ${quickQuizIndex + 1}: ${q.q}`);
  setValue("quickAnswer", "");
  setText("quickFeedback", "");
  setText("quickScore", `Score: ${quickQuizScore}/${quickQuizIndex}`);
}

function submitQuickAnswer() {
  const userAnswer = getValue("quickAnswer").trim();
  const q = quickQuizQuestions[quickQuizIndex];
  if (userAnswer.toLowerCase() === q.a.toLowerCase()) {
    quickQuizScore++;
    setFeedback("quickFeedback", "Correct!", "green");
  } else {
    setFeedback("quickFeedback", `Wrong! Correct answer: ${q.a}`, "red");
  }
  setText("quickScore", `Score: ${quickQuizScore}/${quickQuizIndex + 1}`);
  quickQuizIndex++;
  setTimeout(nextQuickQuizQuestion, 1000);
}

function endQuickQuiz() {
  hideSections();
  showSection("startForm");
  setHTML("quickQuizResult", `<b>Estimated grade:</b> ${quickQuizScore} <br>Your score: ${quickQuizScore}/${QUICK_QUIZ_GRADES}`);
}

function startRanked() {
  rankedQuestions = [];
  for (let g = 8; g <= 12; g++) {
    rankedQuestions = rankedQuestions.concat(questionsByGrade[g]);
  }
  rankedQuestions = shuffleArray(rankedQuestions);
  rankedIndex = 0;
  rankedScore = 0;
  rankedActive = true;
  hideSections();
  showSection("rankedSection");
  setText("rankedResult", "");
  nextRankedQuestion();
}

function nextRankedQuestion() {
  if (!rankedActive || rankedIndex >= rankedQuestions.length) {
    endRanked();
    return;
  }
  const q = rankedQuestions[rankedIndex];
  setText("rankedQuestion", q.q);
  setValue("rankedAnswer", "");
  setText("rankedFeedback", "");
  setText("rankedScore", `Ranked Points: ${rankedScore}`);
}

function submitRankedAnswer() {
  const userAnswer = getValue("rankedAnswer").trim();
  const q = rankedQuestions[rankedIndex];
  if (userAnswer.toLowerCase() === q.a.toLowerCase()) {
    rankedScore += RANKED_POINT_VALUE;
    setFeedback("rankedFeedback", `Correct! +${RANKED_POINT_VALUE} points`, "green");
    rankedIndex++;
    setTimeout(nextRankedQuestion, 800);
  } else {
    setFeedback("rankedFeedback", `Wrong! Correct answer: ${q.a}`, "red");
    rankedActive = false;
    setTimeout(endRanked, 1200);
  }
}

function endRanked() {
  hideSections();
  showSection("startForm");
  rankedTotalPoints = getRankedPoints() + rankedScore;
  saveRankedPoints(rankedTotalPoints);
  setHTML("rankedResult", `<b>Your ranked score:</b> ${rankedScore} points<br>Total: ${rankedTotalPoints}`);
  updateMasterRankedButton();
}

function generateMasterQuestions() {
  const arr = [];
  for (let g = 11; g <= 12; g++) {
    for (let i = 0; i < 50; i++) {
      let correct, options;
      if (g === 11) {
        correct = `${g}x^${g - 1}`;
        options = [
          correct,
          `${g - 1}x^${g}`,
          `${g}x^${g}`,
          `${g - 1}x^${g - 1}`
        ];
        arr.push({
          q: `What is the derivative of x^${g}?`,
          options: shuffleArray(options),
          a: correct
        });
      } else {
        correct = `${g / 2}x^2 + C`;
        options = [
          correct,
          `${g}x^2 + C`,
          `${g / 2}x + C`,
          `${g}x + C`
        ];
        arr.push({
          q: `What is the integral of ${g}x dx?`,
          options: shuffleArray(options),
          a: correct
        });
      }
    }
  }
  return shuffleArray(arr).slice(0, MASTER_QUESTIONS_COUNT);
}

function tryStartMasterRanked() {
  const points = getRankedPoints();
  if (points < RANKED_UNLOCK_POINTS) {
    setText("masterRankedResult", `You need ${RANKED_UNLOCK_POINTS - points} more points in Ranked to unlock Master Ranked!`);
    return;
  }
  startMasterRanked();
}

function startMasterRanked() {
  masterRankedQuestions = generateMasterQuestions();
  masterRankedIndex = 0;
  masterRankedScore = 0;
  masterRankedActive = true;
  hideSections();
  showSection("masterRankedSection");
  setText("masterRankedResult", "");
  nextMasterRankedQuestion();
}

function nextMasterRankedQuestion() {
  if (!masterRankedActive || masterRankedIndex >= masterRankedQuestions.length) {
    endMasterRanked();
    return;
  }
  const q = masterRankedQuestions[masterRankedIndex];
  setText("masterRankedQuestion", q.q);
  setText("masterRankedFeedback", "");
  setText("masterRankedScore", `Master Ranked Points: ${masterRankedScore}`);
  let html = "";
  q.options.forEach((opt, idx) => {
    html += `<label><input type="radio" name="masterOption" value="${opt}"> ${String.fromCharCode(97 + idx)}) ${opt}</label><br>`;
  });
  setHTML("masterRankedOptions", html);
}

function submitMasterRankedAnswer() {
  const radios = document.getElementsByName("masterOption");
  let selected = "";
  for (let r of radios) {
    if (r.checked) selected = r.value;
  }
  if (!selected) {
    setFeedback("masterRankedFeedback", "Please select an answer!", "orange");
    return;
  }
  const q = masterRankedQuestions[masterRankedIndex];
  if (selected === q.a) {
    masterRankedScore += RANKED_POINT_VALUE;
    setFeedback("masterRankedFeedback", `Correct! +${RANKED_POINT_VALUE} points`, "green");
    masterRankedIndex++;
    setTimeout(nextMasterRankedQuestion, 800);
  } else {
    setFeedback("masterRankedFeedback", `Wrong! Correct answer: ${q.a}`, "red");
    masterRankedActive = false;
    setTimeout(endMasterRanked, 1200);
  }
}

function endMasterRanked() {
  hideSections();
  showSection("startForm");
  setHTML("masterRankedResult", `<b>Your Master Ranked score:</b> ${masterRankedScore} points`);
}

// --------- QUIZ PROGRESS SAVE/RESUME LOGIC ---------
function saveQuizProgress() {
  const progress = {
    userName,
    userGrade,
    score,
    total,
    currentTestQuestions,
    currentQuestionIndex
  };
  localStorage.setItem("quizProgress", JSON.stringify(progress));
}

function loadQuizProgress() {
  try {
    const progress = JSON.parse(localStorage.getItem("quizProgress"));
    if (!progress || progress.currentQuestionIndex >= QUIZ_QUESTIONS_COUNT) return false;

    userName = progress.userName;
    userGrade = progress.userGrade;
    score = progress.score;
    total = progress.total;
    currentTestQuestions = progress.currentTestQuestions;
    currentQuestionIndex = progress.currentQuestionIndex;
    return true;
  } catch (e) {
    return false;
  }
}

function clearQuizProgress() {
  localStorage.removeItem("quizProgress");
}

function showResumeQuizPrompt() {
  if (confirm("You have an unfinished test. Would you like to continue it?")) {
    if (loadQuizProgress()) {
      hideSections();
      showSection("quizSection");
      nextQuestion();
    }
  } else {
    clearQuizProgress();
  }
}

// --------- END QUIZ PROGRESS LOGIC ---------

function startQuiz() {
  userName = getValue("name").trim();
  userGrade = parseInt(getValue("grade"), 10);

  if (!userName || isNaN(userGrade)) {
    setFeedback("feedback", "Please enter your name and select grade!", "orange");
    return;
  }

  score = 0;
  total = 0;
  currentQuestionIndex = 0;

  const pool = questionsByGrade[userGrade] || [];
  if (pool.length < QUIZ_QUESTIONS_COUNT) {
    setFeedback("feedback", "Not enough questions for this grade.", "orange");
    return;
  }
  currentTestQuestions = shuffleArray(pool).slice(0, QUIZ_QUESTIONS_COUNT);

  hideSections();
  showSection("quizSection");
  saveQuizProgress();  // ADDED: Save progress when quiz starts
  nextQuestion();
}

function nextQuestion() {
  if (currentQuestionIndex >= currentTestQuestions.length) {
    endQuiz();
    return;
  }
  currentQuestion = currentTestQuestions[currentQuestionIndex];
  setText("question", currentQuestion.q);
  setValue("answer", "");
  setText("feedback", "");
  setText("score", `Score: ${score}/${total}`);
}

function submitAnswer() {
  const userAnswer = getValue("answer").trim();
  total++;
  if (userAnswer.toLowerCase() === currentQuestion.a.toLowerCase()) {
    score++;
    setFeedback("feedback", "Correct!", "green");
  } else {
    setFeedback("feedback", `Wrong! Correct answer: ${currentQuestion.a}`, "red");
  }
  setText("score", `Score: ${score}/${total}`);
  currentQuestionIndex++;
  saveQuizProgress();  // ADDED: Save progress after answering
  setTimeout(nextQuestion, 1000);
}

function endQuiz() {
  hideSections();
  showSection("startForm");
  saveScore();
  clearQuizProgress();  // ADDED: Clear quiz progress when finished
  displayScores();
  setHTML("feedback", `Test finished! Your score: ${score}/${QUIZ_QUESTIONS_COUNT}`);
}

function shuffleArray(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function saveScore() {
  try {
    const scores = JSON.parse(localStorage.getItem("mathScores") || "[]");
    scores.push({
      name: userName,
      grade: userGrade,
      score: score,
      total: total,
      date: new Date().toLocaleString()
    });
    localStorage.setItem("mathScores", JSON.stringify(scores));
  } catch (e) {
    setFeedback("scoreBar", "Could not save score (localStorage error)", "red");
  }
}

function displayScores() {
  let scores = [];
  try {
    scores = JSON.parse(localStorage.getItem("mathScores") || "[]");
  } catch (e) { scores = []; }
  const bar = document.getElementById("scoreBar");
  if (bar) {
    bar.innerHTML = "<b>Your previous scores:</b><br>";
    if (scores.length === 0) {
      bar.innerHTML += "No scores yet.";
      return;
    }
    scores.slice(-10).reverse().forEach(s => {
      bar.innerHTML += `${s.date}: <b>${s.name}</b> (Grade ${s.grade}) — <span style="color:#1565c0">${s.score}/${QUIZ_QUESTIONS_COUNT}</span><br>`;
    });
  }
}

function getRankedPoints() {
  return parseInt(localStorage.getItem("rankedTotalPoints") || "0", 10);
}
function saveRankedPoints(points) {
  localStorage.setItem("rankedTotalPoints", points);
}
function updateMasterRankedButton() {
  const btn = document.getElementById("masterRankedBtn");
  const lock = document.getElementById("masterLock");
  const points = getRankedPoints();
  if (btn && lock) {
    if (points < RANKED_UNLOCK_POINTS) {
      btn.disabled = true;
      btn.style.background = "#ccc";
      btn.style.color = "#888";
      lock.innerText = "🔒";
    } else {
      btn.disabled = false;
      btn.style.background = "#1976d2";
      btn.style.color = "#fff";
      lock.innerText = "";
    }
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}
function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}
function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}
function setFeedback(id, msg, color) {
  const el = document.getElementById(id);
  if (el) {
    el.innerText = msg;
    el.style.color = color;
  }
}
function hideSections() {
  ["startForm", "quizSection", "quickQuizSection", "rankedSection", "masterRankedSection"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}
function showSection(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "flex";
}

function addListeners() {
  const answerEl = document.getElementById("answer");
  if (answerEl) answerEl.addEventListener("keydown", e => { if (e.key === "Enter") submitAnswer(); });

  const quickAnswerEl = document.getElementById("quickAnswer");
  if (quickAnswerEl) quickAnswerEl.addEventListener("keydown", e => { if (e.key === "Enter") submitQuickAnswer(); });

  const rankedAnswerEl = document.getElementById("rankedAnswer");
  if (rankedAnswerEl) rankedAnswerEl.addEventListener("keydown", e => { if (e.key === "Enter") submitRankedAnswer(); });

  const masterSectionEl = document.getElementById("masterRankedSection");
  if (masterSectionEl) masterSectionEl.addEventListener("keydown", e => { if (e.key === "Enter") submitMasterRankedAnswer(); });
}

window.onload = function() {
  displayScores();
  updateMasterRankedButton();
  addListeners();

  // to resume unfinished quiz
  const quizProgress = localStorage.getItem("quizProgress");
  if (quizProgress) {
    const progress = JSON.parse(quizProgress);
    if (progress && progress.currentQuestionIndex < QUIZ_QUESTIONS_COUNT) {
      showResumeQuizPrompt();
    }
  }
};
