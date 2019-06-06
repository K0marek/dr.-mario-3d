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
        console.log("INTERFACE")
        $('#playButton').on('click', e => {
            game.play(settings.defaultSpeed)
            console.log($("#level").val())
            net.getViruses($("#level").val())
            $('#menu').remove()
            let dv = $("<div>").text("Twój wynik: 0").prop("id", "score")
            $("#controls").append(dv)
        })
        $("#level").on("input", () => {
            console.log($("#level").val())
        })

        $('#onePlayer').on('click', e => {
            $('#start').css('display', 'none')
            $('#onePlayerSettings').css('display', 'block')
        })

        $('#twoPlayers').on('click', e => {
            $('#start').css('display', 'none')
            $('#login').css('display', 'block')
        })

        $('#search').on('click', e => {
            const nick = $('#nick').val()
            const loading = $('<div>').attr('id', 'loading')
            const spinner = $('<div>').addClass('spinner-border')
            const header = $('<p>').html('Trwa oczekiwanie na innego gracza')
            loading
                .append(header)
                .append(spinner)
            $('#login').empty()
            $('#menu').append(loading)
            net.addUser(nick)
        })

        // obsługa inputów i ich odwzorowanie na drugim graczu
        $('#level1p').on('input', e => {
            const value = e.target.value
            net.client.emit('changeLevel1p', {
                value,
                enemy: net.enemy
            })
        })

        $('#level2p').on('input', e => {
            const value = e.target.value
            net.client.emit('changeLevel2p', {
                value,
                enemy: net.enemy
            })
        })

        $('.speedButtons1p').on('click', e => {
            $('.speedButtons1p')
                .removeClass('btn-danger')
                .addClass('btn-primary')
            $(e.target)
                .removeClass('btn-primary')
                .addClass('btn-danger')

            const value = e.target.value
            net.client.emit('changeSpeedButtons1p', {
                value,
                enemy: net.enemy
            })
        })

        $('.speedButtons2p').on('click', e => {
            $('.speedButtons2p')
                .removeClass('btn-danger')
                .addClass('btn-primary')
            $(e.target)
                .removeClass('btn-primary')
                .addClass('btn-danger')

            const value = e.target.value
            net.client.emit('changeSpeedButtons2p', {
                value,
                enemy: net.enemy
            })
        })

        $('#playButton2p').on('click', e => {
            net.client.emit('startGame', {
                id: net.id,
                enemy: net.enemy
            })
        })

    }

    //USUNIĘCIE STEROWANIA W GRZE
}