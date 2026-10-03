require('dotenv').config();
const express = require('express');
const path = require('path');
const { getProducts, getProductById, initializeProducts } = require('./src/data/products');

const app = express();
const port = process.env.PORT || 3000;
const whatsappNumber = process.env.WHATSAPP_NUMBER || '51999999999';

const carouselImages = [
  'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=80'
];

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (_req, res) => {
  const featuredProducts = await getProducts({ limit: 6 });
  res.render('index', { carouselImages, featuredProducts });
});

app.get('/products', async (req, res) => {
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const filters = {
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    brand: req.query.brand || undefined,
    groupName: req.query.group || undefined
  };

  const products = await getProducts(filters);
  const allProducts = await getProducts({});
  const brands = [...new Set(allProducts.map((product) => product.brand))].sort();
  const groups = [...new Set(allProducts.map((product) => product.group_name))].sort();

  res.render('products', {
    products,
    brands,
    groups,
    filters: {
      minPrice: req.query.minPrice || '',
      maxPrice: req.query.maxPrice || '',
      brand: req.query.brand || '',
      group: req.query.group || ''
    }
  });
});

app.post('/checkout/whatsapp', async (req, res) => {
  const productId = Number(req.body.productId);
  const quantity = Math.max(1, Number(req.body.quantity) || 1);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).send('Producto inválido');
  }

  const product = await getProductById(productId);
  if (!product) {
    return res.status(404).send('Producto no encontrado');
  }

  const total = (Number(product.price) * quantity).toFixed(2);
  const message = [
    'Hola, quiero finalizar mi compra en Parfum.',
    `Producto: ${product.name}`,
    `Cantidad: ${quantity}`,
    `Total estimado: S/ ${total}`,
    'Adjuntaré el comprobante de pago por este chat.'
  ].join('\n');

  const url = `https://wa.me/${encodeURIComponent(whatsappNumber)}?text=${encodeURIComponent(message)}`;
  return res.redirect(url);
});

initializeProducts().then(() => {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Parfum app running on http://localhost:${port}`);
  });
});
