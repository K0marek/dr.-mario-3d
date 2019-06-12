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

let viruses = {
  "board": [
    {
      "viruses": [
        {
          "posY": 2,
          "posX": 7,
          "color": 255
        },
        {
          "posY": 3,
          "posX": 1,
          "color": 16776960
        },
        {
          "posY": 4,
          "posX": 8,
          "color": 16711680
        },
        {
          "posY": 5,
          "posX": 4,
          "color": 16776960
        },
        {
          "posY": 6,
          "posX": 3,
          "color": 16711680
        },
        {
          "posY": 8,
          "posX": 3,
          "color": 255
        }
      ]
    },
    {
      "viruses": [
        {
          "posY": 2,
          "posX": 2,
          "color": 16776960
        },
        {
          "posY": 3,
          "posX": 1,
          "color": 255
        },
        {
          "posY": 4,
          "posX": 7,
          "color": 16711680
        },
        {
          "posY": 5,
          "posX": 3,
          "color": 16776960
        },
        {
          "posY": 5,
          "posX": 7,
          "color": 16776960
        },
        {
          "posY": 6,
          "posX": 6,
          "color": 16711680
        },
        {
          "posY": 7,
          "posX": 5,
          "color": 255
        }
      ]
    },
    {
      "viruses": [
        {
          "posY": 1,
          "posX": 1,
          "color": 16776960
        },
        {
          "posY": 1,
          "posX": 2,
          "color": 255
        },
        {
          "posY": 1,
          "posX": 3,
          "color": 16711680
        },
        {
          "posY": 1,
          "posX": 4,
          "color": 16776960
        },
        {
          "posY": 1,
          "posX": 5,
          "color": 16776960
        },
        {
          "posY": 1,
          "posX": 6,
          "color": 16711680
        },
        {
          "posY": 1,
          "posX": 7,
          "color": 255
        },
        {
          "posY": 1,
          "posX": 8,
          "color": 255
        },
        {
          "posY": 2,
          "posX": 1,
          "color": 255
        },
        {
          "posY": 2,
          "posX": 2,
          "color": 16776960
        },
        {
          "posY": 2,
          "posX": 3,
          "color": 16776960
        },
        {
          "posY": 2,
          "posX": 4,
          "color": 16776960
        },
        {
          "posY": 2,
          "posX": 5,
          "color": 255
        },
        {
          "posY": 2,
          "posX": 6,
          "color": 16711680
        },
        {
          "posY": 2,
          "posX": 7,
          "color": 16711680
        },
        {
          "posY": 2,
          "posX": 8,
          "color": 16711680
        }
      ]
    },
    {
      "viruses": [
        {
          "posY": 8,
          "posX": 5,
          "color": 255
        },
        {
          "posY": 3,
          "posX": 6,
          "color": 16776960
        },
        {
          "posY": 4,
          "posX": 6,
          "color": 255
        },
        {
          "posY": 2,
          "posX": 2,
          "color": 255
        },
        {
          "posY": 5,
          "posX": 2,
          "color": 16776960
        },
        {
          "posY": 1,
          "posX": 6,
          "color": 255
        },
        {
          "posY": 6,
          "posX": 5,
          "color": 16711680
        },
        {
          "posY": 8,
          "posX": 1,
          "color": 16776960
        },
        {
          "posY": 4,
          "posX": 5,
          "color": 16776960
        }
      ]
    }
  ]
}
mongoClient.connect("mongodb://" + "localhost" + "/" + "DrMario", function(err, db) {
  if(err)
    console.log(err)
  else {
    _db = db
    opers.DeleteById(_db.collection(_coll), function(data) {
      if(data == "DELETED") {
        console.log("USUNIĘTO WSZYSTKO Z KOLEKCJI")
        opers.Insert(_db.collection(_coll), viruses, function(data) {
          if(data == "CREATED") {
            console.log("DODANO DOKUMENT")
          }
          else {
            console.log("NIE DODANO DOKUMENTU")
          }
        })
      }
      else {
        console.log("NIE USUNIĘTO WSZYSTKIEGO Z KOLEKCJI")
      }
    })
  }
})

// tablica z graczami
const users = []

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("static"))

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/static/html/index.html")
})

app.post("/LOAD_LEVEL", function (req, res) {
  let obj
  mongoClient.connect("mongodb://" + "localhost" + "/" + "DrMario", function (err, db) {
    if (err) {
      console.log(err)
      obj = { actionBack: "NOT_CREATED" }
      res.send(JSON.stringify(obj, null, 5))
    }
    else {
      _db = db
      opers.SelectAll(_db.collection(_coll), function (data) {
        if (data.action == "SELECTED") {
          _docs = data.items
          obj = {
            actionBack: "CREATED",
            documents: _docs
          }
        }
        else
          obj = { actionBack: "NOT_CREATED" }
        res.send(JSON.stringify(obj, null, 5))
      })
    }
  })
})

app.post('/addScore', function (req, res) {
  mongoClient.connect("mongodb://localhost/score", function (err, db) {
    if (err) console.log(err)
    else {
      const obj = {
        nick: req.body.nick,
        score: req.body.score
      }
      db.collection('score').insertOne(obj, function (err, res) {
        if (err) throw err
        db.close()
      })
    }
  })
})

app.post('/getScores', function (req, res) {
  mongoClient.connect("mongodb://localhost/score", function (err, db) {
    if (err) console.log(err)
    else {
      const coll = db.collection('score')
      opers.SelectAll(coll, data => {
        res.end(JSON.stringify(data, null, 4))
      })
    }
  })
})

http.listen(PORT, function () {
  console.log("start serwera na porcie " + PORT)
})

socketio.on("connection", function (client) {
  client.on('login', data => {
    const object = {
      id: client.id, // unikatowe id klienta
      which: users.length, // który z kolei zalogowany użytkownik
      nick: data.nick, // nick
      enemy: null // id przeciwnika
    }
    users.push(object)
    if (object.which % 2 == 1) {
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