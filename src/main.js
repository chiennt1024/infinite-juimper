import Phaser from 'phaser'

import HelloWorldScene from './HelloWorldScene'
import GameOver from './GameOver'

const config = {
	type: Phaser.AUTO,
	scale: {
        mode: Phaser.Scale.FIT,
        parent: 'app',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 600,
        height: 800
    },
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 },
			debug: true,
		},
	},
	scene: [HelloWorldScene, GameOver],
}

export default new Phaser.Game(config)
