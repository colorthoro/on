function patch_danmu_plugins(art){
    danmuku = art.plugins.artplayerPluginDanmuku;
    option = danmuku.option;
    let speedMap = {
        10: '极慢',
        7.5: '较慢',
        5: '适中',
        2.5: '较快',
        1: '极快',
    }
    let speedSelector = []
    for (let key in speedMap){
        speedSelector.push({
            default: option.speed == key,
            html: speedMap[key],
            time: parseFloat(key),
        })
    }
    let opacityMap = {
        1: '100%',
        0.75: '75%',
        0.5: '50%',
        0.25: '25%',
        0: '0%',
    }
    let opacitySelector = []
    for (let key in opacityMap){
        opacitySelector.push({
            default: option.opacity == key,
            opacity: parseFloat(key),
            html: opacityMap[key],
        })
    }
    let marginMap = {
        "75%": "1/4",
        "50%": "半屏",
        "25%": "3/4",
        "0%": "满屏",
    }
    let marginSelector = []
    for (let key in marginMap){
        marginSelector.push({
            default: option.margin[1] == key,
            margin: [10, key],
            html: marginMap[key],
        })
    }
    art.setting.update({
        width: 260,
        name: 'danmuku',
        selector: [
            {
                html: '播放速度',
                icon: '',
                tooltip: speedMap[option.speed],
                selector: speedSelector,
                onSelect: function (item) {
                    danmuku.config({
                        speed: item.time,
                    });
                    return item.html;
                },
            },
            {
                html: '字体大小',
                icon: '',
                tooltip: option.fontSize,
                range: [option.fontSize, 8, 50, 1],
                onChange: function (item) {
                    danmuku.config({
                        fontSize: item.range,
                    });
                    return item.range;
                },
            },
            {
                html: '不透明度',
                icon: '',
                tooltip: opacityMap[option.opacity],
                selector: opacitySelector,
                onSelect: function (item) {
                    danmuku.config({
                        opacity: item.opacity,
                    });
                    return item.html;
                },
            },
            {
                html: '显示范围',
                icon: '',
                tooltip: marginMap[option.margin[1]],
                selector: marginSelector,
                onSelect: function (item) {
                    danmuku.config({
                        margin: item.margin,
                    });
                    return item.html;
                },
            },
            {
                html: '弹幕防重叠',
                icon: '',
                tooltip: option.antiOverlap ? '开启' : '关闭',
                switch: option.antiOverlap,
                onSwitch(item) {
                    danmuku.config({
                        antiOverlap: !item.switch,
                    });
                    item.tooltip = item.switch ? '关闭' : '开启';
                    return !item.switch;
                },
            },
            {
                html: '同步视频速度',
                icon: '',
                tooltip: option.synchronousPlayback ? '开启' : '关闭',
                switch: option.synchronousPlayback,
                onSwitch(item) {
                    danmuku.config({
                        synchronousPlayback: !item.switch,
                    });
                    item.tooltip = item.switch ? '关闭' : '开启';
                    return !item.switch;
                },
            },
        ],
    });
}