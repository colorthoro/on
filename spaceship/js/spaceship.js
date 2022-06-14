'use strict';

let mFlag = false;
function isMobile() {
    if (window.navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)) {
        return mFlag = true; // 移动端
    } else {
        return false; // PC端
    }
}
let eventStr = isMobile() ? 'touchmove' : 'mousemove';

const ship = document.getElementById('spaceship');
let skyX = 0, skyY = 0, pangle, angle, skyBackTimer, shipToTimer,
    shipX = ship.offsetLeft + ship.offsetWidth / 2,
    shipY = ship.offsetTop + ship.offsetHeight / 2,
    dx, dy, index, mul;
console.log(shipX, shipY);
document.addEventListener(eventStr, (e) => {
    if (mFlag) {
        e.preventDefault();
        // console.log(e);
        e = e.touches[0];
    }
    index = 0;  // 鼠标移动会重置飞船的跟踪
    mul = 9;  // 飞船刚开始走的快，后面变慢
    dx = e.clientX - shipX;
    dy = e.clientY - shipY;
    pangle = Math.atan2(dy, dx);  // atan(dy/dx)没法区分象限
    angle = -1 * 180 * pangle / Math.PI;  // BOM的坐标系，与常规坐标系的y轴相反。
    // console.log('飞船BOM坐标', shipX, shipY);
    // console.log('鼠标BOM坐标', e.clientX, e.clientY);
    // console.log('鼠标相对飞船BOM坐标', dx, dy);
    // console.log('鼠标相对飞船角度，常规坐标', angle);

    function shipTo() {
        clearTimeout(shipToTimer);
        index += mul;
        if (index < 3000) {
            shipX += dx / 3000 * mul,
                shipY += dy / 3000 * mul;
            // console.log('飞船速度矢量，BOM坐标', (dx / 500 * mul).toFixed(1), (dy / 500 * mul).toFixed(1))
            if (!(index % 200)) mul = Math.max(mul - 3, 2);
        }
        ship.style.transform = `rotate(${90 - angle}deg)`;  // 飞船旋转，正数顺时针旋转
        ship.style.left = shipX - ship.offsetWidth / 2 + 'px';  // left + offsetWidth / 2 = shipX
        ship.style.top = shipY - ship.offsetHeight / 2 + 'px';
        shipToTimer = setTimeout(shipTo, 1);
    }
    shipTo();

    function skyBack() {
        clearTimeout(skyBackTimer);  // 上次计时器启动还没执行时，鼠标移动事件再次发生，就要取消上次的执行，以根据新参数执行
        let stepX = Math.max(e.clientX - shipX),
            stepY = Math.max(e.clientY - shipY);  // 这里不要再直接用dx和dy，因为shipTo()使飞船渐进鼠标，背景速度也该变化。
        if (Math.abs(stepX) < 1 && Math.abs(stepY) < 1) {
            stepX *= 10;
            stepY *= 10;  // 悬停惯性速度
        }
        skyX -= stepX / 10;
        skyY -= stepY / 10;
        // console.log('背景速度矢量，BOM坐标', stepX.toFixed(1), stepY.toFixed(1));
        document.body.style.backgroundPositionX = skyX + 'px';
        document.body.style.backgroundPositionY = skyY + 'px';
        skyBackTimer = setTimeout(skyBack, 10);  // 指定毫秒数后调用
    }
    skyBack();
}, { passive: false });

// setInterval(() => {
//     index++;
//     if(index < 30){
//         shipX += dx / 30;
//         shipY += dy / 30;
//     }
//     ship.style.left = shipX - ship.offsetWidth / 2 + 'px';  // left + offsetWidth / 2 = shipX
//     ship.style.top = shipY - ship.offsetHeight / 2 + 'px';
// }, 10);
// 这样写与shipTo()等效，且无需shipToTimer了。