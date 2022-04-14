const audioCtx = new AudioContext(),
    GainNode = audioCtx.createGain()
let BufferNode,
    isMuted = true
// 连 连 看
GainNode.connect(audioCtx.destination)

// songPreset 默认值设置
if (!data.has('songPreset'))
    data.set('songPreset', [
        { title: '上课', icon: 'looks_one' },
        { title: '下课', icon: 'looks_two' },
        { title: '预铃', icon: 'looks_3' },

        { title: '眼操', icon: 'looks_4' },
        { title: '晚自习', icon: 'looks_5' },
        { title: '占位置', icon: 'looks_6' },
    ])

songPreset = data.get('songPreset')
refreshSongPreset()

if (!data.has('mode')) data.set('mode', true)

function refreshSongPreset() {
    $('.audio-card').empty()
    songPreset.forEach(({ title, icon, text }, id) => {
        if (id % 3 == 0)
            $('.audio-card').append(`<div id="audio-col-${id / 3}">`)
        const item = $(`
                <div class="audio-card-item" id="item-${id}">
                  <div class="title">${title}</div>
                  <i class="mdui-icon material-icons">${
                      text ? icon : 'refresh'
                  }</i>
                  <div class="filename">${text ?? '加载中~'}</div>
                </div>`)
        item.on('click', () => {
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

async function handleChange(id) {
    fetch(`./music/${id + 1}.mp3`, { mode: 'no-cors' })
        .then((res) => res.arrayBuffer())
        .then((buf) => audioCtx.decodeAudioData(buf))
        .then((buf) => {
            console.log('awa')
            songBuf[id] = buf
            songPreset[id].text = '✓ ' + TtoMMSS(buf.duration)
            refreshSongPreset()
        })
}
for (let i = 0; i < songPreset.length; i++) {
    handleChange(i)
}
// hand
function handleDelay(sec) {
    timer.Points[0].time += sec * 1000
}

function togglePlay() {
    switch (BufferNode?.context.state) {
        case 'running':
            if (BufferNode.state == 'closed') timer.startPlaying()
            else {
                audioCtx.suspend()
                $('#play').text('暂停')
                $('#play-icon').text('pause')
            }
            break
        case 'suspended':
            audioCtx.resume()
            $('#play').text('播放')
            $('#play-icon').text('play_arrow')
            break
    }
}

function handleStop() {
    if (mode) {
        timer.Points.splice(0, 1)
        $($(`#list`).children()[0]).remove()
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
        console.log('ended', d, timer.nowPlaying)
        if (d == timer.nowPlaying) timer.stopPlaying()
    }
})

function toggleAuto(m) {
    if ((mode = m)) {
        $('.auto').addClass('mdui-color-indigo')
        $('.manual').removeClass('mdui-color-indigo')
        $('#skip').text('跳过')
    } else {
        $('.manual').addClass('mdui-color-indigo')
        $('.auto').removeClass('mdui-color-indigo')
        $('#skip').text('停止')
    }
}
toggleAuto(false)
