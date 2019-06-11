class Net {
    constructor() {
        this.client = io()
        this.id = null // id gracza
        this.enemy = null // id przeciwnika
        this.which = null // który z kolei user

        this.client.on('both', data => {
            const { which, nick, id, enemy } = data
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
            if (this.which % 2 == 0) { // pierwszy user
                game.bottle.position.x = -240
                game.enemyBottle.position.x = 60
                net.getViruses(data.level2, data.divisor2, 60, false)
                net.getViruses(data.level1, data.divisor1, -240, true)
                // game.play(settings.defaultSpeed)
            }
            if (this.which % 2 == 1) { // drugi user
                game.bottle.position.x = 60
                game.enemyBottle.position.x = -240
                net.getViruses(data.level1, data.divisor1, -240, false)
                net.getViruses(data.level2, data.divisor2, 60, true)
                // game.play(settings.defaultSpeed)
            }
        })

        this.client.on('change', data => {
            const { cellSize } = settings
            const translation = this.which % 2 == 0 ? 60 : -240
            game.scene.remove(game.enemyPill)
            game.enemyPill = new Pill(data.half1color, data.half2color)
            game.enemyPill.position.x = data.pos1X * cellSize + translation
            game.enemyPill.position.y = data.pos1Y * cellSize
            game.enemyPill.half1.posX = data.pos1X
            game.enemyPill.half1.posY = data.pos1Y
            game.enemyPill.half2.posX = data.pos2X
            game.enemyPill.half2.posY = data.pos2Y
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
            game.enemyNextPillsContainer.position.set(this.which % 2 == 0 ? 290 : -310, 120, 0)
            game.scene.add(game.enemyNextPillsContainer)
        })

        this.client.on('fly', data => {
            const { startX, endX } = data
            game.flyingPill = new Pill(data.color1, data.color2)
            game.flyingPill.position.set(startX, 165, 0)
            game.scene.add(game.flyingPill)
            let interval
            const parable = x => -0.03 * Math.pow(x - endX, 2) + 3.7 * (x - endX) + 300
            const reverseParable = x => -0.03 * Math.pow(x - endX, 2) - 3.7 * (x - endX) + 300
            if (this.which % 2 == 0)
                interval = setInterval(() => {
                    game.flyingPill.position.y = parable(game.flyingPill.position.x)
                    game.flyingPill.rotation.z -= Math.PI / 75
                    game.flyingPill.position.x--
                    if (game.flyingPill.position.x == endX) {
                        game.flyingPill.position.y = 300
                        game.scene.remove(game.flyingPill)
                        clearInterval(interval)
                    }
                }, 10)
            else if (this.which % 2 == 1)
                interval = setInterval(() => {
                    game.flyingPill.position.y = reverseParable(game.flyingPill.position.x)
                    game.flyingPill.rotation.z += Math.PI / 75
                    game.flyingPill.position.x++
                    if (game.flyingPill.position.x == endX) {
                        game.flyingPill.position.y = 300
                        game.scene.remove(game.flyingPill)
                        clearInterval(interval)
                    }
                }, 10)
        })

        this.client.on('pillsBoard', data => {
            const { newPill } = data
            const { cellSize } = settings
            const translation = this.which % 2 == 1 ? -240 : 60
            const pill = new Pill(newPill.color1, newPill.color2)
            game.enemyPillsBoard.push(pill)
            pill.position.x = newPill.pos1X * cellSize + translation
            pill.half1.posX = newPill.pos1X
            pill.half1.posY = newPill.pos1Y
            pill.half2.posX = newPill.pos2X
            pill.half2.posY = newPill.pos2Y
            pill.position.y = newPill.pos1Y * cellSize
            pill.rotation.z = newPill.pillRotation
            game.scene.add(pill)
            game.enemyPillsBoard.push(pill)
            game.enemyPill.visible = false

            let pillsToFall = []

            const falling = (pill) => {
                pill.children.forEach(half => {
                    game.enemyBottle.children.forEach(field => {
                        if (field.posX == half.posX && field.posY == half.posY) {
                            field.allow = false
                            field.color = half.color
                        }
                    })
                })
                let toDelete = []
                for (let i = 0; i < pill.children.length; i++) {
                    checkRow(pill.children[i]).forEach(field => {
                        if (!maybePushed(toDelete, field))
                            toDelete.push(field)
                    })
                    checkColumn(pill.children[i]).forEach(field => {
                        if (!maybePushed(toDelete, field))
                            toDelete.push(field)
                    })
                }
                let whereToStart = 15
                toDelete.forEach(field => {
                    field.allow = true
                    field.color = "nothing" //sdfsdf
                    game.enemyPillsBoard.forEach(pill => {
                        pill.children.forEach(pillHalf => {
                            if (pillHalf.posY == field.posY && pillHalf.posX == field.posX) {
                                if (!maybePushed(pillsToFall, pill)) {
                                    pillsToFall.push(pill)
                                    if (field.posY < whereToStart)
                                        whereToStart = field.posY
                                }
                            }
                        })
                    })
                })
                if (pillsToFall.length > 0) {
                    if (whereToStart != 15) {
                        for (let i = whereToStart; i < 15; i++)
                            analyzeNextRow(i)
                        deleteHalfs(toDelete)
                        keepProperPills(whereToStart)
                        pillsToFall.forEach(pill => {
                            pill.children.forEach(pillHalf => {
                                game.enemyBottle.fields[pillHalf.posY][pillHalf.posX].allow = true
                                game.enemyBottle.fields[pillHalf.posY][pillHalf.posX].color = "nothing"
                            })
                        })
                        if (pillsToFall.length > 0) {
                            let interval = setInterval(() => {
                                if (pillsToFall.length > 0) {
                                    let pillsToDelete = []
                                    pillsToFall.forEach(pillToFall => {
                                        pillToFall.children.forEach((pillHalf, index) => {
                                            if (!game.enemyBottle.fields[pillHalf.posY - 1][pillHalf.posX].allow) {
                                                let isToPush = true
                                                pillsToDelete.forEach(pillToDelete => {
                                                    if (pillToDelete.uuid == pillToFall.uuid)
                                                        isToPush = false
                                                })
                                                if (isToPush) {
                                                    pillsToDelete.push(pillToFall)
                                                    game.enemyBottle.fields[pillHalf.posY][pillHalf.posX].allow = false
                                                    game.enemyBottle.fields[pillHalf.posY][pillHalf.posX].color = pillHalf.color
                                                    if (pillToFall.children.length == 2) {
                                                        game.enemyBottle.fields[pillToFall.children[(index + 1) % 2].posY][pillToFall.children[(index + 1) % 2].posX].allow = false
                                                        game.enemyBottle.fields[pillToFall.children[(index + 1) % 2].posY][pillToFall.children[(index + 1) % 2].posX].color = pillToFall.children[(index + 1) % 2].color
                                                    }
                                                }
                                            }
                                        })
                                    })
                                    pillsToDelete.forEach(pillToDelete => {
                                        for (let i = pillsToFall.length - 1; i >= 0; i--) {
                                            if (pillToDelete.uuid == pillsToFall[i].uuid)
                                                pillsToFall.splice(i, 1)
                                        }
                                    })
                                    pillsToFall.forEach(pillToFall => {
                                        pillToFall.children.forEach(pillHalf => {
                                            pillHalf.posY--
                                        })
                                        pillToFall.position.y -= 20
                                    })
                                    if (pillsToFall.length == 0) {
                                        clearInterval(interval)
                                    }
                                }
                                else {
                                    clearInterval(interval)
                                }
                            }, 500)
                        }
                    }
                }
            }

            const checkRow = (half) => {
                let remember = []
                game.enemyBottle.fields[half.posY].forEach(element => {
                    if (remember.length < 4 && element.color == half.color)
                        remember.push(element)
                    else if (remember.length < 4)
                        remember = []
                    else if (remember.length >= 4 && element.color == half.color && element.posX == remember[remember.length - 1].posX + 1)
                        remember.push(element)
                })
                return remember
            }

            const checkColumn = (half) => {
                let remember = []
                game.enemyBottle.fields.forEach(element => {
                    if (remember.length < 4 && element[half.posX].color == half.color)
                        remember.push(element[half.posX])
                    else if (remember.length < 4)
                        remember = []
                    else if (remember.length >= 4 && element[half.posX].color == half.color && element[half.posX].posY == remember[remember.length - 1].posY + 1) {
                        remember.push(element[half.posX])
                    }
                })
                return remember
            }

            const maybePushed = (array, elementToCheck) => {
                let agree = false
                array.forEach(element => {
                    if (element.uuid == elementToCheck.uuid)
                        agree = true
                })
                return agree
            }

            const analyzeNextRow = (posY) => {
                pillsToFall.forEach(pill => {
                    pill.children.forEach(pillHalf => {
                        if (pillHalf.posY == posY) {
                            let obj = {
                                posY: posY,
                                posX: pillHalf.posX
                            }
                            checkUp(obj)
                        }
                    })
                })
            }

            const checkUp = (position) => {

                game.enemyPillsBoard.forEach(pill => {
                    if (!maybePushed(pillsToFall, pill)) {
                        pill.children.forEach((pillHalf, index) => {
                            if (position.posY + 1 == pillHalf.posY && position.posX == pillHalf.posX) {
                                if (pill.children.length == 2) {
                                    if (pill.children[(index + 1) % 2].posX == pillHalf.posX)
                                        pillsToFall.push(pill)
                                    else {
                                        let obj = {
                                            posY: pill.children[(index + 1) % 2].posY,
                                            posX: pill.children[(index + 1) % 2].posX
                                        }
                                        if (!checkUnderEmpty(obj))
                                            pillsToFall.push(pill)
                                        else {
                                            if (checkUnderParent(obj))
                                                pillsToFall.push(pill)
                                        }
                                    }
                                }
                                else
                                    pillsToFall.push(pill)
                            }
                        })
                    }
                })
            }

            const checkUnderEmpty = (position) => {
                let agree = false
                game.enemyPillsBoard.forEach(pill => {
                    pill.children.forEach(pillHalf => {
                        if (position.posY - 1 == pillHalf.posY && position.posX == pillHalf.posX)
                            agree = true
                    })
                })
                return agree
            }

            const checkUnderParent = (position) => {
                let agree = false
                pillsToFall.forEach(pill => {
                    pill.children.forEach(pillHalf => {
                        if (position.posY - 1 == pillHalf.posY && position.posX == pillHalf.posX)
                            agree = true
                    })
                })
                return agree
            }

            const deleteHalfs = (toDelete) => {
                toDelete.forEach(field => {
                    game.enemyPillsBoard.forEach(pill => {
                        pill.children.forEach((pillHalf, index) => {
                            if (pillHalf.posY == field.posY && pillHalf.posX == field.posX) {
                                if (index == 0)
                                    pill.children.shift()
                                else
                                    pill.children.pop()
                            }
                        })
                    })
                    game.allEnemyViruses.children.forEach((virus, index) => {
                        if (virus.posY == field.posY && virus.posX == field.posX) {
                            if (virus.posY < 14) {
                                let obj = {
                                    posY: virus.posY,
                                    posX: virus.posX
                                }
                                checkUp(obj)
                            }
                            game.allEnemyViruses.children.splice(index, 1)
                        }
                    })
                })
            }

            const keepProperPills = (whereToStart) => {
                for (let i = pillsToFall.length - 1; i >= 0; i--) {
                    if (pillsToFall[i].children.length == 0)
                        pillsToFall.splice(i, 1)
                }
            }

            falling(game.enemyPill)

        })

        this.client.on('win', data => {
            ui.win()
            game.continueGame = false
        })

        this.client.on('lose', data => {
            ui.lose()
            game.continueGame = false
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
            success: function (data) {
                let obj = JSON.parse(data)
                if (obj.actionBack == "CREATED") {
                    if (start) {
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
            error: function (xhr, status, error) {
                console.log(xhr)
            }
        })
    }
}