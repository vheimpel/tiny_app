
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs")

var shortURL = "";
var longURL = "";

// const data = {
//   users: [
//     { username: 'monica', password: 'testing' },
//     { username: 'khurram', password: 'testing2' },
//     { username: 'juan', password: 'pwd'}
//   ]
// }

const users = {
  "b5v67jexample": {
    id: "b5v67jexample",
    email: "hello@hello.com",
    password: "hey"
  }
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i = 0; i < 5; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

app.get("/", (req, res) => {
  res.render("urls_new");
});

app.get("/login", (req, res) => {
  const username = req.body.username;
  res.render("urls_new")
})

app.get("/register", (req, res) => {

  res.render("register")
})

app.post("/register", (req, res) => {
  const userId = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const user = {
    id: userId,
    email: userEmail,
    password: userPassword
  }
  users[userId] = user;
  console.log("Users object: ", users)

  res.cookie('id', userId);
  res.redirect('/');
})

app.post("/login", (req, res) => {
  let templateVars = {
    username: req.body.username
  }
  const username = req.body.username;
  console.log("at line 57")
  res.cookie('username', username);
  res.render("urls_new", templateVars);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase[0]);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/logout", (req, res) => {
  let templateVars = {
    username: req.body.username
  }
  const username = req.body.username;
  res.clearCookie('username', username);
  res.render("login", templateVars);
})

app.post("/urls", (req, res) => {
  let newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = req.body.longURL;
  res.redirect("/urls/" + newShortUrl);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { newShortURL: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  const id = req.params.shortURL;
  urlDatabase[id] = req.body.updateField;

  res.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
