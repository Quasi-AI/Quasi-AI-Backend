const db = require("../models");
const User = require("../models/user.model")
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For token generation
const nodemailer = require('nodemailer'); // For sending emails
const fs = require('fs'); 



// Secret key for token generation (use environment variable for production)
const jwtSecret = process.env.JWT_SECRET;

// Email validation function using regex
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email pattern check
  return emailRegex.test(email);
}

// Set up transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com', // Hostinger SMTP server
  port: 465, // Port for SSL
  secure: true, // Use SSL
  auth: {
    user: 'info@quasiai.com',
    pass: 'QuasiAI@123'
  }
});

// Function to send the email after signup
async function sendWelcomeEmail(user , resetlink, emailtemplate) {
  const emailTemplate = fs.readFileSync(emailtemplate, 'utf8'); // Read your HTML template

  const mailOptions = {
    from: 'info@quasiai.com',
    to: user.email,
    subject: 'Welcome to Quasi AI!',
    html: emailTemplate.replace('{{username}}', user.name).replace('{{verification_link}}', resetlink)
  };

  await transporter.sendMail(mailOptions);
}

exports.create = async (req, res) => {
  // Validate request
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ message: "Username, email, password, phone number, and country code are required!" });
  }

  // Validate email format
  if (!validateEmail(req.body.email)) {
    return res.status(400).send({ message: "Invalid email format!" });
  }

  // Manually set default permissions

  const defaultPermissions = {
    canViewCourses: false,
    canEnrollInCourse: true,
    canAddCourse: false,
    canViewAnalytics: false,
    canAddInstructor: false,
    canUpdateCourseContent: false,
    canGradeAssignments: false,
    canManageCourseMaterials: false,
    canViewGrades: false,
    canViewProfile: false,
    canManageUsers: false,
    canAddAdminPermissions: false,
    canViewInstructors: false,
    canManageCourses: false,
    canViewCourseList: false,
    canManageCourseSettings: false,
    canReserveClassroom: false,
    canRequestAssistance: false,
    canPostAnnouncements: false,
    canViewAnnouncements: false,
    canViewAssignments: false,
    canSubmitAssignment: false,
    canViewPaymentHistory: false,
    canAddNotifications: false,
    canViewNotifications: false,
    canManageSettings: false,
    
    // New Permissions
    canManageQuestions: false,         // Permission to create and manage questions
    canCreateQuizzes: false,          // Permission to create and manage quizzes
    canAccessFlashcards: false,       // Permission to access and use flashcards
    canCreateFlashcards: false,       // Permission to create flashcards
    canPlayLearningGames: false,      // Permission to play and use learning games
    canLearnHowToCode: false          // Permission to access and learn how to code content
};


  // Check if user already exists
  User.findOne({ email: req.body.email })
    .then(async existingUser => {
      if (existingUser) {
        return res.status(400).send({ message: "User already exists with this username or email!" });
      }

      // Hash the user's password
      const hashedPassword = await bcrypt.hash(req.body.password, 10); // 10 is the salt rounds

      // Create a User with the hashed password
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword, // Store the hashed password
        permissions: defaultPermissions, // Storing JSON for permissions
      });

      // Save User in the database
      const savedUser = await user.save();

      // //Create profile after user creation
      // const { email } = req.body;

      // // Check if profile already exists
      // const existingProfile = await Profile.findOne({ email });
      // if (existingProfile) {
      //   return res.status(400).json({ message: "Profile or account with this email already exists" });
      // }

      // // Create a new profile
      // const newProfile = new Profile({
      //   email,
      //   user_id: savedUser._id
      // });

      // const savedProfile = await newProfile.save();

      // Generate a token
      const token = jwt.sign(
        { id: savedUser._id, name: savedUser.name },
        jwtSecret,
        { expiresIn: 86400 } // Token expires in 24 hours
      );

      // Send welcome email
      const link = '';
      const emailtemp = 'email-template.html';
      await sendWelcomeEmail(savedUser, link, emailtemp);

      // Send the user, profile, and token in the response
      res.send({
        user: savedUser,
        token: token, // Send the generated token
      });
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the User."
      });
    });
};



// Retrieve all Users from the database.
exports.findAll = (req, res) => {
  const username = req.query.username;
  var condition = username ? { username: { $regex: new RegExp(username), $options: "i" } } : {};

  User.find(condition)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users."
      });
    });
};

// Find a single User with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  User.findById(id)
    .then(data => {
      if (!data) {
        res.status(404).send({ message: "Not found User with id " + id });
      } else {
        res.send(data);
      }
    })
    .catch(err => {
      res.status(500).send({ message: "Error retrieving User with id=" + id });
    });
};

// Update a User by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Data to update cannot be empty!" });
  }

  const id = req.params.email;

  User.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update User with id=${id}. Maybe User was not found!`
        });
      } else {
        res.send({ message: "User was updated successfully." });
      }
    })
    .catch(err => {
      res.status(500).send({ message: "Error updating User with id=" + id });
    });
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete User with id=${id}. Maybe User was not found!`
        });
      } else {
        res.send({ message: "User was deleted successfully!" });
      }
    })
    .catch(err => {
      res.status(500).send({ message: "Could not delete User with id=" + id });
    });
};

// Delete all Users from the database.
exports.deleteAll = (req, res) => {
  User.deleteMany({})
    .then(data => {
      res.send({ message: `${data.deletedCount} Users were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({ message: err.message || "Some error occurred while removing all users." });
    });
};


exports.login = (req, res) => {
  const { email, password } = req.body;

  // Check if both email and password are provided
  if (!email || !password) {
    return res.status(400).send({ message: "Email and password are required!" });
  }

  // Validate email format
  if (!validateEmail(email)) {
    return res.status(400).send({ message: "Invalid email format!" });
  }

  // Find user by email
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User with the email address '" + email + "' was not found." });
      }

      // Compare the password with the stored hashed password
      const passwordIsValid = bcrypt.compareSync(password, user.password);

      if (!passwordIsValid) {
        return res.status(401).send({ message: "Invalid Password!" });
      }

      // Generate a JWT token for the user (you need a secret for signing)
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: 86400 // expires in 24 hours
      });

      // Send the token and user data in the response
      res.status(200).send({
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        token: token
      });
    })
    .catch(err => {
      res.status(500).send({ message: "Error retrieving user with email=" + email });
    });
};


// Endpoint to request password reset
exports.requestPasswordReset = async (req, res) => {
  if (!req.body.email || !validateEmail(req.body.email)) {
    return res.status(400).send({ message: "Invalid email format." });
 }

  User.findOne({ $or: [{ email: req.body.email }] })
      .then(async user => {
          if (!user) {
              return res.status(404).send({ message: "User not found." });
          }
          
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: 3600 });
          const resetLink = `https://park4me.org/earn/html/resetpage.html?token=${token}`;
          const emailtemp = 'password-reset.html'
          await sendWelcomeEmail(user, resetLink, emailtemp);

          res.send({ message: "Password reset link sent to your email." });
      })
      .catch(err => {
          res.status(500).send({ message: "Error finding user." });
      });
};


// Endpoint to reset password
exports.resetPassword = (req, res) => {
  const { token, newPassword } = req.body;

  // Verify the token
  jwt.verify(token, jwtSecret, async (err, decoded) => {
    if (err) {
      return res.status(400).send({ message: "Invalid or expired token." });
    }

    const userId = decoded.id;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true, useFindAndModify: false })
      .then(user => {
        if (!user) {
          return res.status(404).send({ message: "User not found." });
        }
        res.send({ message: "Password reset successfully." });
      })
      .catch(err => {
        res.status(500).send({ message: "Error updating password." });
      });
  });
};


exports.requestAccountDeletion = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).send({ message: "Invalid email format." });
  }

  if (!password) {
    return res.status(400).send({ message: "Password is required." });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid password." });
    }

    // Generate token for account deletion
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: 3600 }); // 1-hour expiration
    const deletionLink = `https://park4me.org/earn/html/delete-account.html?token=${token}`;
    const emailTemplate = 'account-deletion.html';

    // Send email with the deletion link
    await sendWelcomeEmail(user, deletionLink, emailTemplate);

    res.send({ message: "Account deletion link sent to your email." });
  } catch (err) {
    res.status(500).send({ message: "Error processing request." });
  }
};



// Endpoint to confirm and delete account
exports.confirmAccountDeletion = (req, res) => {
  const { token } = req.body;

  jwt.verify(token, jwtSecret, async (err, decoded) => {
    if (err) {
      return res.status(400).send({ message: "Invalid or expired token." });
    }

    const userId = decoded.id;

    User.findByIdAndRemove(userId, { useFindAndModify: false })
      .then(user => {
        if (!user) {
          return res.status(404).send({ message: "User not found." });
        }

        res.send({ message: "User account deleted successfully." });
      })
      .catch(err => {
        res.status(500).send({ message: "Error deleting user account." });
      });
  });
};