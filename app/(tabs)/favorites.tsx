import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const router = useRouter();

  const loadFavorites = async () => {
    const stored = await AsyncStorage.getItem("favorites");
    setFavorites(stored ? JSON.parse(stored) : []);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const removeFavorite = async (id) => {
    const updated = favorites.filter((fav) => fav.id !== id);
    setFavorites(updated);
    await AsyncStorage.setItem("favorites", JSON.stringify(updated));
  };

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <Text style={styles.empty}>There are no recipes added to favorites.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/recipe/${item.id}`)}
              onLongPress={() => removeFavorite(item.id)}
            >
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  card: { marginBottom: 15, flexDirection: "row", alignItems: "center" },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  title: { fontSize: 16, flexShrink: 1 },
  empty: { textAlign: "center", marginTop: 30, fontSize: 16 },
});
