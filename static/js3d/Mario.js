class Mario extends THREE.Object3D {
    constructor() {
        super()
        this.mixer = null
        this.loaded = false
    }

    loadModel = callback => {

        var loader = new THREE.JSONLoader();

        loader.load('models/mario.json', (geometry, materials) => {

            materials.forEach(material => {
                material.skinning = true
            })

            var object = new THREE.SkinnedMesh(geometry, materials)

            object.position.y = 90
            object.position.x = 225
            object.scale.set(20, 20, 20)

            this.mixer = new THREE.AnimationMixer(object)

            var wag = this.mixer.clipAction('wag')
            this.throw = this.mixer.clipAction('throw')

            wag.play()

            this.add(object)
            this.loaded = true

            callback(this)

        })
    }

    updateModel() {
        var delta = game.clock.getDelta()
        if (this.mixer) this.mixer.update(delta)
    }

    throwPill() {
        this.throw.setLoop(THREE.LoopOnce)
        this.throw.play().reset()
    }

}