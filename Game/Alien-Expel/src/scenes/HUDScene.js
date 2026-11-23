import Phaser from 'phaser';
import { BotonesUI } from '../utils/BotonesUI.js';

export class HUDScene extends Phaser.Scene {
    constructor() {
        super('HUDScene');
    }

    create() {
        this.add.rectangle(960, 55, 1920, 110, 0x111122, 0.95)
            .setStrokeStyle(3, 0x884adf);

        this.add.text(60, 22, 'VITALIDAD HÉROE', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#8fcf35'
        });

        this.anchoStamina = 400;
        this.add.rectangle(60, 65, this.anchoStamina, 28, 0x222233)
            .setOrigin(0, 0.5)
            .setStrokeStyle(2, 0xffffff);

        this.barraStamina = this.add.rectangle(62, 65, this.anchoStamina - 4, 24, 0x8fcf35)
            .setOrigin(0, 0.5);

        const gameScene = this.scene.get('GameScene');
        gameScene.events.on('actualizarStamina', (porcentaje) => {
            this.barraStamina.width = (this.anchoStamina - 4) * Phaser.Math.Clamp(porcentaje, 0, 1);
        });

        this.tiempoRestante = 180;

        this.textoTiempo = this.add.text(960, 55, '03:00', {
            fontSize: '52px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.time.addEvent({
            delay: 1000,
            callback: this.actualizarReloj,
            callbackScope: this,
            loop: true
        });

        BotonesUI.crearBotonCircular(this, 1840, 55, 'II', () => {
            this.scene.pause('GameScene');
            this.scene.pause();
            this.scene.launch('PauseScene');
            this.scene.bringToTop('PauseScene');
        }, 100 , 0x8fcf35);
    }

    actualizarReloj() {
        this.tiempoRestante--;

        if (this.tiempoRestante <= 0) {
            this.tiempoRestante = 0;
            this.textoTiempo.setText('00:00');

            // Congelamos la partida y el HUD detrás, y superponemos GameOverScene
            this.scene.pause('GameScene');
            this.scene.pause('HUDScene');
            this.scene.launch('GameOverScene', { ganador: 'JUGADOR 2' });
            this.scene.bringToTop('GameOverScene');
            return;
        }

        const minutos = Math.floor(this.tiempoRestante / 60);
        const segundos = this.tiempoRestante % 60;
        this.textoTiempo.setText(`${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`);

        if (this.tiempoRestante <= 30) {
            this.textoTiempo.setColor('#ff4444');
        }
    }
}
