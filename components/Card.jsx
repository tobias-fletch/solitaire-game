import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function Card({ id, card, style, onPress }) {
  if (!card) return null;

  const isRed = card.suit === "hearts" || card.suit === "diamonds";
  const suitSymbol = {
    hearts: "♥",
    diamonds: "♦",
    spades: "♠",
    clubs: "♣",
  }[card.suit];

  const baseStyle = [
    styles.card,
    !card.faceUp && styles.cardBack,
    style, // external styles (like marginTop or selection border)
  ];

  return (
    <Pressable onPress={onPress} disabled={!card.faceUp}>
      <View style={baseStyle}>
        {card.faceUp ? (
          <Text style={[styles.text, { color: isRed ? "crimson" : "black" }]}>
            {suitSymbol} {card.rank}
          </Text>
        ) : (
          <Text style={styles.backText}>🂠</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 40,
    height: 60,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#888",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  cardBack: {
    backgroundColor: "rgb(85, 30, 124)",
    borderColor: "#0f172a",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
  backText: {
    fontSize: 20,
    color: "#fff",
  },
});
