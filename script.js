function createPlayer(name, symbol) {
    return { name, symbol, wins: 0 }
}

function newGameBoard() {
    const board = [["", "", ""], ["", "", ""], ["", "", ""]];
    let rounds = 0;

    const getRound = () => rounds;

    const checkWin = (symbol) => {
        const resultsArr = [];
        // check rows

        for (let i = 0; i < 3; i++) {
            const row = board[i].join("");
            resultsArr.push(row);
        }

        // cols

        for (let i = 0; i < 3; i++) {
            let col = "";
            for (let j = 0; j < 3; j++) {
                col += board[j][i];
            }
            resultsArr.push(col);
        }

        let diagonal = "";

        // top left to bottom right

        for (let i = 0; i < 3; i++) {
            diagonal += board[i][i];
        }
        resultsArr.push(diagonal);

        // top right to bottom left

        diagonal = "";
        for (let i = 0; i < 3; i++) {
            diagonal += board[i][2 - i];
        }
        resultsArr.push(diagonal);

        return resultsArr.includes(symbol.repeat(3));
    };

    const playerMove = (row, col, symbol) => {
        board[row][col] = symbol;
        rounds++;
    };

    function validMove(row, col) {
        if (board[row][col] === "") {
            return true;
        }
        return false;
    }

    function resetBoard() {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                board[i][j] = "";
            }
        }
        rounds = 0;
    }

    function computerMove() {
        let row = Math.floor(Math.random() * 3);
        let col = Math.floor(Math.random() * 3);

        if (rounds >= 9) {
            return;
        }

        while (board[row][col] !== "") {
            row = Math.floor(Math.random() * 3);
            col = Math.floor(Math.random() * 3);
        }

        return { row, col }
    }

    const getBoard = () => board;

    return {
        checkWin, getRound, playerMove, validMove,
        resetBoard, computerMove, getBoard
    }
}

function playGame(player1, player2) {
    const board = newGameBoard();
    const gameUi = createGameUI(player1, player2, handleClick);

    const computer = player2.name === "Computer" ? true : false;

    let currentPlayerTurn = player1;

    const switchPlayers = () => currentPlayerTurn = currentPlayerTurn === player1 ? player2 : player1;

    // Makes player 1 start second if playing with friend

    if (!computer && player1.symbol === "O") {
        currentPlayerTurn = player2;
    }

    // Makes Computer go First when Computer is X

    if (computer && player2.symbol === "X") {
        const compMove = board.computerMove();
        board.playerMove(compMove.row, compMove.col, player2.symbol);
        gameUi.updateCell(compMove.row, compMove.col, player2.symbol);
    }

    function handleClick(row, col) {

        console.log(board.getBoard());

        if (board.validMove(row, col)) {
            board.playerMove(row, col, currentPlayerTurn.symbol);
        }
        else {
            return;
        }

        gameUi.updateCell(row, col, currentPlayerTurn.symbol);

        if (board.checkWin(currentPlayerTurn.symbol)) {
            gameUi.disableBoard();
            resetGame(currentPlayerTurn);
            return;
        }
        else if (board.getRound() === 9) {
            resetGame("Draw");
            return;
        }

        if (computer) {
            computerTurn();
        }
        else {
            switchPlayers();
        }
    }

    function computerTurn() {
        gameUi.disableBoard();

        setTimeout(() => {
            const compMove = board.computerMove();
            board.playerMove(compMove.row, compMove.col, player2.symbol);
            gameUi.updateCell(compMove.row, compMove.col, player2.symbol);

            if (board.checkWin(player2.symbol)) {
                resetGame(player2);
                return;
            }
            else if (board.getRound() >= 9) {
                resetGame();
                return;
            }
            gameUi.enableBoard();

        }, 500);
    }

    function resetGame(winner) {
        setTimeout(() => {

            if (winner === player1) {
                player1.wins++;
            }
            if (winner === player2) {
                player2.wins++;
            }

            board.resetBoard();
            gameUi.resetBoard();
            gameUi.enableBoard();
            gameUi.updateGame();

            // Friend mode: Makes X always goes first
            if (currentPlayerTurn.symbol !== "X" && !computer) {
                switchPlayers();
            }

            // Computer Mode: Makes Computer go first
            if (computer && player2.symbol === "X") {
                const compMove = board.computerMove();
                board.playerMove(compMove.row, compMove.col, player2.symbol);
                gameUi.updateCell(compMove.row, compMove.col, player2.symbol);
            }

        }, 500);
    }
}

function createGameUI(person1, person2, clickLogic) {
    const player1Title = document.getElementById("player1-name");
    const player2Title = document.getElementById("player2-name")
    const player1Symbol = document.getElementById("player1-symbol");
    const player2Symbol = document.getElementById("player2-symbol");
    const playerOneWinStat = document.getElementById("p1-wins-stat");
    const player2WinStat = document.getElementById("p2-wins-stat");
    const allCells = document.querySelectorAll(".cell");

    const cellMatrix = [...Array(3)].map(() => Array(3).fill(null));

    player1Title.textContent = person1.name;
    player2Title.textContent = person2.name;

    player1Symbol.textContent = person1.symbol;
    player2Symbol.textContent = person2.symbol;

    playerOneWinStat.textContent = person1.wins;
    player2WinStat.textContent = person2.wins;

    allCells.forEach((cell) => {

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        cellMatrix[row][col] = cell;

        cell.addEventListener("click", () => {
            clickLogic(row, col);
        });
    });

    function updateCell(row, col, symbol) {
        const currCell = cellMatrix[row][col];
        currCell.textContent = symbol;

        if (symbol === "X") {
            currCell.style.color = "red";
        } else {
            currCell.style.color = "blue";
        }

    }

    function resetBoard() {
        allCells.forEach((cell) => {
            cell.textContent = "";
            console.log("Heres matrix cell" + cell);
        })
    }

    function disableBoard() {
        cellMatrix.flat().forEach(cell => {
            cell.classList.add("disabled");
        });
        console.log("Disabled");
    }

    function enableBoard() {
        cellMatrix.flat().forEach((cell) => {
            cell.classList.remove("disabled");
        });
        console.log("Enabled");
    }

    function updateGame() {
        playerOneWinStat.textContent = person1.wins;
        player2WinStat.textContent = person2.wins;
    }

    return { updateCell, resetBoard, disableBoard, enableBoard, updateGame }
}

const startDialogUI = (function () {
    let modal, inputName, form, opponent, symbolBtn, resetBtn;

    const show = () => modal.showModal();
    const close = () => modal.close();

    function init() {
        modal = document.getElementById("starting-screen");
        form = document.getElementById("form-dialog");
        inputName = document.getElementById("name");
        opponent = document.getElementById("opponent-type");
        symbolBtn = document.getElementById("selector");
        resetBtn = document.getElementById("reset-btn");

        symbolBtn.addEventListener("click", () => {
            if (symbolBtn.textContent === "X") {
                symbolBtn.textContent = "O";
                symbolBtn.style.color = "#1890ff"
            }
            else {
                symbolBtn.textContent = "X";
                symbolBtn.style.color = "#ff4d4f"
            }
        });


        resetBtn.addEventListener("click", () => location.reload());
        startGame();
    }

    function preventsEsc(dialogEl) {
        dialogEl.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
            }
        });
    }

    function startGame() {
        preventsEsc(modal);

        show();

        form.addEventListener("submit", (e) => {
            e.preventDefault();


            const player1 = createPlayer(inputName.value, symbolBtn.textContent);
            const player2 = createPlayer(opponent.value, symbolBtn.textContent === "X" ? "O" : "X");
            close();
            playGame(player1, player2);
        })
    }

    return {
        init, startGame
    }
})();

window.addEventListener("DOMContentLoaded", () => {
    startDialogUI.init();
});