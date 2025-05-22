import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

const apiKey = process.env.EXPO_PUBLIC_API_KEY;
// $ echo "EXPO_PUBLIC_API_KEY=<place your spoonacular api key here>" > .env

const CATEGORIES = {
  Breakfast: "breakfast",
  "Lunch & Dinner": "lunch,dinner",
  Desser: "dessert",
  "Drinks & Beverages": "drink,beverage",
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
  const [recipes, setRecipes] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadRecipes = async () => {
    setLoading(true);
    const newRecipes = {};
    for (const [label, query] of Object.entries(CATEGORIES)) {
      const items = await fetchRecipes(query);
      newRecipes[label] = items;
    }
    setRecipes(newRecipes);
    setLoading(false);
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  if (loading)
    return (
      <ActivityIndicator size="large" color="#FF6347" style={styles.loader} />
    );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={loadRecipes}
          colors={["#FF6347"]}
        />
      }
    >
      {Object.entries(recipes).map(([key, items]) => (
        <View key={key} style={styles.section}>
          <Text style={styles.title}>
            {key === "comida" ? "ALMUERZOS / CENAS" : key.toUpperCase()}
          </Text>
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
                <Text style={styles.recipeTitle} numberOfLines={2} ellipsizeMode="tail">
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  section: { marginBottom: 20 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FF6347",
    textTransform: "capitalize",
  },
  card: { marginRight: 15, alignItems: "center", width: 150 },
  image: { width: 150, height: 100, borderRadius: 10 },
  recipeTitle: { fontSize: 14, textAlign: "center", marginTop: 5 },
  loader: { flex: 1, justifyContent: "center" },
});
