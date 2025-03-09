// Variables
const menuScreen = document.querySelector(".js-menu");
const menuMarkInputs = document.querySelectorAll(".js-menu-input");
const menuMarkInputLabels = document.querySelectorAll(".js-menu-label");
const menuStartGameButtons = document.querySelectorAll(".js-menu-button");
const boardMovesContainer = document.querySelector(".js-board-moves");
const boardScreen = document.querySelector(".js-board");
const boardTurn = document.querySelector(".js-board-turn");
const modalToggleButtons = document.querySelectorAll(".js-modal-trigger");
const modalOverlay = document.querySelector("#js-overlay");
const modalGameOver = document.querySelector("#js-modal-over");
const modalGameRestart = document.querySelector("#js-modal-restart");
const btnRestartGame = document.querySelector("#js-restart-button");
const btnQuitGame = document.querySelector("#js-quit-button");
const btnNextRound = document.querySelector("#js-next-button");
const labelRoundOutcome = document.getElementById("js-round-outcome");
const labelWinsTotalPlayer = document.querySelector("#js-wins-p1");
const labelWinsTotalOpponent = document.querySelector("#js-wins-opponent");
const labelWinsTitlePlayer = document.querySelector("#js-wins-title-p1");
const labelWinsTitleOpponent = document.querySelector(
  "#js-wins-title-opponent"
);

const winningCombination = [
  [0, 1, 2],
  [0, 3, 6],
  [0, 4, 8],
  [1, 4, 7],
  [2, 4, 6],
  [2, 5, 8],
  [3, 4, 5],
  [6, 7, 8],
];

const initialData = {
  movements: Array.from({ length: 9 }, () => null),
  p1Mark: "mark--ring",
  cpuMark: null,
  p2Mark: null,
  opponent: null,
  nextRoundPlayerTurn: null,
  currentPlayerTurn: null,
  currentRoundMoves: 0,
  currentRoundWinner: null,
  isGameRoundOver: false,
  p1Wins: 0,
  p2Wins: 0,
  cpuWins: 0,
  ties: 0,
};

let ticTacDB;
let isGameRoundOver = false;

/* ///////////////////////// */

function connectDB() {
  if (!localStorage.getItem("ticTacDB")) {
    localStorage.setItem("ticTacDB", JSON.stringify(initialData));
  }

  ticTacDB = getDataFromDB();
  isGameRoundOver = ticTacDB.isGameRoundOver;
}

/* ///////////////////////// */

function getDataFromDB() {
  if (!localStorage.getItem("ticTacDB")) throw Error("Failed to retrieve Data");

  return JSON.parse(localStorage.getItem("ticTacDB"));
}

/* ///////////////////////// */

function setPlayerMark() {
  let playerSelectedMark = "mark--ring";

  //check if function triggered by input change
  if (this?.name === "mark") {
    playerSelectedMark = this.getAttribute("data-name");
  } else {
    document.getElementById(playerSelectedMark).checked = true;
  }

  menuMarkInputLabels.forEach((label) =>
    label.setAttribute("data-checked", false)
  );

  document
    .querySelector(`.js-menu-label[data-input-ref=${playerSelectedMark}]`)
    .setAttribute("data-checked", true);

  ticTacDB.p1Mark = playerSelectedMark;
}

/* ///////////////////////// */

function changeTurnMark() {
  const ticTacDB = getDataFromDB();

  if (document.querySelector(".board__turn-mark")) {
    document.querySelector(".board__turn-mark").remove();
  }

  const { currentPlayerTurn: playerTurn, cpuMark, p2Mark, p1Mark } = ticTacDB;

  const mark =
    playerTurn === "p1" ? p1Mark : playerTurn === "p2" ? p2Mark : cpuMark;

  const html = `<span id="js-board-turn-mark" class="board__turn-mark board__turn-${mark} input-mark input-${mark}"></span>`;

  boardTurn.insertAdjacentHTML("afterbegin", html);
}

/* ///////////////////////// */

function startNewGame() {
  console.log("new game", this);
  const opponent = this.getAttribute("data-opponent");

  let { p1Mark, cpuMark, p2Mark, currentPlayerTurn, nextRoundPlayerTurn } =
    ticTacDB;

  if (p1Mark === "mark--ring") {
    if (opponent == "cpu") {
      cpuMark = "mark--x";
      currentPlayerTurn = "cpu";
    }

    if (opponent == "p2") {
      p2Mark = "mark--x";
      currentPlayerTurn = "p2";
    }

    nextRoundPlayerTurn = "p1";
  } else if (p1Mark === "mark--x") {
    currentPlayerTurn = "p1";

    if (opponent == "cpu") {
      cpuMark = "mark--ring";
    }

    if (opponent == "p2") {
      p2Mark = "mark--ring";
    }

    nextRoundPlayerTurn = opponent;
  }

  isGameRoundOver = false;
  console.log(ticTacDB);
  const updatedData = {
    ...ticTacDB,
    // ...initialData,
    isGameRoundOver,
    p2Mark,
    cpuMark,
    opponent,
    currentPlayerTurn,
    nextRoundPlayerTurn,
  };

  localStorage.setItem("ticTacDB", JSON.stringify(updatedData));

  switchScreen("menu");
  changeTurnMark();
  displayGameBoard();
}

/* ///////////////////////// */

function displayGameBoard() {
  const {
    movements,
    opponent,
    p1Mark,
    p2Mark,
    cpuMark,
    cpuWins,
    p2Wins,
    p1Wins,
  } = getDataFromDB();

  boardMovesContainer.innerHTML = "";

  movements.forEach((move, i) => {
    const moveLabel = document.createElement("label");
    const moveInput = document.createElement("input");

    moveLabel.classList.add("js-moves-label", "board__moves-label");
    moveLabel.setAttribute("for", `js-input${i}`);

    moveInput.classList.add(
      "js-moves-input",
      "input-mark",
      "board__moves-input"
    );
    moveInput.type = "radio";
    moveInput.id = `js-input${i}`;
    moveInput.setAttribute("data-position", i);
    moveInput.addEventListener("change", makeMove);

    if (move) {
      const mark = move === "p1" ? p1Mark : move === "p2" ? p2Mark : cpuMark;

      moveInput.classList.add(`board__moves-${mark}`);
      moveInput.checked = true;
    }

    moveLabel.append(moveInput);
    boardMovesContainer.insertAdjacentElement("beforeend", moveLabel);

    labelWinsTitlePlayer.textContent = `${
      p1Mark === "mark--x" ? x : "o"
    } (You)`;

    labelWinsTitleOpponent.textContent = `${p1Mark === "mark--x" ? o : "x"} ${
      opponent === "cpu" ? "(Cpu)" : "(P2)"
    }`;
  });

  labelWinsTotalOpponent.textContent = opponent === "cpu" ? cpuWins : p2Wins;
  labelWinsTotalPlayer.textContent = p1Wins;
}

/* ///////////////////////// */

function makeMove() {
  if (isGameRoundOver) return;

  const dataFromDB = getDataFromDB();

  let {
    opponent,
    p1Mark,
    p2Mark,
    cpuMark,
    currentPlayerTurn,
    currentRoundMoves,
    movements,
  } = dataFromDB;

  let playerMark;

  switch (currentPlayerTurn) {
    case "p1":
      playerMark = p1Mark;
      break;

    case "p2":
      playerMark = p2Mark;
      break;

    case "cpu":
      playerMark = cpuMark;
      break;

    default:
      break;
  }

  const movePos = this.getAttribute("data-position");

  movements[movePos] = currentPlayerTurn;
  currentRoundMoves += 1;

  localStorage.setItem(
    "ticTacDB",
    JSON.stringify({
      ...dataFromDB,
      movements,
      currentPlayerTurn: currentPlayerTurn === "p1" ? opponent : "p1",
      currentRoundMoves,
    })
  );

  document
    .getElementById(`js-input${movePos}`)
    .classList.add(`board__moves-${playerMark}`);

  checkForWinner(currentPlayerTurn);
}

/* ///////////////////////// */

function checkForWinner(currentPlayer) {
  const ticTacDB = getDataFromDB();

  if (!currentPlayer || !ticTacDB) return;

  let { movements, currentRoundWinner } = ticTacDB;
  let matchedWinningCombination = [];

  // Get all moves made by current player
  const playerSelectedMoves = movements
    .map((move, i) => {
      if (move === currentPlayer) return i;
    })
    .filter((i) => i !== undefined);

  // Check if player moves match any wining combination
  for (const combination of winningCombination) {
    playerSelectedMoves.forEach((move) => {
      if (combination.includes(move)) {
        matchedWinningCombination.push(move);
      }
    });

    if (combination.join("") === matchedWinningCombination.join("")) {
      isGameRoundOver = true;
      currentRoundWinner = currentPlayer;

      localStorage.setItem(
        "ticTacDB",
        JSON.stringify({ ...ticTacDB, isGameRoundOver, currentRoundWinner })
      );

      toggleModal("modal-over");
      return;
    } else {
      matchedWinningCombination = [];
    }
  }

  !isGameRoundOver && changeTurnMark();
}

/* ///////////////////////// */

function displayWinner() {
  const ticTacDB = getDataFromDB();
  let { p1Wins, p2Wins, cpuWins, ties, currentRoundWinner } = ticTacDB;

  let outcomeText = "";

  if (currentRoundWinner === "draw") {
    outcomeText = "Draw!";
    ties += 1;
  } else if (currentRoundWinner === "p1") {
    outcomeText = "Yey, You Won!";
    p1Wins += 1;
  } else {
    outcomeText = "Oh, You Lose!";
    currentRoundWinner === "p2" ? (p2Wins += 1) : (cpuWins += 1);
  }

  labelRoundOutcome.textContent = outcomeText;

  localStorage.setItem(
    "ticTacDB",
    JSON.stringify({ ...ticTacDB, p1Wins, p2Wins, cpuWins, ties })
  );
}

/* ///////////////////////// */

function restartGame() {
  console.log(initialData);
  const modal = this.getAttribute("data-target");
  localStorage.setItem("ticTacDB", JSON.stringify(initialData));

  ticTacDB = getDataFromDB();

  switchScreen("board");
  // toggleModal(modal);
  setPlayerMark();
}

/* ///////////////////////// */

function toggleModal(modal) {
  if (!modal) return;

  const ticTacDB = getDataFromDB();

  let isHidden = true;

  if (modal === "modal-restart") {
    isHidden = modalGameRestart.classList.contains("is-hidden");

    modalGameRestart.classList.toggle("is-hidden", !isHidden);
  }

  if (modal === "modal-over") {
    displayWinner();

    isHidden = modalGameOver.classList.contains("is-hidden");
    modalGameOver.classList.toggle("is-hidden", !isHidden);
  }

  modalOverlay.classList.toggle("is-hidden", !isHidden);
}

/* ///////////////////////// */

function switchScreen(screen) {
  if (!screen) throw new Error("provide a valid screen!");

  menuScreen.classList.toggle("menu--hidden", screen === "menu");
  boardScreen.classList.toggle("board--hidden", screen === "board");
}

// Events || Function Execution
connectDB();

if (ticTacDB?.currentRoundMoves > 0) {
  changeTurnMark();
  displayGameBoard();
  switchScreen("menu");
}

menuMarkInputs.forEach((input) =>
  input.addEventListener("change", setPlayerMark)
);

// menuStartGameButtons.forEach((btn) =>
//   btn.addEventListener("click", startNewGame)
// );
menuStartGameButtons[0].addEventListener("click", startNewGame);

modalToggleButtons.forEach((btn) =>
  btn.addEventListener("click", () => toggleModal("modal-restart"))
);

btnRestartGame.addEventListener("click", restartGame);
btnQuitGame.addEventListener("click", restartGame);
