// Solitaire (Klondike) game logic

const SUITS = ["hearts", "diamonds", "clubs", "spades"];

export const RANK_LABELS = {
  1: "A", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7",
  8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K",
};

export const SUIT_SYMBOLS = {
  hearts: "♥",
  diamonds: "♦",
  spades: "♠",
  clubs: "♣",
};

export function isRed(card) {
  return card.suit === "hearts" || card.suit === "diamonds";
}

function generateDeck() {
  const deck = [];
  for (const suit of SUITS) {
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
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealNewGame() {
  const deck = shuffleDeck(generateDeck());
  const table = [];
  for (let i = 0; i < 7; i++) {
    const pile = deck.splice(0, i + 1).map((card, index, array) => ({
      ...card,
      faceUp: index === array.length - 1,
    }));
    table.push(pile);
  }
  return {
    table,
    foundation: [[], [], [], []],
    stock: deck,
    waste: [],
    redeals: 0,
  };
}

function flipTopIfNeeded(pile) {
  if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
    pile[pile.length - 1].faceUp = true;
  }
}

export function canPlaceOnTableau(movingCard, targetCard) {
  if (!targetCard) return movingCard.rank === 13; // King on empty column
  return (
    movingCard.color !== targetCard.color &&
    movingCard.rank === targetCard.rank - 1
  );
}

export function canPlaceOnFoundation(card, foundationPile) {
  if (foundationPile.length === 0) return card.rank === 1; // Ace starts
  const top = foundationPile[foundationPile.length - 1];
  return top.suit === card.suit && card.rank === top.rank + 1;
}

// Move a stack of cards within the tableau
export function moveTableauToTableau(gameState, fromPile, fromIndex, toPile) {
  if (fromPile === toPile) return false;
  const source = gameState.table[fromPile];
  const dest = gameState.table[toPile];
  const moving = source.slice(fromIndex);
  if (moving.length === 0 || !moving[0].faceUp) return false;
  const target = dest[dest.length - 1];
  if (!canPlaceOnTableau(moving[0], target)) return false;

  gameState.table[fromPile] = source.slice(0, fromIndex);
  flipTopIfNeeded(gameState.table[fromPile]);
  gameState.table[toPile] = [...dest, ...moving];
  return true;
}

// Move top waste card to a tableau column
export function moveWasteToTableau(gameState, toPile) {
  const card = gameState.waste[gameState.waste.length - 1];
  if (!card) return false;
  const dest = gameState.table[toPile];
  const target = dest[dest.length - 1];
  if (!canPlaceOnTableau(card, target)) return false;

  gameState.waste.pop();
  gameState.table[toPile] = [...dest, card];
  return true;
}

// Move a tableau top card to its foundation
export function moveTableauToFoundation(gameState, fromPile) {
  const source = gameState.table[fromPile];
  if (source.length === 0) return false;
  const card = source[source.length - 1];
  if (!card.faceUp) return false;

  const fi = SUITS.indexOf(card.suit);
  const foundation = gameState.foundation[fi];
  if (!canPlaceOnFoundation(card, foundation)) return false;

  source.pop();
  flipTopIfNeeded(source);
  gameState.foundation[fi].push(card);
  return true;
}

// Move top waste card to its foundation
export function moveWasteToFoundation(gameState) {
  const card = gameState.waste[gameState.waste.length - 1];
  if (!card) return false;
  const fi = SUITS.indexOf(card.suit);
  const foundation = gameState.foundation[fi];
  if (!canPlaceOnFoundation(card, foundation)) return false;

  gameState.waste.pop();
  gameState.foundation[fi].push(card);
  return true;
}

// Move a foundation top card back to the tableau
export function moveFoundationToTableau(gameState, suit, toPile) {
  const fi = SUITS.indexOf(suit);
  const foundation = gameState.foundation[fi];
  if (foundation.length === 0) return false;
  const card = foundation[foundation.length - 1];
  const dest = gameState.table[toPile];
  const target = dest[dest.length - 1];
  if (!canPlaceOnTableau(card, target)) return false;

  foundation.pop();
  gameState.table[toPile] = [...dest, card];
  return true;
}

// Draw from stock, or redeal waste back into stock
export function drawFromStock(gameState) {
  if (gameState.stock.length === 0) {
    if (gameState.waste.length === 0) return false;
    gameState.stock = gameState.waste
      .slice()
      .reverse()
      .map((card) => ({ ...card, faceUp: false }));
    gameState.waste = [];
    gameState.redeals += 1;
    return true;
  }
  const card = gameState.stock.pop();
  card.faceUp = true;
  gameState.waste.push(card);
  return true;
}

export function checkWin(gameState) {
  return gameState.foundation.every((pile) => pile.length === 13);
}

// Auto-move all possible cards to foundations (one pass)
export function autoMoveToFoundations(gameState) {
  let moved = false;
  let progress = true;
  while (progress) {
    progress = false;
    if (moveWasteToFoundation(gameState)) {
      moved = true;
      progress = true;
    }
    for (let i = 0; i < 7; i++) {
      if (moveTableauToFoundation(gameState, i)) {
        moved = true;
        progress = true;
      }
    }
  }
  return moved;
}

// Legacy aliases kept for compatibility
export const dealNewGameLegacy = dealNewGame;
export const canMoveCardTotable = canPlaceOnTableau;
export const canMoveCardToFoundation = canPlaceOnFoundation;
export const moveCardTotable = moveTableauToTableau;
export const drawFromStockLegacy = drawFromStock;
export const moveWasteToFoundationLegacy = moveWasteToFoundation;
export const movetableToFoundation = moveTableauToFoundation;
export const moveFoundationTotable = moveFoundationToTableau;
export const moveWasteTotable = moveWasteToTableau;

module.exports = {
  SUITS,
  RANK_LABELS,
  SUIT_SYMBOLS,
  isRed,
  generateDeck,
  shuffleDeck,
  dealNewGame,
  canPlaceOnTableau,
  canPlaceOnFoundation,
  moveTableauToTableau,
  moveWasteToTableau,
  moveTableauToFoundation,
  moveWasteToFoundation,
  moveFoundationToTableau,
  drawFromStock,
  checkWin,
  autoMoveToFoundations,
};
