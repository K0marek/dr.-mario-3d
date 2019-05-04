console.log("wczytano plik Bottle.js")

class Bottle extends THREE.Object3D {

    constructor(height, width) {

        super()

        this.width = width
        this.height = height

        this.fields = []

        for (let i = 0; i < height; i++) {
            let row = []
            for (let j = 0; j < width; j++) {
                if (i == height - 1 && j == width / 2 + 2) {
                    for (let l = i + 1; l < i + 4; l++)
                        row.push(new Frame(l, j))
                    row.push(new Frame(i + 3, j + 1))
                }
                else if (i == height - 1 && j == width / 2 - 3) {
                    for (let l = i + 1; l < i + 4; l++)
                        row.push(new Frame(l, j))
                    row.push(new Frame(i + 3, j - 1))
                }
                if (j == 0 || j == width - 1 || i == 0 || (i == height - 1 && (j > (width / 2) + 1 || j < (width / 2) - 2)))
                    row.push(new Frame(i, j))
                else
                    row.push(new Field(i, j))
            }
            this.fields.push(row)
        }
        this.fields.forEach(row => {
            row.forEach(element => {
                this.add(element)
            })
        })
        this.position.x -= 80

        return (this)

    }

}