const {
  dealNewGame,
  drawFromStock,
  moveWasteToTableau,
  moveWasteToFoundation,
  moveTableauToFoundation,
  moveFoundationToTableau,
  checkWin,
} = require("../utils/solitaire.jsx");

const game = dealNewGame();

function printState() {
  console.log("\n--- STOCK & WASTE ---");
  console.log(`Stock: ${game.stock.length}`);
  console.log(
    `Waste: ${
      game.waste.map((c) => `${c.suit[0].toUpperCase()}${c.rank}`).join(", ") ||
      "empty"
    }`
  );

  console.log("\n--- FOUNDATION ---");
  game.foundation.forEach((pile, i) => {
    const top = pile[pile.length - 1];
    console.log(
      `Foundation ${i + 1}: ${
        top ? `${top.suit[0].toUpperCase()}${top.rank}` : "empty"
      }`
    );
  });

  console.log("\n--- TABLEAU ---");
  game.tableau.forEach((pile, i) => {
    const readable = pile.map((card) => {
      const face = card.faceUp ? "↑" : "↓";
      return `${face}${card.suit[0].toUpperCase()}${card.rank}`;
    });
    console.log(`Pile ${i + 1}: ${readable.join(", ")}`);
  });
}

function tryMoveWasteToAnyTableau() {
  for (let i = 0; i < game.tableau.length; i++) {
    if (moveWasteToTableau(game, i)) {
      console.log(`✅ Moved waste card to Tableau pile ${i + 1}`);
      return true;
    }
  }
  return false;
}

function tryMoveTableauToFoundation() {
  for (let i = 0; i < game.tableau.length; i++) {
    if (moveTableauToFoundation(game, i)) {
      console.log(`✅ Moved tableau card to Foundation from pile ${i + 1}`);
      return true;
    }
  }
  return false;
}

function tryMoveFoundationToAnyTableau() {
  for (let suit of ["hearts", "diamonds", "clubs", "spades"]) {
    for (let i = 0; i < game.tableau.length; i++) {
      if (moveFoundationToTableau(game, suit, i)) {
        console.log(
          `🔁 Moved card from Foundation (${suit}) to Tableau pile ${i + 1}`
        );
        return true;
      }
    }
  }
  return false;
}

// --- Run game logic ---
printState();

for (let turn = 1; turn <= 10; turn++) {
  console.log(`\n=== Turn ${turn} ===`);
  drawFromStock(game);

  if (!tryMoveWasteToAnyTableau()) {
    moveWasteToFoundation(game);
  }

  tryMoveTableauToFoundation();

  // Uncomment this if you want to test undoing
  // tryMoveFoundationToAnyTableau();

  printState();

  if (checkWin(game)) {
    console.log("\n🎉 You won!");
    break;
  }
}
