const Points = {
    // 早自习
    '06:58': 3,
    '07:00': 1,
    '07:40': 2,

    '07:58': 3,
    '08:00': 1,
    '08:40': 2,

    '08:58': 3,
    '09:00': 1,
    '09:40': 4, // 眼操

    '09:58': 3,
    '10:00': 1,
    '10:40': 2,

    '10:58': 3,
    '11:00': 1,
    '11:40': 2,

    // 午检
    '13:28': 3,
    '13:30': 1,

    '13:58': 3,
    '14:00': 1,
    '14:40': 4, // 眼操

    '14:58': 3,
    '15:00': 1,
    '15:40': 2,

    '15:58': 3,
    '16:00': 1,
    '16:40': 2,

    // 晚自习
    '17:58': 3,
    '18:00': 1,
    '19:00': 2,

    '19:18': 3,
    '19:20': 1,
    '20:20': 5,

    // TEST
    '07:40': 3,
    '07:41': 3,
    '07:42': 3,
    '07:43': 3,
    '07:44': 3,
    '07:45': 3,
    '07:46': 3,
    '07:53:00': 3,
    '07:53:06': 3,
    '07:53:13': 3,
    '07:53:24': 3,
    '07:53:35': 3,
    '07:53:48': 3,
    '07:53:51': 3,
    '07:48': 3,
    '07:49': 3,
}

class Timer {
    constructor() {
        this.today = ~~(this.now() / 3600000) * 3600000
        this.nowPlaying = 0
        this.Points = []
        for (const d in Points) {
            const time = this.HHMMtoT(d),
                id = Points[d]
            this.Points.push({ time, id, d })
        }
        this.Points.sort((a, b) => a.time - b.time)
        this.Points = this.Points.filter(({ time }) => time >= this.now())

        $('#list').empty()
        this.Points.forEach(({ time, id, d }, i) => {
            $('#list').append(`
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
            if (!mode || this.Points.length == 0) $('#countdown').text('--:--')
            else {
                let timeleft = (this.Points[0].time - this.now()) / 1000
                if (timeleft <= 0) this.startPlaying()
                $('#countdown').text(TtoMMSS(Math.max(timeleft + 1, 0)))
            }
        }
        this.startUpdate()
    }

    setMutation(func) {
        this.f = func
    }

    startPlaying() {
        console.log('start')
        if (this.Points.length == 0) return
        this.stopPlaying()
        this.nowPlaying++
        this.f(this.Points[0].id - 1, this.nowPlaying)
        this.Points.splice(0, 1)
        $($(`#list`).children()[0]).addClass('mdui-list-item-active')
        $(`#status`).text('PLAY')
        $(`#countdown`).addClass('mdui-color-red')
        $(`#countdown`).removeClass('mdui-color-green')
    }
    stopPlaying() {
        console.log('stop')
        if ($($(`#list`).children()[0]).hasClass('mdui-list-item-active'))
            $($(`#list`).children()[0]).remove()
        $(`#status`).text('NEXT')
        $(`#countdown`).removeClass('mdui-color-red')
        $(`#countdown`).addClass('mdui-color-green')
    }

    now() {
        return +new Date()
    }

    HHMMtoT(str) {
        const [h, m, t] = str.split(':').map((n) => parseInt(n))
        const ans = new Date()
        ans.setHours(h, m, t ?? 0, 0)
        return +ans
    }
}
