// src/screens/GameScreen.js
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
} from "../../utils/solitaire.jsx";

export default function GameScreen() {
  const [game, setGame] = useState(null);

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

  const renderCard = (card, i) => (
    <Text
      key={card.id}
      style={{
        opacity: card.faceUp ? 1 : 0.25,
        fontSize: 16,
        paddingLeft: i * 6,
      }}
    >
      {card.suit[0].toUpperCase()}
      {card.rank}
    </Text>
  );

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

        {/* Top Row */}
        <View style={styles.topRow}>
          <Pressable onPress={handleDraw} style={styles.cardSlot}>
            <Text>Stock</Text>
            <Text>{game.stock.length ? "🂠" : "—"}</Text>
          </Pressable>

          <Pressable onPress={handleWasteToFoundation} style={styles.cardSlot}>
            <Text>Waste</Text>
            <Text>
              {game.waste.length
                ? `${game.waste[game.waste.length - 1].suit[0].toUpperCase()}${
                    game.waste[game.waste.length - 1].rank
                  }`
                : "—"}
            </Text>
          </Pressable>

          <View style={styles.foundation}>
            {game.foundation.map((pile, i) => {
              const top = pile[pile.length - 1];
              return (
                <View key={i} style={styles.cardSlot}>
                  <Text>F{i + 1}</Text>
                  <Text>
                    {top ? `${top.suit[0].toUpperCase()}${top.rank}` : "—"}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Tableau */}
        <Text style={styles.section}>Tableau</Text>
        <View style={styles.tableau}>
          {game.table.map((pile, i) => (
            <View key={i} style={styles.column}>
              <Text style={styles.pileLabel}>Pile {i + 1}</Text>
              {pile.map((card, idx) => renderCard(card, idx))}
            </View>
          ))}
        </View>

        <Pressable onPress={handleTableauToFoundation} style={styles.button}>
          <Text style={styles.buttonText}>Auto Move to Foundation</Text>
        </Pressable>
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
  column: { flex: 1 },
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
