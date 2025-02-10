const express = require("express");
const router = express.Router();


const carts = [
  { id: 1, products: [{ id: 1, quantity: 2 }, { id: 2, quantity: 1 }] },
  { id: 2, products: [{ id: 3, quantity: 1 }] },
];


router.get("/", (req, res) => {
  res.json(carts);
});


router.get("/:cid", (req, res) => {
  const cartId = parseInt(req.params.cid);
  const cart = carts.find((c) => c.id === cartId);
  if (!cart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
  }
  res.json(cart);
});

module.exports = router;