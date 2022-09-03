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

  { title: '诈骗', icon: 'directions_walk', url: 'https://api.i-meto.com/meting/api?server=netease&type=url&id=5221167&auth=99dfa3046c660a386a4aef99d8df2fabe78c065a' },
  { title: '间操', icon: 'accessibility', url: 'https://api.i-meto.com/meting/api?server=netease&type=url&id=25813883&auth=a471cadbbb11712c8f2c819e894420b859432c28' },
  { title: '抬走', icon: 'accessible', url: 'https://api.i-meto.com/meting/api?server=netease&type=url&id=430114655&auth=93d801fa794ce9cbbe944a94a6c034fb212f254e' },
]
if (data.has('songPreset')) songPreset = data.get('songPreset')
data.set('songPreset', songPreset)

let Dialog = null
const DIALOG_TEXT = `<div class="mdui-dialog" id="dialog"><div class="mdui-dialog-title">自定义音乐</div><div class="mdui-dialog-content"><div class="mdui-textfield"><label class="mdui-textfield-label">名称</label><input class="mdui-textfield-input" id="dialog-name" type="text" required /><div class="mdui-textfield-error">名称不能为空，不然你咋区分</div></div><div class="mdui-textfield"><label class="mdui-textfield-label">单曲ID或分享链接</label><input class="mdui-textfield-input" id="dialog-url" type="text" /><div class="mdui-textfield-error" id="dialog-url-error">无法解析</div><div class="mdui-textfield-helper">在网易云打开单曲，复制分享链接然后粘贴到这里</div></div></div><div class="mdui-dialog-actions"><button class="mdui-btn mdui-ripple" mdui-dialog-cancel>取消</button><button class="mdui-btn mdui-ripple" id="dialog-save" mdui-dialog-confirm>保存</button></div></div>`

songPreset.forEach(({ title, icon, text }, id) => {
  if (id % 3 == 0) $('.audio-card').append(`<div id="audio-col-${id / 3}">`)
  const item = $(`
    <div class="audio-card-item" id="item-${id}">
    <div class="title">${title}</div>
    <i class="mdui-icon material-icons">file_download</i>
    <div class="filename">点击加载</div>
    </div>`)
  item.on('click', () => {
    if (!songBuf[id]) {
      loadBuffer(songPreset[id], id)
      return
    }
    if (!mode) {
      if (BufferNode && BufferNode.state == 'playing') {
        BufferNode.onended = null
        BufferNode.stop()
        BufferNode.state = 'closed'
      }
      BufferNode = null
      BufferNode = audioCtx.createBufferSource()
      BufferNode.buffer = songBuf[id]
      BufferNode.connect(GainNode)
      BufferNode.state = 'playing'
      BufferNode.startTime = Date.now()
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
  item.on('contextmenu', (evt) => {
    evt.preventDefault()
    Dialog = new mdui.Dialog(DIALOG_TEXT, {
      closeOnConfirm: false, destroyOnClosed: true, modal: true
    })
    const $name = $('#dialog-name'), $url = $('#dialog-url'), $error = $('#dialog-url-error')
    $name.on('keydown', ({ key }) => {
      if (key == 'Enter') $('#dialog-save')[0].click()
    })
    $url.on('keydown', ({ key }) => {
      if (key == 'Enter') $('#dialog-save')[0].click()
    })
    $('#dialog-save').on('click', async () => {
      const title = $name.val(), url = $url.val()
      let result = null
      if (url.match(/(?<=song\??id=)\d+/) != null) //  匹配成功
        result = url.match(/(?<=song\??id=)\d+/)[0]
      else if (url.match(/[^\d]/) != null) // 含有未知字符
        $error.text('是无法理解的内容呢qwq')
      else if (url != "") // 纯数字，推测为 ID
        result = parseInt(url)
      else // 根本没输
        $error.text('请输入URL...')

      if (!result) {
        $error.parent().addClass('mdui-textfield-invalid')
      } else {
        $error.parent().removeClass('mdui-textfield-invalid')
        $('#dialog-save').text('识别中')
        $('.mdui-dialog-actions button').attr('disabled', true)
        const res = await fetch('https://api.i-meto.com/meting/api?type=song&id=' + result).then(data => data.json())
        if (res.length == 0) {
          $('#dialog-save').text('识别失败了qwq')
          setTimeout(() => {
            $('.mdui-dialog-actions button').removeAttr('disabled')
            $('#dialog-save').text('保存')
          }, 1000)
          return
        }
        const { url } = res[0]
        songPreset[id].url = url
        songPreset[id].title = title
        $($('#item-' + id).children()[0]).text(title)
        data.set('songPreset', songPreset)
        await localforage.removeItem('cache-' + id)
        loadBuffer(songPreset[id], id)
        $('#dialog-save').text('解析成功喵~')
        setTimeout(() => {
          Dialog.close()
        }, 600)
      }
    })
    Dialog.open()
    $name.val(songPreset[id].title)
    if (songPreset[id].url.match(/id=\d+/))
      $url.val(songPreset[id].url.match(/id=\d+/)[0].split('=')[1])
    $('#dialog').mutation()
    Dialog.handleUpdate()
  })
  $(`#audio-col-${~~(id / 3)}`).append(item)
})

async function fetchWithProcess(url, fn) {
  const { body: data, headers } = await fetch(url)
  const totalLength = +headers.get('Content-Length')
  const reader = data.getReader()

  let receivedLength = 0, result = new Uint8Array(totalLength)
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    result.set(value, receivedLength)
    receivedLength += value.length
    fn(receivedLength / totalLength)
  }

  return result.buffer
}
async function loadBuffer({ url }, id) {
  const el = $($('#item-' + id).children()[2])
  console.log('%cstart loading', 'color:yellow;border: 1px yellow solid;border-radius:4px;padding:0 4px', id)
  $('#item-' + id).children()[1].innerHTML = `<div class="half-circle-spinner"><div class="circle circle-1"></div><div class="circle circle-2"></div></div>`
  songPreset[id].loading = true

  el.text('加载缓存...')
  const cache = await localforage.getItem('cache-' + id)
  if (!cache) {
    el.text('未找到缓存')
    setTimeout(() => {
      if (el.text() == '未找到缓存') el.text('准备下载...')
    }, 1000)
    await fetchWithProcess(url, (precent) => {
      el.text('下载中 ' + (precent * 100).toFixed() + '%')
    })
      .then(async (buf) => {
        el.text('缓存中...')
        await localforage.setItem('cache-' + id, buf.slice())
        el.text('解码中...')
        return audioCtx.decodeAudioData(buf)
      })
      .then((buf) => {
        console.log('%cloaded', 'color:lightgreen;border: 1px lightgreen solid;border-radius:4px;padding:0 4px', id, url)
        songBuf[id] = null
        songBuf[id] = buf
        $($('#item-' + id).children()[1]).text(songPreset[id].icon)
        el.text('✓ 成功 ')
        setTimeout(() => el.text('✓ ' + TtoMMSS(buf.duration)), 800)
      })
  }
  else {
    el.text('解析中...')
    await audioCtx.decodeAudioData(cache)
      .then((buf) => {
        console.log('%cloaded', 'color:lightgreen;border: 1px lightgreen solid;border-radius:4px;padding:0 4px', id, url)
        songBuf[id] = null
        songBuf[id] = buf
        $($('#item-' + id).children()[1]).text(songPreset[id].icon)
        el.text('✓ 成功 ')
        setTimeout(() => el.text('✓ ' + TtoMMSS(buf.duration)), 800)
      })
  }
}
songPreset.forEach(loadBuffer)

function handleDelay(sec) {
  if (mode && timer.Points.length > 0)
    timer.Points[0].time += sec * 1000
}

function handleStop() {
  if (mode) {
    timer.Points.splice(0, 1)
    $($(`#time-list`).children()[0]).remove()
  }
  $(`#status`).text('NEXT')
  if (BufferNode && BufferNode.state == 'playing') {
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
  if (BufferNode && BufferNode.state == 'playing') {
    BufferNode.stop()
    BufferNode.state = 'closed'
  }
  BufferNode = null
  BufferNode = audioCtx.createBufferSource()
  BufferNode.buffer = songBuf[id]
  BufferNode.connect(GainNode)
  BufferNode.state = 'playing'
  BufferNode.start(0)
  BufferNode.onended = () => {
    if (d == timer.nowPlaying) timer.stopPlaying()
  }
})

function toggleAuto(m) {
  if (mode == m) return
  handleStop()
  $('.auto').toggleClass('mdui-color-indigo')
  $('.manual').toggleClass('mdui-color-indigo')
  $('#skip').text((mode = m) ? '跳过' : '停止')
}
toggleAuto(false)

const selectText = `<select class="mdui-select">
${songPreset.map(({ title }, id) => `<option value="${id}">${title}</option>`).join('')}
</select>`
for (const d in points) {
  $('#edit-list').append(`<li class="mdui-list-item"><div class="mdui-list-item-content"><input class="mdui-list-item-title" value="${d}" size="3" type="time"/>${selectText.replace(`value="${points[d] - 1}"`, `value="${points[d] - 1}" selected`)}<button class="mdui-btn mdui-btn-icon mdui-ripple mdui-btn-dense" onclick="handleDel(this)"><i class="mdui-icon material-icons">clear</i></button><button class="mdui-btn mdui-btn-icon mdui-ripple mdui-btn-dense" onclick="handleAdd(this)"><i class="mdui-icon material-icons">add</i></button></div></li>`)
}
function handleSave() {
  data.set('points', JSON.parse(`{${[...$('#edit-list')[0].children].map(e => [...e.children[0].children].map(e => e.value)).filter(([e]) => e != "").map(e => `"${e[0]}":${1 + parseInt(e[1])}`)}}`))
  location.reload()
}
function handleReset() {
  data.del('points')
  location.reload()
}
function handleAdd(el) {
  $(el.parentNode.parentNode).after(`<li class="mdui-list-item"><div class="mdui-list-item-content"><input class="mdui-list-item-title" size="3" type="time"/>${selectText}<button class="mdui-btn mdui-btn-icon mdui-ripple mdui-btn-dense" onclick="handleDel(this)"><i class="mdui-icon material-icons">clear</i></button><button class="mdui-btn mdui-btn-icon mdui-ripple mdui-btn-dense" onclick="handleAdd(this)"><i class="mdui-icon material-icons">add</i></button></div></li>`)
}
function handleDel(el) {
  el.parentNode.parentNode.remove()
}

async function handleResetSong() {
  data.del('songPreset')
  await localforage.dropInstance()
  location.reload()
}
async function handleDownloadAll() {
  songPreset.filter((_, id) => songBuf[id]).forEach(loadBuffer)
}