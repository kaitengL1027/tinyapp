// Modules & Setup-------------------------------------------------------------------
const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require("morgan");
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: 'session',
  keys: ["keysss"]
}));
app.use(bodyParser.urlencoded({extended: true}));

let numberOfVisits = 0;
app.use((req, res, next) => {
  numberOfVisits++;
  next();
});



// Data-----------------------------------------------------------------------------
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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

const checkEmailInUsers = function(email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

const checkPasswordByEmail = function(email, password, users) {
  for (let user in users) {
    if (users[user].email === email) {
      if (bcrypt.compareSync(password, users[user].password)) {
        return true;
      } else {
        return false;
      }
    }
  }
  return false;
};

const checkLoginIDByEmail = function(email, users) {
  let id = "";
  for (let user in users) {
    if (users[user].email === email) {
      id = users[user].id;
      return id;
    }
  }
  return null;
};

const urlDatabaseID = function(id, urlDatabase) {
  let singleUserData = {};
  for (let shortU in urlDatabase) {
    if (urlDatabase[shortU].userID === id) {
      singleUserData[shortU] = {};
      singleUserData[shortU]["longURL"] = urlDatabase[shortU].longURL;
      singleUserData[shortU]["userID"] = urlDatabase[shortU].userID;
    }
  }
  return singleUserData;
};



// Post Handlers--------------------------------------------------------------------
app.post("/login", (req, res) => {
  if (checkEmailInUsers(req.body.email, users)) {
    if (checkPasswordByEmail(req.body.email, req.body.password, users)) {
      req.session.user_id = checkLoginIDByEmail(req.body.email, users);
      res.redirect("/urls");
    } else {
      res.status(403).send("Incorrect Password");
    }
  } else {
    res.status(403).send("Account not yet registered!");
  }
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Please fill in form!');
  } else if (checkEmailInUsers(req.body.email, users)) {
    res.status(400).send('User Already Exist!')
  } else {
    let newUserID = String(generateRandomString());
    users[newUserID] = {};
    users[newUserID]["id"] = newUserID;
    users[newUserID]["email"] = req.body.email;
    const password = req.body.password;
    users[newUserID]["password"] = bcrypt.hashSync(password, 10);
    req.session.user_id = newUserID;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let newData = String(generateRandomString());  
  urlDatabase[newData] = {};
  urlDatabase[newData]["longURL"] = req.body.longURL;
  urlDatabase[newData]["userID"] = req.session.user_id;
  res.redirect(`/urls/${newData}`);  // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/update", (req, res) => {
  let userData = urlDatabaseID(req.session.user_id, urlDatabase);
  for (let currentShortURL in userData) {
    if (req.params.shortURL === currentShortURL) {
      urlDatabase[req.params.shortURL].longURL = req.body.longURL;
      res.redirect("/urls");
    }
  }
  let templateLogIn = {
    user: users[req.session.user_id]
  };
  res.render("log_in_first", templateLogIn);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let userData = urlDatabaseID(req.session.user_id, urlDatabase);
  for (let currentShortURL in userData) {
    if (req.params.shortURL === currentShortURL) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    }
  }
  let templateLogIn = {
    user: users[req.session.user_id]
  };
  res.render("log_in_first", templateLogIn);  
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let userData = urlDatabaseID(req.session.user_id, urlDatabase);
  for (let currentShortURL in userData) {
    if (req.params.shortURL === currentShortURL) {
      let sURL = req.params.shortURL;
      res.redirect(`/urls/${sURL}`);
    }
  }
  let templateLogIn = {
    user: users[req.session.user_id]
  };
  res.render("log_in_first", templateLogIn);
});



// Get Handlers---------------------------------------------------------------------
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  if (req.session.user_id === undefined) {
    let templateLogIn = {
      user: users[req.session.user_id]
    }
    res.render("log_in_first", templateLogIn);
  } else {
    let templateVars = {
      user: users[req.session.user_id],
      urls: urlDatabaseID(req.session.user_id, urlDatabase)
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let UserData = urlDatabaseID(req.session.user_id, urlDatabase);
  for (let currentShortURL in UserData) {
    if (req.params.shortURL === currentShortURL) {
      let templateVars = {
        user: users[req.session.user_id],
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL
      };
      res.render("urls_show", templateVars);
    }
  }
  let templateLogIn = {
    user: users[req.session.user_id]
  };
  res.render("log_in_first", templateLogIn);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
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