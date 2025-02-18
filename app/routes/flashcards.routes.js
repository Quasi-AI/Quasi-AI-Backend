module.exports = app => {
    const flashcards = require("../controllers/flashcards.controller.js");
    
    app.post("/flashcards/generate", flashcards.generate);
  
    app.get('/flashcards/:user_id', flashcards.getFlashcards);

};

