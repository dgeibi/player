/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */
importScripts('workbox-sw.prod.js')

const workboxSW = new self.WorkboxSW({ clientsClaim: true, skipWaiting: true })

workboxSW.precache([])

workboxSW.router.registerRoute(
  /.*\.(woff|woff2|eot|ttf|svg)/,
  workboxSW.strategies.cacheFirst({
    cacheName: 'assets',
    cacheableResponse: {
      statuses: [0, 200],
    },
  })
)
