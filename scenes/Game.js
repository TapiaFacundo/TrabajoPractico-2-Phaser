class Game extends Phaser.Scene {
  constructor() {
    super({ key: "Game" });
  }

  init(data) {
    this.nivelActual = data.nivel || 1;
    this.puntajeTotal = data.puntajeTotal || 0;
    this.objetosNivel = 0;
    this.terminado = false;
    this.avisoActivo = false;
  }

  preload() {
    this.load.tilemapTiledJSON("nivel1", "public/assets/nivel1.json");
    this.load.tilemapTiledJSON("nivel2", "public/assets/nivel2.json");
    this.load.tilemapTiledJSON("nivel3", "public/assets/nivel3.json");

    this.load.image("tileset", "public/assets/texture.png");

    this.load.spritesheet("dude", "public/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.image("star", "public/assets/star.png");
    this.load.image("bomb", "public/assets/bomb.png");
  }

  create() {
    this.OFFSET_Y = 40;

    const claveNivel = "nivel" + this.nivelActual;
    const map = this.make.tilemap({ key: claveNivel });

    const tileset = map.addTilesetImage("tileset", "tileset");

    map.createLayer("Fondo", tileset, 0, this.OFFSET_Y);

    this.capaPlataformas = map.createLayer("Plataformas", tileset, 0, this.OFFSET_Y);
    this.capaPlataformas.setCollisionByProperty({ esColisionable: true });

    this.stars = this.physics.add.group();
    this.bombs = this.physics.add.group();

    const objetos = map.getObjectLayer("Objetos").objects;

    objetos.forEach((obj) => {
      const ox = obj.x;
      const oy = obj.y + this.OFFSET_Y; 

      switch (obj.name) {
        case "player":
          this.player = this.physics.add.sprite(ox, oy, "dude");
          this.player.setCollideWorldBounds(true);
          this.player.setScale(0.5);
          this.player.body.setSize(20, 30);
          this.player.body.setOffset(6, 14);
          break;

        case "salida":
          this.salida = this.physics.add.staticImage(ox, oy, "star");
          this.salida.setTint(0x00ff88).setScale(1.4);
          this.salida.refreshBody();
          break;

        case "star": {
          const s = this.stars.create(ox, oy, "star");
          s.body.setAllowGravity(false);
          s.setImmovable(true);
          break;
        }

        case "bomb": {
          const b = this.bombs.create(ox, oy, "bomb");
          b.body.setAllowGravity(false);
          b.setCollideWorldBounds(true);
          b.setBounce(1); 

          const dir = this.leerPropiedad(obj, "dir") || "h";
          const velocidad = 80;
          if (dir === "v") b.setVelocityY(velocidad);
          else b.setVelocityX(velocidad);
          break;
        }
      }
    });

    this.crearAnimaciones();

    this.physics.add.collider(this.player, this.capaPlataformas);
    this.physics.add.collider(this.bombs, this.capaPlataformas);

    this.physics.add.overlap(this.player, this.stars, this.juntarStar, null, this);

    this.physics.add.overlap(this.player, this.bombs, this.tocarBomba, null, this);

    this.physics.add.overlap(this.player, this.salida, this.llegarSalida, null, this);

    const anchoMundo = map.widthInPixels;
    const altoMundo = map.heightInPixels + this.OFFSET_Y;
    this.physics.world.setBounds(0, 0, anchoMundo, altoMundo);
    this.cameras.main.setBounds(0, 0, anchoMundo, altoMundo);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.crearHUD();
  }

  update() {
    if (this.terminado) return;

    const velocidad = 160;
    const body = this.player.body;
    body.setVelocity(0);

    if (this.cursors.left.isDown) {
      body.setVelocityX(-velocidad);
      this.player.anims.play("izquierda", true);
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(velocidad);
      this.player.anims.play("derecha", true);
    }

    if (this.cursors.up.isDown) {
      body.setVelocityY(-velocidad);
    } else if (this.cursors.down.isDown) {
      body.setVelocityY(velocidad);
    }

    if (body.velocity.x === 0 && body.velocity.y === 0) {
      this.player.anims.play("quieto", true);
    }
  }
  leerPropiedad(obj, nombre) {
    if (!obj.properties) return null;
    const p = obj.properties.find((pr) => pr.name === nombre);
    return p ? p.value : null;
  }

  crearAnimaciones() {
    if (!this.anims.exists("izquierda")) {
      this.anims.create({
        key: "izquierda",
        frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
      });
      this.anims.create({
        key: "quieto",
        frames: [{ key: "dude", frame: 4 }],
        frameRate: 20,
      });
      this.anims.create({
        key: "derecha",
        frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  crearHUD() {
    this.add.rectangle(0, 0, this.scale.width, this.OFFSET_Y, 0x000000)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(999);

    this.textoContador = this.add.text(12, 10,
      "Estrellas: " + this.objetosNivel + "/5   Total: " + this.puntajeTotal, {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#ffffff",
    }).setScrollFactor(0).setDepth(1000);

    this.textoNivel = this.add.text(this.scale.width - 12, 10,
      "Nivel " + this.nivelActual, {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#ffd700",
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);
  }

  juntarStar(player, star) {
    star.disableBody(true, true);
    this.objetosNivel += 1;
    this.actualizarHUD();
  }

  actualizarHUD() {
    this.textoContador.setText(
      "Estrellas: " + this.objetosNivel + "/5   Total: " + (this.puntajeTotal + this.objetosNivel)
    );
  }

  tocarBomba(player, bomb) {
    if (this.terminado) return;
    this.terminado = true;

    this.physics.pause();
    player.setTint(0xff0000);

    const cam = this.cameras.main;
    this.add.text(cam.midPoint.x, cam.midPoint.y, "¡PERDISTE!\nClick para reintentar", {
      fontFamily: "monospace",
      fontSize: "32px",
      color: "#ff4444",
      align: "center",
      stroke: "#000",
      strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);

    this.input.once("pointerdown", () => {
      this.scene.restart({ nivel: this.nivelActual, puntajeTotal: this.puntajeTotal });
    });
  }

  llegarSalida(player, salida) {
    if (this.terminado) return;

    if (this.objetosNivel < 5) {
      this.mostrarAviso("¡Necesitás 5 estrellas! (" + this.objetosNivel + "/5)");
      return;
    }

    this.terminado = true;
    this.physics.pause();

    this.puntajeTotal += this.objetosNivel;

    if (this.nivelActual < 3) {
      this.scene.restart({
        nivel: this.nivelActual + 1,
        puntajeTotal: this.puntajeTotal,
      });
    } else {
      this.scene.start("VictoryScene", { puntajeTotal: this.puntajeTotal });
    }
  }

  mostrarAviso(mensaje) {
    if (this.avisoActivo) return;
    this.avisoActivo = true;

    this.textoAviso = this.add.text(this.scale.width / 2, 60, mensaje, {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#ffffff",
      backgroundColor: "#cc0000",
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);

    this.time.delayedCall(1500, () => {
      if (this.textoAviso) this.textoAviso.destroy();
      this.avisoActivo = false;
    });
  }
}