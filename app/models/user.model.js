const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { 
      type: String,
      required: true,
      unique: true  // Optionally, you may want email to be unique
    },
    role: { 
      type: String,
      required: true,
    },
    password: { 
      type: String, 
      required: true 
    },
    permissions: { 
      type: mongoose.Schema.Types.Mixed, 
      default: {}  // Default to empty object if permissions are not provided
    }
  },
  { timestamps: true }
);

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = User; 

