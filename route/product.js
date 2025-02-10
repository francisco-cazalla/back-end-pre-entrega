const express = require("express");
const router = express.Router();

// Base de datos simulada
const products = [
  { id: 1, name: "Producto A", price: 100 },
  { id: 2, name: "Producto B", price: 200 },
  { id: 3, name: "Producto C", price: 300 },
];

// Ruta raíz GET /: listar productos
router.get("/", (req, res) => {
  const limit = parseInt(req.query.limit); // Leer el parámetro ?limit
  if (limit && limit > 0) {
    return res.json(products.slice(0, limit));
  }
  res.json(products);
});

// Ruta GET /:pid: obtener producto por ID
router.get("/:pid", (req, res) => {
  const productId = parseInt(req.params.pid);
  const product = products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(product);
});

module.exports = router;