HOST = "testnet.zincir.xyz:9147"
const lastBlock = async () => {
  const response = await fetch("http://testnet.zincir.xyz:9147/blocks")
  return await response.json()
}

const getBlock = async (index) => {
  const response = await fetch(`http://testnet.zincir.xyz:9147/blocks/${index}`)
  return await response.json()
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

  const socket = new WebSocket("ws://testnet.zincir.xyz:9147/blocks");
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    block = data.block
    render(block)
  }

  setInterval(() => {
    const ago = Date.now()/1000 - block.timestamp
    document.getElementById('last-block-title').innerHTML = `Last Block: #${block.index} ${ago.toFixed()} seconds ago`
  }, 1000)
}

const nodes = async() => {
  const response = await fetch("http://testnet.zincir.xyz:9147/nodes")
  let nodes = await response.json()
  nodes.push(HOST)
  document.getElementById('nodes').innerHTML = JSON.stringify(nodes, null, 2);
}

const difficulty = async(lastBlock) => {
  const difficulties = []

  let index = lastBlock.index
  while (index >= 0) {
    block = await getBlock(index)
    difficulties.push(block.difficulty)
    index = index -60
  }

  document.getElementById('difficulty').innerHTML = JSON.stringify(difficulties, null, 2);
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
  hljs.initHighlighting();
}

const hashRate = async (lastBlock) => {
  firstIndexWithDifficulty = lastBlock.index - lastBlock.index % 60
  firstBlock = await getBlock(firstIndexWithDifficulty)
  elapsedTime = lastBlock.timestamp - firstBlock.timestamp
  averageTime = elapsedTime / (lastBlock.index - firstBlock.index)

  digitCount = lastBlock.difficulty.length
  hex = parseInt(lastBlock.difficulty, 16)
  let difficulty = 16 ** digitCount / hex
  let hashRate = difficulty / averageTime /1000

  document.getElementById('hash-rate').innerText = `${hashRate.toFixed(3)} KH/sec`;
}

const averageBlock = async (blockCount, id, lastBlock) => {
  const first = blockCount == -1? 1 : lastBlock.index - blockCount

  const response2 = await fetch(`http://testnet.zincir.xyz:9147/blocks/${first}`)
  const block2 = await response2.json()

  const average = (lastBlock.timestamp - block2.timestamp)/(lastBlock.index-first)

  document.getElementById(id).innerText = `${average.toFixed(1)} seconds for last ${blockCount == -1 ? lastBlock.index : blockCount}`;
}

window.onload = app
