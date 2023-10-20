/**
parsers:
  - reg: .*www.ccsub.online.+$
    remote:
      url: 'https://colorthoro.gitee.io/on-js/clash_parser.js'
      cache: false

parsers:
  - reg: .*www.ccsub.online/.+$   # 第一个执行的parser
    file: '{path_to_this_file}'

parsers:
  - reg: .*www.ccsub.online.+$   # 第一个执行的parser
    code: |

*/


module.exports.parse = async (raw, { axios, yaml, notify, console }, { name, url, interval, selected }) => {
    console.log('js模块开始预处理')
    const obj = yaml.parse(raw);
    console.log(obj, name, url, interval, selected);
    let proxies = obj['proxies'].map(v => v.name);
    let groups = obj['proxy-groups'];

    groups.push({
        name: 'openai',
        type: 'select',
        proxies: [...proxies]
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
            interval: 60,
            tolerance: 70,
        };
        groupsLocationMap.set(k, obj);
        groups.push(obj);
    })

    groups.forEach(v => {
        if (v.name.includes(locAutoSuffix)) return;
        v.proxies.splice(1, 0, ...groupsLocationMap.keys())
    })

    obj.rules = obj.rules.filter((v) => !v.includes(',google,'))
    obj.rules.unshift('DOMAIN-KEYWORD,openai.com,openai');
    obj.rules.unshift('DOMAIN-KEYWORD,google,openai');

    let defined = new Map([
        ['openai', '日本' + locAutoSuffix],
        ['🚀 节点选择', '香港' + locAutoSuffix]
    ])
    if (selected) {
        for (let select of selected) {
            if (defined[select.name]) {
                select.now = defined[select.name];
                delete defined[select.name];
            }
            console.log(select.name, select.now)
        }
        defined.forEach((now, name) => {
            selected.push({ name, now });
        });
    }
    console.log('预处理成功')
    return yaml.stringify(obj)
}