import express from 'express';
import cors from 'cors';
import { PrismaClient } from './src/generated/prisma/index.js';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes pour les produits admin
app.get('/api/admin-products', async (req, res) => {
  try {
    const products = await prisma.adminProduct.findMany({
      orderBy: { createdAt: 'asc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Erreur GET /api/admin-products:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

app.post('/api/admin-products', async (req, res) => {
  try {
    const { name, defaultUnit } = req.body;
    
    if (!name || !defaultUnit) {
      return res.status(400).json({ error: 'Nom et unité par défaut requis' });
    }

    // Vérifier si le produit existe déjà
    const existingProduct = await prisma.adminProduct.findUnique({
      where: { name }
    });

    if (existingProduct) {
      return res.status(409).json({ error: 'Un produit avec ce nom existe déjà' });
    }

    const newProduct = await prisma.adminProduct.create({
      data: { name, defaultUnit }
    });
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Erreur POST /api/admin-products:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

app.put('/api/admin-products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, defaultUnit } = req.body;
    
    if (!name || !defaultUnit) {
      return res.status(400).json({ error: 'Nom et unité par défaut requis' });
    }

    // Vérifier si le produit existe
    const existingProduct = await prisma.adminProduct.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    // Vérifier si un autre produit avec le même nom existe déjà
    const duplicateProduct = await prisma.adminProduct.findFirst({
      where: { 
        name,
        id: { not: id }
      }
    });

    if (duplicateProduct) {
      return res.status(409).json({ error: 'Un produit avec ce nom existe déjà' });
    }

    const updatedProduct = await prisma.adminProduct.update({
      where: { id },
      data: { name, defaultUnit }
    });
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Erreur PUT /api/admin-products/:id:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

app.delete('/api/admin-products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le produit existe
    const productToDelete = await prisma.adminProduct.findUnique({
      where: { id }
    });

    if (!productToDelete) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    await prisma.adminProduct.delete({
      where: { id }
    });
    
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur DELETE /api/admin-products/:id:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Routes pour les commandes
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        products: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('Erreur GET /api/orders:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, customerPhone, deliveryDay, deliveryDate, notes, products } = req.body;
    
    if (!customerName || !customerPhone || !deliveryDay || !deliveryDate || !products || products.length === 0) {
      return res.status(400).json({ error: 'Données de commande incomplètes' });
    }

    const newOrder = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        deliveryDay,
        deliveryDate,
        notes: notes || '',
        products: {
          create: products.map(product => ({
            name: product.name,
            quantity: product.quantity,
            unit: product.unit,
            produced: product.produced || 0
          }))
        }
      },
      include: {
        products: true
      }
    });
    
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Erreur POST /api/orders:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, customerPhone, deliveryDay, deliveryDate, notes, products } = req.body;

    // Vérifier si la commande existe
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { products: true }
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    // Supprimer les anciens produits et créer les nouveaux
    await prisma.product.deleteMany({
      where: { orderId: id }
    });

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        customerName,
        customerPhone,
        deliveryDay,
        deliveryDate,
        notes: notes || '',
        products: {
          create: products.map(product => ({
            name: product.name,
            quantity: product.quantity,
            unit: product.unit,
            produced: product.produced || 0
          }))
        }
      },
      include: {
        products: true
      }
    });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Erreur PUT /api/orders/:id:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la commande existe
    const orderToDelete = await prisma.order.findUnique({
      where: { id }
    });

    if (!orderToDelete) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    // Supprimer la commande (les produits seront supprimés automatiquement grâce à onDelete: Cascade)
    await prisma.order.delete({
      where: { id }
    });
    
    res.json({ message: 'Commande supprimée avec succès' });
  } catch (error) {
    console.error('Erreur DELETE /api/orders/:id:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur http://localhost:${PORT}`);
});

// Gérer la fermeture propre
process.on('SIGINT', async () => {
  console.log('Fermeture du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});
