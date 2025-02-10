// server.js
const express = require("express");
const fs = require("fs").promises; // Para trabajar con archivos de forma asíncrona usando promesas
const path = require("path");

const app = express();
const PORT = 8080; 

// Middleware para parsear JSON en las peticiones
app.use(express.json());

// Definición de las rutas de los archivos JSON
const productsFile = path.join(__dirname, "productos.json");
const cartsFile = path.join(__dirname, "carrito.json");


async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    
    return [];
  }
}


async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

/* ================================
   ENDPOINTS PARA PRODUCTS
   ================================ */

/**
 * GET /api/products
 * Lista todos los productos almacenados en productos.json.
 */
app.get("/api/products", async (req, res) => {
  try {
    const products = await readJSON(productsFile);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/products/:pid
 * Retorna un producto específico según el id (pid).
 */
app.get("/api/products/:pid", async (req, res) => {
  try {
    const products = await readJSON(productsFile);
    const pid = parseInt(req.params.pid);
    const product = products.find(p => p.id === pid);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/products
 * Agrega un nuevo producto.
 * Los campos obligatorios son: title, description, code, price, stock y category.
 * El campo status se asigna a true por defecto y thumbnails es opcional.
 */
app.post("/api/products", async (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } = req.body;
  if (!title || !description || !code || price === undefined || stock === undefined || !category) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  try {
    const products = await readJSON(productsFile);
    // Generamos un nuevo id (si hay productos, el id es el mayor + 1; si no, iniciamos en 1)
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      title,
      description,
      code,
      price,
      status: true,
      stock,
      category,
      thumbnails: thumbnails || []
    };
    products.push(newProduct);
    await writeJSON(productsFile, products);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/products/:pid
 * Actualiza un producto existente (excepto el campo id) con los datos enviados en el body.
 */
app.put("/api/products/:pid", async (req, res) => {
  const pid = parseInt(req.params.pid);
  const updateData = req.body;
  // Se evita modificar el campo id
  delete updateData.id;
  try {
    const products = await readJSON(productsFile);
    const index = products.findIndex(p => p.id === pid);
    if (index === -1) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    products[index] = { ...products[index], ...updateData };
    await writeJSON(productsFile, products);
    res.json(products[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/products/:pid
 * Elimina un producto según su id.
 */
app.delete("/api/products/:pid", async (req, res) => {
  const pid = parseInt(req.params.pid);
  try {
    const products = await readJSON(productsFile);
    const index = products.findIndex(p => p.id === pid);
    if (index === -1) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    const deletedProduct = products.splice(index, 1);
    await writeJSON(productsFile, products);
    res.json({ message: "Producto eliminado", product: deletedProduct[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================================
   ENDPOINTS PARA CARTS
   ================================ */

/**
 * GET /api/carts
 * Lista todos los carritos almacenados en carrito.json.
 */
app.get("/api/carts", async (req, res) => {
  try {
    const carts = await readJSON(cartsFile);
    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/carts/:cid
 * Retorna un carrito específico según el id (cid).
 */
app.get("/api/carts/:cid", async (req, res) => {
  const cid = parseInt(req.params.cid);
  try {
    const carts = await readJSON(cartsFile);
    const cart = carts.find(c => c.id === cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/carts
 * Crea un nuevo carrito con un id autogenerado y un arreglo vacío de productos.
 */
app.post("/api/carts", async (req, res) => {
  try {
    const carts = await readJSON(cartsFile);
    const newId = carts.length > 0 ? Math.max(...carts.map(c => c.id)) + 1 : 1;
    const newCart = { id: newId, products: [] };
    carts.push(newCart);
    await writeJSON(cartsFile, carts);
    res.status(201).json(newCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/carts/:cid
 * (Opcional) Actualiza un carrito. Por ejemplo, para modificar la lista de productos.
 */
app.put("/api/carts/:cid", async (req, res) => {
  const cid = parseInt(req.params.cid);
  const updateData = req.body;
  try {
    const carts = await readJSON(cartsFile);
    const index = carts.findIndex(c => c.id === cid);
    if (index === -1) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    carts[index] = { ...carts[index], ...updateData };
    await writeJSON(cartsFile, carts);
    res.json(carts[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/carts/:cid
 * Elimina un carrito según su id.
 */
app.delete("/api/carts/:cid", async (req, res) => {
  const cid = parseInt(req.params.cid);
  try {
    const carts = await readJSON(cartsFile);
    const index = carts.findIndex(c => c.id === cid);
    if (index === -1) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    const deletedCart = carts.splice(index, 1);
    await writeJSON(cartsFile, carts);
    res.json({ message: "Carrito eliminado", cart: deletedCart[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/carts/:cid/product/:pid
 * Agrega un producto al carrito indicado. Si el producto ya existe en el carrito,
 * se incrementa la cantidad; de lo contrario, se agrega con cantidad 1.
 */
app.post("/api/carts/:cid/product/:pid", async (req, res) => {
  const cid = parseInt(req.params.cid);
  const pid = parseInt(req.params.pid);
  try {
    
    const carts = await readJSON(cartsFile);
    const products = await readJSON(productsFile);

    
    const cartIndex = carts.findIndex(c => c.id === cid);
    if (cartIndex === -1) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    
    const productExists = products.find(p => p.id === pid);
    if (!productExists) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    
    let productInCart = carts[cartIndex].products.find(item => item.product === pid);
    if (productInCart) {
      
      productInCart.quantity++;
    } else {
      
      carts[cartIndex].products.push({ product: pid, quantity: 1 });
    }

    await writeJSON(cartsFile, carts);
    res.json(carts[cartIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================================
   INICIAR EL SERVIDOR
   ================================ */
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
