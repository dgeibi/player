const combine = (...fns) => arg => fns.reduceRight((ret, fn) => fn(ret), arg)

export default combine
