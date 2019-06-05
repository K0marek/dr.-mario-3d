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

        this.axes = new THREE.AxesHelper(1000)
        this.scene.add(this.axes)

        this.camera.position.set(0, 100, 600)
        this.camera.lookAt(this.scene.position.x, this.scene.position.x + 150, this.scene.position.z)

        $(window).on("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(window.innerWidth, window.innerHeight)
        })

        this.bottle = new Bottle(16, 10)
        this.scene.add(this.bottle)

        this.nextPills = [
            new Pill(this.randomColor(), this.randomColor()),
            new Pill(this.randomColor(), this.randomColor()),
            new Pill(this.randomColor(), this.randomColor())
        ]

        this.pillsContainer = new PillsContainer()
        this.scene.add(this.pillsContainer)

        this.speed = null // domyślna szybkość spadania pigułki

        ui.interface()

        this.render()

    }

    render() {

        requestAnimationFrame(this.render.bind(this))
        this.renderer.render(this.scene, this.camera)

    }

    randomColor = () => {
        // let colors = [0xff0000]
        // let random = Math.floor(Math.random() * 1)
        let colors = [0xff0000, 0x0000ff]
        let random = Math.floor(Math.random() * 2)
        // let colors = [0xff0000, 0x0000ff, 0xffff00]
        // let random = Math.floor(Math.random() * 3)
        return colors[random]
    }

    play = (speed, pillStartX = 0) => {
        this.speed = speed
        this.pillsToFall = []
        this.score = 0
        this.continueGame = true
        this.checkingPills = false

        const nextPill = () => {
            for(let i = this.pillsContainer.children.length - 1; i >= 0; i--) {
                if(this.pillsContainer.children[i].children.length == 0)
                    this.pillsContainer.children.splice(i, 1)
            }

            this.pill = this.nextPills[0]
            this.pill.children.forEach(pillHalf => {
                pillHalf.posY = 15
            })

            this.nextPills.push(new Pill(this.randomColor(), this.randomColor()))

            this.nextPills.forEach((item, index) => {
                this.pillsContainer.add(item)
                item.position.set(150, 200 - index * settings.cellSize, 0)
            })

            this.nextPills.shift()

            this.pill.position.y = settings.cellSize * 15
            this.pill.position.x = pillStartX
        }

        nextPill()

        ui.controls()

        const fall = () => {
            setTimeout(() => {
                const {fields} = this.bottle
                let end = false
                this.pill.children.forEach(half => {
                    if(!fields[half.posY - 1][half.posX].allow)
                        end = true
                })

                if(end) {
                    if(!this.checkEndGame(this.pill)) {
                        alert($("#score").text())
                        this.continueGame = false
                    }
                    else {
                        falling(this.pill)
                        nextPill()
                        this.speed = settings.defaultSpeed
                    }
                }
                else {
                    this.pill.children.forEach(half => {
                        half.posY--
                    })
                    this.pill.position.y -= 20
                }

                if(this.continueGame) {
                    if(this.pillsToFall.length == 0)
                        fall()
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

        fall()

        const falling = (pill) => {
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
                field.color = "nothing" //sdfsdf
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
                                                // falling(pillToFall)
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
                    alert($("#score").text())
                    this.continueGame = false
                }
            }
        }

    }

    checkPossibility = (sign) => {
        let agree = null
        let x = null
        let y = null
        if(this.pill.children[0].posX < this.pill.children[1].posX)
            x = this.pill.children[0].posX
        else
            x = this.pill.children[1].posX
        if(this.pill.children[0].posY > this.pill.children[1].posY)
            y = this.pill.children[0].posY
        else
            y = this.pill.children[1].posY
        if(sign == '-') {
            this.bottle.children.forEach(field => {
                if(field.posX == x - 1 && field.posY == y)
                    agree = field.allow
            })
        }
        else if(sign == '+') {
            this.bottle.children.forEach(field => {
                if(this.pill.positionSet % 2 == 0) {
                    if(field.posX == x + 2 && field.posY == y)
                        agree = field.allow
                }
                else
                    if(field.posX == x + 1 && field.posY == y)
                        agree = field.allow
            })
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
        })
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

}
