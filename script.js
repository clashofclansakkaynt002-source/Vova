let gameMode = 'PvP'; // 'PvP' або 'BOT'
let botDifficulty = 'medium';
let score1 = 0, score2 = 0;
let round = 1;
let phase = 'GK';
let gkChoice = '', strikerChoice = '';
let attempts = { p1: [], p2: [] };

const ball = document.getElementById('ball');
const goalkeeper = document.getElementById('goalkeeper');
const turnText = document.getElementById('turn-instruction');

// ШАНСИ БОТА (ймовірність, що бот вгадає напрямок)
const botChances = {
    'easy': 0.25,   // 1 з 4
    'medium': 0.40, // 1 з 2.5
    'hard': 0.66    // 1 з 1.5
};

function showBotDifficulty() {
    document.querySelector('.menu-box').style.display = 'none';
    document.getElementById('difficulty-box').style.display = 'flex';
}

function startPvP() {
    gameMode = 'PvP';
    setupGameUI();
}

function startBot(diff) {
    gameMode = 'BOT';
    botDifficulty = diff;
    document.getElementById('p2-label').innerText = `БОТ (${diff.toUpperCase()}): 0`;
    setupGameUI();
}

function setupGameUI() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    initAttemptsUI();
    resetField();
}

function handleChoice(choice) {
    if (gameMode === 'PvP') {
        if (phase === 'GK') {
            gkChoice = choice;
            phase = 'STRIKER';
            toggleControls(false);
            showPassScreen(true);
        } else {
            strikerChoice = choice;
            executePenalty();
        }
    } else {
        // РЕЖИМ ПРОТИ БОТА
        strikerChoice = choice;
        // Математика шансів бота
        const shouldWin = Math.random() < botChances[botDifficulty];
        if (shouldWin) {
            gkChoice = strikerChoice; // Бот вгадав
        } else {
            const wrongOptions = ['left', 'center', 'right'].filter(opt => opt !== strikerChoice);
            gkChoice = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        }
        executePenalty();
    }
}

function executePenalty() {
    toggleControls(false);
    
    // Анімація воротаря
    if (gkChoice === 'left') goalkeeper.style.transform = 'translateX(-130px) rotate(-30deg)';
    else if (gkChoice === 'right') goalkeeper.style.transform = 'translateX(60px) rotate(30deg)';
    else goalkeeper.style.transform = 'translateX(-50%) translateY(-30px)';

    // Анімація м'яча
    ball.style.bottom = '70%';
    ball.style.transform = 'scale(0.4) rotate(720deg)';
    if (strikerChoice === 'left') ball.style.left = '32%';
    else if (strikerChoice === 'right') ball.style.left = '62%';
    else ball.style.left = '50%';

    setTimeout(() => {
        const isGoal = (gkChoice !== strikerChoice);
        // В режимі бота гравець завжди б'є, бот завжди ловить (або навпаки, спростимо: гравець б'є 5 разів)
        if (isGoal) { score1++; attempts.p1.push('hit'); } 
        else { score2++; attempts.p1.push('miss'); } // score2 тут як сейви бота
        
        updateUI();
        if (!checkWinner()) {
            setTimeout(resetField, 1500);
        }
    }, 600);
}

function resetField() {
    phase = 'GK';
    ball.style.bottom = '25%'; ball.style.left = '50%'; ball.style.transform = 'scale(1)';
    goalkeeper.style.transform = 'translateX(-50%)';
    toggleControls(true);
    showPassScreen(false);

    if (gameMode === 'PvP') {
        let shooter = (attempts.p1.length + attempts.p2.length) % 2 === 0 ? "ГРАВЕЦЬ 2" : "ГРАВЕЦЬ 1";
        turnText.innerText = `${shooter}: ОБЕРИ КУТ СТРИБКА`;
    } else {
        turnText.innerText = "ВАШ УДАР!";
    }
}

function checkWinner() {
    const totalShots = attempts.p1.length;
    if (totalShots >= 5) {
        let msg = score1 >= 3 ? "ПЕРЕМОГА!" : "БОТ СИЛЬНІШИЙ!";
        if (gameMode === 'PvP') msg = score1 > score2 ? "ГРАВЕЦЬ 1 ПЕРЕМІГ!" : "ГРАВЕЦЬ 2 ПЕРЕМІГ!";
        document.getElementById('overlay').style.display = 'flex';
        document.getElementById('winner-msg').innerText = msg;
        return true;
    }
    return false;
}

// Допоміжні функції інтерфейсу
function toggleControls(show) { document.getElementById('controls').style.display = show ? 'block' : 'none'; }
function showPassScreen(show) {
    document.getElementById('pass-msg').style.display = show ? 'block' : 'none';
    document.getElementById('btn-ready').style.display = show ? 'block' : 'none';
}
function startStrikerPhase() {
    showPassScreen(false);
    toggleControls(true);
    turnText.innerText = "ГРАВЕЦЬ 2: КУДИ Б’ЄШ?";
}
function initAttemptsUI() {
    const bar = document.getElementById('attempts-bar');
    bar.innerHTML = '';
    for(let i=0; i<5; i++) {
        let d = document.createElement('div'); d.className = 'dot'; d.id = `dot-p1-${i}`;
        bar.appendChild(d);
    }
}
function updateUI() {
    document.getElementById('score1').innerText = score1;
    document.getElementById('score2').innerText = score2;
    attempts.p1.forEach((res, i) => document.getElementById(`dot-p1-${i}`).className = `dot p1-${res}`);
}
