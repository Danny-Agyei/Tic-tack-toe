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
const labelTiesTotal = document.querySelector("#js-ties");
const labelWinsTitlePlayer = document.querySelector("#js-wins-title-p1");
const labelWinsTitleOpponent = document.querySelector(
  "#js-wins-title-opponent"
);

import {
  completeThreeMovesIfTwo,
  blockPlayerThreeMove,
  addSecondMoveIfOne,
  moveToAnyAvailableSpace,
} from "./cpuMovementHelper.js";

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
  currentPlayerTurn: null,
  nextRoundPlayerTurn: null,
  currentRoundMoves: 0,
  currentRoundWinner: null,
  isGameRoundOver: false,
  opponent: null,
  p1Mark: "mark--ring",
  cpuMark: null,
  p2Mark: null,
  p1Wins: 0,
  p2Wins: 0,
  cpuWins: 0,
  ties: 0,
};

const clickAudio = new Audio("./click.wav");
const LoseAudio = new Audio("./lose.mp3");
const winAudio = new Audio("./winners.mp3");
let isGameRoundOver = false;
let ticTacDB;

function playSound(type) {
  if (type === "click") {
    clickAudio.play();
  }
  if (type === "win") {
    winAudio.play();
  }
  if (type === "lose") {
    LoseAudio.play();
  }
}

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

function updateDB(data) {
  if (!data) return;
  const oldData = getDataFromDB();

  localStorage.setItem("ticTacDB", JSON.stringify({ ...oldData, ...data }));

  ticTacDB = getDataFromDB();
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
  const turnPlayerMark = document.querySelector(".board__turn-mark");
  ticTacDB = getDataFromDB();

  if (turnPlayerMark) turnPlayerMark.remove();

  const { currentPlayerTurn, cpuMark, p2Mark, p1Mark } = ticTacDB;

  const mark =
    currentPlayerTurn === "p1"
      ? p1Mark
      : currentPlayerTurn === "p2"
      ? p2Mark
      : cpuMark;

  const html = `<span id="js-board-turn-mark" class="board__turn-mark board__turn-${mark} input-mark input-${mark}"></span>`;

  boardTurn.insertAdjacentHTML("afterbegin", html);
}

/* ///////////////////////// */

function switchScreen(screen) {
  if (!screen) return;

  menuScreen.classList.toggle("menu--hidden", screen === "menu");
  boardScreen.classList.toggle("board--hidden", screen === "board");
}

/* ///////////////////////// */

function toggleModal(modal) {
  if (!modal) return;
  const { isGameRoundOver, nextRoundPlayerTurn, p1Mark, p2Mark, cpuMark } =
    ticTacDB;

  const nextRoundMarkWrapper = document.getElementById("js-next-round-turn");

  let isHidden = true;

  if (modal === "modal-restart") {
    isHidden = modalGameRestart.classList.contains("is-hidden");
    modalGameRestart.classList.toggle("is-hidden", !isHidden);
  } else if (modal === "modal-over") {
    isHidden = modalGameOver.classList.contains("is-hidden");
    modalGameOver.classList.toggle("is-hidden", !isHidden);

    if (isGameRoundOver) {
      const markEl = document.createElement("span");
      const nextRoundMark =
        nextRoundPlayerTurn === "p1"
          ? p1Mark
          : nextRoundPlayerTurn === "p2"
          ? p2Mark
          : cpuMark;

      markEl.classList.add(
        "modal__mark",
        "input-mark",
        `modal__${nextRoundMark}`,
        `input-${nextRoundMark}`
      );

      nextRoundMarkWrapper.innerHTML = "";
      nextRoundMarkWrapper.append(markEl);
    }
  }

  modalOverlay.classList.toggle("is-hidden", !isHidden);
}

/* ///////////////////////// */

function startNewGame() {
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

  const updatedData = {
    ...ticTacDB,
    isGameRoundOver,
    p2Mark,
    cpuMark,
    opponent,
    currentPlayerTurn,
    nextRoundPlayerTurn,
  };

  updateDB(updatedData);
  switchScreen("menu");
  changeTurnMark();
  displayGameBoard();

  if (currentPlayerTurn === "cpu") handleCpuMovement();
}

/* ///////////////////////// */

function displayGameBoard() {
  ticTacDB = getDataFromDB();

  const {
    movements,
    opponent,
    p1Mark,
    p2Mark,
    cpuMark,
    cpuWins,
    p2Wins,
    p1Wins,
    ties,
  } = ticTacDB;

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
    moveInput.addEventListener("change", handlePlayerMovement);

    if (move) {
      const mark = move === "p1" ? p1Mark : move === "p2" ? p2Mark : cpuMark;

      moveInput.classList.add(`board__moves-${mark}`);
      moveInput.checked = true;
    }

    moveLabel.append(moveInput);
    boardMovesContainer.insertAdjacentElement("beforeend", moveLabel);

    labelWinsTitlePlayer.textContent = `${
      p1Mark === "mark--x" ? "x" : "o"
    } (You)`;

    labelWinsTitleOpponent.textContent = `${p1Mark === "mark--x" ? "o" : "x"} ${
      opponent === "cpu" ? "(Cpu)" : "(P2)"
    }`;
  });

  labelWinsTotalOpponent.textContent = opponent === "cpu" ? cpuWins : p2Wins;
  labelWinsTotalPlayer.textContent = p1Wins;
  labelTiesTotal.textContent = ties;
}

/* ///////////////////////// */

function handlePlayerMovement() {
  if (isGameRoundOver) return;

  const ticTacDB = getDataFromDB();

  let {
    opponent,
    p1Mark,
    p2Mark,
    cpuMark,
    currentPlayerTurn,
    currentRoundMoves,
    movements,
  } = ticTacDB;

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

  const updatedData = {
    movements,
    currentPlayerTurn: currentPlayerTurn === "p1" ? opponent : "p1",
    currentRoundMoves,
  };

  playSound("click");
  updateDB(updatedData);
  checkForWinner(currentPlayerTurn);
  displayGameBoard();

  if (getDataFromDB().currentPlayerTurn === "cpu") {
    handleCpuMovement();
  }
}

/* ///////////////////////// */

function handleCpuMovement() {
  if (isGameRoundOver) return;

  ticTacDB = getDataFromDB();
  let { currentPlayerTurn, currentRoundMoves, movements } = ticTacDB;

  const getMovements = (player) => {
    return movements
      .map((move, i) => move === player && i)
      .filter((i) => typeof i === "number");
  };

  const playerMovements = getMovements("p1");
  const cpuMovements = getMovements("cpu");

  setTimeout(() => {
    const hasCompleted = completeThreeMovesIfTwo(
      movements,
      winningCombination,
      cpuMovements
    );

    if (!hasCompleted) {
      const hasBlocked = blockPlayerThreeMove(
        movements,
        winningCombination,
        playerMovements
      );

      if (!hasBlocked) {
        const secondMoveAdded = addSecondMoveIfOne(
          movements,
          winningCombination,
          cpuMovements
        );

        if (!secondMoveAdded) moveToAnyAvailableSpace(movements);
      }
    }

    currentRoundMoves += 1;

    const updatedData = {
      movements,
      currentPlayerTurn: "p1",
      currentRoundMoves,
    };

    playSound("click");
    updateDB(updatedData);
    displayGameBoard();
    checkForWinner(currentPlayerTurn);
  }, 1200);
}

/* ///////////////////////// */

function checkForWinner(currentPlayer) {
  ticTacDB = getDataFromDB();

  if (!currentPlayer || !ticTacDB) return;

  let { movements, currentRoundMoves } = ticTacDB;
  let matchedWinningCombination = [];

  const playerSelectedMoves = movements
    .map((move, i) => {
      if (move === currentPlayer) return i;
    })
    .filter((i) => i !== undefined);

  for (const combination of winningCombination) {
    playerSelectedMoves.forEach((move) => {
      if (combination.includes(move)) {
        matchedWinningCombination.push(move);
      }
    });

    if (combination.join("") === matchedWinningCombination.join("")) {
      isGameRoundOver = true;

      updateDB({
        isGameRoundOver,
        currentRoundWinner: currentPlayer,
      });
      displayWinner();
      toggleModal("modal-over");

      break;
    } else {
      matchedWinningCombination = [];
    }
  }

  if (currentRoundMoves === 9 && !isGameRoundOver) {
    isGameRoundOver = true;

    updateDB({
      isGameRoundOver,
      currentRoundWinner: "draw",
    });
    displayWinner();
    toggleModal("modal-over");
  }

  if (!isGameRoundOver) changeTurnMark();
}

/* ///////////////////////// */

function displayWinner() {
  ticTacDB = getDataFromDB();

  let {
    opponent,
    p1Wins,
    p2Wins,
    cpuWins,
    ties,
    currentRoundWinner,
    isGameRoundOver,
  } = ticTacDB;
  let outcomeText = "";

  if (!isGameRoundOver) return;

  switch (currentRoundWinner) {
    case "draw":
      outcomeText = "Draw!";
      ties += 1;
      break;

    case "cpu":
      outcomeText = "Oh, You Lose!";
      cpuWins += 1;
      break;

    case "p1":
      outcomeText = opponent === "p2" ? "P1 Wins!" : "Yey, You Won!";
      p1Wins += 1;
      break;

    case "p2":
      outcomeText = "P2 Wins!";
      p2Wins += 1;
      break;

    default:
      break;
  }

  updateDB({
    p1Wins,
    p2Wins,
    cpuWins,
    ties,
  });

  labelWinsTotalOpponent.textContent = opponent === "cpu" ? cpuWins : p2Wins;
  labelWinsTotalPlayer.textContent = p1Wins;
  labelTiesTotal.textContent = ties;
  labelRoundOutcome.textContent = outcomeText;

  if (outcomeText === "Yey, You Won!") {
    playSound("win");
  } else if (outcomeText === "Oh, You Lose!") {
    playSound("lose");
  }
}

/* ///////////////////////// */

function restartGame() {
  const modal = this.getAttribute("data-target");
  updateDB(initialData);

  ticTacDB = getDataFromDB();

  switchScreen("board");
  toggleModal(modal);
  setPlayerMark();
}

/* ///////////////////////// */

function goToNextRound() {
  ticTacDB = getDataFromDB();
  let {
    opponent,
    p1Mark,
    p1Wins,
    p2Mark,
    p2Wins,
    cpuMark,
    cpuWins,
    ties,
    nextRoundPlayerTurn,
    currentRoundMoves,
    currentPlayerTurn,
  } = ticTacDB;

  if (!isGameRoundOver) return;

  currentRoundMoves = 0;
  currentPlayerTurn = nextRoundPlayerTurn;
  nextRoundPlayerTurn = nextRoundPlayerTurn === "p1" ? opponent : "p1";
  isGameRoundOver = false;

  const updatedData = {
    ...initialData,
    p1Mark,
    p1Wins,
    p2Mark,
    p2Wins,
    ties,
    cpuMark,
    cpuWins,
    opponent,
    currentRoundMoves,
    currentPlayerTurn,
    nextRoundPlayerTurn,
    isGameRoundOver,
  };

  updateDB(updatedData);
  toggleModal("modal-over");
  displayGameBoard();
  changeTurnMark();

  if (currentPlayerTurn === "cpu") handleCpuMovement();
}

/* ///////////////////////// */

// Events & Controller
connectDB();

if (
  ticTacDB?.currentRoundMoves > 0 ||
  ticTacDB?.cpuWins > 0 ||
  ticTacDB?.p1Wins > 0 ||
  ticTacDB?.p2Wins > 0 ||
  ticTacDB?.ties > 0
) {
  if (isGameRoundOver) {
    displayWinner();
    toggleModal("modal-over");
  }

  ticTacDB?.currentPlayerTurn === "cpu" && handleCpuMovement();

  displayGameBoard();
  switchScreen("menu");
  changeTurnMark();
}

menuMarkInputs.forEach((input) =>
  input.addEventListener("change", setPlayerMark)
);

menuStartGameButtons.forEach((btn) =>
  btn.addEventListener("click", startNewGame)
);

modalToggleButtons.forEach((btn) =>
  btn.addEventListener("click", () => toggleModal("modal-restart"))
);

btnQuitGame.addEventListener("click", restartGame);
btnRestartGame.addEventListener("click", restartGame);
btnNextRound.addEventListener("click", goToNextRound);
