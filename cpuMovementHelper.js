// cpuMovementHelper.js
export function completeThreeMovesIfTwo(
  movements,
  winningCombination,
  cpuMovements
) {
  // Logic to check if the CPU can complete a winning move by making it three
  // and return whether the move is completed.

  let hasOnlyCpuMoves = false;
  let isSuccess = false;

  for (const combination of winningCombination) {
    cpuMovements.forEach((move) => {
      if (combination.includes(move)) {
        hasOnlyCpuMoves = combination.every((comb) => movements[comb] !== "p1");
      }
    });

    if (hasOnlyCpuMoves) {
      let numOfCpuMoveAppearance = 0;
      let nullMovePosition = null;

      combination.forEach((i) => {
        if (movements[i] === "cpu") {
          numOfCpuMoveAppearance += 1;
        }
        if (movements[i] === null) {
          nullMovePosition = i;
        }
      });

      if (numOfCpuMoveAppearance === 2) {
        movements[nullMovePosition] = "cpu";
        isSuccess = true;
        break;
      }
    }
  }

  return isSuccess;
}

export function blockPlayerThreeMove(
  movements,
  winningCombination,
  playerMovements
) {
  // Logic to block the player if they can complete three in a row
  // and return whether the block was successful.

  let combinationWithOnlyPlayerMoves = [];
  let numOfPlayerAppearance = 0;

  for (const combination of winningCombination) {
    playerMovements.forEach((move) => {
      if (combination.includes(move)) {
        combinationWithOnlyPlayerMoves = combination;
      }
    });

    combinationWithOnlyPlayerMoves.forEach((move) => {
      movements[move] === "p1" && ++numOfPlayerAppearance;
      movements[move] === "cpu" && --numOfPlayerAppearance;
    });

    if (numOfPlayerAppearance === 2) {
      combinationWithOnlyPlayerMoves.forEach((move) => {
        if (movements[move] === null) movements[move] = "cpu";
      });

      break;
    } else {
      numOfPlayerAppearance = 0;
      combinationWithOnlyPlayerMoves = [];
    }
  }

  return combinationWithOnlyPlayerMoves.length > 0;
}

export function addSecondMoveIfOne(
  movements,
  winningCombination,
  cpuMovements
) {
  // Logic to add a second move if the CPU has only one move already.
  // Return whether a second move was added.

  let hasOnlyCpuMoves = false;
  let combinationWithOnlyCpuMoves = [];

  for (const combination of winningCombination) {
    cpuMovements.forEach((move) => {
      if (combination.includes(move)) {
        hasOnlyCpuMoves = combination.every((comb) => movements[comb] !== "p1");
      }
    });

    if (hasOnlyCpuMoves) {
      combinationWithOnlyCpuMoves = combination;
      break;
    }
  }

  if (hasOnlyCpuMoves) {
    return combinationWithOnlyCpuMoves.some((i) => {
      if (movements[i] !== "cpu") {
        movements[i] = "cpu";
        return true;
      }
    });
  }

  return false;
}

export function moveToAnyAvailableSpace(movements) {
  // Logic to move to any available space when no other conditions were met.

  let randomMove = Math.floor(Math.random() * (8 - 0) + 0);

  if (movements[randomMove] !== null) {
    movements.some((move, i) => {
      if (move === null) {
        movements[i] = "cpu";
        return true;
      }
    });
  } else {
    movements[randomMove] = "cpu";
  }
}
