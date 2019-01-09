var express              = require("express"),
    mongoose             = require("mongoose"),
    passport             = require("passport"),
    User                 = require("./models/user"),
    bodyParser           = require("body-parser"),
    localStrategy        = require("passport-local"),
    session              = require("express-session");

var app = express();

app.use(session(
  { 
    secret: "dogs",
    resave: false,
    saveUninitialized: true
  }
));

app.use(bodyParser.urlencoded({ extended: false}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost/auth_demo_app");

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.set("view engine", "ejs");

app.get("/", function(req, res){
  res.render("home");
});

app.get("/secret", isLoggedIn, function(req, res){
  res.render("secret");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){
  User.register(new User({username: req.body.username}), req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate('local')(req, res, function(){
	res.redirect("/secret");
      });
    }
  });
});

app.get("/login", function(req, res){
  res.render("login");
});

app.post("/login", passport.authenticate('local', {
  successRedirect: "/secret",
  failureRedirect: "/login"
}));

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    console.log("User logged in");
    return next();
  } else {
    res.redirect("/login");
  }
};

app.listen(3000, function() {
  console.log("server is running on port 3000");
});
