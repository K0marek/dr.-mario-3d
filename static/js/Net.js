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
            $('#menu').remove()
            game.enemyBottle = new Bottle(16, 10)
            game.scene.add(game.enemyBottle)
            if(this.which % 2 == 0) { // pierwszy user
                game.bottle.position.x = -240
                game.enemyBottle.position.x = 60
                game.play(settings.defaultSpeed, -160)
            }
            if(this.which % 2 == 1) { // drugi user
                game.bottle.position.x = 60
                game.enemyBottle.position.x = -240
                game.play(settings.defaultSpeed, 140)
            }
        })

        this.client.on('change', data => {
            const { cellSize } = settings
            const translation = this.which % 2 == 0 ? 60 : -240
            game.scene.remove(game.enemyPill)
            game.enemyPill = new Pill(data.half1color, data.half2color)
            game.enemyPill.position.x = data.posX * cellSize + translation
            game.enemyPill.position.y = data.posY * cellSize
            game.enemyPill.rotation.z = data.pillRotation
            game.scene.add(game.enemyPill)
        })

        this.client.on('nextPills', data => {
            const { nextPillColors } = data
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
            game.enemyNextPillsContainer.position.set(this.which % 2 == 0 ? 280 : -320, 120, 0)
            game.scene.add(game.enemyNextPillsContainer)
        })

    }

    addUser = nick => {
        this.nick = nick
        //emitiowanie połączenia
        this.client.emit('login', {
            nick
        })
    }

    getViruses = level => {
        $.ajax({
            url: "http://localhost:3000/LOAD_LEVEL",
            data: {},
            method: "POST",
            success: function(data) {
                let obj = JSON.parse(data)
                console.log(obj)
                game.createViruses(obj.documents[0].board[level].viruses)
            },
            error: function(xhr, status, error) {
                console.log(xhr)
            }
        })
    }
}