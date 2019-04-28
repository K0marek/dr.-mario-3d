console.log("wczytano plik Field.js")

class Field {

    constructor(posY, posX) {
        console.log(posY, posX)

        const { cellSize } = settings

        this.container = new THREE.Object3D

        this.geometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize)
        this.edges = new THREE.EdgesGeometry(this.geometry)
        this.line = new THREE.LineSegments(this.edges, new THREE.LineBasicMaterial({
            color: 0xafabfb
        }))
        this.container.position.y = posY * cellSize
        this.container.position.x = posX * cellSize
        this.container.posX = posX
        this.container.posY = posY
        this.container.allow = true
        this.container.add(this.line)

        return (this.container)

    }

}