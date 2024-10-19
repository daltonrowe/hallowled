import player from 'node-wav-player';

export default class {
  player = player;

  constructor() { }

  play(scene) {
    player.play({
      path: `./sounds/${scene.sound}.wav`,
      loop: scene.loop,
    })
  }

  stop() {
    player.stop();
  }
}