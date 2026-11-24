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
     * @param {Function|null} [opciones.alTerminar=null]  Se llama cuando el sonido acaba.
     * @returns {Phaser.Sound.BaseSound|null}
     */
    static reproducir(scene, key, { duracion = null, volumen = 1, vincular = false, alTerminar = null } = {}) {
        if (!key) {
            return null;
        }
        if (!scene.cache.audio.exists(key)) {
            console.warn(`[Sonidos] El audio "${key}" no está cargado.`);
            return null;
        }

        const sonido = scene.sound.add(key);
        // Al terminar (o al cortarse por la duración) se libera de memoria.
        sonido.once('complete', () => {
            if (alTerminar) {
                alTerminar();
            }
            sonido.destroy();
        });

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

    // ------------------------------------------------------------------
    // MÚSICA DE FONDO
    // La música es global: sigue sonando aunque se cambie de escena.
    // Cada pista se identifica por su clave ('musica-menu', 'musica-juego'...).
    // ------------------------------------------------------------------

    static musicas = new Map();

    /**
     * Pone una pista de música en bucle.
     * - Si ya está sonando, no hace nada (p. ej. al volver de CRÉDITOS al menú).
     * - Si está pausada, la reanuda donde se quedó.
     *
     * @param {Phaser.Scene} scene
     * @param {string} key
     * @param {object} [opciones]
     * @param {number} [opciones.volumen=1]        Volumen final 0-1.
     * @param {number} [opciones.fadeIn=0]         ms que tarda en subir de 0 a "volumen".
     * @param {boolean} [opciones.desdeInicio=false]  true = reinicia la pista aunque ya suene.
     */
    static reproducirMusica(scene, key, { volumen = 1, fadeIn = 0, desdeInicio = false } = {}) {
        if (!scene.cache.audio.exists(key)) {
            console.warn(`[Sonidos] La música "${key}" no está cargada.`);
            return null;
        }

        const existente = Sonidos.musicas.get(key);
        if (existente && !existente.pendingRemove) {
            if (!desdeInicio) {
                if (existente.isPaused) {
                    existente.resume();
                }
                return existente;
            }
            Sonidos.pararMusica(key);
        }

        const musica = scene.sound.add(key, { loop: true });
        Sonidos.musicas.set(key, musica);
        musica.play({ loop: true, volume: fadeIn > 0 ? 0 : volumen });

        if (fadeIn > 0) {
            Sonidos.fundirMusica(scene, key, volumen, fadeIn);
        }
        return musica;
    }

    /**
     * Cambia el volumen de una pista poco a poco.
     * El fundido usa los tweens de "scene": si esa escena se pausa, el fundido también.
     *
     * @param {Phaser.Scene} scene
     * @param {string} key
     * @param {number} volumenFinal  0-1
     * @param {number} duracion      ms
     */
    static fundirMusica(scene, key, volumenFinal, duracion) {
        const musica = Sonidos.musicas.get(key);
        if (!musica || musica.pendingRemove) {
            return null;
        }

        Sonidos.cancelarFundido(musica);
        const estado = { volumen: musica.volume };
        musica._fundido = scene.tweens.add({
            targets: estado,
            volumen: volumenFinal,
            duration: duracion,
            ease: 'Linear',
            onUpdate: () => {
                if (!musica.pendingRemove) {
                    musica.setVolume(estado.volumen);
                }
            },
            onComplete: () => {
                musica._fundido = null;
            }
        });
        return musica._fundido;
    }

    /** Pausa una pista (se puede reanudar con reanudarMusica). */
    static pausarMusica(key) {
        const musica = Sonidos.musicas.get(key);
        if (musica && musica.isPlaying) {
            musica.pause();
        }
    }

    /** Reanuda una pista pausada. Si no estaba pausada, no hace nada. */
    static reanudarMusica(key) {
        const musica = Sonidos.musicas.get(key);
        if (musica && musica.isPaused) {
            musica.resume();
        }
    }

    /** Para y libera una pista. Es seguro llamarlo aunque no esté sonando. */
    static pararMusica(key) {
        const musica = Sonidos.musicas.get(key);
        if (!musica) {
            return;
        }
        Sonidos.cancelarFundido(musica);
        Sonidos.parar(musica);
        Sonidos.musicas.delete(key);
    }

    // Uso interno: detiene un fundido en curso.
    static cancelarFundido(musica) {
        if (musica._fundido) {
            musica._fundido.stop();
            musica._fundido = null;
        }
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
