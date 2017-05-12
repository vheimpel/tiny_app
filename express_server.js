
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
  "example": {
    id: "example",
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

app.get("/", (req, res) => {
  res.render("urls_new");
});

app.get("/login", (req, res) => {
  res.render("login")
})

app.get("/register", (req, res) => {
  res.render("register")
})

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
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
    password: userPassword
  }
  users[userId] = user;
  console.log("Users object: ", users)

  res.cookie('user_id', users[userId].id);
  res.redirect('/urls');
})

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (userEmail === "" || userPassword === "") {
    res.status(400)
    res.send("Please enter all information")
  }

  for (var i in users) {
    if (users[i].email === userEmail) {
      if (users[i].password === userPassword) {

        res.cookie('user_id', users[i].id);
        res.redirect("/urls");
      }
    }
  }
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase[0]);
});

app.get("/urls", (req, res) => {
  let wholeUser = getUserById(req.cookies.user_id);
  console.log("WholeUser :", wholeUser);
  let templateVars = { urls: urlDatabase, user: wholeUser };
  console.log("templateVars: ", templateVars)
  res.render("urls_index", templateVars);
   // let templateVars = {
   //        userInfo: users[i]
   //      }
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
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



