// 呼出做题界面的控制台，直接粘贴
async function myFrame(src, func, id) {
    let frame = document.createElement('iframe');
    document.body.appendChild(frame);
    frame.src = src, frame.id = id, frame.contentWindow.id = id;
    let ok, workResPromise = new Promise(i => ok = i);
    frame.onload = () => ok(func(frame));
    return { frame, workRes: await workResPromise };
}

myFrame(location.href, async (frame) => {
    let doc = frame.contentWindow.document;
    doc.querySelectorAll('.cs-test-item').forEach(item => {
        item.querySelectorAll('div.cs-test-option:nth-child(2n)').forEach(option => {
            option.click();
        })
    });
    await new Promise(ok => setTimeout(ok, 500));
    doc.querySelectorAll('#goNext')[0].click();
    await new Promise(ok => setTimeout(ok, 500));
    doc.querySelectorAll('a.layui-layer-btn1')[0].click();
    await new Promise(ok => setTimeout(ok, 500));
    doc.querySelectorAll('a.layui-layer-btn0')[0].click();
    let ok, loadedPromise = new Promise(i => ok = i);
    frame.onload = ok;
    await loadedPromise;
}, 'myFrame-1').then(async res => {
    let cw = res.frame.contentWindow, rightDataMap=cw.rightDataMap;
    let src = cw.location.href.replace('viewCourseExamPage', 'enterCourse');
    return myFrame(src, async (frame) => {
        let cw = frame.contentWindow, doc = cw.document;
        for (let k in rightDataMap) {
            let v = rightDataMap[k];
            let inputs = doc.getElementsByName(k.split('_')[1]);
            console.log(k, v, inputs);
            await new Promise(ok => setTimeout(ok, 500));
            inputs.forEach(input => {
                let abc = $(input).parent().next().text();
                let info = $(input).parent().parent().next().text();
                let option = $(input).parent().parent().parent();
                console.log(abc, info);
                if (!input.checked && (v.includes(abc) || v.includes(info))) option.click();
                else if (input.checked) option.click();
            });
        }
        await new Promise(ok => setTimeout(ok, 500));
        doc.querySelectorAll('#goNext')[0].click();
        await new Promise(ok => setTimeout(ok, 500));
        doc.querySelectorAll('a.layui-layer-btn1')[0].click();
        location.reload();
    }, 'myFrame-2');
});
