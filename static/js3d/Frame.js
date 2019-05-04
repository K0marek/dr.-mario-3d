console.log("wczytano plik Frame.js")

class Frame extends THREE.Mesh {

    constructor(posY, posX) {

        super()

        const { cellSize } = settings

        this.geometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize, 1, 1, 1)
        this.material = new THREE.MeshBasicMaterial({
            color: 0x0ffff0
        })
        this.position.y = posY * cellSize
        this.position.x = posX * cellSize
        this.posX = posX
        this.posY = posY
        this.allow = false

        return this

    }

}