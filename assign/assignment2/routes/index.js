var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");

//create function for authorization
const authorize = (req, res, next) => {
  const secretKey = "your-256-bit-secret";
  const authorization = req.headers.authorization;

  let token = null;

  if (authorization && authorization.split(" ").length === 2) {
    token = authorization.split(" ")[1];
  
  } else {
    console.log("Unauthorized user");
  }

  try {
    const decodedToken = jwt.verify(token, secretKey);
    console.log(decodedToken)

    if (decodedToken.exp > Date.now()) {
      res.status(301).json({
        error: true,
        message: "Token has expired",
      });
      return;
    }
    next();
  } catch {
   res.status(403).json({
     error: true,
     message: "Invalid token",
    });
  }
};

// create home page
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// create About us page
router.get("/about", function (req, res, next) {
  res.render("index", { title: "About Us" });
  res.send({ message });
});

// create route for the first endpoint i.e. stocks 
router.get("/stocks/symbols", function (req, res) {
  req.db
    .from("stocks")
    .select("symbol", "name", "industry")
    .distinct("symbol")
    .then((rows) => {
      res.json(rows);
    })
    .catch((err)=> {
      res.status(404).json({
        error: true,
        message: "Industry sector not found"
      })

    })
    
      
    
});

// create route for the second endpoint i.e. symbol 
router.get("/stocks/:symbol", function (req, res) {
   const from = req.body.from;
   const to = req.body.to;
  req.db
    .from("stocks")
    .select("*")
    .distinct("symbol")
    .where("symbol", "=", req.params.symbol)
    //.whereBetween("timestamp",[from,to])
    //.orderBy('timestamp',"desc")
    .then((rows) => {
      if(!rows.length){
        res.status(404).json({
          error:true,
          message: "No entry for symbol in stocks database"
        })
      } else{
      res.json(rows[0]);

      }
      
    });
    
    
});

// create route for the third endpoint i.e. authentication 
router.post("/stocks/auth/:symbol", authorize, function (req, res) {
  if (!(req.headers && req.headers.authorization)) {
    res.status(403).json({
      error: true,
      message: "Authorization header not found",
    });
  }
  req.db
    .from("stocks")
    .select("*")
    .distinct("symbol")
    .where("symbol", "=", req.params.symbol)
    //.whereBetween("timestamp",[from,to])
    //.orderby ("timestamp",)
    .then((rows) => {
      // if (!rows.length) {
      //   res.status(404).json({
      //     error: true,
      //     message: "Authorization header not found",
      //   });
      //   return;
      // }
      res.status(200).json(rows[0]);
    });
    
});

module.exports = router;
