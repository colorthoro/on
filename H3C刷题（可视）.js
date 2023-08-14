async function refreshFrame(src, sec, win=window){
    let frame = `<frameset cols='*'>\n<frame id='refreshFrame' src='${src}' ></frameset>`;
    win.document.write(frame);
    sleep = async(t)=>await new Promise(ok=>setTimeout(ok, t*1000));
    while(1){
        ele = win.document.getElementById('refreshFrame');
        cw = ele.contentWindow;
        console.log('work1')
        await sleep(10);
        console.log('work2')
        cw.document.querySelector('.vj-button').click();
        console.log('work3')
        await sleep(sec);
        cw.location.reload();
        console.log('workok')
    }
}
refreshFrame(location.href, 3);



// 呼出做题界面的控制台，直接粘贴
function inFrame(src, func, id = 'inFrame-1', ppp = window) {
    let frame = `<frameset cols='*'>\n<frame id='${id}' src='${src}' ></frameset>`;
    ppp.document.write(frame);
    let fw = $(ppp.document).find('#' + id)[0].contentWindow;
    ppp.fw = fw;
    fw.id = id;
    fw.ppp = ppp;
    fw.onload = () => { func(fw); };
}

async function correct(fw) {
    await new Promise(ok => setTimeout(ok, 1000));
    fw.document.querySelectorAll('#goNext')[0].click();
    await new Promise(ok => setTimeout(ok, 1000));
    fw.document.querySelectorAll('a.layui-layer-btn1')[0].click();
    await new Promise(ok => setTimeout(ok, 1000));
    let close = fw.document.querySelectorAll('.layui-layer-close1')[0];
    if (close) close.click();
    await new Promise(ok => setTimeout(ok, 1000));
}

inFrame(location.href, async (fw) => {
    console.log(fw.id, fw.ppp.id);
    $(fw.document).find('.cs-test-item').each((i, item) => {
        $(item).find('div.cs-test-option:nth-child(2n)').each((j, option) => {
            $(option).click();
        })
    });
    await correct(fw);
    let src = fw.location.href.replace('enterCourse', 'viewCourseExamPage') + `&examUserId=${info.examUserId}`
    inFrame(src, (fw) => {
        console.log(fw.id, fw.ppp.id);
        let src = location.href.replace('viewCourseExamPage', 'enterCourse');
        inFrame(src, async (fw) => {
            console.log(fw.id, fw.ppp.id);
            rightDataMap = fw.ppp.rightDataMap;
            console.log(rightDataMap);
            for (let k in rightDataMap) {
                let v = rightDataMap[k];
                let inputs = fw.document.getElementsByName(k.split('_')[1]);
                // console.log(k, v, inputs);
                inputs.forEach(input => {
                    let abc = $(input).parent().next().text();
                    let info = $(input).parent().parent().next().text();
                    let option = $(input).parent().parent().parent();
                    // console.log(abc, info);
                    if (!input.checked && (v.includes(abc) || v.includes(info))) option.click();
                    else if (input.checked) option.click();
                });
            }
            await correct(fw);
        }, 'inFrame-3', fw)
    }, 'inFrame-2', fw)
}, 'inFrame-1', window)