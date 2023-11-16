import Phaser from "phaser";
import Carrot from "./Carrot";

export default class HelloWorldScene extends Phaser.Scene {
  constructor() {
    super("game");
  }
  platforms;
  player;
  cursors;
  pointer;
  carrots;
  carrotsCollectedText;
  touchingDown;
  carrotsCollected = 0;

  init() {
    this.carrotsCollected = 0;
  }

  preload() {
    const halfWidth = this.scale.width / 2;
    this.load.image("background", "assets/Background/bg_layer2.png");
    this.load.image("platform", "assets/Environment/ground_grass.png");
    this.load.image("bunny-stand", "assets/Players/bunny1_stand.png");
    this.load.image("carrot", "assets/Items/carrot.png");
    this.load.image("bunny-jump", "assets/Players/bunny1_jump.png");
    this.load.audio("jump", "assets/Audio/phaseJump1.ogg");
    this.cursors = this.input.keyboard.createCursorKeys();
    this.pointer = this.input.activePointer;
    this.input.on(
      "pointerdown",
      function (pointer) {
        if(pointer.x < halfWidth) {
          this.moveLeft();
        } else if(pointer.x >= halfWidth) {
          this.moveRight();
        }
      },
      this
    );
  }

  create() {
    const style = { color: "#fff", fontSize: "24px" };
    this.carrotsCollectedText = this.add
      .text(240, 10, "Carrots: 0", style)
      .setScrollFactor(0)
      .setOrigin(0.5, 0);
    this.add.image(240, 320, "background").setScrollFactor(1, 0);

    this.carrots = this.physics.add.group({
      classType: Carrot,
    });
    this.carrots.get(240, 320, "carrot");

    this.platforms = this.physics.add.staticGroup();
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(80, 400);
      const y = 150 * i;

      const platform = this.platforms.create(x, y, "platform");
      platform.scale = 0.5;

      const body = platform.body;
      body.updateFromGameObject();
    }
    this.player = this.physics.add
      .sprite(240, 320, "bunny-stand")
      .setScale(0.5);
    this.physics.add.collider(this.platforms, this.carrots);
    this.physics.add.collider(this.platforms, this.player);
    this.physics.add.collider(this.platforms, this.carrots);
    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.handleCollectCarrot,
      null,
      this
    );
    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setDeadzone(this.scale.width * 1.5);
  }

  update() {
    this.platforms.children.iterate((child) => {
      const platform = child;
      const scrollY = this.cameras.main.scrollY;
      const bottomPlatform = this.findBottomMostPlatform();
      if (this.player.y > bottomPlatform.y + 200) {
        this.scene.start("game-over");
      }
      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100);
        platform.body.updateFromGameObject();
        this.addCarrotAbove(platform);
      }
    });
    this.touchingDown = this.player.body.touching.down;
    if (this.touchingDown) {
      this.player.setVelocityY(-300);
      this.player.setTexture("bunny-jump");
      this.sound.play("jump");
    }
    const vy = this.player.body.velocity.y;
    if (vy > 0 && this.player.texture.key !== "bunny-stand") {
      this.player.setTexture("bunny-stand");
    }
    if (this.pointer.isDown) {
      console.log("x", this.pointer.x);
      console.log("y", this.pointer.y);
    }
    if(!this.pointer.isDown && this.touchingDown) {
      this.player.setVelocityX(0);
    }
    this.horizontalWrap(this.player);
  }

  moveLeft() {
    if (this.touchingDown) {
      return;
    }
    this.player.setVelocityX(-200);
  }

  moveRight() {
    if (this.touchingDown) {
      return;
    }
    this.player.setVelocityX(200);
  }

  horizontalWrap(sprite) {
    const halfWidth = sprite.displayWidth * 0.5;
    const gameWidth = this.scale.width;
    if (sprite.x < -halfWidth) {
      sprite.x = gameWidth + halfWidth;
    } else if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth;
    }
  }

  addCarrotAbove(sprite) {
    const y = sprite.y - sprite.displayHeight;
    const carrot = this.carrots.get(sprite.x, y, "carrot");
    carrot.setActive(true);
    carrot.setVisible(true);
    this.add.existing(carrot);
    carrot.body.setSize(carrot.width, carrot.height);
    this.physics.world.enable(carrot);
    return carrot;
  }

  handleCollectCarrot(player, carrot) {
    this.carrots.killAndHide(carrot);
    this.physics.world.disableBody(carrot.body);
    this.carrotsCollected++;
    const value = `Carrots: ${this.carrotsCollected}`;
    this.carrotsCollectedText.text = value;
  }

  findBottomMostPlatform() {
    const platforms = this.platforms.getChildren();
    let bottomPlatform = platforms[0];
    for (let i = 1; i < platforms.length; i++) {
      const platform = platforms[i];
      if (platform.y < bottomPlatform.y) {
        continue;
      }
      bottomPlatform = platform;
    }
    return bottomPlatform;
  }
}
