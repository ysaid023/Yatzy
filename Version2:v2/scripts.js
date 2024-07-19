const diceContainer = document.getElementById('dice-container');
const rollButton = document.getElementById('roll-button');
const scoreboard = document.getElementById('scoreboard');
const gameStatus = document.getElementById('game-status');
const finalScore = document.getElementById('final-score');
const saveScoreForm = document.getElementById('save-score-form');
const playerNameInput = document.getElementById('player-name');

rollButton.addEventListener('click', rollDice);
saveScoreForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const name = playerNameInput.value;
    ajaxPost('saveScore', { name }, () => {
        saveScoreForm.style.display = 'none';
        alert('Score saved successfully!');
        initializeGame();
    });
});

function rollDice() {
    ajaxPost('rollDice', {}, updateGameState);
}

function toggleDieSelection(index) {
    ajaxPost('selectDie', { index }, updateGameState);
}

function selectScoreCategory(category) {
    ajaxPost('selectCategory', { category }, updateGameState);
}

function updateGameState(response) {
    const game = JSON.parse(response);
    updateDiceDisplay(game.dice);
    updateScoreboard(game.scoreCategories);
    updateGameStatus(game.rollCount);
    finalScore.textContent = game.totalScore ? `Final Score: ${game.totalScore}` : '';
    if (game.scoreCategories.every(cat => cat.score !== null)) {
        rollButton.disabled = true;
        showSaveScoreForm();
    } else {
        rollButton.disabled = game.rollCount >= 3;
    }
}

function updateDiceDisplay(dice) {
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
}

function updateScoreboard(scoreCategories) {
    scoreboard.innerHTML = '';
    scoreCategories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.classList.add('score-category');
        categoryElement.textContent = `${category.name}: ${category.score === null ? '-' : category.score}`;
        categoryElement.addEventListener('click', () => selectScoreCategory(category.name));
        scoreboard.appendChild(categoryElement);
    });
}

function updateGameStatus(rollCount) {
    gameStatus.textContent = `Rolls left: ${3 - rollCount}`;
}

function showSaveScoreForm() {
    saveScoreForm.style.display = 'block';
}

function ajaxPost(action, data, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'api.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function () {
        if (xhr.status === 200) {
            callback(xhr.responseText);
        }
    };
    const params = new URLSearchParams({ action, ...data }).toString();
    xhr.send(params);
}

function initializeGame() {
    ajaxPost('resetGame', {}, updateGameState);
}

initializeGame();