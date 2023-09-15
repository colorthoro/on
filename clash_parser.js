/**
parsers:
  - reg: .*www.ccsub.online.+$
    remote:
      url: 'https://colorthoro.gitee.io/on-js/clash_parser.js'
      cache: false

parsers:
  - reg: .*www.ccsub.online/.+$   # 第一个执行的parser
    file: '{path_to_this_file}'
*/


module.exports.parse = async (raw, { axios, yaml, notify, console }, { name, url, interval, selected }) => {
    console.log('js模块开始预处理')
    const obj = yaml.parse(raw)
    console.log(obj, name, url, interval, selected);
    let proxies = obj['proxies'].map(v => v.name);
    let groups = obj['proxy-groups'];

    groups.push({
        name: '☝openai',
        type: 'select',
        proxies: ['🔰国外流量', ...proxies]
    });

    let proxiesLocationMap = new Map();
    let locAutoSuffix = '-自动选择时延最低';
    proxies.forEach(v => {
        let match = v.match(/转([^a-zA-Z\[\]]+)/);
        if (!match) return;
        let loc = match[1] + locAutoSuffix;
        if (!proxiesLocationMap.get(loc)) proxiesLocationMap.set(loc, [v]);
        else proxiesLocationMap.get(loc).push(v);
    });
    let groupsLocationMap = new Map();
    proxiesLocationMap.forEach((v, k) => {
        let obj = {
            name: k,
            type: 'url-test',
            proxies: v,
            url: 'http://www.gstatic.com/generate_204',
            timeout: k.startsWith('香港') ? 1 : 5,  // 香港区节点多，超时设为1
            interval: 864000,  // 10天刷新一次
            tolerance: 100,  // 100ms的区别不切换
            'evaluate-before-use': true,  // 等待测试完毕再选择，而非自动选择第一个
        };
        groupsLocationMap.set(k, obj);
        groups.push(obj);
    })

    groups.forEach(v => {
        if (v.name.includes(locAutoSuffix)) return;
        v.proxies.splice(1, 0, ...groupsLocationMap.keys())
    })

    obj.rules = obj.rules.filter((v) => !v.includes(',google,'))
    obj.rules.unshift('DOMAIN-KEYWORD,openai.com,☝openai');
    obj.rules.unshift('DOMAIN-KEYWORD,google,☝openai');


    if (selected) for (let select of selected) {
        if (select.name == '☝openai') {
            select.now = '广东移动转日本NTT2[倍率:0.8]';
        } else if (select.name.includes('国外流量')) {
            select.now = '香港' + locAutoSuffix;
        }
        console.log(select.name, select.now)
    }
    console.log('预处理成功')
    return yaml.stringify(obj)
}


/**
parsers:
  - reg: .*www.ccsub.online.+$   # 第一个执行的parser
    code: |

 */