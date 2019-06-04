console.log("wczytano plik Ui.js")

class Ui {

    constructor() {}

    //UTWORZENIE STEROWANIA W GRZE
    controls = () => {
        $(document).on('keydown', e => {
            if(game.pillsToFall.length == 0) {
                const {pill} = game
                const {cellSize} = settings
                const {fields} = game.bottle
                switch(e.keyCode) {
                    //Z
                    case 90:
                        pill.positionSet++
                        if(pill.positionSet == 0) {
                            pill.rotation.z = Math.PI / 2
                            pill.position.y -= cellSize
                            if(!fields[pill.children[1].posY - 1][pill.children[1].posX + 1].allow) {
                                pill.position.x -= cellSize
                                pill.children[0].posX--
                                pill.children[0].posY--
                            } else {
                                pill.children[1].posX++
                                pill.children[0].posY--
                            }
                        }
                        else if(pill.positionSet == 1) {
                            if(fields[pill.children[0].posY + 1][pill.children[0].posX].allow) {
                                pill.rotation.z = Math.PI
                                pill.children[1].posX--
                                pill.children[1].posY++
                            } else {
                                pill.positionSet = 0
                            }
                        }
                        else if(pill.positionSet == 2) {
                            if(!fields[pill.children[1].posY - 1][pill.children[1].posX + 1].allow) {
                                if(fields[pill.children[1].posY - 1][pill.children[1].posX - 1].allow) {
                                    pill.rotation.z = Math.PI * 1.5
                                    pill.children[1].posX--
                                    pill.children[1].posY--
                                } else
                                    pill.positionSet = 1
                            } else {
                                pill.rotation.z = Math.PI * 1.5
                                pill.position.x += cellSize
                                pill.children[0].posX++
                                pill.children[1].posY--
                            }
                        }
                        else if(pill.positionSet == 3) {
                            if(fields[pill.children[1].posY + 1][pill.children[1].posX].allow) {
                                pill.positionSet = -1
                                pill.position.x -= cellSize
                                pill.position.y += cellSize
                                pill.rotation.z = 0
                                pill.children[0].posX--
                                pill.children[0].posY++
                            } else {
                                pill.positionSet = 2
                            }
                        }
                        break
                    //LEFT
                    case 37:
                        if(game.checkPossibility('-')) {
                            pill.position.x -= 20
                            pill.children.forEach(half => {
                                half.posX--
                            })
                        }
                        break
                    //RIGHT
                    case 39:
                        if(game.checkPossibility('+')) {
                            pill.position.x += 20
                            pill.children.forEach(half => {
                                half.posX++
                            })
                        }
                        break
                    //DOWN
                    case 40:
                        game.speed = settings.defaultSpeed / 20
                        break
                }
            }
        })

        $(document).on('keyup', e => {
            switch(e.keyCode) {
                case 40:
                    game.speed = settings.defaultSpeed
                    break
            }
        })
    }

    //OBSŁUGA KLIKNIĘĆ
    interface = () => {
        $('#playButton').on('click', () => {
            game.play(settings.defaultSpeed)
            $("#controls").empty()
            let dv = $("<div>").text("Twój wynik: 0").prop("id", "score")
            $("#controls").append(dv)
        })
    }

    //USUNIĘCIE STEROWANIA W GRZE
}