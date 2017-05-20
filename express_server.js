
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs")

const bcrypt = require("bcrypt");
app.use(express.static(__dirname + "/styles"));

var cookieSession = require("cookie-session")
app.use(cookieSession({
  name: "session",
  keys: ["iac", "cai"]
}))

// Databases
const users = {}

var urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "hello",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "hello"
  },

  "c3yWm3": {
     longURL: "http://www.hackeryou.ca",
     userID: "bye"
  },

  "0tn6yL": {
    longURL: "http://www.askjeeves.com",
    userID: "bye"
  }
}

// Functions
function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i = 0; i < 5; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

function getUserById(id) {
  for (var i in users) {
    if (users[i].id === id) {
      return users[i];
    }
  }
  return "";
}

function getURLid(id) {
  var urlDatabaseFiltered = {}
  for (var i in urlDatabase) {
    if (urlDatabase[i].userID === id) {
      urlDatabaseFiltered[i] = urlDatabase[i];
    }
  }
  return urlDatabaseFiltered;
}

function getUserByEmail(email) {
  for (var i in users) {
    if (users[i].email === email) {
      return users[i];
    }
  }
  return "";
}

function doesUserExist(userEmail) {
  for (var i in users) { // Iterates through user database
    if (users[i].email === userEmail) { // Checks if the email in the user database matches the email entered
      return true;
    }
  }
  return false;
}

// Routes
app.get("/", (req, res) => {
  let wholeUser = getUserById(req.session.user_id);
  let templateVars = {user: wholeUser}
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let wholeUser = getUserById(req.session.user_id);
  let templateVars = { user: wholeUser}
  res.render("login", templateVars)
});

app.post("/login", (req, res) => {
  const userEmail = req.body.userEmail;
  const userPassword = req.body.userPassword;

  if (userEmail === "" || typeof(userEmail) === "undefined"  || userPassword === "" || typeof(userPassword) === "undefined") {
    res.status(400)
    res.send("Please enter all information")
    } else if (doesUserExist(userEmail)) {
      let user = getUserByEmail(userEmail)
      if (bcrypt.compareSync(userPassword, user.password)) {
          req.session.user_id = user.id;
          res.redirect("/urls/new");
        } else {
          res.send("Login info incorrect")
        }
  } else {
    res.send("User not found")
  }
});

app.get("/register", (req, res) => {
  let wholeUser = getUserById(req.session.user_id);
  let templateVars = { user: wholeUser}
  res.render("register", templateVars)
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  if (userEmail === "" || userPassword === "") {
    res.status(400)
    res.send("Please enter all information")
  } else if (doesUserExist(userEmail)) {
      res.status(400)
      res.send("User exists")
  } else {
      const userId = generateRandomString();
      const user = {
      id: userId,
      email: userEmail,
      password: hashedPassword
      }
      users[userId] = user;
      req.session.user_id = users[userId].id;
      res.redirect("/urls/new");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase[0]);
});

app.get("/urls", (req, res) => {
  let wholeUser = getUserById(req.session.user_id);
  let templateVars = { urls: getURLid(req.session.user_id), user: wholeUser };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let wholeUser = getUserById(req.session.user_id);
  let templateVars = { user: wholeUser}
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let wholeUser = getUserById(req.session.user_id);
  let longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//Create urls
app.post("/urls", (req, res) => {
  let newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect("/urls/" + newShortUrl);
});

//Edit endpoint
app.get("/urls/:id", (req, res) => {
  let wholeUser = getUserById(req.session.user_id);
  let templateVars = {
    newShortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: wholeUser,
    urls: urlDatabase
  }
  const userID = req.session.user_id;
  if (!userID)  {
    res.redirect("/")
  } else {
    res.render("urls_show", templateVars);
  }
});

//Delete endpoint
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//Update endpoint
app.post("/urls/:shortURL", (req, res) => {
  const id = req.params.shortURL;
  urlDatabase[id] = {
    longURL: req.body.updateField,
    userID: req.session.user_id
  }
  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
