class Net {
    constructor() {
        this.client = io()
        this.id = null // id gracza
        this.enemy = null // id przeciwnika
        this.which = null // który z kolei user

        this.client.on('both', data => {
            const {which, nick, id, enemy} = data
            this.id = id
            this.enemy = enemy
            this.which = which

            $('#loading').remove()
            $('#twoPlayersSettings').css('display', 'block')
            $('#me').text(`twoje id to: ${id}`)
            $('#enemy').text(`id przeciwnika: ${enemy}`)
        })

        this.client.on('changeLevel1p', data => {
            $('#level1p').val(data.value)
        })

        this.client.on('changeLevel2p', data => {
            $('#level2p').val(data.value)
        })

        this.client.on('changeSpeedButtons1p', data => {
            $('.speedButtons1p')
                .removeClass('btn-danger')
                .addClass('btn-primary')
            $($(`button[value=${data.value}]`)[0])
                .removeClass('btn-primary')
                .addClass('btn-danger')
        })

        this.client.on('changeSpeedButtons2p', data => {
            $('.speedButtons2p')
                .removeClass('btn-danger')
                .addClass('btn-primary')
            $($(`button[value=${data.value}]`)[1])
                .removeClass('btn-primary')
                .addClass('btn-danger')
        })

        this.client.on('startGame', data => {
            game.mario.visible = false
            $('#menu').remove()
            game.enemyBottle = new Bottle(16, 10)
            game.scene.add(game.enemyBottle)
            if(this.which % 2 == 0) { // pierwszy user
                game.bottle.position.x = -240
                game.enemyBottle.position.x = 60
                net.getViruses(data.level2, data.divisor2, 60, false)
                net.getViruses(data.level1, data.divisor1, -240, true)
                // game.play(settings.defaultSpeed)
            }
            if(this.which % 2 == 1) { // drugi user
                game.bottle.position.x = 60
                game.enemyBottle.position.x = -240
                net.getViruses(data.level1, data.divisor1, -240, false)
                net.getViruses(data.level2, data.divisor2, 60, true)
                // game.play(settings.defaultSpeed)
            }
        })

        this.client.on('change', data => {
            const {cellSize} = settings
            const translation = this.which % 2 == 0 ? 60 : -240
            game.scene.remove(game.enemyPill)
            game.enemyPill = new Pill(data.half1color, data.half2color)
            game.enemyPill.position.x = data.posX * cellSize + translation
            game.enemyPill.position.y = data.posY * cellSize
            game.enemyPill.rotation.z = data.pillRotation
            game.scene.add(game.enemyPill)
        })

        this.client.on('nextPills', data => {
            const {nextPillColors} = data
            const nextPills = [
                new Pill(nextPillColors[0], nextPillColors[1]),
                new Pill(nextPillColors[2], nextPillColors[3]),
                new Pill(nextPillColors[4], nextPillColors[5])
            ]
            game.enemyNextPillsContainer = new PillsContainer()
            nextPills.forEach((item, index) => {
                game.enemyNextPillsContainer.add(item)
                item.position.set(0, 60 - index * settings.cellSize, 0)
            })
            game.enemyNextPillsContainer.position.set(this.which % 2 == 0 ? 290 : -310, 120, 0)
            game.scene.add(game.enemyNextPillsContainer)
        })

        this.client.on('fly', data => {
            const {startX, endX} = data
            game.flyingPill = new Pill(data.color1, data.color2)
            game.flyingPill.position.set(startX, 165, 0)
            game.scene.add(game.flyingPill)
            let interval
            const parable = x => -0.03 * Math.pow(x - endX, 2) + 3.7 * (x - endX) + 300
            const reverseParable = x => -0.03 * Math.pow(x - endX, 2) - 3.7 * (x - endX) + 300
            if(this.which % 2 == 0)
                interval = setInterval(() => {
                    game.flyingPill.position.y = parable(game.flyingPill.position.x)
                    game.flyingPill.rotation.z -= Math.PI / 75
                    game.flyingPill.position.x--
                    if(game.flyingPill.position.x == endX) {
                        game.flyingPill.position.y = 300
                        game.scene.remove(game.flyingPill)
                        clearInterval(interval)
                    }
                }, 10)
            else if(this.which % 2 == 1)
                interval = setInterval(() => {
                    game.flyingPill.position.y = reverseParable(game.flyingPill.position.x)
                    game.flyingPill.rotation.z += Math.PI / 75
                    game.flyingPill.position.x++
                    if(game.flyingPill.position.x == endX) {
                        game.flyingPill.position.y = 300
                        game.scene.remove(game.flyingPill)
                        clearInterval(interval)
                    }
                }, 10)
        })

        this.client.on('pillsBoard', data => {
            const {pillsBoard} = data
            game.enemyPillsBoard.forEach(item => {
                game.scene.remove(item)
            })
            game.enemyPillsBoard = []
            pillsBoard.forEach(row => {
                row.forEach(pillObject => {
                    if(pillObject instanceof Object) {
                        const pill = new Pill(pillObject.color1, pillObject.color2)
                        game.enemyPillsBoard.push(pill)
                        pill.position.x = pillObject.posX
                        pill.position.y = pillObject.posY
                        pill.rotation.z = pillObject.pillRotation
                        game.scene.add(pill)
                    }
                })
            })
        })
    }

    addUser = nick => {
        this.nick = nick
        //emitiowanie połączenia
        this.client.emit('login', {
            nick
        })
    }

    getViruses = (level, divisor, positionX, start) => {
        $.ajax({
            url: "http://localhost:3000/LOAD_LEVEL",
            data: {},
            method: "POST",
            success: function(data) {
                let obj = JSON.parse(data)
                console.log(obj)
                if(obj.actionBack == "CREATED") {
                    if(start) {
                        game.createYourViruses(obj.documents[0].board[level].viruses, positionX)
                        game.play(settings.defaultSpeed / divisor)
                        $('#menu').remove()
                        let dv = $("<div>").text("Twój wynik: 0").prop("id", "score")
                        $("#controls").append(dv)
                    }
                    else {
                        game.createEnemyViruses(obj.documents[0].board[level].viruses, positionX)
                    }
                }
                else
                    console.log("Nie udało sie pobrać dokumentów z bazy danych")
            },
            error: function(xhr, status, error) {
                console.log(xhr)
            }
        })
    }
}