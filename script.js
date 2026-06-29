let boxes = document.querySelectorAll(".box");
let resetBtn = document.getElementById("reset-btn");
let themeBtn = document.getElementById("theme-btn");
let msg = document.getElementById("msg");
let turnIndicator = document.getElementById("turn-indicator");
let xScore = document.getElementById("x-score");
let oScore = document.getElementById("o-score");
let drawScore = document.getElementById("draw-score");
let game = document.querySelector(".game");
let winLine = document.getElementById("win-line");

let turn0 = true; // true for 0's turn, false for X's turn
let scores = {
    X: 0,
    "0": 0,
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
    xScore.innerText = scores.X;
    oScore.innerText = scores["0"];
    drawScore.innerText = scores.draw;
};

const updateTurnIndicator = () => {
    turnIndicator.innerText = `Current Turn : ${turn0 ? "0" : "X"}`;
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
        console.log("box was clicked");
        box.innerText = turn0 ? "0" : "X";
        box.disabled = true;

        const gameFinished = checkWin();
        if (!gameFinished) {
            turn0 = !turn0;
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
    msg.innerText = `Winner is ${winner}`;
    scores[winner]++;
    updateScoreboard();
    turnIndicator.innerText = "Current Turn : Game Over";
    showWinningLine(pattern);
    disableBoxes();
};

const showDraw = () => {
    msg.innerText = "Game was a draw";
    scores.draw++;
    updateScoreboard();
    turnIndicator.innerText = "Current Turn : Game Over";
};

const checkWin = () => {
    for (let pattern of winPatterns) {
        
        console.log(pattern[0], pattern[1], pattern[2]);

            let pos1Val = boxes[pattern[0]].innerText;
            let pos2Val = boxes[pattern[1]].innerText;
            let pos3Val = boxes[pattern[2]].innerText;

            if (pos1Val != ""&& pos2Val != ""&& pos3Val != "") {
                if (pos1Val === pos2Val && pos2Val === pos3Val) {
                    console.log("Winner: " + pos1Val);
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

    const resetGame = () =>{

    turn0 = true;

    enableBoxes();

    msg.innerText = "";
    updateTurnIndicator();
    hideWinningLine();

};

resetBtn.addEventListener("click", resetGame);
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    document.body.classList.toggle("dark-mode");

    const isLightMode = document.body.classList.contains("light-mode");
    themeBtn.innerText = isLightMode ? "Dark Mode" : "Light Mode";
});

updateScoreboard();
updateTurnIndicator();
