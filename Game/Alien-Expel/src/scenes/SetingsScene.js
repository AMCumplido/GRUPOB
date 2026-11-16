import Phaser from 'phaser';

export class SetingsScene extends Phaser.Scene {
    constructor() {
        super('SetingsScene');
    }

    create() {
        const background = this.add.image(960, 540, 'background');
        background.setDisplaySize(1920, 1080);

        this.add.text(960, 50, 'OPTIONS', {
            fontSize: '120px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#8fcf35',
            align: 'center',
        }).setOrigin(0.5, 0);

        this.add.text(960, 250, 'SOUND', {
            fontSize: '40px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#569ae2'
        }).setOrigin(0.5, 0);

        this.crearSliderSonido(960, 360, 500);

        this.crearBoton(960, 950, 'VOLVER', () => {
            this.scene.start('MenuScene');
        });
    }

    crearSliderSonido(x, y, ancho) {
        const altoBarra = 16;
        const minX = x - ancho / 2;
        const maxX = x + ancho / 2;

        // Leemos el volumen actual del juego (por defecto es 1, es decir, 100%)
        const volumenActual = this.sound.volume;

        // 1. Barra de fondo oscura
        const barraFondo = this.add.rectangle(x, y, ancho, altoBarra, 0x111122, 0.9)
            .setStrokeStyle(3, 0x884adf)
            .setInteractive({ useHandCursor: true });

        // 2. Barra de relleno verde que crece hasta donde esté el tirador
        const barraRelleno = this.add.rectangle(minX, y, ancho * volumenActual, altoBarra, 0x8fcf35)
            .setOrigin(0, 0.5);

        // 3. Texto con el porcentaje en tiempo real
        const textoPorcentaje = this.add.text(x, y - 45, `${Math.round(volumenActual * 100)}%`, {
            fontSize: '32px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 4. Tirador (círculo arrastrable)
        const tirador = this.add.circle(minX + ancho * volumenActual, y, 22, 0x8fcf35)
            .setStrokeStyle(4, 0xffffff)
            .setInteractive({ useHandCursor: true, draggable: true });

        // Función interna para actualizar volumen, barra y texto a la vez
        const actualizarVolumen = (nuevaPosX) => {
            // Limitamos el movimiento para que no se salga de los bordes de la barra
            const posXClamped = Phaser.Math.Clamp(nuevaPosX, minX, maxX);
            tirador.x = posXClamped;

            // Calculamos valor entre 0.0 y 1.0
            const nuevoVolumen = (posXClamped - minX) / ancho;

            // Aplicamos el volumen global a TODO el juego
            this.sound.volume = nuevoVolumen;

            // Actualizamos relleno visual y texto
            barraRelleno.width = ancho * nuevoVolumen;
            textoPorcentaje.setText(`${Math.round(nuevoVolumen * 100)}%`);
        };

        // Evento al arrastrar el círculo con el ratón
        this.input.on('drag', (pointer, gameObject, dragX) => {
            if (gameObject === tirador) {
                actualizarVolumen(dragX);
            }
        });

        // Extra cómodo: permitir hacer clic directo en cualquier punto de la barra para saltar ahí
        barraFondo.on('pointerdown', (pointer) => {
            actualizarVolumen(pointer.x);
        });


        this.crearBoton(960, 950, 'VOLVER', () => {
            this.scene.start('MenuScene');
        });
    }

    crearBoton(x, y, texto, accion)
    {
        const fondo = this.add.rectangle(x, y, 420, 100, 0x111122, 0.85)
            .setStrokeStyle(4, 0x884adf)
            .setInteractive({useHandCursor: true});

        const etiqueta = this.add.text(x, y, texto, {
            fontSize: '36px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        fondo.on('pointerover', () => {
            fondo.setFillStyle(0x884adf, 1);
            etiqueta.setColor('#111122');
        });

        fondo.on('pointerout', () => {
            fondo.setFillStyle(0x111122, 0.85);
            etiqueta.setColor('#ffffff');
        });

        fondo.on('pointerdown', accion);
    }
}
