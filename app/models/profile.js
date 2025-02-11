const mongoose = require('mongoose');

// Define the User Schema
const profileSchema = new mongoose.Schema(
  {
    profileImage: { 
      type: String
    }
  },
  { timestamps: true }
);

// Create the User model
const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile; 

