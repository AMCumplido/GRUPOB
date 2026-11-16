import Phaser from 'phaser';

export class Boot extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Load assets
        this.load.image('theCursedOnion', 'assets/images/TheCursedOnion.png')
    }

    create() {
        this.cameras.main.setBackgroundColor('#ffd966');
        const theCursedOnion = this.add.image(960, 540, 'theCursedOnion');
    }
}