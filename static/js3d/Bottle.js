console.log("wczytano plik Bottle.js")

class Bottle extends THREE.Object3D {

    constructor(height, width) {

        super()

        this.width = width
        this.height = height

        this.fields = []
        let row = []

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (i == height - 1 && j == width / 2 + 2) {
                    for (let l = i + 1; l < i + 4; l++)
                        this.fields.push(new Frame(l, j))
                    this.fields.push(new Frame(i + 3, j + 1))
                }
                else if (i == height - 1 && j == width / 2 - 3) {
                    for (let l = i + 1; l < i + 4; l++)
                        this.fields.push(new Frame(l, j))
                    this.fields.push(new Frame(i + 3, j - 1))
                }
                if (j == 0 || j == width - 1 || i == 0 || (i == height - 1 && (j > (width / 2) + 1 || j < (width / 2) - 2)))
                    this.fields.push(new Frame(i, j))
                else
                    this.fields.push(new Field(i, j))
            }
        }
        this.fields.forEach(element => {
            this.add(element)
        })
        this.position.x -= 80

        return (this)

    }

}