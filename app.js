var flatiron    = require('flatiron'),
    path        = require('path'),
    plates      = require('plates'),
    fs          = require("fs"),

    app = flatiron.app;

var mongodb = require('mongodb');
var Db = mongodb.Db,
    MongoServer = mongodb.Server;


var clientDb = new Db('socket', new MongoServer("127.0.0.1", 27017, {}));


app.config.file({ file: path.join(__dirname, 'config', 'config.json') });

app.use(flatiron.plugins.http, {});

var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

app.listen(8080);

app.router.get('/', function () {
    console.log("homepage");
    var self = this ;
    fs.readFile(__dirname + '/index.html','utf-8', function (err, html) {

        if (err) {
            self.res.writeHead(404);
            return self.res.end('index.html introuvable');
        }
        // var content = {};

        // html = plates.bind(html,content);
        // //console.log(html);
        self.res.writeHead(200,{'Content-Type': 'text/html;charset=utf-8'});
        self.res.end(html,'utf-8');

    });
});


app.router.get('/talk/:talkname', function (talkname) {
    console.log("talk:"+talkname);
    var self = this ;
    fs.readFile(__dirname + '/index.html','utf-8', function (err, html) {

        if (err) {
            self.res.writeHead(404);
            return self.res.end('index.html introuvable');
        }
        var http_code = 404;
        var content = { "content": "la page demandée n'existe pas" };

        //TODO MT : search page talkname in mongo
       //  collectionTalk.find({name:talkname}).toArray(function(err, results) {
       //      if (results.length>0)
       //      {
       //          http_code= 200;
       //          content.content = '<ol id="talk">';
       //          var partial = '<li><div class="time"></div><div class="pseudo"></div><div class="text"></div></li>';
       //          for (var i = 0; i < results[0].line.length; i++) {
       //              console.log(results[0].line[i]);
       //              var mytime = { "pseudo": "Thu Nov 29 2012 16:29:00 GMT+0100 (CET)" };
       //              var map = plates.Map();
       //              //console.log(map.where('class').is('pseudo'));
       //              map.where('class').is('pseudo').use('pseudo');
       //              map.where('class').is('time').use('time');
       //              map.where('class').is('text').use('text');

       //              var html_line = plates.bind(partial,results[0].line[i],map);
       //              console.log(html_line);
       //              content.content += html_line;
       //          }
       //          content.content += "</ol>";
       //          html = plates.bind(html,content);
       //          //console.log(html);
       //          self.res.writeHead(http_code,{'Content-Type': 'text/html;charset=utf-8'});
       //          self.res.end(html,'utf-8');

       // //content = { "content":  };
       //      }
        });

    });
});

app.start(8080, function () {
    console.log('Application is now started on port 8080');
});

io.sockets.on('connection', function(socket) {

    // setInterval(function(data) {
    //   socket.emit('heartbeat',data, 60000);
    //  });
    
    var activeTalk = false;
    var tabTalkname = []; // array which save delay per talkname
    var tabTalkStart = [];
    var tabTalk = [];
    tabTalk = tabTalkname.push(tabTalkStart);
    var duration = 60000;    //5 minutes in milliseconds (default)

    socket.on('saveNickname', function (nickname) {
        socket.nickname = nickname;
        console.log("new chatter:"+ nickname);
        socket.broadcast.emit('newUser', { nickname: socket.nickname, time: new Date().getTime() });
    });
    
    socket.on('sendMessage', function (message,talkname) {
      var  start = Date();
        console.log("new message: "+ message + " time : " + start);

        //find talk  active ?
        //TODO MT: get list des pages (talks) in mongo here

        if(tabTalk[activeTalk] == false ){
           console.log("no talk or talk inactive:");
          words = message.split(" ");
          if(words.length > 5){
             console.log("nb words:" + words.length);
              activeTalk = true;
              //TODO MT: create talkname in base with starttime = true
               tabTalk.push(talkname);
               tabTalk[talkname].push(start);
               console.log("new talk begin at "+ tabTalk[talkname] +" :" + talkname );
           }
        }else{
            console.log("talk" + talkname +" always active");
            var end = Date();
            var elapsed = end.getTime() - start.getTime(); // time in milliseconds
            if(elapsed > duration){
              console.log("inactive talk during" + duration +" minutes");
              //TODO MT : set startime at false of this talkname in base
              //deconnexion clients socket
              disconnect(socket);
            }
        }
        io.sockets.emit('receiveMessage', { nickname: socket.nickname, message: escape(message), time: new Date().getTime() });
    });


    socket.on('saveNickname', function (nickname) {
        socket.nickname = nickname;
        console.log("new chatter:"+ nickname);
        socket.broadcast.emit('newUser', { nickname: socket.nickname, time: new Date().getTime() });
    });

      //TODO LM :request client for load content histo of a talkpage
     socket.on('requestTalksContent', function (data, talkname) {
                //TODO MT : get last list talks in base
               io.sockets.emit('updateTalksList', lastTalksList);
               //TODO MT : get last content historique page
               io.sockets.emit('talksContentReceive', contentPage);
            });

    function disconnect(socket){
       console.log("disconnection...");
        if (!socket.nickname) return;
        // socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
        // socket.broadcast.emit('nicknames', nicknames);
        // remove the username from global usernames list
        delete usernames[socket.username];

    // update list talks, client-side  + get list talks in base ->> data
    io.sockets.emit('updateTalksList', lastTalksList);
    //TODO MT: in mongo, set talk value starttime at false
    }
    // when the user disconnects.. perform this
  socket.on('disconnect', disconnect);

});
