console.log("wczytano plik Bottle.js")

class Bottle {

    constructor(height, width) {

        this.container = new THREE.Object3D
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (i == height - 1 && j == width / 2 + 2) {
                    for (let l = i + 1; l < i + 4; l++)
                        this.container.add(new Frame(l, j))
                    this.container.add(new Frame(i + 3, j + 1))
                }
                else if (i == height - 1 && j == width / 2 - 3) {
                    for (let l = i + 1; l < i + 4; l++)
                        this.container.add(new Frame(l, j))
                    this.container.add(new Frame(i + 3, j - 1))
                }
                if (j == 0 || j == width - 1 || i == 0 || (i == height - 1 && (j > (width / 2) + 1 || j < (width / 2) - 2)))
                    this.container.add(new Frame(i, j))
                else
                    this.container.add(new Field(i, j))
            }
        }
        this.container.position.x -= 80

        return (this.container)

    }

}