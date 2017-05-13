
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs")

const bcrypt = require('bcrypt');

var cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  keys: ["iac"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const users = {
  "hello": {
    id: "hello",
    email: "hello@hello.com",
    password: "hey"
  },
  "bye": {
    id: "bye",
    email: "bye@bye.com",
    password: "bye"
  }
}

// var urlDatabase = {
//   "hello": {
//     "b2xVn2": "http://www.lighthouselabs.ca",
//     "9sm5xK": "http://www.google.com",
//   },
//   "bye": {
//     "c3yWm3": "http://www.hackeryou.ca",
//     "0tn6yL": "http://www.askjeeves.com",
//   }
// };

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

};

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i = 0; i < 5; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

function getUserByEmail(email) {
  for (var i in users) {
    if (users[i].email === email) {
      return users[i];
    }
  }
}

function getUserById(id) {
  for (var i in users) {
    if (users[i].id === id) {
      return users[i];
    }
  }
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

app.get("/", (req, res) => {
  let wholeUser = getUserById(req.session.user_id);
  let templateVars = { user: wholeUser}
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  let wholeUser = getUserById(req.session.user_id);
  let templateVars = { user: wholeUser}
  console.log(wholeUser)
  res.render("login", templateVars)
})

app.get("/register", (req, res) => {

  let wholeUser = getUserById(req.session.user_id);
  let templateVars = { user: wholeUser}
  res.render("register", templateVars)
})

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);

  if (userEmail === "" || userPassword === "") {
    res.status(400)
    res.send("Please enter all information")
  }

  for (var i in users) {
    if (users[i].email === userEmail) {
      res.status(400)
      res.send("User exists")
    }
  }

  const userId = generateRandomString();

  const user = {
    id: userId,
    email: userEmail,
    password: hashedPassword
  }
  users[userId] = user;
  console.log("Users object: ", users)

  req.session.user_id = users[userId].id;
  res.redirect('/urls/new');
});


app.post("/login", (req, res) => {
  const userEmail = req.body.userEmail;
  const userPassword = req.body.userPassword;

  console.log(req.body)
  if (userEmail === "" || typeof(userEmail) === "undefined"  || userPassword === "" || typeof(userPassword) === "undefined") {
    res.status(400)
    res.send("Please enter all information")
  }

  for (var i in users) {
    if (users[i].email === userEmail) {
      if (bcrypt.compareSync(userPassword, users[i].password)) {
        req.session.user_id = users[i].id;
        console.log(users)
        res.redirect("/urls/new");

      }
    }
  }

  res.send("User not found")

});

app.get("/urls/new", (req, res) => {
  let wholeUser = getUserById(req.session.user_id);
  let templateVars = { user: wholeUser}
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase[0]);
});

app.get("/urls", (req, res) => {
  let wholeUser = getUserById(req.session.user_id);
  console.log("WholeUser :", wholeUser);
  let templateVars = { urls: getURLid(req.session.user_id), user: wholeUser };
  console.log("getUserById: ", getUserById(req.session.user_id))

  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let wholeUser = getUserById(req.session.user_id);
  let templateVars = { user: wholeUser}
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL, templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
})

//Create urls
app.post("/urls", (req, res) => {
  let newShortUrl = generateRandomString();
  urlDatabase[newShortUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }
  console.log(urlDatabase)
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
  };
  console.log(urlDatabase[req.params.id])
  const userID = req.session.user_id;

  if (!userID) return res.redirect("/");

  res.render("urls_show", templateVars);

});

//Delete endpoint
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});
//Update endpoint
app.post('/urls/:shortURL', (req, res) => {
  const id = req.params.shortURL;
  urlDatabase[id] = {
    longURL: req.body.updateField,
    userID: req.session.user_id
  }

  res.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
