console.log("wczytano plik Virus.js")

class Virus extends THREE.Object3D {
    constructor(posX, posY, color) {
        super()
        // let colors = [0xff0000, 0x0000ff]
        // let random = Math.floor(Math.random() * 2)
        // this.color = colors[random]
        this.posX = posX
        this.posY = posY
        this.color = color

        const {cellSize} = settings
        const sphereGeometry = new THREE.SphereGeometry(cellSize / 2, cellSize / 2, cellSize / 2, 32)
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: this.color
        })
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
        this.add(sphere)
        this.position.set(posX * cellSize, posY * cellSize, 0)
        game.bottle.fields[posY][posX].allow = false
        game.bottle.fields[posY][posX].color = this.color
        return this
    }

}