import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        // Load assets
        this.load.image('background', 'assets/images/BackgroundMenuScene.png')
        this.load.image('logotype', 'assets/images/Logotype.png')
    }

    create() {
        // Fondo centrado en el lienzo de 1920x1080
        const background = this.add.image(960, 540, 'background');
        background.setDisplaySize(1920, 1080);
        background.setDepth(-1);

        // Logo guardado en una variable para poder escalarlo
        const logotype = this.add.image(960, 250, 'logotype');
        logotype.setScale(0.4);

        // Botones rectangulares (x, y, texto, acción al hacer clic)
        this.crearBoton(960, 620, 'LOCAL PLAY', () => {
            this.scene.start('LoadScene', { siguienteEscena: 'GameScene' });
        });

        this.crearBoton(960, 760, 'OPTIONS', () => {
            console.log('HelpScene');
        });

        this.crearBoton(960, 900, 'CREDITS', () => {
            console.log('CreditsScene');
        });

        this.crearBotonCircular(1800, 950, 'HOW TO PLAY?', () => {
            console.log('CreditsScene');
        });
    }

    crearBoton(x, y, texto, accion) {
        // Rectángulo de 420x100 px con fondo oscuro y borde verde neón
        const fondo = this.add.rectangle(x, y, 420, 100, 0x111122, 0.85)
            .setStrokeStyle(4, 0x76ff03)
            .setInteractive({ useHandCursor: true });

        // Texto centrado encima del rectángulo
        const etiqueta = this.add.text(x, y, texto, {
            fontSize: '36px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Efectos al pasar el ratón por encima
        fondo.on('pointerover', () => {
            fondo.setFillStyle(0x76ff03, 1);
            etiqueta.setColor('#111122');
        });

        fondo.on('pointerout', () => {
            fondo.setFillStyle(0x111122, 0.85);
            etiqueta.setColor('#ffffff');
        });

        // Acción al pulsar
        fondo.on('pointerdown', accion);
    }
    crearBotonCircular(x, y, texto, accion) {
        // Rectángulo de 420x100 px con fondo oscuro y borde verde neón
        const fondo = this.add.circle(x, y, 100, 0x111122, 0.85)
            .setStrokeStyle(4, 0x76ff03)
            .setInteractive({ useHandCursor: true });

        // Texto centrado encima del círculo
        const etiqueta = this.add.text(x, y, texto, {
            fontSize: '25px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Efectos al pasar el ratón por encima
        fondo.on('pointerover', () => {
            fondo.setFillStyle(0x76ff03, 1);
            etiqueta.setColor('#111122');
        });

        fondo.on('pointerout', () => {
            fondo.setFillStyle(0x111122, 0.85);
            etiqueta.setColor('#ffffff');
        });

        // Acción al pulsar
        fondo.on('pointerdown', accion);
    }
}
