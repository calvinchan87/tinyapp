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

const getUserIDByEmail = function(input) {
  for (const x in users) {
    if (users[x].email === input) {
      return users[x].id; // refactoring ideas from @wesley-wong and @berk-ozer
    }
  }
  return false;
};

const urlsForUser = function(input) {
  let customURLs = {};
  for (const x in urlDatabase) {
    if (urlDatabase[x].userID === input) {
      customURLs[x] = urlDatabase[x];
    }
  }
  return customURLs;
};

const urlDatabase = {
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com"
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
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
  if (users[req.cookies.user_id] === undefined) {
    res.status(403).send("403: Log in or register first to see shortened URLs.");
    console.log("403 error");
    return;
  };
  
  // console.log(urlDatabase);
  // console.log(urlsForUser(users[req.cookies.user_id].id));

  const templateVars = {
    // username: req.cookies["username"], // Display the Username
    urls: urlsForUser(users[req.cookies.user_id].id),
    user: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); // Hat tip to Devin McGillivray for the spoiler/hint
  urlDatabase[shortURL] = {
    longURL: req.body.longURL, // Hat tip to Devin McGillivray for the spoiler/hint
    userID: users[req.cookies.user_id].id
  }
  // console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`); // Hat tip to Paul Ladd for the spoiler/hint
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {
  if (users[req.cookies.user_id] === undefined) {
    res.redirect('/login');
    return;
  };

  const templateVars = {
    // username: req.cookies["username"], // Display the Username
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL; // Hat tip to Ievgen Dilevskyi for the spoiler/hint
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  if (users[req.cookies.user_id] === undefined) {
    res.status(403).send("403: Log in or register first to see shortened URL details.");
    console.log("403 error");
    return;
  }
  
  if (users[req.cookies.user_id].id !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).send("403: This shortened URL does not belong to you, so its details can not be accessed.");
    console.log("403 error");
    return;
  }

  const templateVars = {
    // username: req.cookies["username"], // Display the Username
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.cookies.user_id] === undefined) {
    res.status(403).send("403: Log in or register first to delete URLs.");
    console.log("403 error");
    return;
  }
  
  if (users[req.cookies.user_id].id !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).send("403: This shortened URL does not belong to you, so it can not be deleted.");
    console.log("403 error");
    return;
  }

  delete urlDatabase[req.params.shortURL]; // Edward Smith RA
  res.redirect('/urls/');
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL; // Manali Bhattacharyya RA
  res.redirect('/urls/');
});

//Create a Login Page
app.get("/login", (req, res) => {
  const templateVars = {
    // username: req.cookies["username"],
    user: users[req.cookies.user_id]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  // console.log(req.body);
  // res.cookie('username', req.body.username); // It should set a cookie named username to the value submitted in the request body via the login form
  // console.log(req.body.username);

  let userIDInQuestion = getUserIDByEmail(req.body.email);

  if (userIDInQuestion === false) {
    res.status(403).send("403: Email can not be found.");
    console.log("403 error");
    return;
  };

  if (users[userIDInQuestion].password === req.body.password) {
    res.cookie('user_id', users[userIDInQuestion].id);
    res.redirect('/urls/');
    return;
  }
  
    res.status(403).send("403: Password does not match.");
    console.log("403 error");
  
});

app.post("/logout", (req, res) => {
  // res.clearCookie('username'); // clears the username cookie
  res.clearCookie('user_id');
  res.redirect('/urls/');
});

// Hat tip to Penny req.cookies["username"] seems to always come back undefined,
// the problem was that my "name" param needed to be "username"
// Hat tip to Ievgen <%= user.email%>

// Create a Registration Page (seems like urls_new is a good template)
app.get("/register", (req, res) => {
  const templateVars = {
    // username: req.cookies["username"],
    user: users[req.cookies.user_id] // Hat tip to Ievgen Dilevskyi for the spoiler/hint
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

  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("400: Please enter a valid email address and password.");
    console.log("400 error");
    return;
  };

  if (getUserIDByEmail(req.body.email) !== false) {
    res.status(400).send("400: Email already exists."); // Hat tip to @latagore for res.status(400).syntax
    console.log("400 error");
    return;
  };

  users[randomSix] = user;
  // console.log(user);
  // console.log(users);
  res.cookie('user_id', users[randomSix].id);
  res.redirect('/urls/');
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});