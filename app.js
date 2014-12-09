var express = require('express'), 
    http = require('http'), 
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    multer  = require('multer'),
    Post = require('./post');
var app = express();
var fileUploadDone=false;

function AuthUser(req, res, next){
    var user = {
        email: "najamsk@gmail.com",
        isAdmin: true
    };
    req.user = user;
    next();
}



app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(bodyParser({ keepExtensions: true, uploadDir: path.join(__dirname, '/uploads'), extended: false}));

//app.use(express.methodOverride());
//app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(AuthUser);
app.use(cookieParser('nany is cool'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

/*Configure the multer.*/

app.use(multer({ dest: './uploads/',
 rename: function (fieldname, filename) {
    return filename+Date.now();
  },
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  fileUploadDone=true;
}
}));


// Store "session" information.  To see how to store sessions in a cookie, check out
// https://gist.github.com/visionmedia/1491756
var sessionInfo = {
    name:'Guest'
};

// Create sessionv middleware
//var session = function(request, response, next) {
//    request.sessionInfo = sessionInfo;
//    next();
//};

// create a new blog post object
app.post('/create', function(request, response) {
    // TODO: Create and save a Post model
    console.log("posted blog is ");
    console.log(request.body.title, request.body.content);
    
    var post = new Post({
                        title : request.body.title, 
                        content: request.body.content
                        });
    

    // TODO: Save the model
    post.save(function(err, post) {
        if (err) {
            response.send(500, 'There was an error - tough luck.');
        }
        else {
            response.redirect('/');
        }
    });
});


// Render a form to enter a new post
app.get('/new', function(request, response) {
    response.render('new', {});
});

app.get('/', function(req, res){
//    req.session.count = req.session.count || 0;
//    var n = req.session.count++;
    
    if(req.cookies.name === "guest"){
        console.log("you have been there before");
    }
    else
    {
        console.log("this is your first time here");
        res.cookie('name','guest');
    }
    
    //session 
    req.session.name2 = req.session.name2 || new Date().toUTCString();
    
    console.log(req.session.name2);
    
    //file upload status 
    if(fileUploadDone==true){
        //console.dir(res);
        console.log("File uploaded.");
        //console.log(req.files.picture.path);
        //console.log(req.files.picture.path);
        //console.dir(req.files.picture);
    }
    
    
    // TODO: How do we get a list of all model objects using a mongoose model?
    Post.find(function(err, posts) {
        if (err) {
            res.send(500, 'There was an error - tough luck.');
        }
        else {
            res.render('index', {
                posts:posts,
                name: req.session.name2
            });
        }
    });
    
    
    //res.send('viewed='+ n);
    //res.render('index',req.sessionInfo);
});

app.post('/login', function(request, response) {
    console.log("najam s login");
    sessionInfo.name = request.body.username;
    response.redirect('/');
});

app.post('/doStuff', function(req, res){
    console.log("najam awan");
    if (!req.body) return res.sendStatus(400);
    var param = req.body.foo;

    res.send({
        foo: param,
        isAdmin: req.user.isAdmin
        });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});