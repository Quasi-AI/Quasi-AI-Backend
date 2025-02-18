const Flashcards = require('../models/flashcards.model'); // Import the model
const OpenAI = require('openai'); // Import OpenAI

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper function to generate flashcards using OpenAI
const generateFlashcards = async (model, role, message, level, totalQuestions) => {
    const prompt = `Generate ${totalQuestions} flashcards for a ${level} learner based on the following content:\n\n"${message}"\n\nEach flashcard should be in a question-answer format.`;

    try {
        const response = await openai.chat.completions.create({
            model: model,
            messages: [{ role: role, content: prompt }],
            temperature: 0.7,
        });

        const generatedText = response.choices[0]?.message?.content || "";
        return generatedText.split("\n").map((line, index) => ({
            front: `Q${index + 1}: ${line.split(":")[0]}`,
            back: line.split(":")[1] || "No answer provided",
        }));
    } catch (error) {
        if (error.status === 429) {
            console.error("Rate limit exceeded. Please try again later.");
            throw new Error("Credit exceeded, please try again later.");
        } else {
            console.error("Error generating flashcards:", error);
            throw new Error("Failed to generate flashcards.");
        }
    }
};


// Endpoint to generate flashcards
exports.generate = async (req, res) => {
    const { user_id, message, level, totalQuestions } = req.body;
    if (!user_id || !message || !level || !totalQuestions) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const model = "gpt-3.5-turbo";
    const premium = "gpt-4";  // Premium plan model (can be used later if necessary)
    const role = "Student";

    // Plan: Message length validation
    // if (message.length > 20000) {
    //     return res.status(403).json({ error: 'Message exceeds character limit. Please subscribe to the premium plan.' });
    // }

    try {
        const flashcards = await generateFlashcards(model, role, message, level, totalQuestions);
        const newFlashcardSet = new Flashcards({ user_id, message, level, totalQuestions, flashcards });
        await newFlashcardSet.save();

        res.json({ success: true, level, totalQuestions, flashcards });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Endpoint to fetch all flashcards
exports.getFlashcards = async (req, res) => {
    try {
        const flashcards = await Flashcards.find().sort({ createdAt: -1 });
        res.json({ success: true, flashcards });
    } catch (error) {
        console.error("Error fetching flashcards:", error);
        res.status(500).json({ error: 'Error fetching flashcards.' });
    }
};
