require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const cors = require("cors");

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS before defining routes
app.use(
  cors({
    origin: [
      "https://imf-gadget-api-zy90.onrender.com",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Add security headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.json());

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IMF Gadget API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "https://imf-gadget-api-zy90.onrender.com",
        description: "Production server",
      },
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./index.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Auth Routes
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
app.post("/auth/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });
    res.status(201).json({ id: user.id, username: user.username });
  } catch (error) {
    res.status(400).json({ error: "Registration failed" });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(401).json({ error: "Invalid credentials" });

  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ accessToken });
});

// Gadget Routes
/**
 * @swagger
 * /gadgets:
 *   get:
 *     summary: Get all gadgets
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Available, Deployed, Destroyed, Decommissioned]
 *     responses:
 *       200:
 *         description: List of gadgets
 */
app.get("/gadgets", async (req, res) => {
  try {
    const { status } = req.query;
    const gadgets = await prisma.gadget.findMany({
      where: status ? { status } : {},
    });
    const gadgetsWithProbability = gadgets.map((gadget) => ({
      ...gadget,
      mission_success_probability: Math.floor(Math.random() * 100) + 1,
    }));
    res.json(gadgetsWithProbability);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /gadgets:
 *   post:
 *     summary: Add a new gadget
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gadget created
 */
app.post("/gadgets", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const prefixes = [
      "Nightingale",
      "Kraken",
      "Phoenix",
      "Shadow",
      "Eagle",
      "Viper",
      "Storm",
    ];
    let codename, existing;
    do {
      const randomName = prefixes[Math.floor(Math.random() * prefixes.length)];
      codename = `The ${randomName}`;
      existing = await prisma.gadget.findUnique({ where: { codename } });
    } while (existing);

    const gadget = await prisma.gadget.create({
      data: { name, codename, status: "Available" },
    });
    res.status(201).json(gadget);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /gadgets/{id}:
 *   patch:
 *     summary: Update a gadget
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Available, Deployed, Destroyed]
 *     responses:
 *       200:
 *         description: Gadget updated
 */
app.patch("/gadgets/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    if (status === "Decommissioned") {
      return res.status(400).json({ error: "Use DELETE to decommission" });
    }

    const gadget = await prisma.gadget.update({
      where: { id },
      data: { name, status },
    });
    res.json(gadget);
  } catch (error) {
    res.status(404).json({ error: "Gadget not found" });
  }
});

/**
 * @swagger
 * /gadgets/{id}:
 *   delete:
 *     summary: Decommission a gadget
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gadget decommissioned
 */
app.delete("/gadgets/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const gadget = await prisma.gadget.update({
      where: { id },
      data: { status: "Decommissioned", decommissionedAt: new Date() },
    });
    res.json(gadget);
  } catch (error) {
    res.status(404).json({ error: "Gadget not found" });
  }
});

/**
 * @swagger
 * /gadgets/{id}/self-destruct:
 *   post:
 *     summary: Trigger self-destruct
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Self-destruct initiated
 */
app.post("/gadgets/:id/self-destruct", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const gadget = await prisma.gadget.findUnique({ where: { id } });

    if (!gadget) return res.status(404).json({ error: "Gadget not found" });
    if (gadget.status === "Decommissioned")
      return res.status(400).json({ error: "Decommissioned gadget" });
    if (gadget.status === "Destroyed")
      return res.status(400).json({ error: "Already destroyed" });

    const confirmationCode = Math.floor(100000 + Math.random() * 900000);
    await prisma.gadget.update({
      where: { id },
      data: { status: "Destroyed", destroyedAt: new Date() },
    });

    res.json({ message: "Self-destruct initiated", confirmationCode });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
