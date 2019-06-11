console.log("wczytano plik Virus.js")

class Virus extends THREE.Object3D {
    constructor(posX, posY, color, whichBottle) {
        super()
        // let colors = [0xff0000, 0x0000ff]
        // let random = Math.floor(Math.random() * 2)
        // this.color = colors[random]
        this.posX = posX
        this.posY = posY
        this.color = color

        var loader = new THREE.JSONLoader()
        if (this.color == 255)
            loader.load('models/blueVirus.json', (geometry, materials) => {

                materials.forEach(material => {
                    material.skinning = true
                    material.reflectivity = 0
                    material.shiness = 0
                    material.shininess = 0
                })

                var object = new THREE.SkinnedMesh(geometry, materials)

                object.position.y -= 8
                object.scale.set(4, 4, 4)

                this.add(object)

            })
        else if (this.color == 16711680)
            loader.load('models/redVirus.json', (geometry, materials) => {

                materials.forEach(material => {
                    material.skinning = true
                    material.shiness = 0
                    material.shininess = 0
                })

                var object = new THREE.SkinnedMesh(geometry, materials)

                object.position.y -= 8
                object.scale.set(4, 4, 4)

                this.add(object)

            })
        else if (this.color == 16776960)
            loader.load('models/yellowVirus.json', (geometry, materials) => {

                materials.forEach(material => {
                    material.skinning = true
                    material.shiness = 0
                    material.shininess = 0
                })

                var object = new THREE.SkinnedMesh(geometry, materials)

                object.position.y -= 8
                object.scale.set(4, 4, 4)

                this.add(object)

            })

        const { cellSize } = settings
        // const sphereGeometry = new THREE.SphereGeometry(cellSize / 2, cellSize / 2, cellSize / 2, 32)
        // const sphereMaterial = new THREE.MeshBasicMaterial({
        //     color: this.color
        // })
        // const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
        // this.add(sphere)
        this.position.set(posX * cellSize, posY * cellSize, 0)
        whichBottle.fields[posY][posX].allow = false
        whichBottle.fields[posY][posX].color = this.color
        return this
    }

}