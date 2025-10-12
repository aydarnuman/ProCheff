const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('public/uploads'));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ProCheff Server is running',
    timestamp: new Date().toISOString()
  });
});

// Recipes endpoints
app.get('/api/recipes', (req, res) => {
  // Mock data for now
  const mockRecipes = [
    {
      id: '1',
      title: 'Türk Usulü Menemen',
      description: 'Geleneksel Türk kahvaltısının vazgeçilmezi menemen tarifi',
      ingredients: [
        '4 adet yumurta',
        '2 adet domates',
        '1 adet yeşil biber',
        '1 yemek kaşığı tereyağı',
        'Tuz, karabiber'
      ],
      instructions: [
        'Domatesleri küp küp doğrayın',
        'Biberleri ince ince kıyın',
        'Tavada tereyağını eritin',
        'Biberleri kavurun, sonra domatesleri ekleyin',
        'Yumurtaları çırpıp tavaya ekleyin',
        'Karıştırarak pişirin'
      ],
      cookingTime: 15,
      servings: 2,
      difficulty: 'easy',
      category: 'Kahvaltı',
      tags: ['türk mutfağı', 'kahvaltı', 'kolay'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  res.json(mockRecipes);
});

app.get('/api/recipes/:id', (req, res) => {
  const { id } = req.params;
  
  // Mock single recipe
  const mockRecipe = {
    id,
    title: 'Türk Usulü Menemen',
    description: 'Geleneksel Türk kahvaltısının vazgeçilmezi menemen tarifi',
    ingredients: [
      '4 adet yumurta',
      '2 adet domates',
      '1 adet yeşil biber',
      '1 yemek kaşığı tereyağı',
      'Tuz, karabiber'
    ],
    instructions: [
      'Domatesleri küp küp doğrayın',
      'Biberleri ince ince kıyın',
      'Tavada tereyağını eritin',
      'Biberleri kavurun, sonra domatesleri ekleyin',
      'Yumurtaları çırpıp tavaya ekleyin',
      'Karıştırarak pişirin'
    ],
    cookingTime: 15,
    servings: 2,
    difficulty: 'easy',
    category: 'Kahvaltı',
    tags: ['türk mutfağı', 'kahvaltı', 'kolay'],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  res.json(mockRecipe);
});

app.get('/api/recipes/search', (req, res) => {
  const { q } = req.query;
  
  // Mock search results
  const mockResults = [
    {
      id: '1',
      title: `${q} ile İlgili Tarif`,
      description: 'Arama sonucu mock tarifi',
      cookingTime: 30,
      difficulty: 'medium',
      category: 'Ana Yemek'
    }
  ];
  
  res.json(mockResults);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Sunucu hatası oluştu',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint bulunamadı' });
});

app.listen(PORT, () => {
  console.log(`🚀 ProCheff Server is running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
});