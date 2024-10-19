// https://kno.wled.ge/interfaces/json-api/ 

import { log, table } from "./index.js";

async function get(url) {
  const res = await fetch(`http://${process.env.HOST_NODE}${url}`)
  return await res.json();
}

function updateNode(ip, data) {
  return fetch(`http://${ip}/json/state`, {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify({ ...data })
  })
}

function shuffle(array) {
  let currentIndex = array.length;

  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array
}

export default class {
  host = {}
  nodes = {}
  ips = []

  constructor() {
  }

  effectKey(scene, i) {
    if (this.ips.length === 1)
      return 'lights1'

    if (!scene.hasOwnProperty('lights2'))
      return 'lights1'

    const even = i % 2;
    return even ? 'lights2' : 'lights1'
  }

  async load() {
    this.host = await get('/json/state')

    const info = await get('/json/info')
    this.ips.push(info.ip)

    this.nodes = await get('/json/nodes')

    for (const node of this.nodes.nodes) {
      this.ips.push(node.ip)
    }

    table(this.ips);
  }

  async play(scene) {
    const updatePromises = [];

    const shuffledIps = shuffle([...this.ips])
    console.log(shuffledIps);

    for (let i = 0; i < shuffledIps.length; i++) {
      // if lights2 is present
      // assign every other wled to it
      const lightsKey = this.effectKey(scene, i)
      const ip = shuffledIps[i];
      log(`Updating ${ip}`)
      const promise = updateNode(ip, scene[lightsKey])
      updatePromises.push(promise)
    }

    if (updatePromises.length) {
      await Promise.allSettled(updatePromises);
      return true
    }
  }
}


