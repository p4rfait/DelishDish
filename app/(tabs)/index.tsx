import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList, Image, ActivityIndicator } from "react-native";
import axios from "axios";

const API_KEY = ""; // API key aqui

const CATEGORIES = {
  desayuno: "breakfast",
  comida: "lunch,dinner",
};

const fetchRecipes = async (category) => {
  try {
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch?query=${category}&number=10&apiKey=${API_KEY}`
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
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <Text style={styles.recipeTitle}>{item.title}</Text>
              </View>
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
