HOST = "testnet.zincir.xyz:9147"
const lastBlock = async () => {
  const response = await fetch("http://testnet.zincir.xyz:9147/blocks")
  return await response.json()
}

const getBlock = async (index) => {
  const response = await fetch(`http://testnet.zincir.xyz:9147/blocks/${index}`)
  return await response.json()
}

const render = async () => {
  const block = await lastBlock();
  status()
  difficulty(block)
  averageBlock(6, '6-time', block)
  averageBlock(60, '60-time', block)
  averageBlock(120, '120-time', block)
  averageBlock(-1, 'time', block)
  nextDifficultyAdjustment(block)
  showLastBlock(block)
  nodes()
}

const app = () => {
  render()
  setInterval(render, 15000)
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
    console.log(index)
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

const averageBlock = async (blockCount, id, lastBlock) => {
  const first = blockCount == -1? 1 : lastBlock.index - blockCount

  const response2 = await fetch(`http://testnet.zincir.xyz:9147/blocks/${first}`)
  const block2 = await response2.json()

  const average = (lastBlock.timestamp - block2.timestamp)/(lastBlock.index-first)

  document.getElementById(id).innerText = `${average.toFixed(1)} seconds for last ${blockCount == -1 ? lastBlock.index : blockCount}`;
}

window.onload = app
