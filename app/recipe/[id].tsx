import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "react-native";
import * as Speech from 'expo-speech';
import axios from "axios";

const apiKey = process.env.EXPO_PUBLIC_API_KEY;

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipeDetail = async () => {
      try {
        const response = await axios.get(
          `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`
        );
        setRecipe(response.data);
        navigation.setOptions({ title: response.data.title });
      } catch (error) {
        console.error("Error fetching recipe detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipeDetail();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      const favorites = stored ? JSON.parse(stored) : [];

      const exists = favorites.find((fav) => fav.id === recipe.id);

      let updated;
      if (exists) {
        updated = favorites.filter((fav) => fav.id !== recipe.id);
      } else {
        updated = [...favorites, { id: recipe.id, title: recipe.title, image: recipe.image }];
      }

      await AsyncStorage.setItem("favorites", JSON.stringify(updated));
      alert(exists ? "Removed from Favorites" : "Added to Favorites");
    } catch (e) {
      console.error("Error toggling favorite", e);
    }
  };

  const [speaking, setSpeaking] = useState(false);

  const readRecipeInfo = async () => {
    const isSpeaking = await Speech.isSpeakingAsync();

    if (isSpeaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }

    if (!recipe) return;

    let text = `${recipe.title}. ${recipe.summary?.replace(/<[^>]*>/g, '')}.`;

    if (recipe.extendedIngredients?.length) {
      text += ' Ingredients: ';
      text += recipe.extendedIngredients.map(ing => ing.original).join('. ') + '.';
    }

    if (recipe.instructions) {
      text += ' Instructions: ' + recipe.instructions.replace(/<[^>]*>/g, '') + '.';
    }

    if (recipe.analyzedInstructions?.[0]?.steps?.length) {
      text += ' Steps: ';
      recipe.analyzedInstructions[0].steps.forEach(step => {
        text += `Step ${step.number}: ${step.step}. `;
      });
    }

    setSpeaking(true);
    Speech.speak(text, {
      language: 'en-US',
      rate: 1.0,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
    });
  };


  if (loading) {
    return <ActivityIndicator size="large" color="#FF6347" style={styles.loader} />;
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text>Error al cargar la receta.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: recipe.image }} style={styles.image} />
      <Button title="Add/Remove from Favorites 🤍" onPress={toggleFavorite} color="#FF6347" />
      <Button
        title={speaking ? 'Stop Reading' : '🔊 Read Recipe'}
        onPress={readRecipeInfo}
        color="#FF6347"
      />
      <Text style={styles.sectionTitle}>Summary:</Text>
      <Text>{recipe.summary.replace(/<\/?[^>]+(>|$)/g, "")}</Text>

      <Text style={styles.sectionTitle}>Ingredients:</Text>
      {recipe.extendedIngredients.map((ingredient) => (
        <Text key={ingredient.id}>• {ingredient.original}</Text>
      ))}
      <Text style={styles.sectionTitle}>Instructions:</Text>
      <Text>{recipe.instructions ? recipe.instructions.replace(/<\/?[^>]+(>|$)/g, "") : "No instructions available"}</Text>
      <Text style={styles.sectionTitle}>Steps</Text>
      {recipe.analyzedInstructions?.[0]?.steps?.length > 0 ? (
        recipe.analyzedInstructions[0].steps.map((step) => (
          <Text key={step.number} style={styles.step}>
            {step.number}. {step.step}
          </Text>
        ))
      ) : (
        <Text>No steps available.</Text>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  loader: { flex: 1, justifyContent: "center" },
  image: { width: "100%", height: 200, borderRadius: 10, marginBottom: 15 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, color: "#FF6347" },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 15, marginBottom: 5 },
});
