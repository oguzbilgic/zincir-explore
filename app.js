const app = async () => {
  averageBlock(-1, 'time')
  averageBlock(60, '60-time')
  lastBlock()
}

const lastBlock = async () => {
  const response = await fetch("http://localhost:9147/blocks")
  const lastBlock = await response.json()

  document.getElementById('last-block').innerHTML = JSON.stringify(lastBlock, null, 2);
  hljs.initHighlighting();
}

const averageBlock = async (blockCount, id) => {
  const response = await fetch("http://localhost:9147/blocks")
  const lastBlock = await response.json()

  const first = blockCount == -1? 1 : lastBlock.index - blockCount

  const response2 = await fetch(`http://localhost:9147/blocks/${first}`)
  const block2 = await response2.json()

  const average = (lastBlock.timestamp - block2.timestamp)/(lastBlock.index-first)

  document.getElementById(id).innerText = average;
}

window.onload = app
