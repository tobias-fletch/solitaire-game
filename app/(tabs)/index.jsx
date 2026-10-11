import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";
import {
  dealNewGame,
  drawFromStock,
  moveTableauToTableau,
  moveWasteToTableau,
  moveTableauToFoundation,
  moveWasteToFoundation,
  moveFoundationToTableau,
  checkWin,
  autoMoveToFoundations,
  SUITS,
  SUIT_SYMBOLS,
  isRed,
} from "../../utils/solitaire.jsx";
import Card, { CardSlot, CARD_WIDTH, CARD_HEIGHT } from "../../components/Card.jsx";

const FELT = "#0d5c2e";
const FELT_DARK = "#083d1f";
const GOLD = "#ffd54f";

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GameScreen() {
  const [game, setGame] = useState(() => dealNewGame());
  const [selection, setSelection] = useState(null);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [won, setWon] = useState(false);
  const [started, setStarted] = useState(false);
  const lastTap = useRef({ id: null, time: 0 });

  useEffect(() => {
    if (!started || won) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started, won]);

  const bump = () => {
    setMoves((m) => m + 1);
    if (!started) setStarted(true);
  };

  const refresh = () => setGame({ ...game });

  const afterMove = (didMove) => {
    if (didMove) {
      bump();
      refresh();
      setSelection(null);
      if (checkWin(game)) setWon(true);
    } else {
      setSelection(null);
    }
  };

  // ---- Stock ----
  const onStockPress = () => {
    setSelection(null);
    if (drawFromStock(game)) {
      bump();
      refresh();
    }
  };

  // ---- Waste ----
  const onWastePress = () => {
    const top = game.waste[game.waste.length - 1];
    if (!top) return;
    // double-tap -> foundation
    const now = Date.now();
    if (lastTap.current.id === top.id && now - lastTap.current.time < 350) {
      afterMove(moveWasteToFoundation(game));
      lastTap.current = { id: null, time: 0 };
      return;
    }
    lastTap.current = { id: top.id, time: now };
    if (selection?.type === "waste") setSelection(null);
    else setSelection({ type: "waste" });
  };

  // ---- Tableau ----
  const onTableauCardPress = (pileIndex, cardIndex) => {
    const pile = game.table[pileIndex];
    const card = pile[cardIndex];
    if (!card?.faceUp) return;

    // If something is selected, try to move it here
    if (selection) {
      if (selection.type === "waste") {
        afterMove(moveWasteToTableau(game, pileIndex));
        return;
      }
      if (selection.type === "tableau") {
        if (selection.pile === pileIndex) {
          setSelection(null); // deselect
          return;
        }
        afterMove(
          moveTableauToTableau(game, selection.pile, selection.index, pileIndex)
        );
        return;
      }
      if (selection.type === "foundation") {
        afterMove(moveFoundationToTableau(game, selection.suit, pileIndex));
        return;
      }
    }

    // double-tap top card -> foundation
    const isTop = cardIndex === pile.length - 1;
    const now = Date.now();
    if (
      isTop &&
      lastTap.current.id === card.id &&
      now - lastTap.current.time < 350
    ) {
      afterMove(moveTableauToFoundation(game, pileIndex));
      lastTap.current = { id: null, time: 0 };
      return;
    }
    lastTap.current = { id: card.id, time: now };
    setSelection({ type: "tableau", pile: pileIndex, index: cardIndex });
  };

  const onTableauEmptyPress = (pileIndex) => {
    if (!selection) return;
    if (selection.type === "waste") {
      afterMove(moveWasteToTableau(game, pileIndex));
    } else if (selection.type === "tableau") {
      afterMove(
        moveTableauToTableau(game, selection.pile, selection.index, pileIndex)
      );
    } else if (selection.type === "foundation") {
      afterMove(moveFoundationToTableau(game, selection.suit, pileIndex));
    }
  };

  // ---- Foundation ----
  const onFoundationPress = (suit) => {
    const fi = SUITS.indexOf(suit);
    const pile = game.foundation[fi];
    const top = pile[pile.length - 1];

    if (selection) {
      // move selected single card here
      if (selection.type === "waste") {
        afterMove(moveWasteToFoundation(game));
        return;
      }
      if (selection.type === "tableau") {
        const src = game.table[selection.pile];
        if (selection.index === src.length - 1) {
          afterMove(moveTableauToFoundation(game, selection.pile));
        } else {
          setSelection(null);
        }
        return;
      }
      if (selection.type === "foundation") {
        setSelection(null);
        return;
      }
    }

    // select foundation top card to move back to tableau
    if (top) {
      if (selection?.type === "foundation" && selection.suit === suit) {
        setSelection(null);
      } else {
        setSelection({ type: "foundation", suit });
      }
    }
  };

  const onAutoMove = () => {
    setSelection(null);
    if (autoMoveToFoundations(game)) {
      bump();
      refresh();
      if (checkWin(game)) setWon(true);
    }
  };

  const onNewGame = () => {
    setGame(dealNewGame());
    setSelection(null);
    setMoves(0);
    setSeconds(0);
    setWon(false);
    setStarted(false);
  };

  const isSelected = (type, pile, index, suit) => {
    if (!selection || selection.type !== type) return false;
    if (type === "waste") return true;
    if (type === "tableau")
      return selection.pile === pile && selection.index === index;
    if (type === "foundation") return selection.suit === suit;
    return false;
  };

  const wasteTop = game.waste[game.waste.length - 1];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.felt}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>♠ Solitaire</Text>
          <View style={styles.stats}>
            <Text style={styles.statText}>Moves {moves}</Text>
            <Text style={styles.statText}>{formatTime(seconds)}</Text>
          </View>
          <Pressable onPress={onNewGame} style={styles.newGameBtn}>
            <Text style={styles.newGameText}>New Game</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.board}>
          {/* Top row: stock, waste, foundations */}
          <View style={styles.topRow}>
            <View style={styles.topGroup}>
              {game.stock.length > 0 ? (
                <Pressable onPress={onStockPress}>
                  <View style={styles.stockCard}>
                    <Text style={styles.stockCount}>{game.stock.length}</Text>
                    <Text style={styles.stockLabel}>STOCK</Text>
                  </View>
                </Pressable>
              ) : (
                <CardSlot onPress={onStockPress}>
                  <Text style={styles.slotIcon}>↻</Text>
                </CardSlot>
              )}
              {wasteTop ? (
                <Card
                  card={wasteTop}
                  onPress={onWastePress}
                  selected={isSelected("waste")}
                />
              ) : (
                <CardSlot>
                  <Text style={styles.slotIcon}>–</Text>
                </CardSlot>
              )}
            </View>
            <View style={styles.topGroup}>
              {SUITS.map((suit) => {
                const pile = game.foundation[SUITS.indexOf(suit)];
                const top = pile[pile.length - 1];
                return (
                  <View key={suit}>
                    {top ? (
                      <Card
                        card={top}
                        onPress={() => onFoundationPress(suit)}
                        selected={isSelected("foundation", null, null, suit)}
                      />
                    ) : (
                      <CardSlot onPress={() => onFoundationPress(suit)}>
                        <Text
                          style={[
                            styles.slotIcon,
                            {
                              color:
                                suit === "hearts" || suit === "diamonds"
                                  ? "rgba(255,120,120,0.5)"
                                  : "rgba(255,255,255,0.35)",
                            },
                          ]}
                        >
                          {SUIT_SYMBOLS[suit]}
                        </Text>
                      </CardSlot>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Tableau */}
          <View style={styles.tableau}>
            {game.table.map((pile, pi) => (
              <View key={pi} style={styles.column}>
                {pile.length === 0 ? (
                  <CardSlot onPress={() => onTableauEmptyPress(pi)}>
                    <Text style={styles.slotIcon}>K</Text>
                  </CardSlot>
                ) : (
                  pile.map((card, ci) => (
                    <View
                      key={card.id}
                      style={[
                        styles.stacked,
                        ci > 0 && {
                          marginTop: card.faceUp ? -72 : -88,
                        },
                      ]}
                    >
                      <Card
                        card={card}
                        onPress={() => onTableauCardPress(pi, ci)}
                        selected={isSelected("tableau", pi, ci)}
                      />
                    </View>
                  ))
                )}
              </View>
            ))}
          </View>

          {/* Auto-move helper */}
          <Pressable onPress={onAutoMove} style={styles.autoBtn}>
            <Text style={styles.autoText}>✨ Auto-finish foundations</Text>
          </Pressable>
        </ScrollView>

        {/* Win modal */}
        <Modal visible={won} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>🎉 You win!</Text>
              <Text style={styles.modalText}>
                Completed in {moves} moves and {formatTime(seconds)}.
              </Text>
              <Pressable onPress={onNewGame} style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>Play again</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FELT_DARK },
  felt: {
    flex: 1,
    backgroundColor: FELT,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  stats: {
    flexDirection: "row",
    gap: 14,
  },
  statText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  newGameBtn: {
    backgroundColor: GOLD,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newGameText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1a1a2e",
  },
  board: {
    padding: 14,
    alignItems: "center",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 760,
    marginBottom: 22,
  },
  topGroup: {
    flexDirection: "row",
    gap: 10,
  },
  stockCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 10,
    backgroundColor: "#1e3a8a",
    borderWidth: 1,
    borderColor: "#172554",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  stockCount: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
  },
  stockLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1.5,
    marginTop: 2,
  },
  slotIcon: {
    fontSize: 26,
    color: "rgba(255,255,255,0.4)",
  },
  tableau: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    maxWidth: 760,
  },
  column: {
    alignItems: "center",
    minHeight: 320,
  },
  stacked: {},
  autoBtn: {
    marginTop: 26,
    marginBottom: 10,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  autoText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 36,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 22,
  },
  modalBtn: {
    backgroundColor: FELT,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 24,
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
});
