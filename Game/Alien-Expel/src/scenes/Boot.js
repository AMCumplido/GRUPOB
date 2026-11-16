import Phaser from 'phaser';

export class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Load assets
        this.load.image('theCursedOnion', 'assets/images/TheCursedOnion.png');
    }

    create() {
        this.cameras.main.setBackgroundColor('#ffd966');
        const theCursedOnion = this.add.image(960, 540, 'theCursedOnion');

        // 1. Esperar 3000 milisegundos (1 segundos)
        this.time.delayedCall(1000, () => {

            // 2. Iniciar el fundido a negro durante 1000 ms (1 segundo)
            // Los tres ceros finales (0, 0, 0) indican color negro RGB
            this.cameras.main.fadeOut(1000, 0, 0, 0);

            // 3. Escuchar cuando termine el fundido para cambiar a MenuScene
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('MenuScene');
            });
        });
    }
}