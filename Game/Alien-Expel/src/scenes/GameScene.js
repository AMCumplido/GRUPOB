import Phaser from 'phaser';
import { Paddle } from '../entities/Paddle';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init() {
        this.players = new Map();
        this.inputMappings = [];
    }

    preload() {
        //Se hacen en LoadScene
    }

    create() {
        const offsetY = 110;

        const map = this.make.tilemap({ key: 'mapa1' });
        const tileset = map.addTilesetImage('tileset_escenario1', 'tiles_escenario1');

        const capaSuelo = map.createLayer('Suelo', tileset, 0, offsetY);
        const capaMuros = map.createLayer('Muros', tileset, 0, offsetY);
        const capaDecoracion = map.createLayer('Decoracion', tileset, 0, offsetY);

        capaMuros.setCollisionByProperty({ collides: true });

        this.scene.launch('HUDScene');

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause('HUDScene');
            this.scene.pause('GameScene');
            this.scene.launch('PauseScene');
            this.scene.bringToTop('PauseScene');
        });
    }
}
