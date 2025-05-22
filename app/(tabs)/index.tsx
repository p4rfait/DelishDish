import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

const apiKey = process.env.EXPO_PUBLIC_API_KEY;
// $ echo "EXPO_PUBLIC_API_KEY=<place your spoonacular api key here>" > .env

const CATEGORIES = {
  desayuno: "breakfast",
  comida: "lunch,dinner",
};

const fetchRecipes = async (category) => {
  try {
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch?query=${category}&sort=random&number=5&apiKey=${apiKey}`
    );
    return response.data.results;
  } catch (error) {
    console.error(`Error fetching ${category}:`, error);
    return [];
  }
};

export default function TabOneScreen() {
  const [recipes, setRecipes] = useState({ desayuno: [], comida: [] });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadRecipes = async () => {
      const desayuno = await fetchRecipes(CATEGORIES.desayuno);
      const comida = await fetchRecipes(CATEGORIES.comida);
      setRecipes({ desayuno, comida });
      setLoading(false);
    };
    loadRecipes();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#FF6347" style={styles.loader} />;

  return (
    <View style={styles.container}>
      {Object.entries(recipes).map(([key, items]) => (
        <View key={key} style={styles.section}>
          <Text style={styles.title}>{key === "comida" ? "ALMUERZOS / CENAS" : key.toUpperCase()}</Text>
          <FlatList
            data={items}
            horizontal
            keyExtractor={(item) => `${key}-${item.id}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/recipe/${item.id}`)}
              >
                <Image source={{ uri: item.image }} style={styles.image} />
                <Text style={styles.recipeTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  section: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#FF6347", textTransform: "capitalize" },
  card: { marginRight: 15, alignItems: "center", width: 150 },
  image: { width: 150, height: 100, borderRadius: 10 },
  recipeTitle: { fontSize: 14, textAlign: "center", marginTop: 5 },
  loader: { flex: 1, justifyContent: "center" },
});
