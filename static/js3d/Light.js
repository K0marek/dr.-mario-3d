class Light extends THREE.Object3D {
    constructor(power = 1) {
        super()
        this.power = power
        this.init()
    }

    init() {
        this.light = new THREE.AmbientLight(0xffffff, this.power)
        this.add(this.light)
    }

    getLight() {
        return this
    }
}