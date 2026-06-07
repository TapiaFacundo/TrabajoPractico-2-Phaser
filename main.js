class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 80, "EL EXPLORADOR\nDE LA MAZMORRA", {
      fontFamily: "monospace",
      fontSize: "40px",
      color: "#ffd700",
      align: "center",
      stroke: "#000",
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 20,
      "Recolectá al menos 5 estrellas\ny llegá a la salida.\n¡Cuidado con las bombas!", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#ffffff",
      align: "center",
    }).setOrigin(0.5);

    const boton = this.add.text(width / 2, height / 2 + 130, "[ JUGAR ]", {
      fontFamily: "monospace",
      fontSize: "28px",
      color: "#00ff88",
      backgroundColor: "#000000",
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    boton.on("pointerover", () => boton.setColor("#ffffff"));
    boton.on("pointerout", () => boton.setColor("#00ff88"));
    boton.on("pointerdown", () => {
      this.scene.start("Game", { nivel: 1, puntajeTotal: 0 });
    });
  }
}

class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: "VictoryScene" });
  }

  init(data) {
    this.puntajeTotal = data.puntajeTotal || 0;
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 80, "¡VICTORIA!", {
      fontFamily: "monospace",
      fontSize: "56px",
      color: "#ffd700",
      stroke: "#000",
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 10,
      "Completaste la mazmorra.\nEstrellas totales: " + this.puntajeTotal, {
      fontFamily: "monospace",
      fontSize: "22px",
      color: "#ffffff",
      align: "center",
    }).setOrigin(0.5);

    const boton = this.add.text(width / 2, height / 2 + 120, "[ JUGAR DE NUEVO ]", {
      fontFamily: "monospace",
      fontSize: "24px",
      color: "#00ff88",
      backgroundColor: "#000000",
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    boton.on("pointerover", () => boton.setColor("#ffffff"));
    boton.on("pointerout", () => boton.setColor("#00ff88"));
    boton.on("pointerdown", () => this.scene.start("MenuScene"));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 792,
  height: 640, 
  parent: "game-container",
  backgroundColor: "#1a1a2e",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [MenuScene, Game, VictoryScene],
};

const game = new Phaser.Game(config);