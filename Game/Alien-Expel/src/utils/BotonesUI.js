import { Sonidos } from './Sonidos.js';

export class BotonesUI {
    /**
     * opciones.sonido: clave del sonido al pulsar.
     *   'button-2' (por defecto) = menú principal
     *   'button'                 = menús dentro de la partida
     *   null                     = sin sonido
     * opciones.duracionSonido: ms que suena el clic (null = archivo entero)
     */
    static crearBotonRectangular(scene, x, y, texto, accion, opciones = {}) {
        const {
            colorBorde = 0x8fcf35,
            colorFondo = 0x111122,
            colorTexto = '#ffffff',
            colorTextoHover = '#111122',
            ancho = 420,
            alto = 100,
            sonido = 'button-2',
            duracionSonido = null
        } = opciones;

        const fondo = scene.add.rectangle(x, y, ancho, alto, colorFondo, 0.85)
            .setStrokeStyle(4, colorBorde)
            .setInteractive({useHandCursor: true});

        const etiqueta = scene.add.text(x, y, texto, {
            fontSize: '36px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: colorTexto
        }).setOrigin(0.5);

        fondo.on('pointerover', () => {
            fondo.setFillStyle(colorBorde, 1);
            etiqueta.setColor(colorTextoHover);
        });

        fondo.on('pointerout', () => {
            fondo.setFillStyle(colorFondo, 0.85);
            etiqueta.setColor(colorTexto);
        });

        fondo.on('pointerdown', (...args) => {
            Sonidos.reproducir(scene, sonido, { duracion: duracionSonido });
            accion(...args);
        });

        return {fondo, etiqueta};
    }

    static crearBotonCircular(scene, x, y, texto, accion, radio = 100, colorBorde = 0x8fcf35, sonido = 'button-2', duracionSonido = null) {
        const fondo = scene.add.circle(x, y, radio, 0x111122, 0.85)
            .setStrokeStyle(4, colorBorde)
            .setInteractive({ useHandCursor: true });

        const etiqueta = scene.add.text(x, y, texto, {
            fontSize: '25px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        fondo.on('pointerover', () => {
            fondo.setFillStyle(colorBorde, 1);
            etiqueta.setColor('#111122');
        });

        fondo.on('pointerout', () => {
            fondo.setFillStyle(0x111122, 0.85);
            etiqueta.setColor('#ffffff');
        });

        fondo.on('pointerdown', (...args) => {
            Sonidos.reproducir(scene, sonido, { duracion: duracionSonido });
            accion(...args);
        });

        return { fondo, etiqueta };
    }
}
