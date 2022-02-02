const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/talaihDB");
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    branchName: String
});
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const memberSchema = new mongoose.Schema({
    name: String,
    branchName: String,
    dateOfBirth: String,
    dateOfVow: String,
    bloodType: String
});
const Member = new mongoose.model("Member", memberSchema);

const postSchema = new mongoose.Schema({
  postTitle: String,
  postContent: String,
  branchName: String
});
const Post = new mongoose.model("Post", postSchema);

app.get("/", function(req, res){
    Post.find({}, function(err, posts){
      if(!err){
        res.render("home", {posts: posts});
      }
    })
});

app.get("/lejne", function(req, res){
  res.render("lejne");
})

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.post("/register", function(req, res){
  User.register({username: req.body.username, branchName: req.body.branchName}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/fourou3/req.body.BranchName");
      });
    }
  });
});

app.post("/login", function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        User.findOne({username: user.username},function(err,foundUser){
          res.redirect("/fourou3/" + foundUser.branchName);
        });
    });
    }
  });
});


app.get("logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.get("/order", function(req, res){
  res.render("order");
});

app.get("/calendar", function(req, res){
  res.render("calendar");
});

app.get("/fourou3", function(req, res){
  User.find({}, function(err, branches){
    res.render("fourou3",{branches: branches});
  });
});

app.get("/fourou3/:fare3Name", function(req, res){
  User.findOne({branchName: req.params.fare3Name}, function(err, foundUser){
    if(err){
      console.log(err);
    } else {
        if(foundUser){
          Member.find({branchName: req.params.fare3Name}, function(err, members){
            Post.find({branchName: req.params.fare3Name}, function(err, posts){
              res.render("fare3", {branch: foundUser, members: members, posts: posts});
            })
          });
          }}
      });
});

app.post("/addmember", function(req, res){
  const member = new Member({
  name: req.body.memberName,
  branchName: req.body.branchName,
  dateOfBirth: req.body.dateOfBirth,
  dateOfVow: req.body.dateOfVow,
  bloodType: req.body.bloodType
  });
  member.save(function(){
    res.redirect("/fourou3/" + req.body.branchName);
  });
});

app.post("/compose", function(req, res){
  const post = new Post({
    postTitle: req.body.postTitle,
    postContent: req.body.postContent,
    branchName: req.body.branchName
  });
  post.save(function(){
    res.redirect("/fourou3/" + req.body.branchName);
  });
});


app.listen("3000", function(){
  console.log("Server is online on port 3000");
});
