import Phaser from 'phaser';
import { BotonesUI } from '../utils/BotonesUI.js'

export class CreditScene extends Phaser.Scene {
    constructor() {
        super('CreditScene');
    }

    create() {
        const background = this.add.image(960, 540, 'background');
        background.setDisplaySize(1920, 1080);

        this.add.text(960, 50, 'CREDITS', {
            fontSize: '120px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#8fcf35',
            align: 'center',
        }).setOrigin(0.5, 0);

        const creditos = [
            { rol: 'PROGRAMMER', nombres: 'Álvaro Cardos Serrano\nAlejandro Miguel Cumplido Alastuey\nDaniel Delgado Pérez\nEstanislao de Koska Castrillón Román'},
            { rol: 'ART', nombres: 'Alejandro Miguel Cumplido Alastuey' },
            { rol: 'DESIGN', nombres: 'Estanislao de Koska Castrillón Román' },
            { rol: 'MUSIC', nombres: 'Daniel Delgado Pérez' }
        ];

        let posY = 250;

        creditos.forEach((seccion) => {
            this.add.text(960, posY, seccion.rol, {
                fontSize: '40px',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                color: '#569ae2'
            }).setOrigin(0.5, 0);

            const textoNombres = this.add.text(960, posY + 50, seccion.nombres, {
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#ffffff',
                align: 'center',
                lineSpacing: 8
            }).setOrigin(0.5, 0);

            posY += 50 + textoNombres.height + 40;
        });

        BotonesUI.crearBotonRectangular(this, 960, 950, 'VOLVER', () => {
            this.scene.start('MenuScene');
        }, { colorBorde: 0x884adf });
    }
}
// 569ae2, 8fcf35, 884adf