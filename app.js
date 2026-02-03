// State Management
let currentState = {
    view: 'home',
    mode: null, // 'training' or 'test'
    currentQuestions: [],
    currentIndex: 0,
    score: 0,
    startTime: null,
    timerInterval: null,
    dailySetsCompleted: 0,
    totalSolved: 0,
    correctAnswers: 0,
    history: []
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    updateHomeUI();
});

function loadStats() {
    const saved = localStorage.getItem('labubu_math_stats');
    if (saved) {
        const stats = JSON.parse(saved);
        // Reset daily sets if it's a new day
        const today = new Date().toDateString();
        if (stats.lastDate !== today) {
            stats.dailySetsCompleted = 0;
            stats.lastDate = today;
        }
        currentState = { ...currentState, ...stats };
    }
}

function saveStats() {
    const dataToSave = {
        dailySetsCompleted: currentState.dailySetsCompleted,
        totalSolved: currentState.totalSolved,
        correctAnswers: currentState.correctAnswers,
        history: currentState.history,
        lastDate: new Date().toDateString(),
        bestScore: currentState.bestScore || 0,
        streak: currentState.streak || 0
    };
    localStorage.setItem('labubu_math_stats', JSON.stringify(dataToSave));
}

function updateHomeUI() {
    document.getElementById('daily-count').textContent = `${currentState.dailySetsCompleted} / 5 Sets`;
    const progress = (currentState.dailySetsCompleted / 5) * 100;
    document.getElementById('progress-bar').style.width = `${Math.min(progress, 100)}%`;
}

// Navigation
function showView(viewId) {
    ['home-view', 'quiz-view', 'result-view'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(viewId + '-view').classList.remove('hidden');
}

function goHome() {
    clearInterval(currentState.timerInterval);
    showView('home');
    updateHomeUI();
}

// Quiz Logic
function startTraining() {
    currentState.mode = 'training';
    currentState.currentQuestions = getQuestionSet(24);
    startQuiz();
}

function startMockTest() {
    currentState.mode = 'test';
    currentState.currentQuestions = getQuestionSet(24);
    startQuiz();
}

function startQuiz() {
    currentState.currentIndex = 0;
    currentState.score = 0;
    currentState.startTime = Date.now();
    showView('quiz');
    updateQuestion();
    startTimer();
}

function startTimer() {
    const timerDisplay = document.getElementById('timer');
    clearInterval(currentState.timerInterval);
    currentState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - currentState.startTime) / 1000);
        const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const secs = (elapsed % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${mins}:${secs}`;
    }, 1000);
}

function updateQuestion() {
    const q = currentState.currentQuestions[currentState.currentIndex];
    document.getElementById('current-q').textContent = currentState.currentIndex + 1;
    document.getElementById('total-q').textContent = currentState.currentQuestions.length;
    
    const content = document.getElementById('question-content');
    content.innerHTML = `
        <div class="bg-pink-50 p-4 rounded-xl mb-4 text-[#4FB0AC] font-bold text-sm uppercase tracking-widest">
            ${q.category} • ${q.points} Points
        </div>
        <h3 class="text-3xl font-bold text-[#8B5E3C] leading-snug">${q.question}</h3>
    `;

    const optionsGrid = document.getElementById('options-grid');
    optionsGrid.innerHTML = '';
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => handleAnswer(idx);
        optionsGrid.appendChild(btn);
    });
}

function handleAnswer(selectedIndex) {
    const q = currentState.currentQuestions[currentState.currentIndex];
    const btns = document.querySelectorAll('.option-btn');
    
    // Disable all buttons
    btns.forEach(btn => btn.disabled = true);

    if (selectedIndex === q.answer) {
        btns[selectedIndex].classList.add('correct');
        currentState.score++;
        currentState.correctAnswers++;
        playSuccessEffect();
    } else {
        btns[selectedIndex].classList.add('wrong');
        btns[q.answer].classList.add('correct');
    }

    currentState.totalSolved++;

    setTimeout(() => {
        currentState.currentIndex++;
        if (currentState.currentIndex < currentState.currentQuestions.length) {
            updateQuestion();
        } else {
            finishQuiz();
        }
    }, 1500);
}

function finishQuiz() {
    clearInterval(currentState.timerInterval);
    showView('result');
    
    const total = currentState.currentQuestions.length;
    const score = currentState.score;
    document.getElementById('final-score').textContent = `${score} / ${total}`;
    
    // Update Stats
    if (currentState.mode === 'training') {
        currentState.dailySetsCompleted++;
        if (currentState.dailySetsCompleted === 5) {
            playConfetti();
        }
    }
    
    if (!currentState.bestScore || score > currentState.bestScore) {
        currentState.bestScore = score;
    }

    // Analysis
    const percentage = (score / total) * 100;
    const analysisBox = document.getElementById('result-analysis');
    const resultEmoji = document.getElementById('result-emoji');
    const resultTitle = document.getElementById('result-title');

    if (percentage === 100) {
        resultEmoji.textContent = '👑';
        resultTitle.textContent = 'Perfect Score!';
        analysisBox.textContent = "You're a Math Wizard! Labubu is so proud of you!";
    } else if (percentage >= 80) {
        resultEmoji.textContent = '🌟';
        resultTitle.textContent = 'Great Job!';
        analysisBox.textContent = "Almost perfect! You're getting really strong at math.";
    } else {
        resultEmoji.textContent = '💪';
        resultTitle.textContent = 'Keep Going!';
        analysisBox.textContent = "Every practice makes your brain grow bigger. Let's try again!";
    }

    saveStats();
}

// Stats UI
function toggleStats() {
    const modal = document.getElementById('stats-modal');
    if (modal.classList.contains('hidden')) {
        document.getElementById('total-solved').textContent = currentState.totalSolved;
        const accuracy = currentState.totalSolved > 0 
            ? Math.round((currentState.correctAnswers / currentState.totalSolved) * 100) 
            : 0;
        document.getElementById('accuracy-bar').style.width = accuracy + '%';
        document.getElementById('best-score').textContent = currentState.bestScore || 0;
        document.getElementById('day-streak').textContent = (currentState.streak || 0) + ' Days';
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

function resetStats() {
    if (confirm("Do you want to clear all your progress?")) {
        localStorage.removeItem('labubu_math_stats');
        location.reload();
    }
}

function playConfetti() {
    // Basic emoji rain as confetti
    const emoji = '🎉';
    for(let i=0; i<20; i++) {
        const div = document.createElement('div');
        div.textContent = emoji;
        div.style.position = 'fixed';
        div.style.left = Math.random() * 100 + 'vw';
        div.style.top = '-20px';
        div.style.fontSize = '2rem';
        div.style.zIndex = '100';
        div.style.transition = 'all 2s ease-in';
        document.body.appendChild(div);
        setTimeout(() => {
            div.style.top = '100vh';
            div.style.transform = `rotate(${Math.random() * 360}deg)`;
            setTimeout(() => div.remove(), 2000);
        }, 50);
    }
}

function playSuccessEffect() {
    // Simple visual feedback for kids
    const header = document.querySelector('header');
    header.style.transform = 'scale(1.05)';
    setTimeout(() => header.style.transform = 'scale(1)', 200);
}
