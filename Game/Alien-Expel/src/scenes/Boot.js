import Phaser from 'phaser';

export class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        this.load.image('theCursedOnion', 'assets/images/TheCursedOnion.png');

        // Sonidos de botones: se cargan aquí porque el menú aparece antes de LoadScene
        this.load.audio('button', 'assets/audio/button.mp3');
        this.load.audio('button-2', 'assets/audio/button-2.mp3');
        this.load.audio('musica-menu', 'assets/audio/musica-menu.mp3');
    }

    create() {
        this.cameras.main.setBackgroundColor('#ffd966');
        const theCursedOnion = this.add.image(960, 540, 'theCursedOnion');

        this.time.delayedCall(1000, () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('MenuScene');
            });
        });
    }
}
