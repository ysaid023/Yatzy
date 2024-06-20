const diceContainer = document.getElementById('dice-container');
const rollButton = document.getElementById('roll-button');
const scoreboard = document.getElementById('scoreboard');
const gameStatus = document.getElementById('game-status');
const finalScore = document.getElementById('final-score');

let dice = [1, 1, 1, 1, 1].map(value => ({ value, selected: false }));
let rollCount = 0;
let scoreCategories = [
    { name: 'Ones', score: null },
    { name: 'Twos', score: null },
    { name: 'Threes', score: null },
    { name: 'Fours', score: null },
    { name: 'Fives', score: null },
    { name: 'Sixes', score: null },
    { name: 'Three of a kind', score: null },
    { name: 'Four of a kind', score: null },
    { name: 'Full House', score: null },
    { name: 'Small Straight', score: null },
    { name: 'Large Straight', score: null },
    { name: 'Yatzy', score: null },
    { name: 'Chance', score: null }
];
let totalScore = 0;

function rollDice() {
    if (rollCount < 3) {
        for (let i = 0; i < dice.length; i++) {
            if (!dice[i].selected) {
                dice[i].value = Math.floor(Math.random() * 6) + 1;
            }
        }
        rollCount++;
        updateDiceDisplay();
        updateGameStatus();
    }
}

function updateDiceDisplay() {
    diceContainer.innerHTML = '';
    dice.forEach((die, index) => {
        const dieElement = document.createElement('div');
        dieElement.classList.add('dice');
        dieElement.textContent = die.value;
        dieElement.addEventListener('click', () => toggleDieSelection(index));
        if (die.selected) {
            dieElement.classList.add('selected');
        }
        diceContainer.appendChild(dieElement);
    });
    updateScoreboard();
}

function toggleDieSelection(index) {
    dice[index].selected = !dice[index].selected;
    updateDiceDisplay();
}

function updateGameStatus() {
    gameStatus.textContent = `Rolls left: ${3 - rollCount}`;
    if (rollCount >= 3) {
        rollButton.disabled = true;
    }
}

function initializeGame() {
    dice = dice.map(() => ({ value: 1, selected: false }));
    rollCount = 0;
    scoreCategories = scoreCategories.map(category => ({ ...category, score: null }));
    totalScore = 0;
    rollButton.disabled = false;
    updateDiceDisplay();
    updateScoreboard();
    updateGameStatus();
    finalScore.textContent = '';
}

function updateScoreboard() {
    scoreboard.innerHTML = '';
    scoreCategories.forEach(category => {
        const predictedScore = calculateScore(category.name);
        const categoryElement = document.createElement('div');
        categoryElement.classList.add('score-category');
        categoryElement.textContent = `${category.name}: ${category.score === null ? predictedScore : category.score}`;
        categoryElement.addEventListener('click', () => selectScoreCategory(category));
        scoreboard.appendChild(categoryElement);
    });
}

function selectScoreCategory(category) {
    if (category.score === null) {
        category.score = calculateScore(category.name);
        totalScore += category.score;
        rollCount = 0;
        rollButton.disabled = false;
        updateScoreboard();
        updateGameStatus();
        dice = dice.map(() => ({ value: 1, selected: false }));
        if (scoreCategories.every(cat => cat.score !== null)) {
            finalScore.textContent = `Final Score: ${totalScore}`;
            rollButton.disabled = true;
        }
        updateDiceDisplay();
    }
}

function calculateScore(categoryName) {
    const counts = [0, 0, 0, 0, 0, 0];
    dice.forEach(die => counts[die.value - 1]++);
    switch (categoryName) {
        case 'Ones': return counts[0] * 1;
        case 'Twos': return counts[1] * 2;
        case 'Threes': return counts[2] * 3;
        case 'Fours': return counts[3] * 4;
        case 'Fives': return counts[4] * 5;
        case 'Sixes': return counts[5] * 6;
        case 'Three of a kind': return counts.some(count => count >= 3) ? dice.reduce((acc, die) => acc + die.value, 0) : 0;
        case 'Four of a kind': return counts.some(count => count >= 4) ? dice.reduce((acc, die) => acc + die.value, 0) : 0;
        case 'Full House': return counts.includes(3) && counts.includes(2) ? 25 : 0;
        case 'Small Straight': return (counts.slice(0, 4).every(count => count >= 1) || counts.slice(1, 5).every(count => count >= 1) || counts.slice(2, 6).every(count => count >= 1)) ? 30 : 0;
        case 'Large Straight': return (counts.slice(0, 5).every(count => count >= 1) || counts.slice(1, 6).every(count => count >= 1)) ? 40 : 0;
        case 'Yatzy': return counts.includes(5) ? 50 : 0;
        case 'Chance': return dice.reduce((acc, die) => acc + die.value, 0);
        default: return 0;
    }
}

rollButton.addEventListener('click', rollDice);
initializeGame();