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