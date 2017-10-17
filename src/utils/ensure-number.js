export default (num, fallback, min = -Infinity, max = Infinity) => {
  const number = Number(num)
  if (Number.isNaN(number) || num < min || num > max) return fallback
  return number
}
