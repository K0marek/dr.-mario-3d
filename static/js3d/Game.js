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

        this.bottle = new Bottle(16, 10)
        this.scene.add(this.bottle)

        const randomColor = () => {
            let colors = [0xff0000, 0x0000ff, 0xffff00]
            let random = Math.floor(Math.random() * 3)
            return colors[random]
        }

        this.pill = new Pill(randomColor(), randomColor())
        this.scene.add(this.pill.container)

        ui.controls()

        setInterval(() => {
            this.pill.container.position.y -= 20
        }, 1000)

        this.render()
    }

    render() {

        requestAnimationFrame(this.render.bind(this))

        this.renderer.render(this.scene, this.camera)

    }

}
