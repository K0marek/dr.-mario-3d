console.log("wczytano plik Ui.js")

class Ui {

    constructor() { }

    //UTWORZENIE STEROWANIA W GRZE
    controls = () => {
        $(document).on('keydown', e => {
            const { pill } = game
            const { cellSize } = settings
            switch (e.keyCode) {
                //Z
                case 90:
                    pill.positionSet++
                    if (pill.positionSet == 0) {
                        pill.position.y -= cellSize
                        pill.rotation.z = Math.PI / 2
                        pill.children[1].posX++
                        pill.children[0].posY--
                    }
                    else if (pill.positionSet == 1) {
                        pill.rotation.z = Math.PI
                        pill.children[1].posX--
                        pill.children[1].posY++
                    }
                    else if (pill.positionSet == 2) {
                        pill.position.x += cellSize
                        pill.rotation.z = Math.PI * 1.5
                        pill.children[0].posX++
                        pill.children[1].posY--
                    }
                    else if (pill.positionSet == 3) {
                        pill.positionSet = -1
                        pill.position.x -= cellSize
                        pill.position.y += cellSize
                        pill.rotation.z = 0
                        pill.children[0].posX--
                        pill.children[0].posY++
                    }
                    break
                //LEFT
                case 37:
                    if (game.checkPossibility('-')) {
                        pill.position.x -= 20
                        pill.children.forEach(half => {
                            half.posX--
                        })
                    }
                    break
                //RIGHT
                case 39:
                    if (game.checkPossibility('+')) {
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
        })

        $(document).on('keyup', e => {
            switch (e.keyCode) {
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
        })
    }

    //USUNIĘCIE STEROWANIA W GRZE
}