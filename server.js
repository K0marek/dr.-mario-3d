var express = require("express")
var app = express()
const PORT = 3000

app.use(express.static("static"))

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/static/html/index.html")
})

app.listen(PORT, function() {
  console.log("start serwera na porcie " + PORT)
})