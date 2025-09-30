let userName = "";
let userGrade = 1;
let questionsPool = [];
let currentQuestion = {};
let score = 0;
let total = 0;
let currentTestQuestions = [];
let currentQuestionIndex = 0;

let quickQuizQuestions = [];
let quickQuizIndex = 0;
let quickQuizScore = 0;

let rankedQuestions = [];
let rankedIndex = 0;
let rankedScore = 0;
let rankedActive = false;

// Генерация 100 вопросов для каждого класса
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
  for (let g = 1; g <= 12; g++) {
    const arr = shuffleArray(questionsByGrade[g]);
    quickQuizQuestions.push(arr[0]);
  }
  quickQuizIndex = 0;
  quickQuizScore = 0;
  document.getElementById("startForm").style.display = "none";
  document.getElementById("quizSection").style.display = "none";
  document.getElementById("quickQuizSection").style.display = "flex";
  document.getElementById("quickQuizResult").innerText = "";
  nextQuickQuizQuestion();
}

function nextQuickQuizQuestion() {
  if (quickQuizIndex >= quickQuizQuestions.length) {
    endQuickQuiz();
    return;
  }
  const q = quickQuizQuestions[quickQuizIndex];
  document.getElementById("quickQuestion").innerText = `Grade ${quickQuizIndex + 1}: ${q.q}`;
  document.getElementById("quickAnswer").value = "";
  document.getElementById("quickFeedback").innerText = "";
  document.getElementById("quickScore").innerText = `Score: ${quickQuizScore}/${quickQuizIndex}`;
}

function submitQuickAnswer() {
  const userAnswer = document.getElementById("quickAnswer").value.trim();
  const q = quickQuizQuestions[quickQuizIndex];
  if (userAnswer.toLowerCase() === q.a.toLowerCase()) {
    quickQuizScore++;
    document.getElementById("quickFeedback").innerText = "Correct!";
    document.getElementById("quickFeedback").style.color = "green";
  } else {
    document.getElementById("quickFeedback").innerText = `Wrong! Correct answer: ${q.a}`;
    document.getElementById("quickFeedback").style.color = "red";
  }
  document.getElementById("quickScore").innerText = `Score: ${quickQuizScore}/${quickQuizIndex + 1}`;
  quickQuizIndex++;
  setTimeout(nextQuickQuizQuestion, 1000);
}

function endQuickQuiz() {
  document.getElementById("quickQuizSection").style.display = "none";
  document.getElementById("startForm").style.display = "flex";
  let estimatedGrade = quickQuizScore;
  document.getElementById("quickQuizResult").innerHTML =
    `<b>Estimated grade:</b> ${estimatedGrade} <br>Your score: ${quickQuizScore}/12`;
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
  document.getElementById("startForm").style.display = "none";
  document.getElementById("quizSection").style.display = "none";
  document.getElementById("quickQuizSection").style.display = "none";
  document.getElementById("rankedSection").style.display = "flex";
  document.getElementById("rankedResult").innerText = "";
  nextRankedQuestion();
}

function nextRankedQuestion() {
  if (!rankedActive || rankedIndex >= rankedQuestions.length) {
    endRanked();
    return;
  }
  const q = rankedQuestions[rankedIndex];
  document.getElementById("rankedQuestion").innerText = q.q;
  document.getElementById("rankedAnswer").value = "";
  document.getElementById("rankedFeedback").innerText = "";
  document.getElementById("rankedScore").innerText = `Ranked Points: ${rankedScore}`;
}

function submitRankedAnswer() {
  const userAnswer = document.getElementById("rankedAnswer").value.trim();
  const q = rankedQuestions[rankedIndex];
  if (userAnswer.toLowerCase() === q.a.toLowerCase()) {
    rankedScore += 15;
    document.getElementById("rankedFeedback").innerText = "Correct! +15 points";
    document.getElementById("rankedFeedback").style.color = "green";
    rankedIndex++;
    setTimeout(nextRankedQuestion, 800);
  } else {
    document.getElementById("rankedFeedback").innerText = `Wrong! Correct answer: ${q.a}`;
    document.getElementById("rankedFeedback").style.color = "red";
    rankedActive = false;
    setTimeout(endRanked, 1200);
  }
}

function endRanked() {
  document.getElementById("rankedSection").style.display = "none";
  document.getElementById("startForm").style.display = "flex";
  document.getElementById("rankedResult").innerHTML =
    `<b>Your ranked score:</b> ${rankedScore} points`;
}

function startQuiz() {
  userName = document.getElementById("name").value.trim();
  userGrade = parseInt(document.getElementById("grade").value, 10);

  if (!userName || isNaN(userGrade)) {
    alert("Please enter your name and select grade!");
    return;
  }

  score = 0;
  total = 0;
  currentQuestionIndex = 0;

  questionsPool = questionsByGrade[userGrade] || [];
  if (questionsPool.length < 10) {
    alert("Not enough questions for this grade.");
    return;
  }
  currentTestQuestions = shuffleArray(questionsPool).slice(0, 10);

  document.getElementById("startForm").style.display = "none";
  document.getElementById("quizSection").style.display = "flex";
  document.getElementById("quickQuizSection").style.display = "none";
  document.getElementById("rankedSection").style.display = "none";
  nextQuestion();
}

function nextQuestion() {
  if (currentQuestionIndex >= currentTestQuestions.length) {
    endQuiz();
    return;
  }
  currentQuestion = currentTestQuestions[currentQuestionIndex];
  document.getElementById("question").innerText = currentQuestion.q;
  document.getElementById("answer").value = "";
  document.getElementById("feedback").innerText = "";
  document.getElementById("score").innerText = `Score: ${score}/${total}`;
}

function submitAnswer() {
  const userAnswer = document.getElementById("answer").value.trim();
  total++;
  if (userAnswer.toLowerCase() === currentQuestion.a.toLowerCase()) {
    score++;
    document.getElementById("feedback").innerText = "Correct!";
    document.getElementById("feedback").style.color = "green";
  } else {
    document.getElementById("feedback").innerText = `Wrong! Correct answer: ${currentQuestion.a}`;
    document.getElementById("feedback").style.color = "red";
  }
  document.getElementById("score").innerText = `Score: ${score}/${total}`;
  currentQuestionIndex++;
  setTimeout(nextQuestion, 1000);
}

function endQuiz() {
  document.getElementById("quizSection").style.display = "none";
  document.getElementById("startForm").style.display = "flex";
  saveScore();
  displayScores();
  alert(`Test finished! Your score: ${score}/10`);
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
  const scores = JSON.parse(localStorage.getItem("mathScores") || "[]");
  scores.push({
    name: userName,
    grade: userGrade,
    score: score,
    total: total,
    date: new Date().toLocaleString()
  });
  localStorage.setItem("mathScores", JSON.stringify(scores));
}
function displayScores() {
  const scores = JSON.parse(localStorage.getItem("mathScores") || "[]");
  const bar = document.getElementById("scoreBar");
  bar.innerHTML = "<b>Your previous scores:</b><br>";
  if (scores.length === 0) {
    bar.innerHTML += "No scores yet.";
    return;
  }
  scores.slice(-10).reverse().forEach(s => {
    bar.innerHTML += `${s.date}: <b>${s.name}</b> (Grade ${s.grade}) — <span style="color:#1565c0">${s.score}/10</span><br>`;
  });
}
window.onload = displayScores;

let rankedTotalPoints = 0;

let masterRankedQuestions = [];
let masterRankedIndex = 0;
let masterRankedScore = 0;
let masterRankedActive = false;
let masterRankedCurrentAnswer = "";

// Генерация вопросов с вариантами для 11-12 классов
function generateMasterQuestions() {
  const arr = [];
  for (let g = 11; g <= 12; g++) {
    for (let i = 0; i < 50; i++) {
      let a = Math.floor(Math.random() * (10 + g * 2)) + 1;
      let b = Math.floor(Math.random() * (10 + g * 2)) + 1;
      let correct, options;
      if (g === 11) {
        correct = `${g}x^${g - 1}`;
        options = [
          `${g}x^${g - 1}`,
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
          `${g / 2}x^2 + C`,
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
  return arr.slice(0, 20); 
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
  document.getElementById("startForm").style.display = "none";
  document.getElementById("quizSection").style.display = "none";
  document.getElementById("quickQuizSection").style.display = "none";
  document.getElementById("rankedSection").style.display = "flex";
  document.getElementById("rankedResult").innerText = "";
  nextRankedQuestion();
}

function nextRankedQuestion() {
  if (!rankedActive || rankedIndex >= rankedQuestions.length) {
    endRanked();
    return;
  }
  const q = rankedQuestions[rankedIndex];
  document.getElementById("rankedQuestion").innerText = q.q;
  document.getElementById("rankedAnswer").value = "";
  document.getElementById("rankedFeedback").innerText = "";
  document.getElementById("rankedScore").innerText = `Ranked Points: ${rankedScore}`;
}

function submitRankedAnswer() {
  const userAnswer = document.getElementById("rankedAnswer").value.trim();
  const q = rankedQuestions[rankedIndex];
  if (userAnswer.toLowerCase() === q.a.toLowerCase()) {
    rankedScore += 15;
    document.getElementById("rankedFeedback").innerText = "Correct! +15 points";
    document.getElementById("rankedFeedback").style.color = "green";
    rankedIndex++;
    setTimeout(nextRankedQuestion, 800);
  } else {
    document.getElementById("rankedFeedback").innerText = `Wrong! Correct answer: ${q.a}`;
    document.getElementById("rankedFeedback").style.color = "red";
    rankedActive = false;
    setTimeout(endRanked, 1200);
  }
}

function endRanked() {
  document.getElementById("rankedSection").style.display = "none";
  document.getElementById("startForm").style.display = "flex";
  rankedTotalPoints = getRankedPoints() + rankedScore;
  saveRankedPoints(rankedTotalPoints);
  document.getElementById("rankedResult").innerHTML =
    `<b>Your ranked score:</b> ${rankedScore} points<br>Total: ${rankedTotalPoints}`;
  updateMasterRankedButton();
}
function tryStartMasterRanked() {
  if (getRankedPoints() < 200) {
    const need = 200 - getRankedPoints();
    alert(`You need ${need} more points in Ranked to unlock Master Ranked!`);
    return;
  }
  startMasterRanked();
}

function startMasterRanked() {
  masterRankedQuestions = generateMasterQuestions();
  masterRankedIndex = 0;
  masterRankedScore = 0;
  masterRankedActive = true;
  document.getElementById("startForm").style.display = "none";
  document.getElementById("masterRankedSection").style.display = "flex";
  document.getElementById("masterRankedResult").innerText = "";
  nextMasterRankedQuestion();
}

function nextMasterRankedQuestion() {
  if (!masterRankedActive || masterRankedIndex >= masterRankedQuestions.length) {
    endMasterRanked();
    return;
  }
  const q = masterRankedQuestions[masterRankedIndex];
  document.getElementById("masterRankedQuestion").innerText = q.q;
  document.getElementById("masterRankedFeedback").innerText = "";
  document.getElementById("masterRankedScore").innerText = `Master Ranked Points: ${masterRankedScore}`;
  let html = "";
  q.options.forEach((opt, idx) => {
    html += `<label><input type="radio" name="masterOption" value="${opt}"> ${String.fromCharCode(97 + idx)}) ${opt}</label><br>`;
  });
  document.getElementById("masterRankedOptions").innerHTML = html;
}

function submitMasterRankedAnswer() {
  const radios = document.getElementsByName("masterOption");
  let selected = "";
  for (let r of radios) {
    if (r.checked) selected = r.value;
  }
  if (!selected) {
    alert("Please select an answer!");
    return;
  }
  const q = masterRankedQuestions[masterRankedIndex];
  if (selected === q.a) {
    masterRankedScore += 15;
    document.getElementById("masterRankedFeedback").innerText = "Correct! +15 points";
    document.getElementById("masterRankedFeedback").style.color = "green";
    masterRankedIndex++;
    setTimeout(nextMasterRankedQuestion, 800);
  } else {
    document.getElementById("masterRankedFeedback").innerText = `Wrong! Correct answer: ${q.a}`;
    document.getElementById("masterRankedFeedback").style.color = "red";
    masterRankedActive = false;
    setTimeout(endMasterRanked, 1200);
  }
}

function endMasterRanked() {
  document.getElementById("masterRankedSection").style.display = "none";
  document.getElementById("startForm").style.display = "flex";
  document.getElementById("masterRankedResult").innerHTML =
    `<b>Your Master Ranked score:</b> ${masterRankedScore} points`;
}

//  Система очков Ranked 
function getRankedPoints() {
  return parseInt(localStorage.getItem("rankedTotalPoints") || "0", 10);
}
function saveRankedPoints(points) {
  localStorage.setItem("rankedTotalPoints", points);
}
function updateMasterRankedButton() {
  const btn = document.getElementById("masterRankedBtn");
  const lock = document.getElementById("masterLock");
  if (getRankedPoints() < 200) {
    btn.disabled = false;
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
window.onload = function() {
  displayScores();
  updateMasterRankedButton();
};
document.getElementById("answer").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    submitAnswer();
  }
});
document.getElementById("quickAnswer").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    submitQuickAnswer();
  }
});

document.getElementById("rankedAnswer").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    submitRankedAnswer();
  }
});

document.getElementById("masterRankedSection").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    submitMasterRankedAnswer();
  }
});