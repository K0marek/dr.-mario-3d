class Ui {

    constructor() {
        console.log('konstruktor klasy Ui')
    }

    //sterowanie w grze
    controls = () => {
        $(document).on('keydown', e => {
            switch (e.keyCode) {
                case 90:
                    game.pill.container.rotation.z += Math.PI / 2
                    break
                case 88:
                    game.pill.container.rotation.z -= Math.PI / 2
                    break
                case 37:
                    game.pill.container.position.x -= 20
                    break
                case 39:
                    game.pill.container.position.x += 20
                    break
            }
        })
    }

    //usunięcie sterowania po wygranej
}