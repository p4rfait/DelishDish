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
  Modal,
  TextInput,
  Button,
  Alert,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

const CATEGORIES = {
  Breakfast: "breakfast",
  "Lunch & Dinner": "lunch,dinner",
  Dessert: "dessert",
  "Drinks & Beverages": "drink,beverage",
};

async function saveApiKey(key) {
  await SecureStore.setItemAsync("SPOONACULAR_API_KEY", key);
}

async function getApiKey() {
  return await SecureStore.getItemAsync("SPOONACULAR_API_KEY");
}

const fetchRecipes = async (category, apiKey) => {
  try {
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch?query=${category}&sort=random&number=5&apiKey=${apiKey}`
    );
    return response.data.results;
  } catch (error) {
    throw error;
  }
};

export default function TabOneScreen() {
  const [recipes, setRecipes] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputKey, setInputKey] = useState("");
  const [apiKey, setApiKey] = useState(null);

  const router = useRouter();

  const loadRecipes = async (key) => {
    setLoading(true);
    try {
      const newRecipes = {};
      for (const [label, query] of Object.entries(CATEGORIES)) {
        const items = await fetchRecipes(query, key);
        newRecipes[label] = items;
      }
      setRecipes(newRecipes);
      setLoading(false);
      setModalVisible(false);
      setApiKey(key);
      await saveApiKey(key);
    } catch (error) {
      setLoading(false);
      setModalVisible(true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (!apiKey) {
      setModalVisible(true);
      setRefreshing(false);
      return;
    }
    try {
      await loadRecipes(apiKey);
    } catch {
      // error manejado en loadRecipes
    }
    setRefreshing(false);
  };

  useEffect(() => {
    (async () => {
      const savedKey = await getApiKey();
      if (!savedKey) {
        setModalVisible(true);
        setLoading(false);
      } else {
        await loadRecipes(savedKey);
      }
    })();
  }, []);

  if (loading)
    return (
      <ActivityIndicator size="large" color="#FF6347" style={styles.loader} />
    );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6347"]}
          />
        }
      >
        {Object.entries(recipes).map(([key, items]) => (
          <View key={key} style={styles.section}>
            <Text style={styles.title}>{key.toUpperCase()}</Text>
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
                  <Text
                    style={styles.recipeTitle}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Ingrese su API Key de Spoonacular</Text>
            <TextInput
              placeholder="API Key"
              style={styles.input}
              value={inputKey}
              onChangeText={setInputKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button
              title="Guardar y Continuar"
              onPress={() => {
                if (inputKey.trim() === "") {
                  Alert.alert("Error", "La API Key no puede estar vacía.");
                  return;
                }
                loadRecipes(inputKey.trim());
              }}
              color="#FF6347"
            />
          </View>
        </View>
      </Modal>
    </View>
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
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
});
