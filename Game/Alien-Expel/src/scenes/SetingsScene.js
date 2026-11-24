import Phaser from 'phaser';
import { BotonesUI } from '../utils/BotonesUI.js'

export class SetingsScene extends Phaser.Scene {
    constructor() {
        super('SetingsScene');
    }

    init(data) {
        this.escenaAnterior = (data && data.escenaAnterior) ? data.escenaAnterior : null;
    }
    create() {
        const background = this.add.image(960, 540, 'background');
        background.setDisplaySize(1920, 1080);

        this.add.text(960, 50, 'OPCIONES', {
            fontSize: '120px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#8fcf35',
            align: 'center',
        }).setOrigin(0.5, 0);

        this.add.text(960, 250, 'SONIDO', {
            fontSize: '40px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#569ae2'
        }).setOrigin(0.5, 0);

        this.crearSliderSonido(960, 360, 500);

        // Si venimos de la pausa estamos "dentro de la partida" -> 'button'; si no, menú principal -> 'button-2'
        const sonidoBoton = this.escenaAnterior === 'PauseScene' ? 'button' : 'button-2';

        BotonesUI.crearBotonRectangular(this, 960, 950, 'VOLVER', () => {
            if (this.escenaAnterior === 'PauseScene') {
                this.escenaAnterior = null;
                this.scene.setVisible(true, 'GameScene');
                this.scene.setVisible(true, 'HUDScene');
                this.scene.start('PauseScene', { saltarAnimacion: true });
            } else {
                this.escenaAnterior = null;
                this.scene.start('MenuScene');
            }
        }, { colorBorde: 0x884adf, sonido: sonidoBoton });
    }

    crearSliderSonido(x, y, ancho) {
        const altoBarra = 16;
        const minX = x - ancho / 2;
        const maxX = x + ancho / 2;
        const volumenActual = this.sound.volume;

        const barraFondo = this.add.rectangle(x, y, ancho, altoBarra, 0x111122, 0.9)
            .setStrokeStyle(3, 0x884adf)
            .setInteractive({ useHandCursor: true });

        const barraRelleno = this.add.rectangle(minX, y, ancho * volumenActual, altoBarra, 0x8fcf35)
            .setOrigin(0, 0.5);

        const textoPorcentaje = this.add.text(x, y - 45, `${Math.round(volumenActual * 100)}%`, {
            fontSize: '32px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        const tirador = this.add.circle(minX + ancho * volumenActual, y, 22, 0x8fcf35)
            .setStrokeStyle(4, 0xffffff)
            .setInteractive({ useHandCursor: true, draggable: true });

        const actualizarVolumen = (nuevaPosX) => {
            const posXClamped = Phaser.Math.Clamp(nuevaPosX, minX, maxX);
            tirador.x = posXClamped;

            const nuevoVolumen = (posXClamped - minX) / ancho;

            this.sound.volume = nuevoVolumen;

            barraRelleno.width = ancho * nuevoVolumen;
            textoPorcentaje.setText(`${Math.round(nuevoVolumen * 100)}%`);
        };

        this.input.on('drag', (pointer, gameObject, dragX) => {
            if (gameObject === tirador) {
                actualizarVolumen(dragX);
            }
        });

        barraFondo.on('pointerdown', (pointer) => {
            actualizarVolumen(pointer.x);
        });
    }
}
