import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Sonidos } from '../utils/Sonidos.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        // true solo cuando se entra desde JUEGO LOCAL (no en VOLVER A JUGAR)
        this.desdeMenu = data?.desdeMenu === true;
        this.players = new Map();
        this.doors = new Map();
        this.vents = new Map();
        this.conveyors = new Map();
        this.interactionButtons = [];
        this.staminaCubes = null;
        this.activeStaminaPositions = new Set();
        this.staminaSpawnPositions = [];
        this.offsetY = 110;
    }

    preload() {
        //Se hacen en LoadScene
    }

    create() {
        // Los sonidos "vinculados" se pausan con la pausa y se paran al salir de la partida
        Sonidos.vincularEscena(this);

        // Música: fuera la del menú, empieza la de la partida desde el principio
        Sonidos.pararMusica('musica-menu');
        Sonidos.reproducirMusica(this, 'musica-juego', { desdeInicio: true });
        // Al salir de la partida (VOLVER INICIO / VOLVER A JUGAR) se para la música de juego
        this.events.once('shutdown', () => {
            Sonidos.pararMusica('musica-juego');
            Sonidos.pararMusica('musica-timeout');
        });

        const map = this.make.tilemap({ key: 'mapa1' });
        const tileset = map.addTilesetImage('tileset_escenario1', 'tiles_escenario1');

        map.createLayer('Suelo', tileset, 0, this.offsetY);
        const capaMuros = map.createLayer('Muros', tileset, 0, this.offsetY);
        map.createLayer('Decoracion', tileset, 0, this.offsetY);

        capaMuros.setCollision([3, 4]);

        this.createPlayerTextures();
        const objects = map.getObjectLayer('Interacivos')?.objects || [];
        const spawnHero = objects.find((object) => object.name === 'spawn_heroe');
        const spawnAlien = objects.find((object) => object.name === 'spawn_alien');

        this.players.set('hero', new Player(this, {
            role: 'hero',
            x: spawnHero?.x || 960,
            y: (spawnHero?.y || 832) + this.offsetY
        }));
        this.players.set('alien', new Player(this, {
            role: 'alien',
            x: spawnAlien?.x || 960,
            y: (spawnAlien?.y || 256) + this.offsetY
        }));

        this.physics.add.collider(this.players.get('hero').sprite, capaMuros);
        this.physics.add.collider(this.players.get('alien').sprite, capaMuros);
        this.physics.add.overlap(
            this.players.get('hero').sprite,
            this.players.get('alien').sprite,
            this.captureAlien,
            null,
            this
        );

        this.createInteractiveObjects(objects);
        this.createStaminaCubes();
        this.createInteractionOverlay();

        this.scene.launch('HUDScene');

        if (this.desdeMenu) {
            Sonidos.reproducir(this, 'iniciar-partida', { duracion: null, vincular: true });
        }

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.pause('HUDScene');
            this.scene.pause('GameScene');
            this.scene.launch('PauseScene');
            this.scene.bringToTop('PauseScene');
        });
    }

    update(_time, delta) {
        for (const player of this.players.values()) {
            if (player.sprite.active) {
                player.update(delta, this.getConveyorVelocity(player.sprite));
            }
        }

        const hero = this.players.get('hero');
        const alien = this.players.get('alien');
        if (hero?.sprite.active) {
            this.interactWithNearbyObjects(hero);
        }
        if (alien?.sprite.active) {
            this.interactWithNearbyObjects(alien);
        }

        const nearbyHeroObject = hero?.sprite.active ? this.findNearbyObject(hero) : null;
        const nearbyAlienObject = alien?.sprite.active ? this.findNearbyObject(alien) : null;
        if (nearbyHeroObject) {
            this.updateInteractionOverlay(hero, nearbyHeroObject);
        } else if (nearbyAlienObject) {
            this.updateInteractionOverlay(alien, nearbyAlienObject);
        } else {
            this.hideInteractionOverlay();
        }
    }

    createPlayerTextures() {
        if (!this.textures.exists('player-hero')) {
            const heroGraphics = this.make.graphics({ add: false });
            heroGraphics.fillStyle(0x8fcf35);
            heroGraphics.fillCircle(21, 21, 20);
            heroGraphics.generateTexture('player-hero', 42, 42);
            heroGraphics.destroy();
        }
        if (!this.textures.exists('player-alien')) {
            const alienGraphics = this.make.graphics({ add: false });
            alienGraphics.fillStyle(0x884adf);
            alienGraphics.fillCircle(21, 21, 20);
            alienGraphics.generateTexture('player-alien', 42, 42);
            alienGraphics.destroy();
        }
        if (!this.textures.exists('interactive-object')) {
            const objectGraphics = this.make.graphics({ add: false });
            objectGraphics.fillStyle(0xffffff, 0.35);
            objectGraphics.fillRect(0, 0, 64, 64);
            objectGraphics.generateTexture('interactive-object', 64, 64);
            objectGraphics.destroy();
        }
        if (!this.textures.exists('stamina-cube')) {
            const cubeGraphics = this.make.graphics({ add: false });
            cubeGraphics.fillStyle(0x35d07f);
            cubeGraphics.fillRect(2, 2, 28, 28);
            cubeGraphics.lineStyle(3, 0xd8ffe5);
            cubeGraphics.strokeRect(2, 2, 28, 28);
            cubeGraphics.generateTexture('stamina-cube', 32, 32);
            cubeGraphics.destroy();
        }
    }

    createInteractiveObjects(objects) {
        for (const object of objects) {
            const x = object.x + object.width / 2;
            const y = object.y + object.height / 2 + this.offsetY;
            const properties = this.readProperties(object.properties);

            if (object.type === 'Puerta') {
                const door = this.physics.add.sprite(x, y, 'interactive-object');
                door.setSize(object.width, object.height);
                door.setDisplaySize(object.width, object.height);
                door.setVisible(false);
                door.setImmovable(true);
                door.body.allowGravity = false;
                door.body.moves = false;
                const visual = this.add.rectangle(x, y, object.width, object.height, 0xe84d4d, 0.35)
                    .setStrokeStyle(3, 0xff7777);
                const heroCollider = this.physics.add.collider(
                    this.players.get('hero').sprite,
                    door,
                    this.pushFromDoor,
                    null,
                    this
                );
                const alienCollider = this.physics.add.collider(
                    this.players.get('alien').sprite,
                    door,
                    this.pushFromDoor,
                    null,
                    this
                );
                heroCollider.active = false;
                alienCollider.active = false;
                const doorData = {
                    object,
                    body: door,
                    visual,
                    colliders: [heroCollider, alienCollider],
                    closed: false,
                    timer: null
                };
                this.doors.set(object.name, doorData);
                continue;
            }

            if (object.type === 'Alcantarilla') {
                this.vents.set(object.name, {
                    x, y, width: object.width, height: object.height,
                    destination: properties.destino, cooldown: false,
                    cooldownDuration: properties.cooldown || 10000
                });
                continue;
            }

            if (object.type === 'Cinta') {
                const visual = this.add.rectangle(x, y, object.width, object.height, 0x3d8bd9, 0.25)
                    .setStrokeStyle(2, 0x78c8ff);
                this.conveyors.set(object.name, {
                    x, y, width: object.width, height: object.height,
                    active: properties.activaInicialmente === true,
                    duration: properties.duracion || 10000,
                    visual,
                    velocity: object.width > object.height
                        ? new Phaser.Math.Vector2(100, 0)
                        : new Phaser.Math.Vector2(0, 100)
                });
                continue;
            }

            if (object.type === 'Boton') {
                this.add.rectangle(x, y, object.width - 8, object.height - 8, 0xf2c94c, 0.8)
                    .setStrokeStyle(2, 0xffffff);
                this.add.text(x, y, properties.tipo === 'puerta' ? 'SHIFT' : 'E', {
                    fontSize: '14px',
                    fontFamily: 'Arial',
                    fontStyle: 'bold',
                    color: '#111122'
                }).setOrigin(0.5).setDepth(5);
                this.interactionButtons.push({
                    x, y, width: object.width, height: object.height,
                    type: properties.tipo, target: properties.objetivo,
                    cooldown: false
                });
            }
        }
    }

    createStaminaCubes() {
        this.staminaCubes = this.physics.add.group();
        this.staminaSpawnPositions = [
            { x: 160, y: 160 },
            { x: 800, y: 224 },
            { x: 1440, y: 160 },
            { x: 160, y: 480 },
            { x: 672, y: 480 },
            { x: 1120, y: 480 },
            { x: 1600, y: 480 },
            { x: 160, y: 864 },
            { x: 800, y: 864 },
            { x: 1440, y: 864 }
        ];

        for (let index = 0; index < 4; index += 1) {
            this.spawnStaminaCube();
        }

        const hero = this.players.get('hero').sprite;
        const alien = this.players.get('alien').sprite;
        this.physics.add.overlap(hero, this.staminaCubes, this.collectStaminaCube, null, this);
        this.physics.add.overlap(alien, this.staminaCubes, this.collectStaminaCube, null, this);
        this.time.addEvent({
            delay: 15000,
            callback: this.replenishStaminaCubes,
            callbackScope: this,
            loop: true
        });
    }

    spawnStaminaCube() {
        const availablePositions = this.staminaSpawnPositions.filter(({ x, y }) => {
            return !this.activeStaminaPositions.has(`${x},${y}`);
        });
        if (availablePositions.length === 0) {
            return;
        }

        const position = Phaser.Utils.Array.GetRandom(availablePositions);
        const positionKey = `${position.x},${position.y}`;
        const cube = this.staminaCubes.create(
            position.x,
            position.y + this.offsetY,
            'stamina-cube'
        );
        cube.setImmovable(true);
        cube.body.allowGravity = false;
        cube.setSize(28, 28);
        cube.setData('amount', 50);
        cube.setData('positionKey', positionKey);
        this.activeStaminaPositions.add(positionKey);
    }

    replenishStaminaCubes() {
        this.ensureMinimumStaminaCubes();
        if (this.activeStaminaPositions.size < 4) {
            this.spawnStaminaCube();
        }
    }

    ensureMinimumStaminaCubes() {
        while (this.activeStaminaPositions.size < 2) {
            this.spawnStaminaCube();
        }
    }

    collectStaminaCube(playerSprite, cube) {
        if (!cube.active) {
            return;
        }

        const player = playerSprite.getData('player');
        if (player?.isHero) {
            player.restoreStamina(cube.getData('amount'));
        }
        Sonidos.reproducir(this, 'recoger-item', { duracion: null, vincular: true });
        this.activeStaminaPositions.delete(cube.getData('positionKey'));
        cube.disableBody(true, true);
        this.ensureMinimumStaminaCubes();
    }

    readProperties(properties = []) {
        return properties.reduce((result, property) => {
            result[property.name] = property.value;
            return result;
        }, {});
    }

    interactWithNearbyObjects(player) {
        const nearbyObject = this.findNearbyObject(player);

        if (!Phaser.Input.Keyboard.JustDown(player.interactKey)) {
            return;
        }

        if (nearbyObject?.type === 'button') {
            this.activateButton(nearbyObject.object);
        }

        if (!player.isHero && nearbyObject?.type === 'vent' && !nearbyObject.object.cooldown) {
            this.useVent(player, nearbyObject.object);
        }
    }

    createInteractionOverlay() {
        this.interactionOverlay = this.add.rectangle(960, 1000, 920, 58, 0x111122, 0.9)
            .setStrokeStyle(2, 0x8fcf35)
            .setDepth(1000)
            .setVisible(false);
        this.interactionText = this.add.text(960, 1000, '', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(1001);
        this.interactionText.setVisible(false);
    }

    findNearbyObject(player) {
        const button = this.interactionButtons.find((candidate) => {
            const canUseButton = player.isHero
                ? candidate.type === 'cinta'
                : candidate.type === 'puerta';
            return canUseButton && this.isNear(player.sprite, candidate);
        });

        if (button) {
            return { type: 'button', object: button };
        }

        if (!player.isHero) {
            for (const vent of this.vents.values()) {
                if (this.isNear(player.sprite, vent)) {
                    return { type: 'vent', object: vent };
                }
            }
        }

        return null;
    }

    updateInteractionOverlay(player, nearbyObject) {
        const key = player.isHero ? 'E' : 'SHIFT';
        let message = `Pulsa ${key} para interactuar`;

        if (nearbyObject.type === 'button') {
            const button = nearbyObject.object;
            if (button.type === 'cinta') {
                const conveyor = this.conveyors.get(button.target);
                message = conveyor?.active
                    ? 'Cinta activa'
                    : `Pulsa ${key} para activar la cinta`;
            } else {
                const door = this.doors.get(button.target);
                message = door?.closed
                    ? 'Puerta bloqueada'
                    : `Pulsa ${key} para bloquear la puerta`;
            }
        } else if (nearbyObject.object.cooldown) {
            message = 'Conducto en cooldown';
        } else {
            message = `Pulsa ${key} para usar el conducto`;
        }

        this.interactionText.setText(message);
        this.interactionOverlay.setVisible(true);
        this.interactionText.setVisible(true);
    }

    hideInteractionOverlay() {
        this.interactionOverlay.setVisible(false);
        this.interactionText.setVisible(false);
    }

    isNear(sprite, object) {
        const distance = Phaser.Math.Distance.Between(sprite.x, sprite.y, object.x, object.y);
        return distance <= Math.max(object.width, object.height) / 2 + 48;
    }

    activateButton(button) {
        if (button.cooldown) {
            return;
        }

        if (button.type === 'puerta') {
            const door = this.doors.get(button.target);
            if (!door) {
                return;
            }

            // Suena tanto al bloquear como al desbloquear con el botón
            Sonidos.reproducir(this, 'puerta', { duracion: null, vincular: true });

            if (door.closed) {
                door.closed = false;
                door.colliders.forEach((collider) => {
                    collider.active = false;
                });
                if (door.timer) {
                    door.timer.remove(false);
                    door.timer = null;
                }
                door.visual.setFillStyle(0xe84d4d, 0.35);
                return;
            }

            door.closed = true;
            door.colliders.forEach((collider) => {
                collider.active = true;
            });
            door.visual.setFillStyle(0xff3333, 0.8);
            door.timer = this.time.delayedCall(15000, () => {
                // Si queréis que también suene al reabrirse sola, descomentad:
                // Sonidos.reproducir(this, 'puerta', { duracion: null, vincular: true });
                door.closed = false;
                door.colliders.forEach((collider) => {
                    collider.active = false;
                });
                door.visual.setFillStyle(0xe84d4d, 0.35);
                door.timer = null;
            });
        }

        if (button.type === 'cinta') {
            const conveyor = this.conveyors.get(button.target);
            // Si ya está activa se ignora (evita dos temporizadores y dos sonidos a la vez)
            if (!conveyor || conveyor.active) {
                return;
            }
            conveyor.active = true;
            conveyor.visual.setFillStyle(0x35d07f, 0.45);
            this.iniciarSonidoCinta(conveyor, 4000);
            this.time.delayedCall(conveyor.duration, () => {
                conveyor.active = false;
                conveyor.visual.setFillStyle(0x3d8bd9, 0.25);
                this.detenerSonidoCinta(conveyor);
            });
        }
    }

    /**
     * 'activar-rampa' suena duracionActivacion ms y después 'rampa' en bucle
     * hasta que la cinta se apaga (detenerSonidoCinta).
     */
    iniciarSonidoCinta(conveyor, duracionActivacion = 4000) {
        conveyor.sonidoActivar = Sonidos.reproducir(this, 'activar-rampa', {
            duracion: duracionActivacion,
            vincular: true
        });

        if (conveyor.duration > duracionActivacion) {
            // Temporizador de la escena: se congela con la pausa igual que el audio
            conveyor.timerSonido = this.time.delayedCall(duracionActivacion, () => {
                conveyor.timerSonido = null;
                if (conveyor.active) {
                    conveyor.sonidoLoop = Sonidos.reproducirLoop(this, 'rampa', { vincular: true });
                }
            });
        }
    }

    detenerSonidoCinta(conveyor) {
        if (conveyor.timerSonido) {
            conveyor.timerSonido.remove(false);
            conveyor.timerSonido = null;
        }
        Sonidos.parar(conveyor.sonidoActivar);
        Sonidos.parar(conveyor.sonidoLoop);
        conveyor.sonidoActivar = null;
        conveyor.sonidoLoop = null;
    }

    useVent(player, vent) {
        const destination = this.vents.get(vent.destination);
        if (!destination) {
            return;
        }
        player.sprite.setPosition(destination.x, destination.y);
        Sonidos.reproducir(this, 'ventilacion', { duracion: null, vincular: true });
        vent.cooldown = true;
        this.time.delayedCall(vent.cooldownDuration, () => {
            vent.cooldown = false;
        });
    }

    getConveyorVelocity(sprite) {
        for (const conveyor of this.conveyors.values()) {
            if (conveyor.active && this.isInsideArea(sprite, conveyor)) {
                return conveyor.velocity;
            }
        }
        return new Phaser.Math.Vector2(0, 0);
    }

    isInsideArea(sprite, object) {
        return Phaser.Geom.Intersects.RectangleToRectangle(
            sprite.getBounds(),
            new Phaser.Geom.Rectangle(
                object.x - object.width / 2,
                object.y - object.height / 2,
                object.width,
                object.height
            )
        );
    }

    pushFromDoor(playerSprite, doorSprite) {
        const direction = new Phaser.Math.Vector2(
            playerSprite.x - doorSprite.x,
            playerSprite.y - doorSprite.y
        ).normalize();
        playerSprite.setVelocity(direction.x * 250, direction.y * 250);
    }

    captureAlien(heroSprite, alienSprite) {
        if (!alienSprite.active) {
            return;
        }
        alienSprite.disableBody(true, true);
        this.events.emit('alienCapturado');
        this.scene.pause('GameScene');
        this.scene.pause('HUDScene');
        this.scene.launch('GameOverScene', { ganador: 'JUGADOR 1', motivo: 'captura' });
        this.scene.bringToTop('GameOverScene');
    }
}
