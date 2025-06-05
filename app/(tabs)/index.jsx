import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { dealNewGame } from "../../utils/solitaire";

export default function GameScreen() {
  const [game, setGame] = useState(null);

  useEffect(() => {
    setGame(dealNewGame());
  }, []);

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading game...</Text>
      </SafeAreaView>
    );
  }

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.board}>
        {/* Top Row: Stock, Waste, Foundation */}
        <View style={styles.topRow}>
          <View style={styles.stockWaste}>
            <Text style={styles.pileLabel}>Stock</Text>
            <View style={styles.cardSlot}>
              <Text>{game.stock.length ? "🂠" : "—"}</Text>
            </View>

            <Text style={styles.pileLabel}>Waste</Text>
            <View style={styles.cardSlot}>
              {game.waste.length ? (
                <Text>
                  {game.waste[game.waste.length - 1].suit[0].toUpperCase()}
                  {game.waste[game.waste.length - 1].rank}
                </Text>
              ) : (
                <Text>—</Text>
              )}
            </View>
          </View>

          <View style={styles.foundation}>
            {game.foundation.map((pile, i) => {
              const top = pile[pile.length - 1];
              return (
                <View key={i} style={styles.cardSlot}>
                  <Text style={styles.pileLabel}>F{i + 1}</Text>
                  <Text>
                    {top ? `${top.suit[0].toUpperCase()}${top.rank}` : "—"}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Bottom Row: Tableau */}
        <Text style={styles.section}>Tableau</Text>
        <View style={styles.tableau}>
          {game.tableau.map((pile, i) => (
            <View key={i} style={styles.column}>
              <Text style={styles.pileLabel}>Pile {i + 1}</Text>
              {pile.map((card, idx) => renderCard(card, idx))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e6eaf0" },
  board: { padding: 16 },
  section: { fontSize: 18, marginTop: 20, fontWeight: "600" },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  stockWaste: {
    flexDirection: "column",
    gap: 12,
  },
  foundation: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  cardSlot: {
    width: 50,
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  tableau: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  column: {
    flex: 1,
    minWidth: 40,
  },
  pileLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
});
