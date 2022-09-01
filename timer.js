const Points = {
    // 早自习
    '06:48': 3,
    '06:50': 1,
    '07:30': 2,

    // 1
    '07:38': 3,
    '07:40': 1,
    '08:20': 2,

    // 2
    '08:28': 3,
    '08:30': 1,
    '09:10': 4, // 眼操

    // 3
    '09:23': 3,
    '09:25': 1,
    '10:05': 2,

    // 4
    '10:28': 3,
    '10:30': 1,
    '11:10': 2,

    // 5
    '11:18': 3,
    '11:20': 1,
    '12:00': 2,

    // 午检
    '13:28': 3,
    '13:30': 1,

    // 6
    '13:38': 3,
    '13:40': 1,
    '14:20': 4, // 眼操

    // 7
    '14:43': 3,
    '15:45': 1,
    '15:25': 2,

    // 8
    '15:33': 3,
    '15:35': 1,
    '16:15': 2,

    // 9
    '16:23': 3,
    '16:25': 1,
    '17:00': 2,

    // 晚自习 1
    '17:58': 3,
    '18:00': 1,
    '19:00': 2,

    // 晚自习 2
    '19:08': 3,
    '19:10': 1,
    '20:10': 2,

    // 晚自习 3
    '20:18': 3,
    '20:20': 1,
    '21:20': 5, // 卡农
    '21:20': 5, // 卡农
}

let points = Points
if (data.has('points')) points = data.get('points')

class Timer {
    constructor() {
        this.today = ~~(Date.now() / 3600000) * 3600000
        this.nowPlaying = 0
        this.Points = []
        for (const d in points) {
            const time = this.HHMMtoT(d),
                id = points[d]
            this.Points.push({ time, id, d })
        }
        this.Points.sort((a, b) => a.time - b.time)
        this.Points = this.Points.filter(({ time }) => time >= Date.now())

        $('#time-list').empty()
        this.Points.forEach(({ time, id, d }, i) => {
            $('#time-list').append(`
            <li class="mdui-list-item mdui-ripple">
                <i class="mdui-list-item-avatar mdui-icon material-icons">
                ${songPreset[id - 1].icon}</i>
                <div class="mdui-list-item-content">
                    <div class="mdui-list-item-title">
                        ${songPreset[id - 1].title}
                    </div>
                    <div class="mdui-list-item-text">${d}</div>
                </div>
            </li>
            `)
        })

        this.startUpdate = () => {
            requestAnimationFrame(this.startUpdate)
            if (this.Points.length == 0) $('#countdown').text('--:--')
            else {
                let timeleft = (this.Points[0].time - Date.now()) / 1000
                if (timeleft <= 0) {
                    if (mode) {
                        this.startPlaying()
                    } else {
                        this.nowPlaying++
                        this.Points.splice(0, 1)
                        $($(`#time-list`).children()[0]).remove()
                    }
                }
                this.Timeleft = this.Timeleft * (1 - .1) + timeleft * .1
                $('#countdown').text(TtoMMSS(Math.max(this.Timeleft + 1, 0)))
            }
        }
        this.Timeleft = 0
        this.startUpdate()
    }

    setMutation(func) {
        this.f = func
    }

    startPlaying() {
        console.log('%cAUTO PLAY', 'color:#11ffa4;border: 1px #11ffa4 solid;border-radius:4px;padding:0 4px')
        if (this.Points.length == 0) return
        this.stopPlaying()
        this.nowPlaying++
        this.f(this.Points[0].id - 1, this.nowPlaying)
        this.Points.splice(0, 1)
        $($(`#time-list`).children()[0]).addClass('mdui-list-item-active')
        $(`#status`).text('PLAY')
        $(`#countdown`).addClass('mdui-color-red')
        $(`#countdown`).removeClass('mdui-color-green')
    }

    stopPlaying() {
        if ($($(`#time-list`).children()[0]).hasClass('mdui-list-item-active'))
            $($(`#time-list`).children()[0]).remove()
        $(`#status`).text('NEXT')
        $(`#countdown`).removeClass('mdui-color-red')
        $(`#countdown`).addClass('mdui-color-green')
    }

    HHMMtoT(str) {
        const [h, m, t] = str.split(':').map((n) => parseInt(n))
        const ans = new Date()
        ans.setHours(h, m, t ?? 0, 0)
        return +ans
    }
}
