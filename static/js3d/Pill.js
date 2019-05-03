class Pill extends THREE.Object3D {
    constructor(color1, color2) {

        super()

        this.color1 = color1
        this.color2 = color2
        this.positionSet = 0

        const { cellSize } = settings

        let half1 = this.createHalf(this.color1)
        half1.posX = 4
        half1.posY = 16
        this.add(half1)
        let half2 = this.createHalf(this.color2)
        half2.posX = 5
        half2.posY = 16
        half2.rotation.z = Math.PI
        half2.position.y = -cellSize
        this.add(half2)

        this.rotation.z = Math.PI / 2

        return this
    }

    createHalf = (color) => {

        const { cellSize } = settings

        const container = new THREE.Object3D()
        const cylinderGeometry = new THREE.CylinderGeometry(cellSize / 2, cellSize / 2, cellSize / 2, 32)
        const material = new THREE.MeshBasicMaterial({
            color
        })
        const cylinder = new THREE.Mesh(cylinderGeometry, material)
        container.add(cylinder)

        const sphereGeometry = new THREE.SphereGeometry(cellSize / 2, 32, 32)
        const sphere = new THREE.Mesh(sphereGeometry, material)
        container.add(sphere)

        cylinder.position.y = -cellSize / 4
        return container
    }

}