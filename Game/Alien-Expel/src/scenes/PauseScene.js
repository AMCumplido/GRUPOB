import Phaser from 'phaser';
import { BotonesUI } from '../utils/BotonesUI.js';
import { Sonidos } from '../utils/Sonidos.js';

export class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    init(data) {
        this.saltarAnimacion = data?.saltarAnimacion || false;
    }

    create() {
        this.scene.bringToTop();

        // Música: se pausa la de la partida y suena la del menú
        Sonidos.pausarMusica('musica-juego');
        Sonidos.pausarMusica('musica-timeout');
        Sonidos.reproducirMusica(this, 'musica-menu');

        // Al continuar: fuera la del menú y la de la partida sigue donde se quedó
        const volverAMusicaDeJuego = () => {
            Sonidos.pararMusica('musica-menu');
            Sonidos.reanudarMusica('musica-juego');
            Sonidos.reanudarMusica('musica-timeout');
        };

        const gameScene = this.scene.get('GameScene');
        let efectoBlur = null;
        if (gameScene?.cameras?.main?.postFX) {
            efectoBlur = gameScene.cameras.main.postFX.addBlur(1, 2, 2, 1.5);
        }

        const overlay = this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0)
            .setInteractive();

        if (!this.saltarAnimacion) {
            this.tweens.add({
                targets: overlay,
                fillAlpha: 0.7,
                duration: 250
            });
        }

        const limpiarBlur = () => {
            if (efectoBlur && gameScene && gameScene.cameras.main.postFX) {
                gameScene.cameras.main.postFX.remove(efectoBlur);
            }
        };

        const titulo = this.add.text(960, 220, 'PAUSA', {
            fontSize: '100px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#8fcf35'
        }).setOrigin(0.5);

        const btnOptions = BotonesUI.crearBotonRectangular(this, 960, 460, 'OPCIONES', () => {
            limpiarBlur();
            this.scene.setVisible(false, 'GameScene');
            this.scene.setVisible(false, 'HUDScene');
            this.scene.start('SetingsScene', { escenaAnterior: 'PauseScene' });
        }, { sonido: 'button' });

        const btnMenu = BotonesUI.crearBotonRectangular(this, 960, 620, 'VOLVER INICIO', () => {
            limpiarBlur();
            this.scene.stop('GameScene');
            this.scene.stop('HUDScene');
            this.scene.start('MenuScene');
        }, { sonido: 'button' });

        const btnResume = BotonesUI.crearBotonRectangular(this, 960, 780, 'CONTINUAR', () => {
            limpiarBlur();
            volverAMusicaDeJuego();
            this.scene.resume('GameScene');
            this.scene.resume('HUDScene');
            this.scene.stop();
        }, { colorBorde: 0x884adf, sonido: 'button' });

        const elementosAnimar = [
            titulo,
            btnOptions.fondo, btnOptions.etiqueta,
            btnMenu.fondo, btnMenu.etiqueta,
            btnResume.fondo, btnResume.etiqueta
        ];

        if (this.saltarAnimacion) {
            overlay.fillAlpha = 0.7;
            elementosAnimar.forEach(el => el.setScale(1));
        } else {
            elementosAnimar.forEach(el => el.setScale(0));
            this.tweens.add({
                targets: elementosAnimar,
                scale: 1,
                duration: 350,
                ease: 'Back.easeOut'
            });
        }

        this.time.delayedCall(150, () => {
            this.input.keyboard.once('keydown-ESC', () => {
                limpiarBlur();
                volverAMusicaDeJuego();
                this.scene.resume('GameScene');
                this.scene.resume('HUDScene');
                this.scene.stop();
            });
        });

    }
}