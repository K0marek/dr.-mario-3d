console.log("wczytano plik Game.js")

class Game {

    constructor() {

        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        )

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        })
        this.renderer.setClearColor(0x000000)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        $("#root").append(this.renderer.domElement)

        this.camera.position.set(0, 100, 600)
        this.camera.lookAt(this.scene.position.x, this.scene.position.x + 150, this.scene.position.z)

        $(window).on("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(window.innerWidth, window.innerHeight)
        })

        this.bottle = new Bottle(16, 10)
        this.scene.add(this.bottle)

        // model
        this.mario = new Mario()
        this.mario.loadModel(modeldata => {
            this.scene.add(modeldata)
        })

        this.clock = new THREE.Clock()

        this.light = new Light()
        this.scene.add(this.light.container)

        //tablica z kolorami następnych pilli do generowania ich
        this.nextPillColors = []
        for(let i = 0; i < 6; i++) {
            this.nextPillColors.push(this.randomColor())
        }

        //obiekt 3d na wszystkie wirusy
        this.allYourViruses = new THREE.Object3D
        this.allEnemyViruses = new THREE.Object3D

        // tablica z pillami odpowiednich kolorów
        this.nextPills = [
            new Pill(this.nextPillColors[0], this.nextPillColors[1]),
            new Pill(this.nextPillColors[2], this.nextPillColors[3]),
            new Pill(this.nextPillColors[4], this.nextPillColors[5])
        ]

        // tablica będąca odzwierciedleniem pilli na planszy
        this.pillsBoard = this.bottle.fields.map(row => {
            return row.map(item => {
                if(item.allow)
                    return 0
                else
                    return 1 // jeżeli pole to część ramki (zajęte) wstawiam tam 1
            })
        })

        // zmienna która określa czy pill jest w trakcie lotu (wtedy nie działa sterowanie)
        this.isPillFlying = false

        //tablica przeciwnika
        this.enemyPillsBoard = []

        // kontener na wszystkie pille
        this.pillsContainer = new PillsContainer()
        this.scene.add(this.pillsContainer)

        this.speed = null // domyślna szybkość spadania pigułki

        ui.interface()

        this.render()

    }

    render() {

        if(this.mario.loaded)
            this.mario.updateModel()

        requestAnimationFrame(this.render.bind(this))
        this.renderer.render(this.scene, this.camera)

    }

    randomColor = () => {
        // let colors = [0xff0000]
        // let random = Math.floor(Math.random() * 1)
        // let colors = [0xff0000, 0x0000ff]
        // let random = Math.floor(Math.random() * 2)
        let colors = [0xff0000, 0x0000ff, 0xffff00]
        let random = Math.floor(Math.random() * 3)
        return colors[random]
    }

    play = (speed) => {
        this.speed = speed
        this.pillsToFall = []
        this.score = 0
        this.continueGame = true

        const fly = startX => {
            this.isPillFlying = true
            const parable = x => -0.03 * Math.pow(x - startX, 2) + 3.7 * (x - startX) + 300
            const reverseParable = x => -0.03 * Math.pow(x - startX, 2) - 3.7 * (x - startX) + 300
            let interval
            if(net.which % 2 == 1 || net.which == null)
                interval = setInterval(() => {
                    this.pill.position.y = parable(this.pill.position.x)
                    this.pill.rotation.z -= Math.PI / 75
                    this.pill.position.x--
                    if(this.pill.position.x == startX) {
                        this.pill.position.y = 300
                        this.isPillFlying = false
                        clearInterval(interval)
                        fall()
                    }
                }, 10)
            else if(net.which % 2 == 0)
                interval = setInterval(() => {
                    this.pill.position.y = reverseParable(this.pill.position.x)
                    this.pill.rotation.z += Math.PI / 75
                    this.pill.position.x++
                    if(this.pill.position.x == startX) {
                        this.pill.position.y = 300
                        this.isPillFlying = false
                        clearInterval(interval)
                        fall()
                    }
                }, 10)
        }

        const nextPill = () => {

            //this.mario.throwPill()

            for(let i = this.pillsContainer.children.length - 1; i >= 0; i--) {
                if(this.pillsContainer.children[i].children.length == 0)
                    this.pillsContainer.children.splice(i, 1)
            }

            this.pill = new Pill(this.nextPillColors[0], this.nextPillColors[1])
            this.pill.children.forEach(pillHalf => {
                pillHalf.posY = 15
            })
            this.scene.add(this.pill)

            this.nextPillColors.shift()
            this.nextPillColors.shift()
            this.nextPills.shift()
            this.nextPillColors.push(this.randomColor(), this.randomColor())
            this.nextPills.push(new Pill(this.nextPillColors[4], this.nextPillColors[5]))

            this.nextPillsContainer = new PillsContainer()
            this.nextPills.forEach((item, index) => {
                this.nextPillsContainer.add(item)
                item.position.set(0, 40 - index * settings.cellSize, 0)
            })
            this.scene.add(this.nextPillsContainer)
            if(net.enemy == null) // pozycja dla jednego gracza
                this.nextPillsContainer.position.set(150, 120, 0)
            else // pozycja dla 2 graczy zależy od tego który z kolei jest to podłączony gracz
                this.nextPillsContainer.position.set(net.which % 2 == 0 ? -310 : 290, 120, 0)

            if(net.enemy == null) {
                this.pill.position.x = 150
                this.pill.position.y = 165
                fly(0)
            } else {
                this.pill.position.x = net.which % 2 == 0 ? -310 : 290
                this.pill.position.y = 165
                fly(net.which % 2 == 0 ? -160 : 140)

                net.client.emit('fly', {
                    enemy: net.enemy,
                    startX: net.which % 2 == 0 ? -310 : 290,
                    endX: net.which % 2 == 0 ? -160 : 140,
                    color1: this.pill.color1,
                    color2: this.pill.color2,
                })
            }

            net.client.emit('nextPills', {
                enemy: net.enemy,
                nextPillColors: this.nextPillColors
            })
        }

        nextPill()

        ui.controls()

        const fall = () => {
            this.pillsContainer.add(this.pill)
            net.client.emit('change', {
                enemy: net.enemy,
                pos1X: this.pill.half1.posX,
                pos1Y: this.pill.half1.posY,
                pos2X: this.pill.half2.posX,
                pos2Y: this.pill.half2.posY,
                half1color: this.pill.color1,
                half2color: this.pill.color2,
                pillRotation: this.pill.rotation.z
            })
            setTimeout(() => {
                const {fields} = this.bottle
                let end = false
                this.pill.children.forEach(half => {
                    if(!fields[half.posY - 1][half.posX].allow)
                        end = true
                })
                if(end) {
                    // informacje o każdej części pilla zapisuje w tablicy this.pillsBoard
                    this.pillsBoard[this.pill.half1.posY][this.pill.half1.posX] = {
                        pos1X: this.pill.half1.posX,
                        pos1Y: this.pill.half1.posY,
                        pos2X: this.pill.half2.posX,
                        pos2Y: this.pill.half2.posY,
                        color1: this.pill.color1,
                        color2: this.pill.color2,
                        pillRotation: this.pill.rotation.z
                    }
                    net.client.emit('pillsBoard', {
                        enemy: net.enemy,
                        newPill: {
                            pos1X: this.pill.half1.posX,
                            pos1Y: this.pill.half1.posY,
                            pos2X: this.pill.half2.posX,
                            pos2Y: this.pill.half2.posY,
                            color1: this.pill.color1,
                            color2: this.pill.color2,
                            pillRotation: this.pill.rotation.z
                        }
                    })
                    if(!this.checkEndGame(this.pill)) {
                        ui.lose()
                        net.client.emit('win', {
                            enemy: net.enemy,
                        })
                        this.continueGame = false
                    }
                    else {
                        this.falling(this.pill)
                        nextPill()
                        this.speed = speed
                        return
                    }
                }
                else {
                    this.pill.children.forEach(half => {
                        half.posY--
                    })
                    this.pill.position.y -= 20
                }

                if(this.continueGame) {
                    if(this.pillsToFall.length == 0) {
                        fall()
                    }
                    else {
                        let interval = setInterval(() => {
                            if(this.pillsToFall.length == 0) {
                                clearInterval(interval)
                                fall()
                            }
                        }, settings.defaultSpeed)
                    }
                }
            }, this.speed)
        }
    }

    falling = (pill) => {
        pill.children.forEach(half => {
            this.bottle.children.forEach(field => {
                if(field.posX == half.posX && field.posY == half.posY) {
                    field.allow = false
                    field.color = half.color
                }
            })
        })
        let toDelete = []
        for(let i = 0; i < pill.children.length; i++) {
            this.checkRow(pill.children[i]).forEach(field => {
                if(!this.maybePushed(toDelete, field))
                    toDelete.push(field)
            })
            this.checkColumn(pill.children[i]).forEach(field => {
                if(!this.maybePushed(toDelete, field))
                    toDelete.push(field)
            })
        }
        let whereToStart = 15
        toDelete.forEach(field => {
            field.allow = true
            field.color = "nothing"
            this.pillsContainer.children.forEach(pill => {
                pill.children.forEach(pillHalf => {
                    if(pillHalf.posY == field.posY && pillHalf.posX == field.posX) {
                        if(!this.maybePushed(this.pillsToFall, pill)) {
                            this.pillsToFall.push(pill)
                            if(field.posY < whereToStart)
                                whereToStart = field.posY
                        }
                    }
                })
            })
        })
        if(this.pillsToFall.length > 0) {
            if(whereToStart != 15) {
                for(let i = whereToStart; i < 15; i++)
                    this.analyzeNextRow(i)
                this.deleteHalfs(toDelete)
                this.keepProperPills(whereToStart)
                this.pillsToFall.forEach(pill => {
                    pill.children.forEach(pillHalf => {
                        this.bottle.fields[pillHalf.posY][pillHalf.posX].allow = true
                        this.bottle.fields[pillHalf.posY][pillHalf.posX].color = "nothing"
                    })
                })
                if(this.pillsToFall.length > 0) {
                    let interval = setInterval(() => {
                        if(this.pillsToFall.length > 0) {
                            let pillsToDelete = []
                            this.pillsToFall.forEach(pillToFall => {
                                pillToFall.children.forEach((pillHalf, index) => {
                                    if(!this.bottle.fields[pillHalf.posY - 1][pillHalf.posX].allow) {
                                        let isToPush = true
                                        pillsToDelete.forEach(pillToDelete => {
                                            if(pillToDelete.uuid == pillToFall.uuid)
                                                isToPush = false
                                        })
                                        if(isToPush) {
                                            pillsToDelete.push(pillToFall)
                                            this.bottle.fields[pillHalf.posY][pillHalf.posX].allow = false
                                            this.bottle.fields[pillHalf.posY][pillHalf.posX].color = pillHalf.color
                                            if(pillToFall.children.length == 2) {
                                                this.bottle.fields[pillToFall.children[(index + 1) % 2].posY][pillToFall.children[(index + 1) % 2].posX].allow = false
                                                this.bottle.fields[pillToFall.children[(index + 1) % 2].posY][pillToFall.children[(index + 1) % 2].posX].color = pillToFall.children[(index + 1) % 2].color
                                            }
                                        }
                                    }
                                })
                            })
                            pillsToDelete.forEach(pillToDelete => {
                                for(let i = this.pillsToFall.length - 1; i >= 0; i--) {
                                    if(pillToDelete.uuid == this.pillsToFall[i].uuid)
                                        this.pillsToFall.splice(i, 1)
                                }
                            })
                            this.pillsToFall.forEach(pillToFall => {
                                pillToFall.children.forEach(pillHalf => {
                                    pillHalf.posY--
                                })
                                pillToFall.position.y -= 20
                            })
                            if(this.pillsToFall.length == 0) {
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
        else {
            if(!this.checkEndGame(this.pill)) {
                ui.lose()
                net.client.emit('win', {
                    enemy: net.enemy,
                })
                this.continueGame = false
            }
        }
    }

    checkPossibility = (sign) => {
        let agree = null
        const {fields} = this.bottle
        const {half1, half2} = this.pill

        if(sign == '-') {
            if(fields[half1.posY][half1.posX - 1].allow && fields[half2.posY][half2.posX - 1].allow)
                agree = true
            else
                agree = false
        }
        else if(sign == '+') {
            if(fields[half1.posY][half1.posX + 1].allow && fields[half2.posY][half2.posX + 1].allow)
                agree = true
            else
                agree = false
        }
        return agree
    }

    checkRow = (half) => {
        let remember = []
        this.bottle.fields[half.posY].forEach(element => {
            if(remember.length < 4 && element.color == half.color)
                remember.push(element)
            else if(remember.length < 4)
                remember = []
            else if(remember.length >= 4 && element.color == half.color && element.posX == remember[remember.length - 1].posX + 1)
                remember.push(element)
        })
        return remember
    }

    checkColumn = (half) => {
        let remember = []
        this.bottle.fields.forEach(element => {
            if(remember.length < 4 && element[half.posX].color == half.color)
                remember.push(element[half.posX])
            else if(remember.length < 4)
                remember = []
            else if(remember.length >= 4 && element[half.posX].color == half.color && element[half.posX].posY == remember[remember.length - 1].posY + 1) {
                remember.push(element[half.posX])
            }
        })
        return remember
    }

    maybePushed = (array, elementToCheck) => {
        let agree = false
        array.forEach(element => {
            if(element.uuid == elementToCheck.uuid)
                agree = true
        })
        return agree
    }

    analyzeNextRow = (posY) => {
        this.pillsToFall.forEach(pill => {
            pill.children.forEach(pillHalf => {
                if(pillHalf.posY == posY) {
                    let obj = {
                        posY: posY,
                        posX: pillHalf.posX
                    }
                    this.checkUp(obj)
                }
            })
        })
    }

    checkUp = (position) => {

        this.pillsContainer.children.forEach(pill => {
            if(!this.maybePushed(this.pillsToFall, pill)) {
                pill.children.forEach((pillHalf, index) => {
                    if(position.posY + 1 == pillHalf.posY && position.posX == pillHalf.posX) {
                        if(pill.children.length == 2) {
                            if(pill.children[(index + 1) % 2].posX == pillHalf.posX)
                                this.pillsToFall.push(pill)
                            else {
                                let obj = {
                                    posY: pill.children[(index + 1) % 2].posY,
                                    posX: pill.children[(index + 1) % 2].posX
                                }
                                if(!this.checkUnderEmpty(obj))
                                    this.pillsToFall.push(pill)
                                else {
                                    if(this.checkUnderParent(obj))
                                        this.pillsToFall.push(pill)
                                }
                            }
                        }
                        else
                            this.pillsToFall.push(pill)
                    }
                })
            }
        })
    }

    checkUnderEmpty = (position) => {
        let agree = false
        this.pillsContainer.children.forEach(pill => {
            pill.children.forEach(pillHalf => {
                if(position.posY - 1 == pillHalf.posY && position.posX == pillHalf.posX)
                    agree = true
            })
        })
        return agree
    }

    checkUnderParent = (position) => {
        let agree = false
        this.pillsToFall.forEach(pill => {
            pill.children.forEach(pillHalf => {
                if(position.posY - 1 == pillHalf.posY && position.posX == pillHalf.posX)
                    agree = true
            })
        })
        return agree
    }

    deleteHalfs = (toDelete) => {
        this.score += 200 * toDelete.length
        $("#score").text("Twój wynik: " + this.score)
        toDelete.forEach(field => {
            this.pillsContainer.children.forEach(pill => {
                pill.children.forEach((pillHalf, index) => {
                    if(pillHalf.posY == field.posY && pillHalf.posX == field.posX) {
                        if(index == 0)
                            pill.children.shift()
                        else
                            pill.children.pop()
                    }
                })
            })
            this.allYourViruses.children.forEach((virus, index) => {
                if(virus.posY == field.posY && virus.posX == field.posX) {
                    if(virus.posY < 14) {
                        let obj = {
                            posY: virus.posY,
                            posX: virus.posX
                        }
                        this.checkUp(obj)
                    }
                    this.allYourViruses.children.splice(index, 1)
                    this.numberOfViruses--
                }
            })
        })
        // if (this.numberOfViruses == 0) {
        //     this.continueGame = false
        //     alert("WYGRAŁEŚ")
        // }
    }

    keepProperPills = (whereToStart) => {
        for(let i = this.pillsToFall.length - 1; i >= 0; i--) {
            if(this.pillsToFall[i].children.length == 0)
                this.pillsToFall.splice(i, 1)
            // else {
            //     let agree = false
            //     this.pillsToFall[i].children.forEach(pillHalf => {
            //         if(pillHalf.posY >= whereToStart)
            //             agree = true
            //     })
            //     if(!agree)
            //         this.pillsToFall.splice(i, 1)
            // }
        }
        // for(let i = this.pillsToFall.length - 1; i >= 0; i--) {
        //     if(this.pillsToFall[i].children.length != 0) {
        //         let agree = false
        //         this.pillsToFall[i].children.forEach(pillHalf => {
        //             if(pillHalf.posY >= whereToStart)
        //                 agree = true
        //         })
        //         if(!agree)
        //             this.pillsToFall.splice(i, 1)
        //     }
        //     else
        //         this.pillsToFall.splice(i, 1)
        // }
    }

    checkEndGame = (pill) => {
        let agree = true
        pill.children.forEach(pillHalf => {
            if(pillHalf.posY >= 15)
                agree = false
        })
        return agree
    }

    createYourViruses = (viruses, positionX) => {
        this.numberOfViruses = viruses.length
        viruses.forEach(virus => {
            this.allYourViruses.add(new Virus(virus.posX, virus.posY, virus.color, game.bottle))
        })
        this.allYourViruses.position.x = positionX
        this.scene.add(this.allYourViruses)
    }

    createEnemyViruses = (viruses, positionX) => {
        viruses.forEach(virus => {
            this.allEnemyViruses.add(new Virus(virus.posX, virus.posY, virus.color, game.enemyBottle))
        })
        this.allEnemyViruses.position.x = positionX
        this.scene.add(this.allEnemyViruses)
    }

}