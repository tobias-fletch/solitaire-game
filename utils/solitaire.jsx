// Generates cards for a solitaire game

const SUITS = ["hearts", "diamonds", "clubs", "spades"];

function generateDeck() {
  const deck = [];

  for (let suit of SUITS) {
    const color = suit === "hearts" || suit === "diamonds" ? "red" : "black";

    for (let rank = 1; rank <= 13; rank++) {
      deck.push({
        suit,
        rank,
        color,
        faceUp: false,
        id: `${suit}-${rank}-${Math.random().toString(36).substring(2, 9)}`,
      });
    }
  }

  return deck;
}

function shuffleDeck(deck) {
  const shuffled = [...deck]; // this creats a copy to avoid mutating the original deck

  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; //swap
  }

  return shuffled;
}

function dealNewGame() {
  const deck = shuffleDeck(generateDeck());
  const tableau = [];

  for (let i = 0; i < 7; i++) {
    const pile = deck.splice(0, i + 1).map((card, index, array) => ({
      ...card,
      faceUp: index === array.length - 1, // only the last card is face up
    }));
    tableau.push(pile);
  }

  return {
    tableau,
    foundation: [[], [], [], []], // 4 empty foundations
    stock: deck, // remaining cards in the stock
    waste: [], // empty waste pile
  };
}

function canMoveCardToTableau(fromCard, toCard) {
  return fromCard.color !== toCard.color && fromCard.rank === toCard.rank - 1;
}

// Can move card to the foundation pile?
function canMoveCardToFoundation(card, foundationPile) {
  if (foundationPile.length === 0) {
    return card.rank === 1; // Must be Ace
  }

  const topCard = foundationPile[foundationPile.length - 1];
  return topCard.suit === card.suit && card.rank === topCard.rank + 1;
}

function moveCardToTableau(
  gameState,
  fromPileIndex,
  fromCardIndex,
  toPileIndex
) {
  const fromPile = gameState.tableau[fromPileIndex];
  const toPile = gameState.tableau[toPileIndex];

  const movingCards = fromPile.slice(fromCardIndex);
  const targetCard = toPile[toPile.length - 1];

  const isValid = targetCard
    ? canMoveCardToTableau(movingCards[0], targetCard)
    : movingCards[0].rank === 13; // Allow Kings on empty piles

  if (!isValid) return false;

  // Remove from source
  gameState.tableau[fromPileIndex] = fromPile.slice(0, fromCardIndex);

  // Flip next card if needed
  const newFromPile = gameState.tableau[fromPileIndex];
  if (newFromPile.length && !newFromPile[newFromPile.length - 1].faceUp) {
    newFromPile[newFromPile.length - 1].faceUp = true;
  }

  // Add to destination
  gameState.tableau[toPileIndex] = [...toPile, ...movingCards];

  return true;
}

function drawFromStock(gameState) {
  if (gameState.stock.length === 0) {
    // Reset stock from waste

    gameState.stock = gameState.waste.map((card) => ({
      ...card,
      faceUp: false, // Reset face up status
    }));
    gameState.waste = [];
    return;
  }

  // Draw one card from stock and flip it to face up
  const card = gameState.stock.pop();
  card.faceUp = true; // Face up when drawn
  gameState.waste.push(card);
}

function moveWasteToFoundation(gameState) {
  const card = gameState.waste[gameState.waste.length - 1];
  if (!card) return false;

  const foundationIndex = SUITS.indexOf(card.suit);
  const foundationPile = gameState.foundation[foundationIndex];

  if (canMoveCardToFoundation(card, foundationPile)) {
    // Move card to foundation
    gameState.waste.pop(); // Remove from waste
    gameState.foundation[foundationIndex].push(card);
    return true;
  }
  return false;
}

function moveWasteToTableau(gameState, toPileIndex) {
  const card = gameState;
  if (!card) return false;

  const toPile = gameState.tableau[toPileIndex];
  const topCard = toPile[toPile.length - 1];

  const valid =
    (topCard &&
      card.color !== topCard.color &&
      card.rank === topCard.rank - 1) ||
    (!topCard && card.rank === 13); // King on empty pile

  if (valid) {
    gameState.waste.pop();
    gameState.tableau[toPileIndex].push(card);
    return true;
  }
  return false;
}

function checkWin(gameState) {
  return gameState.foundation.every((pile) => pile.length === 13);
}

function moveTableauToFoundation(gameState, fromPileIndex) {
  const fromPile = gameState.tableau[fromPileIndex];
  if (fromPile.length === 0) return false;

  const card = fromPile[fromPile.length - 1]; // Get the top card
  if (!card.faceUp) return false; // Must be face up

  const foundationIndex = SUITS.indexOf(card.suit);
  const foundationPile = gameState.foundation[foundationIndex];

  if (canMoveCardToFoundation(card, foundationPile)) {
    fromPile.pop();
    gameState.foundation[foundationIndex].push(card);

    // Flip next card if needed
    if (fromPile.length > 0 && !fromPile[fromPile.length - 1].faceUp) {
      fromPile[fromPile.length - 1].faceUp = true;
    }
    return true;
  }
  return false;
}

function moveFoundationToTableau(gameState, suit, toPileIndex) {
  const foundationIndex = SUITS.indexOf(suit);
  const foundationPile = gameState.foundation[foundationIndex];

  if (!foundationPile.length) return false;

  const card = foundationPile[foundationPile.length - 1];
  const toPile = gameState.tableau[toPileIndex];
  const topCard = toPile[toPile.length - 1];

  const valid =
    (topCard &&
      card.color !== topCard.color &&
      card.rank === topCard.rank - 1) ||
    (!topCard && card.rank === 13);

  if (valid) {
    foundationPile.pop();
    gameState.tableau[toPileIndex].push(card);
    return true;
  }

  return false;
}

module.exports = {
  generateDeck,
  shuffleDeck,
  dealNewGame,
  canMoveCardToTableau,
  canMoveCardToFoundation,
  moveCardToTableau,
  drawFromStock,
  moveWasteToFoundation,
  moveWasteToTableau,
  checkWin,
  moveTableauToFoundation,
  moveFoundationToTableau,
};
