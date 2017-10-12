export default (views) => {
  const nodes = {}
  Object.entries(views).forEach(([key, value]) => {
    nodes[key] = document.querySelector(value)
  })
  return nodes
}
