HOST = "testnet.zincir.xyz:9147"
const lastBlock = async () => {
  const response = await fetch(`http://${HOST}/blocks`)
  return await response.json()
}

const getBlock = async (index) => {
  const response = await fetch(`http://${HOST}/blocks/${index}`)
  return await response.json()
}

const calculateHashRate = (difficulty, averageTime) => {
  digitCount = difficulty.length
  hex = parseInt(difficulty, 16)
  let diff = 16 ** digitCount / hex
  return diff / averageTime
}

const render = async (block) => {
  status()
  difficulty(block)
  averageBlock(6, '6-time', block)
  averageBlock(60, '60-time', block)
  averageBlock(120, '120-time', block)
  averageBlock(-1, 'time', block)
  nextDifficultyAdjustment(block)
  showLastBlock(block)
  nodes()
  hashRate(block)
}

const app = async () => {
  let block = await lastBlock();
  render(block)

  const socket = new WebSocket(`ws://${HOST}/blocks`);
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    block = data.block
    render(block)
  }

  setInterval(() => {
    hashRate(block)
    const ago = Date.now()/1000 - block.timestamp
    document.getElementById('last-block-title').innerHTML = `Last Block: #${block.index} ${ago.toFixed()} seconds ago`
  }, 5000)
}

const nodes = async() => {
  const response = await fetch(`http://${HOST}/nodes`)
  let nodes = await response.json()
  nodes.push(HOST)
  document.getElementById('nodes').innerHTML = JSON.stringify(nodes, null, 2);
}

const difficulty = async(lastBlock) => {
  const difficulties = []

  let index = lastBlock.index
  while (index >= 0) {
    block = await getBlock(index)
    let hashRate = calculateHashRate(block.difficulty, 60)/1000
    if (hashRate != Infinity) {
      difficulties.push([index, hashRate])
    } else {
      difficulties.push([index, 0])
    }

    index = index -60
  }

  new Dygraph(document.getElementById("difficulty"), difficulties.reverse(), {
    ylabel: 'Network Hash Rate',
    xlabel: 'Block Index',
    labels: ["Block Index", "Hash Rate"]
  });


  // document.getElementById('difficulty').innerHTML = JSON.stringify(difficulties, null, 2);
}

const status = async() => {
  if (lastBlock) {
    document.getElementById('status').innerHTML = 'ONLINE'
  }
}

const showLastBlock = async (lastBlock) => {
  document.getElementById('last-block').innerHTML = JSON.stringify(lastBlock, null, 2);
  hljs.initHighlighting();
}

const nextDifficultyAdjustment = async (lastBlock) => {
  const blocks = 60 - (lastBlock.index % 60)

  document.getElementById('next-difficulty-adjustment').innerHTML = `in ${blocks} blocks`
}

const hashRate = async (lastBlock) => {
  firstIndexWithDifficulty = lastBlock.index - lastBlock.index % 60
  firstBlock = await getBlock(firstIndexWithDifficulty)
  elapsedTime = Date.now()/1000 - firstBlock.timestamp
  averageTime = elapsedTime / (1 + lastBlock.index - firstBlock.index)

  let hashRate = calculateHashRate(lastBlock.difficulty, averageTime) / 1000

  document.getElementById('hash-rate').innerText = `${hashRate.toFixed(3)} KH/sec`;
}

const averageBlock = async (blockCount, id, lastBlock) => {
  const first = blockCount == -1? 1 : lastBlock.index - blockCount

  const response2 = await fetch(`http://${HOST}/blocks/${first}`)
  const block2 = await response2.json()

  const average = (lastBlock.timestamp - block2.timestamp)/(lastBlock.index-first)

  document.getElementById(id).innerText = `${average.toFixed(1)} seconds for last ${blockCount == -1 ? lastBlock.index : blockCount}`;
}

window.onload = app
