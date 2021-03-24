const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcryptjs');

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['lloyd']
}));

app.set("view engine", "ejs");

const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers');

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

app.get("/", (req, res) => {
  if (users[req.session.user_id] === undefined) {
    res.redirect('/login');
    return;
  }
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  if (users[req.session.user_id] === undefined) {
    res.status(403).send("403: <a href=/login>Log in</a>  or <a href=/register>register</a> first to see shortened URLs.");
    console.log("403 error");
    return;
  }

  const templateVars = {
    urls: urlsForUser(users[req.session.user_id].id, urlDatabase),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: users[req.session.user_id].id
  };
  
  if (urlDatabase[shortURL].longURL.startsWith('http://') || urlDatabase[shortURL].longURL.startsWith('https://')) {

  } else {
    urlDatabase[shortURL].longURL = 'http://' + urlDatabase[shortURL].longURL;
  }

  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id] === undefined) {
    res.redirect('/login');
    return;
  }

  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(403).send("403: This shortened URL doesn't exist.");
    console.log("403 error");
    return;
  }

  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  if (users[req.session.user_id] === undefined) {
    res.status(403).send("403: <a href=/login>Log in</a>  or <a href=/register>register</a> first to see shortened URL details.");
    console.log("403 error");
    return;
  }

  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(403).send("403: This shortened URL doesn't exist, so its details can not be updated.");
    console.log("403 error");
    return;
  }

  if (users[req.session.user_id].id !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).send("403: This shortened URL does not belong to you, so its details can not be accessed.");
    console.log("403 error");
    return;
  }

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.session.user_id] === undefined) {
    res.status(403).send("403: <a href=/login>Log in</a>  or <a href=/register>register</a> first to delete URLs.");
    console.log("403 error");
    return;
  }
  
  if (users[req.session.user_id].id !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).send("403: This shortened URL does not belong to you, so it can not be deleted.");
    console.log("403 error");
    return;
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
});

app.post("/urls/:shortURL", (req, res) => {
  let updatedURL = req.body.longURL;
  if (updatedURL.startsWith('http://') || updatedURL.startsWith('https://')) {

  } else {
    updatedURL = 'http://' + updatedURL;
  }

  urlDatabase[req.params.shortURL].longURL = updatedURL;
  res.redirect('/urls/');
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls/');
    return;
  }

  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let userIDInQuestion = getUserByEmail(req.body.email, users).id;

  if (userIDInQuestion === undefined) {
    res.status(403).send("403: Email can not be found.");
    console.log("403 error");
    return;
  }

  if (bcrypt.compareSync(req.body.password, users[userIDInQuestion].password)) {
    req.session.user_id = users[userIDInQuestion].id;
    res.redirect('/urls/');
    return;
  }
  
  res.status(403).send("403: Password does not match.");
  console.log("403 error");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls/');
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls/');
    return;
  }

  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const randomSix = generateRandomString();
  const unhashedPassword = req.body.password;

  let user = {
    id: randomSix,
    email: req.body.email,
    password: bcrypt.hashSync(unhashedPassword, 10)
  };

  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("400: Please enter a valid email address and password.");
    console.log("400 error");
    return;
  }

  if (getUserByEmail(req.body.email, users) !== false) {
    res.status(400).send("400: Email already exists.");
    console.log("400 error");
    return;
  }

  users[randomSix] = user;
  req.session.user_id = users[randomSix].id;
  res.redirect('/urls/');
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});