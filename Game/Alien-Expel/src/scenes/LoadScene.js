import Phaser from 'phaser';

export class LoadScene extends Phaser.Scene {
    constructor() {
        super('LoadScene');
    }

    init(data) {
        this.siguienteEscena = data.siguienteEscena || 'MenuScene';
        // Datos que se pasan a la siguiente escena (p. ej. { desdeMenu: true } para GameScene)
        this.datosSiguiente = data.datosSiguiente || {};
        this.tipSeleccionado = null;
    }

    preload() {
        // Para esta escena:
        this.anchoBarra = 600;
        this.altoBarra = 40;
        const margen = 60;

        this.barraX = margen;
        this.barraY = 1080 - margen - this.altoBarra;

        const borde = this.add.graphics();
        borde.lineStyle(4, 0x8fcf35, 1);
        borde.strokeRect(this.barraX, this.barraY, this.anchoBarra, this.altoBarra);

        this.relleno = this.add.graphics();

        this.textoCarga = this.add.text(this.barraX, this.barraY - 35, 'CARGANDO... 0%', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        this.load.on('progress', (valor) => {
            this.relleno.clear();
            this.relleno.fillStyle(0x8fcf35, 1);
            this.relleno.fillRect(this.barraX + 6, this.barraY + 6, (this.anchoBarra - 12) * valor, this.altoBarra - 12);
            this.textoCarga.setText(`CARGANDO... ${Math.round(valor * 100)}%`);
        });

        if (!this.cache.json.exists('tipsCarga')) {
            this.load.json('tipsCarga', 'assets/data/load.json');
            this.load.once('filecomplete-json-tipsCarga', () => {
                const listaTips = this.cache.json.get('tipsCarga');
                listaTips.forEach((tip) => {
                    this.load.image(tip.imagenKey, tip.rutaImagen);
                });
            });
        }

        this.load.image('deco1', 'assets/images/tips/Decorado1.png');
        this.load.image('deco2', 'assets/images/tips/Decorado2.png');
        this.load.image('deco3', 'assets/images/tips/Pensamiento.png');

        //Para el juego:
        this.load.spritesheet('player-hero', 'assets/images/SpritesCharacter/Héroe_1.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('player-alien', 'assets/images/SpritesCharacter/Alien_1.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.tilemapTiledJSON('mapa1', 'assets/maps/mapa_escenario1.json');
        this.load.image('tiles_escenario1', 'assets/maps/tileset_escenario1.png');
        // Sonidos de la partida
        this.load.audio('iniciar-partida', 'assets/audio/iniciar-partida.mp3');
        this.load.audio('activar-rampa', 'assets/audio/activar-rampa.mp3');
        this.load.audio('rampa', 'assets/audio/rampa.mp3');
        this.load.audio('puerta', 'assets/audio/puerta.mp3');
        this.load.audio('ventilacion', 'assets/audio/ventilacion.mp3');
        this.load.audio('recoger-item', 'assets/audio/recoger-item.mp3');
        this.load.audio('victoria', 'assets/audio/victoria.mp3');
        this.load.audio('fin-partida', 'assets/audio/fin-partida.mp3');
        this.load.audio('reloj', 'assets/audio/reloj.mp3');
        this.load.audio('musica-juego', 'assets/audio/musica-juego.mp3');
        this.load.audio('musica-timeout', 'assets/audio/musica-timeout.mp3');
        // METER AKI COSAS!!!!
    }

    mostrarTipEnPantalla() {
        if (!this.tipSeleccionado) return;

        const imgTip = this.add.image(1360, 400, this.tipSeleccionado.imagenKey).setOrigin(0, 0);
        imgTip.setScale(0.8);

        this.add.text(650, 425, this.tipSeleccionado.titulo, {
            fontSize: '42px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#000000',
            align: 'left',
        }).setOrigin(0.5, 0);

        this.add.text(900, 490, this.tipSeleccionado.texto, {
            fontSize: '30px',
            fontFamily: 'Arial',
            color: '#000000',
            align: 'left',
            wordWrap: { width: 800 }
        }).setOrigin(0.5, 0);
    }

    create() {
        const background = this.add.image(960, 540, 'background');
        background.setDisplaySize(1920, 1080);
        background.setDepth(-4);
        const deco1 = this.add.image(1500, 800, 'deco1');
        deco1.setDepth(-3);
        deco1.setScale(0.4);
        const deco2 = this.add.image(1800, 1080, 'deco2');
        deco2.setDepth(-2);
        deco2.setScale(0.7);
        const deco3 = this.add.image(960, 540, 'deco3');
        deco3.setDepth(-1);

        if (this.cache.json.exists('tipsCarga')) {
            const listaTips = this.cache.json.get('tipsCarga');
            this.tipSeleccionado = Phaser.Utils.Array.GetRandom(listaTips);
            this.mostrarTipEnPantalla();
        }

        const progreso = { valor: 0 };

        this.tweens.add({
            targets: progreso,
            valor: 1,
            duration: 3000,
            ease: 'Power1',
            onUpdate: () => {
                this.relleno.clear();
                this.relleno.fillStyle(0x8fcf35, 1);
                this.relleno.fillRect(this.barraX + 6, this.barraY + 6, (this.anchoBarra - 12) * progreso.valor, this.altoBarra - 12);
                this.textoCarga.setText(`CARGANDO... ${Math.round(progreso.valor * 100)}%`);
            },
            onComplete: () => {
                this.scene.start(this.siguienteEscena, this.datosSiguiente);
            }
        });
    }
}
