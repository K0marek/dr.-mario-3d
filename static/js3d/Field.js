console.log("wczytano plik Field.js")

class Field extends THREE.Object3D {

    constructor(posY, posX) {

        super()

        const { cellSize } = settings

        this.geometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize)
        this.edges = new THREE.EdgesGeometry(this.geometry)
        this.line = new THREE.LineSegments(this.edges, new THREE.LineBasicMaterial({
            color: 0xafabfb
        }))
        this.add(this.line)

        this.position.y = posY * cellSize
        this.position.x = posX * cellSize

        this.posX = posX
        this.posY = posY
        this.allow = true
        this.color = "nothing"

        return this

    }

}