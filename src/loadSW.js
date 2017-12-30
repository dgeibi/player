const isSWUpdateAvailable = new Promise(resolve => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker
      .register('sw.js', { scope: './' })
      .then(reg => {
        console.log(`Registration succeeded. Scope is ${reg.scope}`)
        reg.addEventListener('updatefound', () => {
          const installingWorker = reg.installing
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                resolve(true)
              } else {
                resolve(false)
              }
            }
          }
        })
      })
      .catch(error => {
        console.log(`Registration failed with ${error}`)
      })
  }
})

export default isSWUpdateAvailable
