const express = require("express");
const cors = require("cors");
const storage = require("./app/Firebase/firebase.config");
require('dotenv').config();
const app = express();

const corsOptions = {
  origin: true, // Allow all origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS", // Ensure OPTIONS is allowed
  credentials: true // Allow credentials (like cookies) to be sent with requests
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database", err);
    process.exit();
  });

// Import and use routes
require("./app/routes/user.routes")(app);
require("./app/routes/flashcards.routes")(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
