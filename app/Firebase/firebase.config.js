


// /firebase/firebaseConfig.js

// Import the functions you need from the Firebase SDK
const { initializeApp } = require("firebase/app");
const { getStorage } = require("firebase/storage"); // Include other services as needed

require('dotenv').config();

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app); // Example of using Firebase Storage

// Export Firebase app and services
module.exports = { app, storage };
