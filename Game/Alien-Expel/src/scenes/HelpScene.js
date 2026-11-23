import Phaser from 'phaser';
import { BotonesUI } from '../utils/BotonesUI.js';

export class HelpScene extends Phaser.Scene {
    constructor() {
        super('HelpScene');
    }

    preload() {
        this.load.image('info', 'assets/images/Info.png');
    }

    create() {
        const menuScene = this.scene.get('MenuScene');
        let efectoBlur = null;
        if (menuScene && menuScene.cameras && menuScene.cameras.main.postFX) {
            efectoBlur = menuScene.cameras.main.postFX.addBlur(1, 2, 2, 1.5);
        }

        const overlay = this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0)
            .setInteractive();

        this.tweens.add({
            targets: overlay,
            fillAlpha: 0.7,
            duration: 250
        });

        const imagenAyuda = this.add.image(960, 480, 'info').setScale(0);

        const btnVolver = BotonesUI.crearBotonRectangular(this, 960, 950, 'VOLVER', () => {
            if (efectoBlur && menuScene.cameras.main.postFX) {
                menuScene.cameras.main.postFX.remove(efectoBlur);
            }
            this.scene.stop();
            this.scene.resume('MenuScene');
        }, { colorBorde: 0x884adf });

        btnVolver.fondo.setAlpha(0).disableInteractive();
        btnVolver.etiqueta.setAlpha(0);

        this.tweens.add({
            targets: imagenAyuda,
            scale: 0.85,
            duration: 400,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: [btnVolver.fondo, btnVolver.etiqueta],
                    alpha: 1,
                    duration: 200,
                    onComplete: () => {
                        btnVolver.fondo.setInteractive({ useHandCursor: true });
                    }
                });
            }
        });
    }
}
