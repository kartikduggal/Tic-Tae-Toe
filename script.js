let boxes = document.querySelectorAll(".box");
let playerForm = document.getElementById("player-form");
let playerXNameInput = document.getElementById("player-x-name");
let playerONameInput = document.getElementById("player-o-name");
let xPlayerLabel = document.getElementById("x-player-label");
let oPlayerLabel = document.getElementById("o-player-label");
let aiModeBtn = document.getElementById("ai-mode-btn");
let aiLevelControl = document.getElementById("ai-level-control");
let aiLevelSelect = document.getElementById("ai-level");
let resetBtn = document.getElementById("reset-btn");
let gameOverBtn = document.getElementById("game-over-btn");
let muteBtn = document.getElementById("mute-btn");
let themeBtn = document.getElementById("theme-btn");
let msg = document.getElementById("msg");
let turnIndicator = document.getElementById("turn-indicator");
let xScore = document.getElementById("x-score");
let oScore = document.getElementById("o-score");
let drawScore = document.getElementById("draw-score");
let game = document.querySelector(".game");
let winLine = document.getElementById("win-line");

let turnO = false; // false for X's turn, true for O's turn
let nextRoundStartsWithO = false;
let isAiMode = false;
let aiThinking = false;
let gameStarted = false;
let gameFinished = false;
let soundMuted = false;
let players = {
    X: "Player X",
    O: "Player O"
};
let scores = {
    X: 0,
    O: 0,
    draw: 0
};
let audioContext;

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

const updateAiModeControls = () => {
    aiModeBtn.classList.toggle("active", isAiMode);
    aiModeBtn.setAttribute("aria-pressed", String(isAiMode));
    aiModeBtn.innerText = isAiMode ? "AI Mode On" : "Play with AI";
    aiLevelControl.classList.toggle("show", isAiMode);
    playerONameInput.disabled = isAiMode;
    playerONameInput.required = !isAiMode;
    playerONameInput.value = isAiMode ? "AI" : "";
    playerONameInput.placeholder = isAiMode ? "AI" : "Enter name";
};

const updateMuteButton = () => {
    muteBtn.classList.toggle("active", soundMuted);
    muteBtn.setAttribute("aria-pressed", String(soundMuted));
    muteBtn.innerText = soundMuted ? "Unmute Sound" : "Mute Sound";
};

const getAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    return audioContext;
};

const playTone = (frequency, duration, type = "sine", volume = 0.08, delay = 0) => {
    if (soundMuted) {
        return;
    }

    const context = getAudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startTime = context.currentTime + delay;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
};

const playClickSound = () => {
    playTone(520, 0.07, "square", 0.035);
};

const playWinSound = () => {
    playTone(523, 0.12, "triangle", 0.08);
    playTone(659, 0.12, "triangle", 0.08, 0.1);
    playTone(784, 0.18, "triangle", 0.09, 0.2);
};

const playDrawSound = () => {
    playTone(392, 0.12, "sine", 0.06);
    playTone(392, 0.12, "sine", 0.05, 0.16);
};

const playResetSound = () => {
    playTone(440, 0.08, "sawtooth", 0.045);
    playTone(330, 0.1, "sawtooth", 0.04, 0.08);
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
        if (!gameStarted || gameFinished || aiThinking || (isAiMode && turnO)) {
            return;
        }

        playClickSound();
        box.innerText = turnO ? "O" : "X";
        box.disabled = true;

        const roundFinished = checkWin();
        if (!roundFinished) {
            turnO = !turnO;
            updateTurnIndicator();
            playAiTurn();
        }
    });
});  

const getBoard = () => [...boxes].map((box) => box.innerText);

const getWinner = (board) => {
    for (let pattern of winPatterns) {
        const [first, second, third] = pattern;

        if (board[first] !== "" && board[first] === board[second] && board[second] === board[third]) {
            return board[first];
        }
    }

    if (board.every((value) => value !== "")) {
        return "draw";
    }

    return null;
};

const minimax = (board, isMaximizing) => {
    const result = getWinner(board);

    if (result === "O") {
        return 1;
    }

    if (result === "X") {
        return -1;
    }

    if (result === "draw") {
        return 0;
    }

    let bestScore = isMaximizing ? -Infinity : Infinity;
    const symbol = isMaximizing ? "O" : "X";

    for (let index = 0; index < board.length; index++) {
        if (board[index] !== "") {
            continue;
        }

        board[index] = symbol;
        const score = minimax(board, !isMaximizing);
        board[index] = "";
        bestScore = isMaximizing ? Math.max(score, bestScore) : Math.min(score, bestScore);
    }

    return bestScore;
};

const chooseAiMove = () => {
    const board = getBoard();
    const level = aiLevelSelect.value;

    if (level === "easy") {
        return chooseRandomMove(board);
    }

    if (level === "medium") {
        return chooseMediumMove(board);
    }

    return chooseHardMove(board);
};

const chooseRandomMove = (board) => {
    const openMoves = board
        .map((value, index) => value === "" ? index : -1)
        .filter((index) => index !== -1);

    if (openMoves.length === 0) {
        return -1;
    }

    return openMoves[Math.floor(Math.random() * openMoves.length)];
};

const findImmediateMove = (board, symbol) => {
    for (let index = 0; index < board.length; index++) {
        if (board[index] !== "") {
            continue;
        }

        board[index] = symbol;
        const winner = getWinner(board);
        board[index] = "";

        if (winner === symbol) {
            return index;
        }
    }

    return -1;
};

const chooseMediumMove = (board) => {
    const winningMove = findImmediateMove(board, "O");

    if (winningMove !== -1) {
        return winningMove;
    }

    const blockingMove = findImmediateMove(board, "X");

    if (blockingMove !== -1) {
        return blockingMove;
    }

    return chooseRandomMove(board);
};

const chooseHardMove = (board) => {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let index = 0; index < board.length; index++) {
        if (board[index] !== "") {
            continue;
        }

        board[index] = "O";
        const score = minimax(board, false);
        board[index] = "";

        if (score > bestScore) {
            bestScore = score;
            bestMove = index;
        }
    }

    return bestMove;
};

const playAiTurn = () => {
    if (!isAiMode || !gameStarted || gameFinished || !turnO) {
        return;
    }

    aiThinking = true;

    setTimeout(() => {
        if (!isAiMode || !gameStarted || gameFinished || !turnO) {
            aiThinking = false;
            return;
        }

        const move = chooseAiMove();

        if (move === -1) {
            aiThinking = false;
            return;
        }

        playClickSound();
        boxes[move].innerText = "O";
        boxes[move].disabled = true;

        const roundFinished = checkWin();
        aiThinking = false;

        if (!roundFinished) {
            turnO = false;
            updateTurnIndicator();
        }
    }, 450);
};

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
    msg.innerText = `🎉 Winner is ${players[winner]} (${winner})`;
    scores[winner]++;
    nextRoundStartsWithO = winner === "O";
    updateScoreboard();
    updateTurnIndicator();
    showWinningLine(pattern);
    playWinSound();
    disableBoxes();
};

const showDraw = () => {
    gameFinished = true;
    msg.innerText = "Game was a draw";
    scores.draw++;
    updateScoreboard();
    updateTurnIndicator();
    playDrawSound();
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
    turnO = nextRoundStartsWithO;
    gameFinished = false;

    enableBoxes();

    msg.innerText = "";
    updateTurnIndicator();
    hideWinningLine();
    playAiTurn();
};

const resetGame = () =>{
    playResetSound();

    if (!gameStarted) {
        msg.innerText = "Enter player names before starting the game.";
        return;
    }

    resetBoard();
};

const startGame = (event) => {
    event.preventDefault();
    playClickSound();

    players.X = playerXNameInput.value.trim() || "Player X";
    players.O = isAiMode ? "AI" : playerONameInput.value.trim() || "Player O";
    scores = {
        X: 0,
        O: 0,
        draw: 0
    };
    nextRoundStartsWithO = false;
    gameStarted = true;

    updateScoreboard();
    resetBoard();
};

const showFinalResult = () => {
    playClickSound();

    if (!gameStarted) {
        msg.innerText = "Enter player names before ending the game.";
        return;
    }

    gameFinished = true;
    disableBoxes();
    hideWinningLine();
    updateTurnIndicator();

    if (scores.X === scores.O) {
        msg.innerText = `Match drawn on total score: ${players.X} ${scores.X} - ${scores.O} ${players.O}`;
        return;
    }

    const winnerSymbol = scores.X > scores.O ? "X" : "O";
    const loserSymbol = winnerSymbol === "X" ? "O" : "X";
    const winningScore = scores[winnerSymbol];
    const losingScore = scores[loserSymbol];
    const margin = winningScore - losingScore;

    msg.innerText = `🏆 ${players[winnerSymbol]} wins by total score ${winningScore}-${losingScore} (${margin} point${margin === 1 ? "" : "s"})`;
    playWinSound();
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
aiModeBtn.addEventListener("click", () => {
    playClickSound();
    isAiMode = !isAiMode;
    updateAiModeControls();

    if (gameStarted) {
        startGame(new Event("submit"));
    }
});
aiLevelSelect.addEventListener("change", playClickSound);
resetBtn.addEventListener("click", resetGame);
gameOverBtn.addEventListener("click", showFinalResult);
muteBtn.addEventListener("click", () => {
    playClickSound();
    soundMuted = !soundMuted;
    updateMuteButton();
});
themeBtn.addEventListener("click", () => {
    playClickSound();
    document.body.classList.toggle("light-mode");
    document.body.classList.toggle("dark-mode");

    const isLightMode = document.body.classList.contains("light-mode");
    themeBtn.innerText = isLightMode ? "Dark Mode" : "Light Mode";
});

prepareInitialState();
updateAiModeControls();
updateMuteButton();
