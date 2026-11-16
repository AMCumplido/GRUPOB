import Phaser from 'phaser';

export class LoadScene extends Phaser.Scene {
    constructor() {
        super('LoadScene');
    }

    init(data) {
        // Recibe la escena destino; si no se envía ninguna, va a MenuScene por defecto
        this.siguienteEscena = data.siguienteEscena || 'MenuScene';
    }

    preload() {
        // 1. Dibujar el marco y la barra de carga en el centro (960, 540)
        const anchoBarra = 600;
        const altoBarra = 40;
        const x = 960 - anchoBarra / 2;
        const y = 540;

        const borde = this.add.graphics();
        borde.lineStyle(4, 0x76ff03, 1);
        borde.strokeRect(x, y, anchoBarra, altoBarra);

        this.relleno = this.add.graphics();

        this.textoCarga = this.add.text(960, y - 50, 'CARGANDO... 0%', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 2. Actualizar la barra conforme se cargan los archivos reales
        this.load.on('progress', (valor) => {
            this.relleno.clear();
            this.relleno.fillStyle(0x76ff03, 1);
            this.relleno.fillRect(x + 6, y + 6, (anchoBarra - 12) * valor, altoBarra - 12);
            this.textoCarga.setText(`CARGANDO... ${Math.round(valor * 100)}%`);
        });

        // 3. Cargar los assets (solo se descargan la primera vez; luego Phaser usa la caché)
        this.load.image('background', 'assets/images/BackgroundMenuScene.png');
        this.load.image('logotype', 'assets/images/Logotype.png');
        // Añade aquí sprites, sonidos, etc. de GameScene
    }

    create() {
        const anchoBarra = 600;
        const altoBarra = 40;
        const x = 960 - anchoBarra / 2;
        const y = 540;

        // Si los archivos ya estaban en caché (por ejemplo al venir desde MenuScene),
        // simulamos el llenado de la barra de 0% a 100% en 1 segundo para que se vea la transición
        const progreso = { valor: 0 };

        this.tweens.add({
            targets: progreso,
            valor: 1,
            duration: 1000,
            ease: 'Power1',
            onUpdate: () => {
                this.relleno.clear();
                this.relleno.fillStyle(0x76ff03, 1);
                this.relleno.fillRect(x + 6, y + 6, (anchoBarra - 12) * progreso.valor, altoBarra - 12);
                this.textoCarga.setText(`CARGANDO... ${Math.round(progreso.valor * 100)}%`);
            },
            onComplete: () => {
                // Aquí usamos la variable dinámica en lugar de 'MenuScene' fijo
                this.scene.start(this.siguienteEscena);
            }
        });
    }
}