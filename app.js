// var flatiron    = require('flatiron'),
//     path        = require('path'),
//     plates      = require('plates'),
//     fs          = require("fs"),

//     app = flatiron.app;

// var mongodb = require('mongodb');
// var Db = mongodb.Db,
//     MongoServer = mongodb.Server;


// var clientDb = new Db('socket', new MongoServer("127.0.0.1", 27017, {}));


// app.config.file({ file: path.join(__dirname, 'config', 'config.json') });

// app.use(flatiron.plugins.http, {});



var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(8080);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}
function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

// app.router.get('/', function () {
//     console.log("homepage");
//     var self = this ;
//     fs.readFile(__dirname + '/index.html','utf-8', function (err, html) {

//         if (err) {
//             self.res.writeHead(404);
//             return self.res.end('index.html introuvable');
//         }
//         var content = { "content": "mon super TP à faire !!!" };

//         html = plates.bind(html,content);
//         //console.log(html);
//         self.res.writeHead(200,{'Content-Type': 'text/html;charset=utf-8'});
//         self.res.end(html,'utf-8');




// Inclusion de Mongoose
var mongoose = require('mongoose');

// On se connecte à la base de données
// N'oubliez pas de lancer ~/mongodb/bin/mongod dans un terminal !
mongoose.connect('mongodb://localhost/bd_tchat', function(err) {
  if (err) { throw err; }
});

// Création du schéma pour les commentaires
var PageSchema = new mongoose.Schema({
  page : { type : String, match: /^[a-zA-Z0-9-_]+$/ },
  talkname :{type : String},
	messages :{
			author :{type : String},
			message:{type : String}
		  }
});

// on crée le model
var PageModel = mongoose.model('page',PageSchema);

//on récupère le model
var PageModel = mongoose.model('page');

//instance de model
var maPage = new PageModel({talkname :'mon talkname'});
maPage.messages = ({author :'auteur'},{message:'message'});
/*maPage.messages = 'message';
maPage.author = 'auteur';*/

// On le sauvegarde dans MongoDB !
maPage.save(function (err) {
  if (err) { throw err; }
 // console.log('page ajouté avec succès !');

PageModel.find(null, function (err, comms) {
  if (err) { throw err; }

  // comms est un tableau de hash
//console.log(comms);
 /* var comm;
  for (var i = 0, l = comms.length; i < l; i++) {
    comm = comms[i];
    console.log('------------------------------');
    console.log('Auteur : ' + comm.author);
    console.log('Message : ' + comm.message);
    console.log('------------------------------');
  }*/
});



  // On se déconnecte de MongoDB maintenant
  mongoose.connection.close();
});


//     });
// });


// app.router.get('/talk/:talkname', function (talkname) {
//     console.log("talk:"+talkname);
//     var self = this ;
//     fs.readFile(__dirname + '/index.html','utf-8', function (err, html) {

//         if (err) {
//             self.res.writeHead(404);
//             return self.res.end('index.html introuvable');
//         }
//         var http_code = 404;
//         var content = { "content": "la page demandée n'existe pas" };
//         collectionTalk.find({name:talkname}).toArray(function(err, results) {
//             if (results.length>0)
//             {
//                 http_code= 200;
//                 content.content = '<ol id="talk">';
//                 var partial = '<li><div class="time"></div><div class="pseudo"></div><div class="text"></div></li>';
//                 for (var i = 0; i < results[0].line.length; i++) {
//                     console.log(results[0].line[i]);
//                     var mytime = { "pseudo": "Thu Nov 29 2012 16:29:00 GMT+0100 (CET)" };
//                     var map = plates.Map();
//                     //console.log(map.where('class').is('pseudo'));
//                     map.where('class').is('pseudo').use('pseudo');
//                     map.where('class').is('time').use('time');
//                     map.where('class').is('text').use('text');

//                     var html_line = plates.bind(partial,results[0].line[i],map);
//                     console.log(html_line);
//                     content.content += html_line;
//                 }
//                 content.content += "</ol>";
//                 html = plates.bind(html,content);
//                 //console.log(html);
//                 self.res.writeHead(http_code,{'Content-Type': 'text/html;charset=utf-8'});
//                 self.res.end(html,'utf-8');

//        //content = { "content":  };
//             }
//         });

//     });
// });

// app.start(3000, function () {
//     console.log('Application is now started on port 3000');
// });


// var io = require('socket.io').listen(app.server);
// var collectionTalk = null;

// clientDb.open(function(err, client) {
//     client.collection('talk', function(err, collection) {
//         collectionTalk = collection;
//     });
// });

io.sockets.on('connection', function(socket) {
    // socket.on('login', function(data) {
    //     if (data.pseudo)
    //     {
    //         console.log("nouveau chatteur:"+data.pseudo)
    //     }else
    //     {
    //         console.log("pas de pseudo!");
    //     }
    // });

    socket.on('saveNickname', function (nickname) {
        socket.nickname = nickname;
        socket.broadcast.emit('newUser', { nickname: socket.nickname, time: new Date().getTime() });
    });
    
    socket.on('sendMessage', function (message) {
        io.sockets.emit('receiveMessage', { nickname: socket.nickname, message: escape(message), time: new Date().getTime() });
    });

    socket.on('disconnect', function () {
        socket.broadcast.emit('user disconnected');
    });


});
console.log('Live Chat App running at http://localhost:8080/');
