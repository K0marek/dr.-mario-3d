console.log("wczytano plik Main.js")

let ui
let game
let net

$(document).ready(function () {
    ui = new Ui()
    game = new Game()
    net = new Net()
})