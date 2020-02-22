var express = require("express")
    app = express()
    bodyParser = require("body-parser")
    mongoose = require("mongoose")
    methodOverride = require("method-override")
    passport = require("passport")
    LocalStrategy = require("passport-local")

    User = require("./models/user")

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended: true}))
app.use(methodOverride("_method"))

app.use(require("express-session")({
    secret: "Secret",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.connect("mongodb://localhost/blog_app")

var blogSchema = new mongoose.Schema({
    title: String,
    body: String,
    created: {
        type: Date, default: Date.now
    }
})

var Blog = mongoose.model("Blog", blogSchema)

app.get("/", function(req, res){
    res.redirect("blogs")
})
       
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err)
            res.send("Error")
        } else {
            res.render("index", {blogs: blogs.reverse()})
        }
    })
})

app.get("/blogs/new", isLoggedIn, function(req, res){
    res.render("new")
})

app.post("/blogs", isLoggedIn, function(req, res){ 
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            console.log(err)
        } else {
            res.redirect("/blogs")
        }
    })
})


app.get("/blogs/register", function(req, res){
    res.render("register")
})

app.post("/blogs/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if (err){
            res.send(err)
        }else{
            console.log("here")
            passport.authenticate("local")(req, res, function(){
                console.log("here1")
                res.send("success")
            })
        }
    })
})

app.get("/blogs/login", function(req, res){
    res.render("login")
})

app.post("/blogs/login", passport.authenticate("local", {
    successRedirect: "/blogs",
    failureRedirect: "/blogs/login"
}), function(req, res){

})


app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            console.log(err);
        }else{
            res.render("show", {blog:blog})
        }
    })
})

app.get("/blogs/:id/edit", isLoggedIn, function(req, res){
    Blog.findById(req.params.id, function(err, blog){
        if(err){
            console.log(err)
        }else{
            res.render("edit", {blog: blog})
        }
    })
})

app.put("/blogs/:id", isLoggedIn, function(req, res){
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs")
        }else{
            res.redirect("/blogs/"+req.params.id)
        }
    })
})

app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs")
        }else{
            res.redirect("/blogs")
        }
    })
})

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }else{
        res.redirect("/blogs/login")
    }
}

app.listen(3000, function(){
    console.log("Server")
})
