async function addSheetJS() {
    let sheetjs = document.createElement('script')
    sheetjs.src = 'https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js'
    let ok, p = new Promise(i => ok = i)
    sheetjs.onload = ok
    document.head.append(sheetjs)
    await p
}

function class2table(dom) {
    if (dom.classList.contains('plan-td')) {
        let td = document.createElement('td')
        td.innerText = dom.innerText.replaceAll('\n', '');
        return td
    }
    let el;
    if (dom.classList.contains('plan-th') || dom.classList.contains('plan-tr')) {
        el = document.createElement('tr')
    } else {
        el = document.createElement('tbody');
    }
    for (let i = 0; i < dom.children.length; i++) {
        el.appendChild(class2table(dom.children[i]))
    }
    return el
}
addSheetJS().then(async () => {
    let planBox = document.querySelector('uni-view.plan-list-btn')
    planBox.click()
    await new Promise(ok => setTimeout(ok, 1000))
    let plans = document.querySelectorAll('uni-view.plan-item')
    let wb = XLSX.utils.book_new()
    let wb_list = []
    for (let pl of plans) {
        let name = pl.innerText.replaceAll('\n', '')
        console.log(name)
        pl.click()
        await new Promise(ok => setTimeout(ok, 1000))
        let tb = document.querySelector('div.uni-scroll-view-content')
        tb = class2table(tb);
        let ws = XLSX.utils.table_to_sheet(tb, { raw: true })
        let alist = XLSX.utils.sheet_to_json(ws, { header: 1 })
        alist.forEach(item => item.splice(0, 0, name))
        alist = alist.filter(item => !item[3].includes('计划'))
        window.test = alist
        wb_list.push(...alist)
    }
    let ws = XLSX.utils.aoa_to_sheet(wb_list, { raw: true })
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, 'plans.xlsx')
});