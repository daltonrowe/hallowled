// https://kno.wled.ge/interfaces/json-api/ 

import { log, table } from "./index.js";

async function get(url) {
  let host = process.env.HOST_NODE

  const res = await fetch(`http://${host}${url}`)
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

export default class {
  ips = []

  constructor() {
  }

  async loadAllNodes() {
    const info = await get('/json/info')
    this.ips.push(info.ip)

    const nodes = await get('/json/nodes')

    for (const node of nodes) {
      this.ips.push(node.ip)
    }
  }

  async load() {
    if (process.env.DIRECT_AP_MODE !== 'on') {
      await this.loadAllNodes();
    } else {
      this.ips.push('4.3.2.1')
    }

    table(this.ips);
  }

  async play(scene) {
    const updatePromises = [];

    for (let i = 0; i < this.ips.length; i++) {
      const ip = this.ips[i]

      log(`✉️ Updating ${ip}`)
      const promise = updateNode(ip, scene.lights)
      updatePromises.push(promise)
    }

    if (updatePromises.length) {
      await Promise.allSettled(updatePromises);
      return true
    }
  }
}


