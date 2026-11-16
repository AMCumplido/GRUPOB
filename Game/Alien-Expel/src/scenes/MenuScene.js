import Phaser from 'phaser';

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

        this.crearBoton(960, 620, 'LOCAL PLAY', () => {
            this.scene.start('LoadScene', { siguienteEscena: 'GameScene' });
        });

        this.crearBoton(960, 760, 'OPTIONS', () => {
            this.scene.start('SetingsScene');
        });

        this.crearBoton(960, 900, 'CREDITS', () => {
            this.scene.start('CreditScene');
        });

        this.crearBotonCircular(1800, 950, 'HOW TO PLAY?', () => {
            console.log('CreditsScene');
        });
    }

    crearBoton(x, y, texto, accion) {
        const fondo = this.add.rectangle(x, y, 420, 100, 0x111122, 0.85)
            .setStrokeStyle(4, 0x8fcf35)
            .setInteractive({ useHandCursor: true });

        const etiqueta = this.add.text(x, y, texto, {
            fontSize: '36px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        fondo.on('pointerover', () => {
            fondo.setFillStyle(0x8fcf35, 1);
            etiqueta.setColor('#111122');
        });

        fondo.on('pointerout', () => {
            fondo.setFillStyle(0x111122, 0.85);
            etiqueta.setColor('#ffffff');
        });

        fondo.on('pointerdown', accion);
    }
    crearBotonCircular(x, y, texto, accion) {
        const fondo = this.add.circle(x, y, 100, 0x111122, 0.85)
            .setStrokeStyle(4, 0x8fcf35)
            .setInteractive({ useHandCursor: true });

        const etiqueta = this.add.text(x, y, texto, {
            fontSize: '25px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        fondo.on('pointerover', () => {
            fondo.setFillStyle(0x8fcf35, 1);
            etiqueta.setColor('#111122');
        });

        fondo.on('pointerout', () => {
            fondo.setFillStyle(0x111122, 0.85);
            etiqueta.setColor('#ffffff');
        });

        fondo.on('pointerdown', accion);
    }
}
