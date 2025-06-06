import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
} from "react-native";
import {
  dealNewGame,
  drawFromStock,
  moveWasteToFoundation,
  movetableToFoundation,
  moveCardTotable,
} from "../../utils/solitaire.jsx";
import Card from "../../components/Card.jsx";

// ----- Stock Component -----
function StockPile({ stock, onDraw }) {
  return (
    <Pressable onPress={onDraw} style={styles.cardSlot}>
      <Text>Stock</Text>
      <Text>{stock.length ? "🂠" : "—"}</Text>
    </Pressable>
  );
}

// ----- Waste Component -----
function WastePile({ waste, onMoveToFoundation }) {
  return (
    <Pressable onPress={onMoveToFoundation} style={styles.cardSlot}>
      <Text>Waste</Text>
      {waste.length ? (
        <Card key={waste.length} card={waste[waste.length - 1]} />
      ) : (
        <Text style={{ fontSize: 24 }}>—</Text>
      )}
    </Pressable>
  );
}

// ----- Foundation Pile Component -----
function FoundationPile({
  pile,
  index,
  selectedCard,
  game,
  setGame,
  setSelectedCard,
}) {
  const top = pile[pile.length - 1];
  const handlePress = () => {
    if (!selectedCard) return;
    // Attempt to move selected card to this foundation
    const moved = moveCardTotable(
      game,
      selectedCard.pileIndex,
      selectedCard.cardIndex,
      `foundation-${index}`
    );
    if (moved) {
      setGame({ ...game });
      setSelectedCard(null);
    }
  };
  return (
    <Pressable onPress={handlePress} style={styles.cardSlot}>
      {top ? <Card card={top} /> : <Text style={{ fontSize: 24 }}>—</Text>}
    </Pressable>
  );
}

// ----- Foundation Row Component -----
function FoundationRow({
  foundation,
  selectedCard,
  game,
  setGame,
  setSelectedCard,
}) {
  return (
    <View style={styles.foundation}>
      {foundation.map((pile, i) => (
        <FoundationPile
          key={i}
          pile={pile}
          index={i}
          selectedCard={selectedCard}
          game={game}
          setGame={setGame}
          setSelectedCard={setSelectedCard}
        />
      ))}
    </View>
  );
}

// ----- Tableau Column Component -----
function TableauColumn({
  pile,
  pileIndex,
  selectedCard,
  setSelectedCard,
  game,
  setGame,
}) {
  const facedown = pile.filter((c) => !c.faceUp);
  const faceup = pile.filter((c) => c.faceUp);
  return (
    <View style={styles.column}>
      {facedown.map((card, idx) => (
        <Card
          key={card.id}
          card={card}
          style={{ position: "absolute", top: idx * 4 }}
        />
      ))}
      {faceup.map((card, idx) => {
        const cardIndex = facedown.length + idx;
        const isSelected =
          selectedCard &&
          selectedCard.pileIndex === pileIndex &&
          selectedCard.cardIndex === cardIndex;
        const handlePress = () => {
          if (!card.faceUp) return;
          if (selectedCard) {
            const moved = moveCardTotable(
              game,
              selectedCard.pileIndex,
              selectedCard.cardIndex,
              pileIndex
            );
            if (moved) setGame({ ...game });
            setSelectedCard(null);
          } else {
            setSelectedCard({ pileIndex, cardIndex });
          }
        };
        return (
          <Card
            key={card.id}
            card={card}
            onPress={handlePress}
            style={{
              marginTop: idx === 0 ? facedown.length * 4 : -28,
              top: facedown.length * 4 + idx,
              borderColor: isSelected ? "blue" : "transparent",
              borderWidth: isSelected ? 2 : 0,
            }}
          />
        );
      })}
    </View>
  );
}

// ----- Tableau Area Component -----
function TableauArea({ table, selectedCard, setSelectedCard, game, setGame }) {
  return (
    <View style={styles.tableau}>
      {table.map((pile, i) => (
        <TableauColumn
          key={i}
          pile={pile}
          pileIndex={i}
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
          game={game}
          setGame={setGame}
        />
      ))}
    </View>
  );
}

// ----- Action Buttons Component -----
function ActionButtons({ onAutoMove, onRestart }) {
  return (
    <>
      <Pressable onPress={onAutoMove} style={styles.button}>
        <Text style={styles.buttonText}>Auto Move to Foundation</Text>
      </Pressable>
      <Pressable
        onPress={onRestart}
        style={[styles.button, { backgroundColor: "#FF3B30" }]}
      >
        <Text style={styles.buttonText}>Restart Game</Text>
      </Pressable>
    </>
  );
}

// ----- Main GameScreen Component -----
export default function GameScreen() {
  const [game, setGame] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    const newGame = dealNewGame();
    setGame(newGame);
  }, []);

  const handleDraw = () => {
    drawFromStock(game);
    setGame({ ...game });
  };

  const handleWasteToFoundation = () => {
    moveWasteToFoundation(game);
    setGame({ ...game });
  };

  const handleTableauToFoundation = () => {
    for (let i = 0; i < game.table.length; i++) {
      if (movetableToFoundation(game, i)) {
        setGame({ ...game });
        break;
      }
    }
  };

  const handleRestart = () => {
    const newGame = dealNewGame();
    setGame(newGame);
    setSelectedCard(null);
  };

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading game...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.board}>
        <Text style={styles.header}>🃏 Solitaire</Text>

        {/* Top Row: Stock, Waste, Foundation */}
        <View style={styles.topRow}>
          <StockPile stock={game.stock} onDraw={handleDraw} />
          <WastePile
            waste={game.waste}
            onMoveToFoundation={handleWasteToFoundation}
          />
          <FoundationRow
            foundation={game.foundation}
            selectedCard={selectedCard}
            game={game}
            setGame={setGame}
            setSelectedCard={setSelectedCard}
          />
        </View>

        {/* Tableau Area */}
        <TableauArea
          table={game.table}
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
          game={game}
          setGame={setGame}
        />

        {/* Action Buttons: Auto Move & Restart */}
        <ActionButtons
          onAutoMove={handleTableauToFoundation}
          onRestart={handleRestart}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e6eaf0" },
  board: { padding: 16 },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  foundation: { flexDirection: "row", gap: 8 },
  cardSlot: {
    width: 60,
    height: 70,
    backgroundColor: "#fff",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    marginRight: 10,
  },
  section: { fontSize: 20, marginTop: 10, marginBottom: 5, fontWeight: "600" },
  tableau: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  column: {
    flex: 1,
    position: "relative",
    minHeight: 300,
  },
  pileLabel: { fontWeight: "bold", marginBottom: 4 },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
