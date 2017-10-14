import Player from './Player'
import selectors from './utils/selectors'

const views = selectors({
  audio: '.player__audio',
  file: '#audio-file',
  fileSelector: '.file-selector',
  play: '.player__button--play',
  prev: '.player__button--prev',
  next: '.player__button--next',
  loop: '.player__loop-toggle',
  volume: '.player__volume',
  processbar: '.player__process-bar',
  currentTime: '.player__current-time',
  duration: '.player__duration',
  title: '.player__title',
});

(async () => {
  const player = await Player.fromStore(views.audio)

  player.on('play', () => {
    views.play.title = '暂停'
    views.play.classList.remove('player__button--play')
    views.play.classList.add('player__button--pause')
  })

  player.on('pause', () => {
    views.play.title = '播放'
    views.play.classList.remove('player__button--pause')
    views.play.classList.add('player__button--play')
  })

  player.on('metadata', (data) => {
    console.log(data)
    const { artist, title } = data
    let ret = title
    if (artist) ret += ` - ${artist}`
    views.title.textContent = ret
  })

  views.file.addEventListener('change', (e) => {
    player.addFiles(e.target.files)
    e.target.value = null
  })

  views.fileSelector.addEventListener('click', (e) => {
    e.stopPropagation()
    views.file.click()
  })

  const pad = n => (Number(n) < 10 ? `0${n}` : String(n))
  const convertSecs = s => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`

  views.audio.addEventListener('timeupdate', () => {
    const currentTime = views.audio.currentTime
    views.processbar.value = currentTime
    views.currentTime.textContent = convertSecs(currentTime)
  })

  views.processbar.addEventListener('change', () => {
    views.audio.currentTime = Number(views.processbar.value)
  })

  views.audio.addEventListener('loadeddata', () => {
    views.processbar.min = 0
    const duration = views.audio.duration
    views.processbar.max = views.audio.duration
    views.duration.textContent = convertSecs(duration)
  })

  views.play.addEventListener('click', async () => {
    if (player.playing) {
      player.pause()
    } else {
      player.play()
    }
  })

  views.prev.addEventListener('click', () => {
    player.previous()
  })

  views.next.addEventListener('click', () => {
    player.next()
  })

  views.loop.checked = player.get('loop')
  views.loop.addEventListener('change', (e) => {
    player.loop = e.target.checked
    player.set('loop', e.target.checked)
  })

  views.volume.value = views.audio.volume * 100
  views.volume.addEventListener('change', (e) => {
    player.audio.volume = e.target.value / 100
  })
})()

