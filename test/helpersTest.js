const { assert } = require('chai');
const { checkLoginIDByEmail, generateRandomString, checkEmailInUsers, urlDatabaseID } = require('../helpers.js');

const testUsers = {
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

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};



describe('checkLoginIDByEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkLoginIDByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput);
  });
  it('should return null with invalid(not in users) email', function() {
    const user = checkLoginIDByEmail("abc@example.com", testUsers);
    const expectedOutput = null;
    assert.strictEqual(user, expectedOutput);
  });
});

describe('generateRandomString', function() {
  it('should return a random string that is 6 characters long', function() {
    const idLength = generateRandomString().length;
    const length = 6;
    assert.strictEqual(idLength, length);
  });
});

describe('checkEmailInUsers', function() {
  it('should return true if email is in testUsers', function() {
    const haveEmail = checkEmailInUsers("user@example.com", testUsers);
    const expectedOutput = true;
    assert.strictEqual(haveEmail, expectedOutput);
  });
  it('should return false if email is not in testUsers', function() {
    const haveEmail = checkEmailInUsers("abc@example.com", testUsers);
    const expectedOutput = false;
    assert.strictEqual(haveEmail, expectedOutput);
  });
  it('should return false if email is empty', function() {
    const haveEmail = checkEmailInUsers("", testUsers);
    const expectedOutput = false;
    assert.strictEqual(haveEmail, expectedOutput);
  });
});

describe('urlDatabaseID', function() {
  it('should return an object containing all the url data under the same id', function() {
    const singleIdObj = urlDatabaseID("aJ48lW", urlDatabase);
    const expectedOutput = {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
      i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
    };
    assert.deepEqual(singleIdObj, expectedOutput);
  });
});