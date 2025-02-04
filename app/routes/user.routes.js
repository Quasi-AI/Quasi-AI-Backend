module.exports = app => {
  const user = require("../controllers/user.controller.js");
  
  app.post("/user/create", user.create);

  app.get("/user/", user.findAll);

  app.get("/user/:id", user.findOne);

  app.put("/user/update/:id", user.update);

  app.delete("/user/:id", user.delete);

  app.delete("/user/", user.deleteAll);

  app.post("/user/login", user.login);

  app.post("/user/request", user.requestPasswordReset);

  app.post("/user/reset", user.resetPassword);

  app.post("/user/requestAccountDeletion", user.requestAccountDeletion);

  app.post("/user/confirmAccountDeletion", user.confirmAccountDeletion);
  

};


