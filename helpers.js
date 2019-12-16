const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: 'session',
  keys: ["keysss"]
}));
app.use(bodyParser.urlencoded({extended: true}));


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

module.exports = {
  generateRandomString,
  checkEmailInUsers,
  checkPasswordByEmail,
  checkLoginIDByEmail,
  urlDatabaseID
};