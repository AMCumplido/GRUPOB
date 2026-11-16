import Phaser from 'phaser';
export class LoadScene extends Phaser.Scene {
    constructor() {
        super('LoadScene');
    }

    init(data) {
        this.siguienteEscena = data.siguienteEscena || 'MenuScene';
    }

    preload() {
        this.load.image('background', 'assets/images/BackgroundMenuScene.png')
        // --- 1. CONFIGURACIÓN DE LA BARRA DE CARGA (Esquina inferior izquierda) ---
        this.anchoBarra = 600;
        this.altoBarra = 40;
        const margen = 60;

        this.barraX = margen;
        this.barraY = 1080 - margen - this.altoBarra;

        const borde = this.add.graphics();
        borde.lineStyle(4, 0x76ff03, 1);
        borde.strokeRect(this.barraX, this.barraY, this.anchoBarra, this.altoBarra);

        this.relleno = this.add.graphics();

        this.textoCarga = this.add.text(this.barraX, this.barraY - 35, 'CARGANDO... 0%', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        this.load.on('progress', (valor) => {
            this.relleno.clear();
            this.relleno.fillStyle(0x76ff03, 1);
            this.relleno.fillRect(this.barraX + 6, this.barraY + 6, (this.anchoBarra - 12) * valor, this.altoBarra - 12);
            this.textoCarga.setText(`CARGANDO... ${Math.round(valor * 100)}%`);
        });

        // --- 2. CARGA DEL JSON Y SELECCIÓN ALEATORIA ---
        this.load.json('tipsCarga', 'assets/data/load.json');

        // Cuando el JSON termina de leerse, elegimos un consejo al azar y cargamos su imagen
        this.load.once('filecomplete-json-tipsCarga', () => {
            const listaTips = this.cache.json.get('tipsCarga');

            // Phaser.Utils.Array.GetRandom elige un elemento al azar del array
            this.tipSeleccionado = Phaser.Utils.Array.GetRandom(listaTips);

            // Ponemos en cola la imagen correspondiente a ese consejo
            this.load.image(this.tipSeleccionado.imagenKey, this.tipSeleccionado.rutaImagen);

            // En cuanto esa imagen específica esté lista, la dibujamos en pantalla
            this.load.once(`filecomplete-image-${this.tipSeleccionado.imagenKey}`, () => {
                this.mostrarTipEnPantalla();
            });
        });

        // --- 3. CARGA DEL RESTO DE ASSETS DEL JUEGO ---
        this.load.image('background', 'assets/images/BackgroundMenuScene.png');
        this.load.image('logotype', 'assets/images/Logotype.png');
    }

    mostrarTipEnPantalla() {
        if (!this.tipSeleccionado) return;

        // Imagen en la esquina superior derecha (ajusta x, y y escala según el tamaño de tus dibujos)
        const imgTip = this.add.image(1100, 300, this.tipSeleccionado.imagenKey).setOrigin(0, 0);
        imgTip.setScale(0.7);

        // Título del consejo en la parte superior central/derecha
        this.add.text(960, 120, this.tipSeleccionado.titulo, {
            fontSize: '42px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#76ff03'
        }).setOrigin(0.5, 0);

        // Texto descriptivo justo debajo del título con salto de línea automático (wordWrap)
        this.add.text(960, 185, this.tipSeleccionado.texto, {
            fontSize: '30px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 900 }
        }).setOrigin(0.5, 0);
    }

    create() {
        const background = this.add.image(960, 540, 'background');
        background.setDisplaySize(1920, 1080);
        background.setDepth(-1);
        // Si los archivos ya estaban en caché (segunda vez que entras a LoadScene),
        // nos aseguramos de elegir y mostrar un consejo nuevo igualmente
        if (!this.tipSeleccionado && this.cache.json.exists('tipsCarga')) {
            const listaTips = this.cache.json.get('tipsCarga');
            this.tipSeleccionado = Phaser.Utils.Array.GetRandom(listaTips);
            this.mostrarTipEnPantalla();
        }

        // Animación de transición de 1 segundo
        const progreso = { valor: 0 };

        this.tweens.add({
            targets: progreso,
            valor: 1,
            duration: 1000,
            ease: 'Power1',
            onUpdate: () => {
                this.relleno.clear();
                this.relleno.fillStyle(0x76ff03, 1);
                this.relleno.fillRect(this.barraX + 6, this.barraY + 6, (this.anchoBarra - 12) * progreso.valor, this.altoBarra - 12);
                this.textoCarga.setText(`CARGANDO... ${Math.round(progreso.valor * 100)}%`);
            },
            onComplete: () => {
                this.scene.start(this.siguienteEscena);
            }
        });
    }
}
