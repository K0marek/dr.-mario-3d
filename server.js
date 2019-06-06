var express = require("express")
var app = express()
const PORT = 3000
var http = require('http').createServer(app)
var socketio = require('socket.io')(http)

// tablica z graczami
const users = []

app.use(express.static("static"))

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/static/html/index.html")
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
      socketio.sockets.to(data.id).emit('startGame')
      socketio.sockets.to(data.enemy).emit('startGame')
    })

    client.on('change', data => {
      socketio.sockets.to(data.enemy).emit('change', data)
    })

    client.on('nextPills', data => {
      socketio.sockets.to(data.enemy).emit('nextPills', data)
    })

  })
})