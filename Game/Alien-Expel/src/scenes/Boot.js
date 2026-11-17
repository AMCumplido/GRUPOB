import Phaser from 'phaser';

export class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        this.load.image('theCursedOnion', 'assets/images/TheCursedOnion.png');
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