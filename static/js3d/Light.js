class Light {
    constructor() {
        this.container = new THREE.Object3D()

        this.init()
    }

    init() {
        this.light = new THREE.PointLight(0xffffff, 1, 1000)
        this.light.position.set(0, 200, 200)
        this.container.add(this.light)
    }

    getLight() {
        return this.containter
    }
}