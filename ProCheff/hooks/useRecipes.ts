import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  imageUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface UseRecipesReturn {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  fetchRecipes: () => Promise<void>;
  searchRecipes: (query: string) => Promise<void>;
  getRecipeById: (id: string) => Promise<Recipe | null>;
}

export const useRecipes = (): UseRecipesReturn => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/recipes');
      setRecipes(response.data);
    } catch (err) {
      setError('Tarifler yüklenirken bir hata oluştu');
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchRecipes = async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/recipes/search?q=${encodeURIComponent(query)}`);
      setRecipes(response.data);
    } catch (err) {
      setError('Tarif arama sırasında bir hata oluştu');
      console.error('Error searching recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRecipeById = async (id: string): Promise<Recipe | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/recipes/${id}`);
      return response.data;
    } catch (err) {
      setError('Tarif yüklenirken bir hata oluştu');
      console.error('Error fetching recipe:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    searchRecipes,
    getRecipeById
  };
};