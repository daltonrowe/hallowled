import 'dotenv/config'

import scenes from "./scenes.js"
import Audio from './audio.js';
import Lights from './lights.js';
import { logo } from './logo.js';

export function log() {
  if (process.env.LOG === '1') console.log(...arguments);
}

export function table() {
  if (process.env.LOG === '1') console.table(...arguments);
}


logo();

const gap = parseInt(process.env.GAP) * 1000
const audio = new Audio();
const lights = new Lights();
await lights.load()

const sceneNames = Object.keys(scenes)

let last = Date.now()
let currentName = sceneNames[0]
let current = scenes[currentName]
let currentLength = current.length + gap
let running = false;

function pickScene() {
  const randSceneIndex = Math.floor(Math.random() * sceneNames.length)
  const nextSceneName = sceneNames[randSceneIndex]

  return nextSceneName !== currentName ? nextSceneName : pickScene()
}

function setupScene(sceneName) {
  log(`👻 Assigning ${sceneName}...`);

  currentName = sceneName
  current = scenes[sceneName]
  currentLength = current.length + gap
}

async function playScene() {
  await lights.play(current)
  if (current.sound) audio.play(current);

  log(`🪓 Playing ${currentName}!`);
}

playScene()

setInterval(async () => {
  if (running) return;
  running = true

  const now = Date.now();

  if (now - last > currentLength) {
    log('🎃 Changing scene!');

    const randScene = pickScene();
    setupScene(randScene);
    playScene();

    last = now
  }

  running = false
}, 1000);