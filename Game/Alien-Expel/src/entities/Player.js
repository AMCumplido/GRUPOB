import Phaser from 'phaser';

export class Player {
    constructor(scene, { role, x, y }) {
        this.scene = scene;
        this.role = role;
        this.isHero = role === 'hero';
        this.maxStamina = 100;
        this.stamina = this.maxStamina;
        this.baseSpeed = this.isHero ? 190 : 185;
        this.exhaustedSpeed = 80;

        this.sprite = scene.physics.add.sprite(x, y, this.isHero ? 'player-hero' : 'player-alien');
        this.sprite.setDisplaySize(42, 42);
        this.sprite.setSize(36, 36);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setData('player', this);

        this.keys = this.isHero
            ? scene.input.keyboard.addKeys('W,A,S,D,SPACE,E')
            : scene.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,SHIFT');
        this.interactKey = this.isHero ? this.keys.E : this.keys.SHIFT;
    }

    update(delta, conveyorVelocity) {
        const direction = new Phaser.Math.Vector2(
            (this.keys.D?.isDown ? 1 : 0) - (this.keys.A?.isDown ? 1 : 0) +
            (this.keys.RIGHT?.isDown ? 1 : 0) - (this.keys.LEFT?.isDown ? 1 : 0),
            (this.keys.S?.isDown ? 1 : 0) - (this.keys.W?.isDown ? 1 : 0) +
            (this.keys.DOWN?.isDown ? 1 : 0) - (this.keys.UP?.isDown ? 1 : 0)
        );

        if (direction.lengthSq() > 0) {
            direction.normalize();
        }

        const running = this.isHero && this.keys.SPACE?.isDown && direction.lengthSq() > 0;
        let speed = this.baseSpeed;

        if (this.isHero) {
            if (this.stamina <= 0) {
                speed = this.exhaustedSpeed;
            } else if (running) {
                speed *= 2;
            }

            const staminaDrain = direction.lengthSq() > 0 ? (running ? 50 : 8) : 0;
            this.stamina = Phaser.Math.Clamp(
                this.stamina - staminaDrain * (delta / 1000),
                0,
                this.maxStamina
            );
            this.scene.events.emit('actualizarStamina', this.stamina / this.maxStamina);
        }

        this.sprite.setVelocity(
            direction.x * speed + conveyorVelocity.x,
            direction.y * speed + conveyorVelocity.y
        );
    }

    restoreStamina(amount) {
        if (!this.isHero) {
            return;
        }

        this.stamina = Phaser.Math.Clamp(this.stamina + amount, 0, this.maxStamina);
        this.scene.events.emit('actualizarStamina', this.stamina / this.maxStamina);
    }
}
