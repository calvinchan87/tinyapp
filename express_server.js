const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser"); // Hat tip to Caden
app.use(cookieParser()); // Hat tip to Penny, "name" param needed to be "username"
// Hat tip to Ievgen <label for="username"><%= username%></label>
// Hat tip to Ievgen user: users[req.cookies.user_id] && <%= user.email%>

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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
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
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]; // Hat tip to Ievgen Dilevskyi for the spoiler/hint
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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
  const username = res.cookie();
  // It should set a cookie named username to the value submitted in the request body via the login form
  res.redirect('/urls/');
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});