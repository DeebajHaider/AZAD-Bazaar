require('dotenv').config();
const express = require('express');
const { connectMongo } = require('./initDB');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
connectMongo()
  .then(() => {
    console.log("MongoDB connected, starting server...");

    // Start server only after DB is ready
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });

// Basic route
app.get('/', (req, res) => res.send("Grocery App Backend Running"));
