import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { RANK_LABELS, SUIT_SYMBOLS, isRed } from "../utils/solitaire.jsx";

export const CARD_WIDTH = 76;
export const CARD_HEIGHT = 108;

export default function Card({ card, style, onPress, selected }) {
  if (!card) return null;

  const red = isRed(card);
  const color = red ? "#c62828" : "#1a1a2e";
  const label = RANK_LABELS[card.rank];
  const symbol = SUIT_SYMBOLS[card.suit];

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <View
        style={[
          styles.card,
          !card.faceUp && styles.cardBack,
          selected && styles.selected,
          style,
        ]}
      >
        {card.faceUp ? (
          <>
            <View style={styles.cornerTop}>
              <Text style={[styles.rank, { color }]}>{label}</Text>
              <Text style={[styles.suitSmall, { color }]}>{symbol}</Text>
            </View>
            <Text style={[styles.suitLarge, { color }]}>{symbol}</Text>
            <View style={styles.cornerBottom}>
              <Text style={[styles.rank, { color }]}>{label}</Text>
              <Text style={[styles.suitSmall, { color }]}>{symbol}</Text>
            </View>
          </>
        ) : (
          <View style={styles.backPattern}>
            <Text style={styles.backSymbol}>♠</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export function CardSlot({ children, onPress, style }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <View style={[styles.slot, style]}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  selected: {
    borderColor: "#ffd54f",
    borderWidth: 3,
    shadowColor: "#ffd54f",
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  cardBack: {
    backgroundColor: "#1e3a8a",
    borderColor: "#172554",
    justifyContent: "center",
    alignItems: "center",
  },
  backPattern: {
    width: "82%",
    height: "86%",
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  backSymbol: {
    fontSize: 30,
    color: "rgba(255,255,255,0.5)",
  },
  cornerTop: {
    position: "absolute",
    top: 5,
    left: 7,
    alignItems: "center",
  },
  cornerBottom: {
    position: "absolute",
    bottom: 5,
    right: 7,
    alignItems: "center",
    transform: [{ rotate: "180deg" }],
  },
  rank: {
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 18,
  },
  suitSmall: {
    fontSize: 13,
    lineHeight: 14,
  },
  suitLarge: {
    fontSize: 38,
  },
  slot: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
});
