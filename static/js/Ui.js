console.log("wczytano plik Ui.js")

class Ui {

    constructor() { }

    //UTWORZENIE STEROWANIA W GRZE
    controls = () => {
        $(document).on('keydown', e => {
            if (!game.isPillFlying) {
                if (game.pillsToFall.length == 0) {
                    const { pill } = game
                    const { cellSize } = settings
                    const { fields } = game.bottle
                    switch (e.keyCode) {
                        //Z
                        case 90:
                            pill.positionSet++
                            if (pill.positionSet == 0) {
                                pill.rotation.z = Math.PI / 2
                                pill.position.y -= cellSize
                                if (!fields[pill.children[1].posY - 1][pill.children[1].posX + 1].allow) {
                                    pill.position.x -= cellSize
                                    pill.children[0].posX--
                                    pill.children[0].posY--
                                } else {
                                    pill.children[1].posX++
                                    pill.children[0].posY--
                                }
                            }
                            else if (pill.positionSet == 1) {
                                if (fields[pill.children[0].posY + 1][pill.children[0].posX].allow) {
                                    pill.rotation.z = Math.PI
                                    pill.children[1].posX--
                                    pill.children[1].posY++
                                } else {
                                    pill.positionSet = 0
                                }
                            }
                            else if (pill.positionSet == 2) {
                                if (!fields[pill.children[1].posY - 1][pill.children[1].posX + 1].allow) {
                                    if (fields[pill.children[1].posY - 1][pill.children[1].posX - 1].allow) {
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
                            else if (pill.positionSet == 3) {
                                if (fields[pill.children[1].posY + 1][pill.children[1].posX].allow) {
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
                            net.client.emit('change', {
                                enemy: net.enemy,
                                pos1X: game.pill.half1.posX,
                                pos1Y: game.pill.half1.posY,
                                pos2X: game.pill.half2.posX,
                                pos2Y: game.pill.half2.posY,
                                half1color: game.pill.color1,
                                half2color: game.pill.color2,
                                pillRotation: game.pill.rotation.z
                            })
                            break
                        //LEFT
                        case 37:
                            if (game.checkPossibility('-')) {
                                pill.position.x -= 20
                                pill.children.forEach(half => {
                                    half.posX--
                                })
                                net.client.emit('change', {
                                    enemy: net.enemy,
                                    pos1X: game.pill.half1.posX,
                                    pos1Y: game.pill.half1.posY,
                                    pos2X: game.pill.half2.posX,
                                    pos2Y: game.pill.half2.posY,
                                    half1color: game.pill.color1,
                                    half2color: game.pill.color2,
                                    pillRotation: game.pill.rotation.z
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
                                net.client.emit('change', {
                                    enemy: net.enemy,
                                    pos1X: game.pill.half1.posX,
                                    pos1Y: game.pill.half1.posY,
                                    pos2X: game.pill.half2.posX,
                                    pos2Y: game.pill.half2.posY,
                                    half1color: game.pill.color1,
                                    half2color: game.pill.color2,
                                    pillRotation: game.pill.rotation.z
                                })
                            }
                            break
                        //DOWN
                        case 40:
                            game.speed = settings.defaultSpeed / 20
                            break
                    }
                }
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
        $('#playButton').on('click', e => {
            for (let i = 0; i < $("#speedButtons>button").length; i++) {
                let bt = $("#speedButtons>button")[i]
                if ($(bt).hasClass("btn-danger"))
                    net.getViruses($("#level").val(), i + 1, -80, true)
            }
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

        $('.speedButtons').on('click', e => {
            $('.speedButtons')
                .removeClass('btn-danger')
                .addClass('btn-primary')
            $(e.target)
                .removeClass('btn-primary')
                .addClass('btn-danger')

            const value = e.target.value
            net.client.emit('changeSpeedButtons', {
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
            let divisor1
            for (let i = 0; i < $("#speedButtons1p>button").length; i++) {
                let bt = $("#speedButtons1p>button")[i]
                if ($(bt).hasClass("btn-danger")) {
                    divisor1 = i + 1
                }
            }
            for (let i = 0; i < $("#speedButtons2p>button").length; i++) {
                let bt = $("#speedButtons2p>button")[i]
                if ($(bt).hasClass("btn-danger")) {
                    net.client.emit('startGame', {
                        id: net.id,
                        enemy: net.enemy,
                        level1: $("#level1p").val(),
                        level2: $("#level2p").val(),
                        divisor1: divisor1,
                        divisor2: i + 1
                    })
                }
                // net.getViruses($("#level1p").val(), i + 1)
            }
        })

        $('#refresh').on('click', e => {
            location.reload()
        })

    }

    win = () => {
        $('#nickInfo').html(`Gratulację ${net.nick} - wygrałeś!`)
        $('#scoreInfo').html(`Twój wynik to: ${game.score} punktów`)
        $('#win').css('display', 'block')
    }

    lose = () => {
        $('#nickInfo').html(`Niestety ${net.nick} - przegrałeś!`)
        $('#scoreInfo').html(`Twój wynik to: ${game.score} punktów`)
        $('#win').css('display', 'block')
    }
}