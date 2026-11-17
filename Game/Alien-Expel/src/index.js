import Phaser from 'phaser';
import {Boot} from './scenes/Boot.js';
import { GameScene } from './scenes/GameScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import {HelpScene} from './scenes/HelpScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { LoadScene } from './scenes/LoadScene.js';
import { SetingsScene } from './scenes/SetingsScene.js';
import { CreditScene } from './scenes/CreditScene.js';
import {GameOverScene} from './scenes/GameOverScene.js';
import {HUDScene} from './scenes/HUDScene.js';

const config = {
    type: Phaser.AUTO,      // WebGL if available; otherwise, Canvas
    width: 1920,
    height: 1080,
    scale: {
        mode: Phaser.Scale.FIT,             // Escala el juego para que quepa entero en la ventana
        autoCenter: Phaser.Scale.CENTER_BOTH // Lo centra tanto en horizontal como en vertical
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [Boot, MenuScene, HelpScene, LoadScene, GameScene, SetingsScene, CreditScene, PauseScene, GameOverScene, HUDScene]      // The first scene starts automatically
};

const game = new Phaser.Game(config);
