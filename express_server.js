const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser"); // Hat tip to Caden for the spoiler/hint
app.use(cookieParser()); // Hat tip to Penny for the spoiler/hint

app.set("view engine", "ejs");

function generateRandomString() {
  let randomSix   = '';
  let chars       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charsLength = chars.length;
  for (var i = 0; i < 6; i++) {
    randomSix += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  return randomSix;
};

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
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], // Display the Username
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); // Hat tip to Devin McGillivray for the spoiler/hint
  urlDatabase[shortURL] = req.body.longURL; // Hat tip to Devin McGillivray for the spoiler/hint
  console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`); // Hat tip to Paul Ladd for the spoiler/hint
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], // Display the Username
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]; // Hat tip to Ievgen Dilevskyi for the spoiler/hint
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], // Display the Username
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]; // Edward Smith RA
  res.redirect('/urls/');
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL; // Manali Bhattacharyya RA
  res.redirect('/urls/');
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username); // It should set a cookie named username to the value submitted in the request body via the login form
  console.log(req.body.username);
  res.redirect('/urls/');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username'); // clears the username cookie
  res.redirect('/urls/');
});

// Hat tip to Penny req.cookies["username"] seems to always come back undefined, the problem was that my "name" param needed to be "username"
// Hat tip to Ievgen user: users[req.cookies.user_id] && <%= user.email%>

// Create a Registration Page (seems like urls_new is a good template)
app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_register", templateVars);
});

// Create a Registration Handler (seems like POST to edit longURL is a good template)
app.post("/register", (req, res) => {
  // console.log(req.body);
  const randomSix = generateRandomString();
  let user = {
    id: randomSix,
    email: req.body.email,
    password: req.body.password
  };
  users[randomSix] = user;
  // console.log(user);
  // console.log(users);
  res.cookie('username', randomSix);
  res.redirect('/urls/');
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});