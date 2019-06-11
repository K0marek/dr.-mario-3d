var express = require("express")
var app = express()
const PORT = 3000
var bodyParser = require("body-parser")
var http = require('http').createServer(app)
var socketio = require('socket.io')(http)
let mongoClient = require('mongodb').MongoClient
let ObjectID = require('mongodb').ObjectID
let opers = require("./modules/Operations.js")
let _db, _coll = "Data", _docs

// tablica z graczami
const users = []

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("static"))

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/static/html/index.html")
})

app.post("/LOAD_LEVEL", function(req, res) {
  let obj
  mongoClient.connect("mongodb://" + "localhost" + "/" + "DrMario", function(err, db) {
    if(err) {
      console.log(err)
      obj = {actionBack: "NOT_CREATED"}
      res.send(JSON.stringify(obj, null, 5))
    }
    else {
      _db = db
      opers.SelectAll(_db.collection(_coll), function(data) {
        if(data.action == "SELECTED") {
          _docs = data.items
          obj = {
            actionBack: "CREATED",
            documents: _docs
          }
        }
        else
          obj = {actionBack: "NOT_CREATED"}
        res.send(JSON.stringify(obj, null, 5))
      })
    }
  })
})

http.listen(PORT, function() {
  console.log("start serwera na porcie " + PORT)
})

socketio.on("connection", function(client) {
  client.on('login', data => {
    const object = {
      id: client.id, // unikatowe id klienta
      which: users.length, // który z kolei zalogowany użytkownik
      nick: data.nick, // nick
      enemy: null // id przeciwnika
    }
    users.push(object)
    if(object.which % 2 == 1) {
      const previousUser = users[users.length - 2] // poprzednio zalogowany user

      object.enemy = previousUser.id
      users[users.length - 2].enemy = object.id

      // wysłanie do usera informacji o zalogowniu drugiego klienta
      socketio.sockets.to(previousUser.id).emit('both', previousUser)
      socketio.sockets.to(object.id).emit('both', object)
    }

    client.on('changeLevel1p', data => {
      socketio.sockets.to(data.enemy).emit('changeLevel1p', {
        value: data.value
      })
    })

    client.on('changeLevel2p', data => {
      socketio.sockets.to(data.enemy).emit('changeLevel2p', {
        value: data.value
      })
    })

    client.on('changeSpeedButtons1p', data => {
      socketio.sockets.to(data.enemy).emit('changeSpeedButtons1p', {
        value: data.value
      })
    })

    client.on('changeSpeedButtons2p', data => {
      socketio.sockets.to(data.enemy).emit('changeSpeedButtons2p', {
        value: data.value
      })
    })

    client.on('startGame', data => {
      socketio.sockets.to(data.id).emit('startGame', data)
      socketio.sockets.to(data.enemy).emit('startGame', data)
    })

    client.on('change', data => {
      socketio.sockets.to(data.enemy).emit('change', data)
    })

    client.on('nextPills', data => {
      socketio.sockets.to(data.enemy).emit('nextPills', data)
    })

    client.on('fly', data => {
      socketio.sockets.to(data.enemy).emit('fly', data)
    })

    client.on('pillsBoard', data => {
      socketio.sockets.to(data.enemy).emit('pillsBoard', data)
    })

    client.on('win', data => {
      socketio.sockets.to(data.enemy).emit('win', data)
    })

    client.on('lose', data => {
      socketio.sockets.to(data.enemy).emit('lose', data)
    })

  })
})