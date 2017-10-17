export default (map, key, fallback) => (map.has(key) ? key : fallback)
