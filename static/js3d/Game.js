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

        this.raycaster = new THREE.Raycaster()
        this.mouseVector = new THREE.Vector2()

        this.camera.position.set(0, 100, 600)
        this.camera.lookAt(this.scene.position.x, this.scene.position.x + 150, this.scene.position.z)

        $(window).on("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(window.innerWidth, window.innerHeight)
        })

        this.fields = []

        this.bottle = new Bottle(16, 10)
        this.scene.add(this.bottle)

        this.nextPills = [
            new Pill(this.randomColor(), this.randomColor()),
            new Pill(this.randomColor(), this.randomColor()),
            new Pill(this.randomColor(), this.randomColor())
        ]

        this.speed = null // domyślna szybkość spadania pigułki

        ui.interface()

        this.render()

    }

    render() {

        requestAnimationFrame(this.render.bind(this))
        this.renderer.render(this.scene, this.camera)

    }

    randomColor = () => {
        let colors = [0xff0000, 0x0000ff, 0xffff00]
        let random = Math.floor(Math.random() * 3)
        return colors[random]
    }

    play = (speed) => {
        this.speed = speed

        const nextPill = () => {

            this.pill = this.nextPills[0]

            this.nextPills.push(new Pill(this.randomColor(), this.randomColor()))

            this.nextPills.forEach((item, index) => {
                this.scene.add(item)
                item.position.set(150, 200 - index * settings.cellSize, 0)
            })

            this.nextPills.shift()

            this.pill.position.y = settings.cellSize * 15
            this.pill.position.x = 0
            this.scene.add(this.pill)
        }

        nextPill()

        ui.controls()

        const fall = () => {
            setTimeout(() => {
                const { fields } = this.bottle
                let end = false
                this.pill.children.forEach(half => {
                    half.posY--
                    if (!fields[half.posY][half.posX].allow)
                        end = true
                })
                if (end) {
                    this.pill.children.forEach(half => {
                        this.bottle.children.forEach(field => {
                            if (field.posX == half.posX && field.posY == half.posY + 1)
                                field.allow = false
                        })
                    })
                    nextPill()
                }
                else
                    this.pill.position.y -= 20
                fall()
            }, this.speed)
        }
        fall()
    }

    checkPossibility = (sign) => {
        let agree = null
        let x = null
        let y = null
        if (this.pill.children[0].posX < this.pill.children[1].posX)
            x = this.pill.children[0].posX
        else
            x = this.pill.children[1].posX
        if (this.pill.children[0].posY > this.pill.children[1].posY)
            y = this.pill.children[0].posY
        else
            y = this.pill.children[1].posY
        if (sign == '-') {
            this.bottle.children.forEach(field => {
                if (field.posX == x - 1 && field.posY == y)
                    agree = field.allow
            })
        }
        else if (sign == '+') {
            this.bottle.children.forEach(field => {
                if (this.pill.positionSet % 2 == 0) {
                    if (field.posX == x + 2 && field.posY == y)
                        agree = field.allow
                }
                else
                    if (field.posX == x + 1 && field.posY == y)
                        agree = field.allow
            })
        }
        return agree
    }

}
