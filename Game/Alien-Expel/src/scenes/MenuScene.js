import Phaser from 'phaser';
import { BotonesUI } from '../utils/BotonesUI.js'

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.image('background', 'assets/images/BackgroundMenuScene.png')
        this.load.image('logotype', 'assets/images/Logotype.png')
    }

    create() {
        const background = this.add.image(960, 540, 'background');
        background.setDisplaySize(1920, 1080);
        background.setDepth(-1);

        const logotype = this.add.image(960, 250, 'logotype');
        logotype.setScale(0.4);

        BotonesUI.crearBotonRectangular(this,960, 620, 'LOCAL PLAY', () => {
            this.scene.start('LoadScene', { siguienteEscena: 'GameScene' });
        });

        BotonesUI.crearBotonRectangular(this,960, 760, 'OPTIONS', () => {
            this.scene.start('SetingsScene');
        });

        BotonesUI.crearBotonRectangular(this,960, 900, 'CREDITS', () => {
            this.scene.start('CreditScene');
        });

        BotonesUI.crearBotonCircular(this,1800, 950, 'HOW TO PLAY?', () => {
            this.scene.pause();
            this.scene.launch('HelpScene');
        });
    }
}
