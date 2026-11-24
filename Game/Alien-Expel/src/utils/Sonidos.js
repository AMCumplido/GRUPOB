/**
 * Utilidad centralizada para reproducir sonidos (mismo estilo que BotonesUI).
 *
 * Todas las claves de audio son el nombre del archivo sin ".mp3"
 * (p. ej. 'button', 'button-2', 'activar-rampa', 'rampa'...).
 *
 * El volumen general lo controla el slider de OPCIONES (this.sound.volume),
 * así que todos los sonidos de aquí lo respetan automáticamente.
 */
export class Sonidos {

    /**
     * Reproduce un sonido una sola vez.
     *
     * @param {Phaser.Scene} scene  Escena desde la que se llama.
     * @param {string} key          Clave del audio (nombre del archivo sin .mp3).
     * @param {object} [opciones]
     * @param {number|null} [opciones.duracion=null]  Milisegundos que debe sonar.
     *        null = el archivo entero. Si es más largo que el archivo, suena entero.
     * @param {number} [opciones.volumen=1]  Volumen 0-1 (relativo al volumen general).
     * @param {boolean} [opciones.vincular=false]  true = se pausa/reanuda/para junto
     *        con la escena (requiere haber llamado a Sonidos.vincularEscena(scene)).
     * @returns {Phaser.Sound.BaseSound|null}
     */
    static reproducir(scene, key, { duracion = null, volumen = 1, vincular = false } = {}) {
        if (!key) {
            return null;
        }
        if (!scene.cache.audio.exists(key)) {
            console.warn(`[Sonidos] El audio "${key}" no está cargado.`);
            return null;
        }

        const sonido = scene.sound.add(key);
        // Al terminar (o al cortarse por la duración) se libera de memoria.
        sonido.once('complete', () => sonido.destroy());

        if (vincular) {
            Sonidos.registrar(scene, sonido);
        }

        if (duracion !== null && duracion > 0) {
            // Usamos un "marker" de Phaser: el corte lo hace el propio motor de audio,
            // así funciona aunque la escena cambie o se pause.
            const total = sonido.totalDuration || sonido.duration || Infinity;
            const segundos = Math.min(duracion / 1000, total);
            sonido.addMarker({ name: 'recorte', start: 0, duration: segundos });
            sonido.play('recorte', { volume: volumen });
        } else {
            sonido.play({ volume: volumen });
        }

        return sonido;
    }

    /**
     * Reproduce un sonido en bucle hasta que se llame a Sonidos.parar(sonido).
     *
     * @param {Phaser.Scene} scene
     * @param {string} key
     * @param {object} [opciones]
     * @param {number} [opciones.volumen=1]
     * @param {boolean} [opciones.vincular=true]
     * @returns {Phaser.Sound.BaseSound|null}
     */
    static reproducirLoop(scene, key, { volumen = 1, vincular = true } = {}) {
        if (!scene.cache.audio.exists(key)) {
            console.warn(`[Sonidos] El audio "${key}" no está cargado.`);
            return null;
        }

        const sonido = scene.sound.add(key, { loop: true });
        if (vincular) {
            Sonidos.registrar(scene, sonido);
        }
        sonido.play({ loop: true, volume: volumen });
        return sonido;
    }

    /**
     * Para y libera un sonido. Es seguro llamarlo con null o con un sonido ya terminado.
     */
    static parar(sonido) {
        if (!sonido || sonido.pendingRemove) {
            return;
        }
        sonido.stop();
        sonido.destroy();
    }

    /**
     * Engancha los sonidos "vinculados" al ciclo de vida de la escena:
     *  - pause    -> se pausan (p. ej. al abrir el menú de pausa o el fin de partida)
     *  - resume   -> se reanudan
     *  - shutdown -> se paran todos (VOLVER INICIO, VOLVER A JUGAR...)
     *
     * Llamar una vez al principio de create().
     */
    static vincularEscena(scene) {
        if (scene._sonidosVinculados) {
            return;
        }
        scene._sonidosVinculados = true;
        scene._sonidos = new Set();

        const pausar = () => {
            scene._sonidos.forEach((sonido) => {
                if (sonido.isPlaying) {
                    sonido.pause();
                }
            });
        };

        const reanudar = () => {
            scene._sonidos.forEach((sonido) => {
                if (sonido.isPaused) {
                    sonido.resume();
                }
            });
        };

        const limpiar = () => {
            [...scene._sonidos].forEach((sonido) => Sonidos.parar(sonido));
            scene._sonidos.clear();
            scene.events.off('pause', pausar);
            scene.events.off('resume', reanudar);
            scene._sonidosVinculados = false;
        };

        scene.events.on('pause', pausar);
        scene.events.on('resume', reanudar);
        scene.events.once('shutdown', limpiar);
    }

    // Uso interno: apunta el sonido en la lista de la escena.
    static registrar(scene, sonido) {
        if (!scene._sonidos) {
            return;
        }
        scene._sonidos.add(sonido);
        sonido.once('destroy', () => scene._sonidos?.delete(sonido));
    }
}
