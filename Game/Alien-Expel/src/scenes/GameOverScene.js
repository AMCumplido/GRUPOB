import Phaser from 'phaser';
import { BotonesUI } from '../utils/BotonesUI.js';

export class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.ganador = data?.ganador || 'JUGADOR 2';
    }

    create() {
        this.scene.bringToTop();

        const gameScene = this.scene.get('GameScene');
        const hudScene = this.scene.get('HUDScene');
        let efectoBlurGame = null;
        let efectoBlurHUD = null;

        if (gameScene?.cameras?.main?.postFX) {
            efectoBlurGame = gameScene.cameras.main.postFX.addBlur(1, 2, 2, 1.5);
        }
        if (hudScene?.cameras?.main?.postFX) {
            efectoBlurHUD = hudScene.cameras.main.postFX.addBlur(1, 2, 2, 1.5);
        }

        const limpiarBlur = () => {
            if (efectoBlurGame && gameScene?.cameras?.main?.postFX) {
                gameScene.cameras.main.postFX.remove(efectoBlurGame);
            }
            if (efectoBlurHUD && hudScene?.cameras?.main?.postFX) {
                hudScene.cameras.main.postFX.remove(efectoBlurHUD);
            }
        };

        const overlay = this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0)
            .setInteractive();

        this.tweens.add({
            targets: overlay,
            fillAlpha: 0.75,
            duration: 250
        });

        const titulo = this.add.text(960, 260, 'FIN DE LA PARTIDA', {
            fontSize: '95px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        const colorGanador = (this.ganador === 'JUGADOR 1') ? '#569ae2' : '#8fcf35';

        const textoGanador = this.add.text(960, 410, `GANADOR: ${this.ganador}`, {
            fontSize: '64px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: colorGanador
        }).setOrigin(0.5);

        const btnRejugar = BotonesUI.crearBotonRectangular(this, 960, 620, 'VOLVER A JUGAR', () => {
            limpiarBlur();
            this.scene.stop('HUDScene');
            this.scene.stop();
            this.scene.start('GameScene');
        }, { colorBorde: 0x884adf });

        const btnInicio = BotonesUI.crearBotonRectangular(this, 960, 780, 'VOLVER INICIO', () => {
            limpiarBlur();
            // Limpiamos partida y HUD antes de regresar al menú principal
            this.scene.stop('GameScene');
            this.scene.stop('HUDScene');
            this.scene.start('MenuScene');
        }, { colorBorde: 0x884adf });

        const elementosAnimar = [
            titulo,
            textoGanador,
            btnRejugar.fondo, btnRejugar.etiqueta,
            btnInicio.fondo, btnInicio.etiqueta
        ];

        elementosAnimar.forEach(el => el.setScale(0));

        this.tweens.add({
            targets: elementosAnimar,
            scale: 1,
            duration: 350,
            ease: 'Back.easeOut'
        });
    }
}
