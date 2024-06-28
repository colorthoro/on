// 呼出做题界面的控制台，直接粘贴
async function myFrame(src, func, id) {
    let frame = document.createElement('iframe');
    document.body.appendChild(frame);
    frame.src = src, frame.id = id, frame.contentWindow.id = id;
    let ok, workResPromise = new Promise(i => ok = i);
    frame.onload = () => ok(func(frame));
    return { frame, workRes: await workResPromise };
}
async function work() {
    let res = undefined, src = location.href;
    let myMap = new Map();
    let done = false, cnt = 1;
    while (!done) {
        if (cnt > 2) {
            let ok = confirm('题目可能随机，请确认是否自动尝试多次答题来获取答案');
            if (!ok) return;
        }
        if (res) {
            for (let k in res.frame.contentWindow.rightDataMap) {
                let v = res.frame.contentWindow.rightDataMap[k];
                myMap.set(k, v);
            }
            src = res.frame.contentWindow.location.href.replace('viewCourseExamPage', 'enterCourse');
        }
        res = await myFrame(src, async (frame) => {
            let doc = frame.contentWindow.document;
            myMap.forEach(async (v, k) => {
                // 处理每个已知题目
                let options = doc.getElementsByName(k.split('_')[1]);
                if (!options.length) return;
                let title = options[0].parentNode.parentNode.parentNode.parentNode.firstElementChild.textContent;
                console.log(title, options, k, v);
                await new Promise(ok => setTimeout(ok, 500));
                options.forEach(input => {
                    let abc = $(input).parent().next().text();
                    let info = $(input).parent().parent().next().text();
                    let option = $(input).parent().parent().parent();
                    console.log(abc, info);
                    if (!input.checked && (v.includes(abc) || v.includes(info))) option.click();
                    else if (input.checked && !(v.includes(abc) || v.includes(info))) option.click();
                });
            });
        }, `myFrame-${cnt++}`);
        done = true;
        doc.querySelectorAll('.cs-test-item').forEach(item => {
            let checked = false;
            item.querySelectorAll('input').forEach(input => {
                if (input.checked) checked = true;
            });
            if (checked) return;
            done = false;
            // 处理未知题目
            item.querySelectorAll('div.cs-test-option:nth-child(2n)').forEach(option => {
                option.click();
            });
        });
        try {
            await new Promise(ok => setTimeout(ok, 500));
            doc.querySelectorAll('#goNext')[0].click(); // 提交
            await new Promise(ok => setTimeout(ok, 500));
            doc.querySelectorAll('a.layui-layer-btn1')[0].click(); // 确认
            await new Promise(ok => setTimeout(ok, 500));
            doc.querySelectorAll('a.layui-layer-btn0')[0].click(); // 查看结果
            let ok, loadedPromise = new Promise(i => ok = i);
            frame.onload = ok;
            await loadedPromise;
        } catch (e) { }
    }
}