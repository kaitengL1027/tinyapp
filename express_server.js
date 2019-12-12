const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());



// Data-----------------------------------------------------------------------------
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};



// Helper Functions-----------------------------------------------------------------
const generateRandomString = function() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let length = characters.length;
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * length));
    }
  return result;
};

const checkEmailInUsers = function(toCheck) {
  let id = "";
  for (let obj in users) {
    if (users[obj].email === toCheck) {
      id = obj;
      return id;
    }
  }
  return id;
};

const checkPasswordInUsers = function(toCheck) {
  let id = "";
  for (let obj in users) {
    if (users[obj].password === toCheck) {
      id = obj;
      return id;
    }
  }
  return id;
};

const checkLoginIDByEmail = function(toCheck) {
  let id = "";
  for (let obj in users) {
    if (users[obj].email === toCheck) {
      id = obj;
      return id;
    }
  }
  return id;
};



// Post Handlers--------------------------------------------------------------------
app.post("/login", (req, res) => {
  if ((checkEmailInUsers(req.body.email) === checkPasswordInUsers(req.body.password)) && checkEmailInUsers(req.body.email) !== "") {
    res.cookie('user_id', checkLoginIDByEmail(req.body.email));
    res.redirect("/urls");
  } else {
    res.status(403).end();
  }
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Please fill in form!');
  } else if (checkEmailInUsers(req.body.email) !== "") {
    res.status(400).send('User Already Exist!')
  } else {
    let newUserID = String(generateRandomString());
    users[newUserID] = {};
    users[newUserID]["id"] = newUserID;
    users[newUserID]["email"] = req.body.email;
    users[newUserID]["password"] = req.body.password;
    res.cookie('user_id', newUserID);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let newData = String(generateRandomString());  
  urlDatabase[newData] = req.body.longURL;
  res.redirect(`/urls/${newData}`);  // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  console.log(urlDatabase);
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let sURL = req.params.shortURL;
  res.redirect(`/urls/${sURL}`);
});



// Get Handlers---------------------------------------------------------------------
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  console.log(templateVars.urls);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
})

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});



// Defaults------------------------------------------------------------------
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});