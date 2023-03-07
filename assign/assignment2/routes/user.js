var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
var token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImV4YW1wbGVAYXBpLmNvbSIsImV4cCI6MTU5MDk5NDIxNCwiaWF0IjoxNTkwOTA3ODE0fQ.dSh62STP21NI0H-mfMYfLl7A2y8bJHt15Bt0hd8V-YI";
var jwt = require("jsonwebtoken");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

//create register route
router.post("/register", function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  //Verify body
  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed ",
    });
  }

  // ouput user exists message if the user exists
  req.db
    .from("users")
    .select("*")
    .where("email", "=", email)
    .then((users) => {
      if (users.length > 0) {
        res.status(409).json({
          error: true,
          message: "user already exists",
        });
        return;
      }

      //create user
      const saltRounds = 10;
      const hash = bcrypt.hashSync(password, saltRounds);
      return req.db.from("users").insert({ email, hash });
    })
    .then(() => {
      res.status(201).json({ success: true, message: "User created" });
    });
});

//create login route
router.post("/login", function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  //verify body
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed",
    });
    return;
  }

  //compare password if the user already exists
  const queryUsers = req.db
    .from("users")
    .select("*")
    .where("email", "=", `${email}`);
  queryUsers
    .then((users) => {
      if (users.length === 1) {
        //compare passwords
        const user = users[0];
        return bcrypt.compare(password, user.hash);
       }
    })
    .then((matches) => {
      if (matches) {
        //create and return JWT token
        const secretKey = "your-256-bit-secret";
        const expires_in = 60 * 60 * 24;
        const exp = Math.floor(Date.now() / 1000) + expires_in;
        const token = jwt.sign({ email, exp }, secretKey);
        res.status(200).json({ token_type: "Bearer", token, expires_in });
      }
      else{
        res.status(401).json({
          error: true,
          message: "Incorrect email or password",
        });
        return;
      }
      
    });
});


module.exports = router;
