console.log("wczytano plik Bottle.js")

class Bottle extends THREE.Object3D {

    constructor(height, width) {

        super()

        this.fields = []
        let row

        for(let i = 0; i < height; i++) {
            row = []
            for(let j = 0; j < width; j++) {
                if(i == height - 1 && j == width / 2 + 2) {
                    for(let l = i + 1; l < i + 4; l++)
                        this.add(new Frame(l, j))
                    this.add(new Frame(i + 3, j + 1))
                }
                else if(i == height - 1 && j == width / 2 - 3) {
                    for(let l = i + 1; l < i + 4; l++)
                        this.add(new Frame(l, j))
                    this.add(new Frame(i + 3, j - 1))
                }
                if(j == 0 || j == width - 1 || i == 0 || (i == height - 1 && (j > (width / 2) + 1 || j < (width / 2) - 2)))
                    row.push(new Frame(i, j))
                else
                    row.push(new Field(i, j))
            }
            this.fields.push(row)
        }
        row = []
        for(let j = width / 2 - 2; j < width / 2 + 2; j++) {
            row.push(new Field(height, j))
        }
        this.fields.push(row)
        console.log(this.fields)
        this.fields.forEach(row => {
            row.forEach(element => {
                this.add(element)
            })
        })
        this.position.x -= 80

        return (this)

    }

}