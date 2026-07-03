let boxes = document.querySelectorAll(".box");
let playerForm = document.getElementById("player-form");
let playerXNameInput = document.getElementById("player-x-name");
let playerONameInput = document.getElementById("player-o-name");
let xPlayerLabel = document.getElementById("x-player-label");
let oPlayerLabel = document.getElementById("o-player-label");
let resetBtn = document.getElementById("reset-btn");
let gameOverBtn = document.getElementById("game-over-btn");
let themeBtn = document.getElementById("theme-btn");
let msg = document.getElementById("msg");
let turnIndicator = document.getElementById("turn-indicator");
let xScore = document.getElementById("x-score");
let oScore = document.getElementById("o-score");
let drawScore = document.getElementById("draw-score");
let game = document.querySelector(".game");
let winLine = document.getElementById("win-line");

let turnO = false; // false for X's turn, true for O's turn
let gameStarted = false;
let gameFinished = false;
let players = {
    X: "Player X",
    O: "Player O"
};
let scores = {
    X: 0,
    O: 0,
    draw: 0
};

const winPatterns = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [3, 4, 5],
    [6, 7, 8]
];
const updateScoreboard = () => {
    xPlayerLabel.innerText = players.X;
    oPlayerLabel.innerText = players.O;
    xScore.innerText = scores.X;
    oScore.innerText = scores.O;
    drawScore.innerText = scores.draw;
};

const updateTurnIndicator = () => {
    if (!gameStarted) {
        turnIndicator.innerText = "Enter player names to start";
        return;
    }

    if (gameFinished) {
        turnIndicator.innerText = "Current Turn : Game Over";
        return;
    }

    const currentSymbol = turnO ? "O" : "X";
    turnIndicator.innerText = `Current Turn : ${players[currentSymbol]} (${currentSymbol})`;
};

const hideWinningLine = () => {
    winLine.classList.remove("show");
};

const showWinningLine = (pattern) => {
    const gameRect = game.getBoundingClientRect();
    const startBox = boxes[pattern[0]].getBoundingClientRect();
    const endBox = boxes[pattern[2]].getBoundingClientRect();

    const startX = startBox.left + startBox.width / 2 - gameRect.left;
    const startY = startBox.top + startBox.height / 2 - gameRect.top;
    const endX = endBox.left + endBox.width / 2 - gameRect.left;
    const endY = endBox.top + endBox.height / 2 - gameRect.top;
    const lineLength = Math.hypot(endX - startX, endY - startY);
    const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

    winLine.classList.remove("show");
    winLine.style.left = `${startX}px`;
    winLine.style.top = `${startY}px`;
    winLine.style.transform = `rotate(${angle}deg)`;
    winLine.style.setProperty("--line-width", `${lineLength}px`);

    winLine.offsetWidth;
    requestAnimationFrame(() => {
        winLine.classList.add("show");
    });
};

 boxes.forEach((box) => {
    box.addEventListener("click", () => {
        if (!gameStarted || gameFinished) {
            return;
        }

        box.innerText = turnO ? "O" : "X";
        box.disabled = true;

        const roundFinished = checkWin();
        if (!roundFinished) {
            turnO = !turnO;
            updateTurnIndicator();
        }
    });
});  

const disableBoxes = () => {
    boxes.forEach((box)=>{
        box.disabled = true;
    });
};

const enableBoxes = () => {
    boxes.forEach((box)=>{
        box.disabled = false;
        box.innerText = "";
    });
};

const showWinner = (winner, pattern) => {
    gameFinished = true;
    msg.innerText = `Winner is ${players[winner]} (${winner})`;
    scores[winner]++;
    updateScoreboard();
    updateTurnIndicator();
    showWinningLine(pattern);
    disableBoxes();
};

const showDraw = () => {
    gameFinished = true;
    msg.innerText = "Game was a draw";
    scores.draw++;
    updateScoreboard();
    updateTurnIndicator();
};

const checkWin = () => {
    for (let pattern of winPatterns) {
            let pos1Val = boxes[pattern[0]].innerText;
            let pos2Val = boxes[pattern[1]].innerText;
            let pos3Val = boxes[pattern[2]].innerText;

            if (pos1Val != ""&& pos2Val != ""&& pos3Val != "") {
                if (pos1Val === pos2Val && pos2Val === pos3Val) {
                    showWinner(pos1Val, pattern);
                    return true;
            }
            };
        }

        const isDraw = [...boxes].every((box) => box.innerText !== "");
        if (isDraw) {
            showDraw();
            return true;
        }

        return false;
    };

const resetBoard = () => {
    turnO = false;
    gameFinished = false;

    enableBoxes();

    msg.innerText = "";
    updateTurnIndicator();
    hideWinningLine();
};

const resetGame = () =>{
    if (!gameStarted) {
        msg.innerText = "Enter player names before starting the game.";
        return;
    }

    resetBoard();
};

const startGame = (event) => {
    event.preventDefault();

    players.X = playerXNameInput.value.trim() || "Player X";
    players.O = playerONameInput.value.trim() || "Player O";
    scores = {
        X: 0,
        O: 0,
        draw: 0
    };
    gameStarted = true;

    updateScoreboard();
    resetBoard();
};

const showFinalResult = () => {
    if (!gameStarted) {
        msg.innerText = "Enter player names before ending the game.";
        return;
    }

    gameFinished = true;
    disableBoxes();
    hideWinningLine();
    updateTurnIndicator();

    if (scores.X === scores.O) {
        msg.innerText = `Match drawn: ${players.X} ${scores.X} - ${scores.O} ${players.O}`;
        return;
    }

    const winnerSymbol = scores.X > scores.O ? "X" : "O";
    const loserSymbol = winnerSymbol === "X" ? "O" : "X";
    const winningScore = scores[winnerSymbol];
    const losingScore = scores[loserSymbol];
    const margin = winningScore - losingScore;

    msg.innerText = `${players[winnerSymbol]} wins the match by ${margin} point${margin === 1 ? "" : "s"} (${winningScore}-${losingScore})`;
};

const prepareInitialState = () => {
    gameStarted = false;
    gameFinished = false;
    enableBoxes();
    disableBoxes();
    updateScoreboard();
    updateTurnIndicator();
};

playerForm.addEventListener("submit", startGame);
resetBtn.addEventListener("click", resetGame);
gameOverBtn.addEventListener("click", showFinalResult);
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    document.body.classList.toggle("dark-mode");

    const isLightMode = document.body.classList.contains("light-mode");
    themeBtn.innerText = isLightMode ? "Dark Mode" : "Light Mode";
});

prepareInitialState();
