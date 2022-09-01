const audioCtx = new AudioContext(),
  GainNode = audioCtx.createGain()
let BufferNode,
  isMuted = true,
  isNew = false
// 连 连 看
GainNode.connect(audioCtx.destination)

songPreset = [
  { title: '上课', icon: 'looks_one', url: './music/1.mp3' },
  { title: '下课', icon: 'looks_two', url: './music/2.mp3' },
  { title: '预铃', icon: 'looks_3', url: './music/3.mp3' },

  { title: '眼操', icon: 'looks_4', url: './music/4.mp3' },
  { title: '晚自习', icon: 'looks_5', url: './music/5.mp3' },
  { title: '回寝', icon: 'looks_6', url: 'https://api.i-meto.com/meting/api?server=netease&type=url&id=5276818&auth=fcd3144dadb8d2951601c8dd7a424d5b335f528b' },

  { title: 'Rick Roll', icon: 'directions_walk', url: 'https://api.i-meto.com/meting/api?server=netease&type=url&id=5221167&auth=99dfa3046c660a386a4aef99d8df2fabe78c065a' },
  { title: '间操', icon: 'accessibility', url: 'https://api.i-meto.com/meting/api?server=netease&type=url&id=25813883&auth=a471cadbbb11712c8f2c819e894420b859432c28' },
  { title: 'Astronomia', icon: 'accessible', url: 'https://api.i-meto.com/meting/api?server=netease&type=url&id=430114655&auth=93d801fa794ce9cbbe944a94a6c034fb212f254e' },
]
refreshSongPreset()

function refreshSongPreset() {
  $('.audio-card').empty()
  songPreset.forEach(({ title, icon, text }, id) => {
    if (id % 3 == 0) $('.audio-card').append(`<div id="audio-col-${id / 3}">`)
    const item = $(`
                <div class="audio-card-item" id="item-${id}">
                  <div class="title">${title}</div>
                  ${text ? `<i class="mdui-icon material-icons">${icon}</i>`
        : `<div class="half-circle-spinner">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        </div>`}
                  <div class="filename">${text ?? '加载中~'}</div>
                </div>`)
    item.on('click', () => {
      if (!songBuf[id]) return
      if (!mode) {
        if (BufferNode && BufferNode.state != 'closed') {
          BufferNode.stop()
          BufferNode.state = 'closed'
        }
        BufferNode = audioCtx.createBufferSource()
        BufferNode.buffer = songBuf[id]
        BufferNode.connect(GainNode)
        BufferNode.start(0)
        $(`#status`).text('PLAY')
        $(`#countdown`).addClass('mdui-color-red')
        $(`#countdown`).removeClass('mdui-color-green')
        BufferNode.onended = () => {
          $(`#status`).text('NEXT')
          $(`#countdown`).removeClass('mdui-color-red')
          $(`#countdown`).addClass('mdui-color-green')
        }
      }
    })
    $(`#audio-col-${~~(id / 3)}`).append(item)
  })
}

async function loadBuffer() {
  songPreset.forEach(({ url }, id) =>
    fetch(url)
      .then((res) => res.arrayBuffer())
      .then((buf) => audioCtx.decodeAudioData(buf))
      .then((buf) => {
        console.log(id, url);
        songBuf[id] = buf
        songPreset[id].text = '✓ ' + TtoMMSS(buf.duration)
        refreshSongPreset()
      })
  )
}
loadBuffer()

function handleDelay(sec) {
  if (mode)
    timer.Points[0].time += sec * 1000
}

function handleStop() {
  if (mode) {
    timer.Points.splice(0, 1)
    $($(`#time-list`).children()[0]).remove()
  }
  $(`#status`).text('NEXT')
  if (BufferNode && BufferNode.state != 'closed') {
    BufferNode.stop()
    BufferNode.state = 'closed'
  }
}

function toggleMute() {
  isMuted ^= 1
  GainNode.gain.value = isMuted
  $('#mute-icon').text(`volume_${isMuted ? 'up' : 'off'}`)
  $('#mute-icon').parent().toggleClass('mdui-color-indigo')
}

const timer = new Timer()

timer.setMutation((id, d) => {
  if (BufferNode && BufferNode.state != 'closed') {
    BufferNode.stop()
    BufferNode.state = 'closed'
  }
  BufferNode = audioCtx.createBufferSource()
  BufferNode.buffer = songBuf[id]
  BufferNode.connect(GainNode)
  BufferNode.start(0)
  BufferNode.onended = () => {
    if (d == timer.nowPlaying) timer.stopPlaying()
  }
})

function toggleAuto(m) {
  if (mode == m) return
  $('.auto').toggleClass('mdui-color-indigo')
  $('.manual').toggleClass('mdui-color-indigo')
  $('#skip').text((mode = m) ? '跳过' : '停止')
}
toggleAuto(false)

const selectText = `<select class="mdui-select">
${songPreset.map(({ title }, id) => `<option value="${id}">${title}</option>`)}
</select>`
for (const d in points) {
  $('#edit-list').append(`<li class="mdui-list-item"><div class="mdui-list-item-content"><input class="mdui-list-item-title" value="${d}" size="3" type="time"/>${selectText.replace(`value="${points[d] - 1}"`, `value="${points[d] - 1}" selected`)}<button class="mdui-btn mdui-btn-icon mdui-ripple mdui-btn-dense" onclick="handleDel(this)"><i class="mdui-icon material-icons">clear</i></button><button class="mdui-btn mdui-btn-icon mdui-ripple mdui-btn-dense" onclick="handleAdd(this)"><i class="mdui-icon material-icons">add</i></button></div></li>`)
}
function handleSave() {
  data.set('points', JSON.parse(`{${[...$('#edit-list')[0].children].map(e => [...e.children[0].children].map(e => e.value)).filter(([e]) => e != "").map(e => `"${e[0]}":${e[1]}`)}}`))
  location.reload()
}
function handleReset() {
  data.del('points')
  location.reload()
}
function handleAdd(el) {
  console.log($(el.parentNode.parentNode));
  $(el.parentNode.parentNode).after(`<li class="mdui-list-item"><div class="mdui-list-item-content"><input class="mdui-list-item-title" size="3" type="time"/>${selectText}<button class="mdui-btn mdui-btn-icon mdui-ripple mdui-btn-dense" onclick="handleDel(this)"><i class="mdui-icon material-icons">clear</i></button><button class="mdui-btn mdui-btn-icon mdui-ripple mdui-btn-dense" onclick="handleAdd(this)"><i class="mdui-icon material-icons">add</i></button></div></li>`)
}
function handleDel(el) {
  el.parentNode.parentNode.remove()
}