const mongoose = require('mongoose');

// Define Mongoose Schema & Model
const flashcardSchema = new mongoose.Schema(
    {
    message: { type: String, required: true },
    user_id: { type: String, required: true },
    level: { type: String, required: true, enum: ['beginner', 'intermediate', 'advanced'] },
    totalQuestions: { type: Number, required: true },
    flashcards: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now }
}
);

const Flashcard = mongoose.model("Flashcard", flashcardSchema);

module.exports = Flashcard;


