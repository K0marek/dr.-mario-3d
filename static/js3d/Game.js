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

        // var orbitControl = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        // orbitControl.addEventListener('change', () => {
        //     this.renderer.render(this.scene, this.camera)
        // })

        $(window).on("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(window.innerWidth, window.innerHeight)
        })

        this.bottle = new Bottle(16, 10)
        this.scene.add(this.bottle)

        this.action = {
            xd: null
        }

        var loader = new THREE.JSONLoader()

        loader.load('models/mario.json', (geometry, materials) => {

            materials.forEach(material => {
                material.skinning = true
            })

            var object = new THREE.SkinnedMesh(geometry, materials)

            object.position.y = 200
            object.position.x = 200
            object.scale.set(20, 20, 20)

            this.mixer = new THREE.AnimationMixer(object)
            this.mixer.clipAction(geometry.animations[2]).play()

            this.scene.add(object)

        })

        this.clock = new THREE.Clock()

        this.nextPills = [
            new Pill(this.randomColor(), this.randomColor()),
            new Pill(this.randomColor(), this.randomColor()),
            new Pill(this.randomColor(), this.randomColor())
        ]

        this.pillsContainer = new PillsContainer()
        this.scene.add(this.pillsContainer)

        var light = new Light()
        this.scene.add(light.container)

        this.speed = null // domyślna szybkość spadania pigułki

        ui.interface()

        this.render()

    }

    render() {

        var delta = this.clock.getDelta()
        if (this.mixer) this.mixer.update(delta)

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

    play = (speed) => {
        this.speed = speed

        const nextPill = () => {

            this.pill = this.nextPills[0]

            this.nextPills.push(new Pill(this.randomColor(), this.randomColor()))

            this.nextPills.forEach((item, index) => {
                this.pillsContainer.add(item)
                item.position.set(150, 200 - index * settings.cellSize, 0)
            })

            this.nextPills.shift()

            this.pill.position.y = settings.cellSize * 15
            this.pill.position.x = 0
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
                    this.pill.children.forEach(half => {
                        this.bottle.children.forEach(field => {
                            if(field.posX == half.posX && field.posY == half.posY) {
                                field.allow = false
                                field.color = half.color
                            }
                        })
                    })
                    let toDelete = []
                    for(let i = 0; i < this.pill.children.length; i++) {
                        toDelete.push(this.checkRow(this.pill.children[i]))
                        toDelete.push(this.checkColumn(this.pill.children[i]))
                    }
                    console.log(toDelete)
                    let pillsToFall = []
                    toDelete.forEach(el => {
                        if(el.length > 3) {
                            let remember = []
                            el.forEach((field, indexEl) => {
                                field.allow = true
                                field.color = "nothing"
                                this.scene.children[2].children.forEach(pill => {
                                    // let isDeleted = false
                                    pill.children.forEach((pillHalf, indexPillHalf) => {
                                        if(pillHalf.posX == field.posX && pillHalf.posY == field.posY) {
                                            let obj = {
                                                posY: field.posY,
                                                posX: field.posX
                                            }
                                            remember.push(obj)
                                            if(pill.children.length == 2) {
                                                if(!this.maybePushed(pillsToFall
                                                    , pill) && pill.children[(indexPillHalf + 1) % 2].posY == pillHalf.posY)
                                                    pillsToFall.push(pill)
                                            }
                                            else
                                                pillsToFall.push(pill)
                                            if(indexPillHalf == 0)
                                                pill.children.shift()
                                            else
                                                pill.children.pop()
                                            // isDeleted = true
                                        }
                                    })
                                    // if((indexEl == 0 || indexEl == el.length
                                    //     - 1)&&isDeleted&&pill.children.length==1) {
                                    //                         if(!this.checkUnderEmpty(obj))
                                    //                             pillsToFall.push(pill)
                                    // }
                                })
                            })
                            for(let i = pillsToFall.length - 1; i >= 0; i--) {
                                if(pillsToFall[i].children.length == 0)
                                    pillsToFall.splice(i, 1)
                            }
                            // let pillsToFall = []
                            remember.forEach((element, indexElement) => {
                                if(element.posY != 15 && !this.bottle.fields[element.posY + 1][element.posX].allow) {
                                    this.scene.children[2].children.forEach(pill => {
                                        pill.children.forEach((pillHalf, indexPillHalf) => {
                                            // if(pillHalf.posY == this.bottle.fields[element.posY + 1][element.posX].posY && pillHalf.posX == this.bottle.fields[element.posY + 1][element.posX].posX) {
                                            if(pillHalf.posY == element.posY + 1 && pillHalf.posX == element.posX) {
                                                if(pill.children.length == 2) {
                                                    if(pill.children[(indexPillHalf + 1) % 2].posX == pillHalf.posX)
                                                        pillsToFall.push(pill)
                                                    else {
                                                        if(!this.maybePushed(pillsToFall, pill)) {
                                                            let obj = {
                                                                posY: pill.children[(indexPillHalf + 1) % 2].posY,
                                                                posX: pill.children[(indexPillHalf + 1) % 2].posX
                                                            }
                                                            if(!this.checkUnderEmpty(obj))
                                                                pillsToFall.push(pill)
                                                        }
                                                    }
                                                }
                                                else
                                                    pillsToFall.push(pill)
                                            }
                                            // if(indexElement == 0 || indexElement == remember.length - 1) {

                                            // }

                                            //DRUGI WARUNEK SPRAWDZAJACY CZY OBOK JEST CZĘŚĆ DO SPADANIA

                                        })
                                    })
                                }
                            })
                            // console.log(pillsToFall)
                            if(pillsToFall.length > 0) {
                                let whereToStart = 15
                                pillsToFall.forEach(pill => {
                                    pill.children.forEach(pillHalf => {
                                        if(pillHalf.posY < whereToStart)
                                            whereToStart = pillHalf.posY
                                    })
                                })
                                if(whereToStart != 15) {
                                    for(let i = whereToStart; i < 15; i++)
                                        this.analyzeNextRow(i, pillsToFall)
                                    console.log(pillsToFall)
                                    pillsToFall.forEach(pill => {
                                        pill.children.forEach(pillHalf => {
                                            // console.log(pillHalf.posY, pillHalf.posX)
                                            this.bottle.fields[pillHalf.posY][pillHalf.posX].allow = true
                                            this.bottle.fields[pillHalf.posY][pillHalf.posX].color = "nothing"
                                        })
                                    })
                                    // pillsToFall.forEach(pill => {
                                    //     pill.children.forEach(pillHalf => {
                                    //         this.bottle.fields[pillHalf.posY][pillHalf.posX].allow = true
                                    //     })
                                    // })
                                    if(pillsToFall.length > 0) {
                                        let interval = setInterval(() => {
                                            if(pillsToFall.length > 0) {
                                                let pillsToDelete = []
                                                pillsToFall.forEach(pillToFall => {
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
                                                                if(pillToFall.children.length == 2)
                                                                    this.bottle.fields[pillToFall.children[(index + 1) % 2].posY][pillToFall.children[(index + 1) % 2].posX].allow = false
                                                            }
                                                        }
                                                    })
                                                })
                                                pillsToDelete.forEach(pillToDelete => {
                                                    pillToDelete.children.forEach(pillHalf => {
                                                        this.bottle.fields[pillHalf.posY][pillHalf.posX].allow = false
                                                        this.bottle.fields[pillHalf.posY][pillHalf.posX].color = pillHalf.color
                                                    })
                                                    for(let i = pillsToFall.length - 1; i >= 0; i--) {
                                                        if(pillToDelete.uuid == pillsToFall[i].uuid)
                                                            pillsToFall.splice(i, 1)
                                                    }
                                                })
                                                pillsToFall.forEach(pillToFall => {
                                                    pillToFall.children.forEach(pillHalf => {
                                                        pillHalf.posY--
                                                    })
                                                    pillToFall.position.y -= 20
                                                })
                                            }
                                            else {
                                                clearInterval(interval)
                                                // nextPill()
                                                // this.speed = settings.defaultSpeed
                                            }
                                        }, 500)
                                    }
                                }
                            }
                        }
                    })
                    nextPill()
                    this.speed = settings.defaultSpeed
                }
                else {
                    this.pill.children.forEach(half => {
                        half.posY--
                    })
                    this.pill.position.y -= 20
                }
                fall()
            }, this.speed)
        }
        fall()
    }

    checkPossibility = (sign) => {
        const { fields } = this.bottle
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

        if (sign == '-') {
            if (this.pill.positionSet % 2 == 0)
                agree = fields[y][x - 1].allow
            else {
                if (fields[y][x - 1].allow && fields[y - 1][x - 1].allow)
                    agree = true
                else
                    agree = false
            }
        }
        else if (sign == '+') {
            if (this.pill.positionSet % 2 == 0)
                agree = fields[y][x + 2].allow
            else {
                if (fields[y][x + 1].allow && fields[y - 1][x + 1].allow)
                    agree = true
                else
                    agree = false
            }

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

    maybePushed = (pushedPills, pill) => {
        let agree = false
        pushedPills.forEach(element => {
            if(element.uuid == pill.uuid)
                agree = true
        })
        return agree
    }

    checkUnderEmpty = (position) => {
        let agree = false
        this.scene.children[2].children.forEach(pill => {
            pill.children.forEach(pillHalf => {
                if(position.posY - 1 == pillHalf.posY && position.posX == pillHalf.posX)
                    agree = true
            })
        })
        return agree
    }

    checkUnderParent = (position, pushedPills) => {
        let agree = false
        pushedPills.forEach(pill => {
            pill.children.forEach(pillHalf => {
                if(position.posY - 1 == pillHalf.posY && position.posX == pillHalf.posX)
                    agree = true
            })
        })
        return agree
    }

    checkUp = (position, pillsToFall) => {
        this.scene.children[2].children.forEach(pill => {
            if(!this.maybePushed(pillsToFall, pill)) {
                pill.children.forEach((pillHalf, index) => {
                    if(position.posY + 1 == pillHalf.posY && position.posX == pillHalf.posX) {
                        if(pill.children.length == 2) {
                            if(pill.children[(index + 1) % 2].posX == pillHalf.posX)
                                pillsToFall.push(pill)
                            else {
                                let obj = {
                                    posY: pill.children[(index + 1) % 2].posY,
                                    posX: pill.children[(index + 1) % 2].posX
                                }
                                if(!this.checkUnderEmpty(obj))
                                    pillsToFall.push(pill)
                                else {
                                    if(this.checkUnderParent(obj, pillsToFall))
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

    analyzeNextRow = (posY, pillsToFall) => {
        pillsToFall.forEach(pill => {
            pill.children.forEach(pillHalf => {
                if(pillHalf.posY == posY) {
                    let obj = {
                        posY: posY,
                        posX: pillHalf.posX
                    }
                    this.checkUp(obj, pillsToFall)
                }
            })
        })
    }

    // checkRest() {
    //     let remember = []
    //     this.scene.children[2].children.forEach((pill, index) => {
    //         if (index < this.scene.children[2].children.length - 3)
    //             pill.children.forEach(pillHalf => {
    //                 if (this.bottle.fields[pillHalf.posY - 1][pillHalf.posX].allow)
    //                     remember.push(pillHalf)
    //             })
    //     })
    //     console.log(remember)
    // }

}
