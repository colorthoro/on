/**
parsers:
  - reg: .*www.ccsub.online.+$
    remote:
      url: 'https://colorthoro.github.io/onJS/clash_parser.js'
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
    // console.log(obj, name, url, interval, selected);
    let proxies = obj['proxies'].map(v => v.name);
    let groups = obj['proxy-groups'];

    groups.push({
        name: 'openai',
        type: 'select',
        proxies: [...proxies]
    });
    console.log('已创建openai组, 添加了所有节点');

    let proxiesLocationMap = new Map();
    let locSuffix = '-手动';
    let locAutoSuffix = '-自动选择时延最低';
    proxies.forEach(v => {
        let match = v.match(/转([^a-zA-Z\[\]]+)/);
        if (!match) return;
        let locName = match[1];
        if (!proxiesLocationMap.get(locName)) {
            console.log('识别到', locName);
            proxiesLocationMap.set(locName, [v]);
        }
        else proxiesLocationMap.get(locName).push(v);
    });
    let groupsLocationMap = new Map();
    proxiesLocationMap.forEach((v, locName) => {
        let obj0 = {
            name: locName,
            type: 'select',
            proxies: v,
        };
        groups.push(obj0);
        console.log('已创建', locName, '组');
        let obj = {
            name: locName + locAutoSuffix,
            type: 'url-test',
            proxies: v,
            url: 'http://www.gstatic.com/generate_204',
            interval: 60,
            tolerance: 70,
        };
        groups.push(obj);
        console.log('已创建', locName + locAutoSuffix, '组');

        groupsLocationMap.set(locName + locAutoSuffix, obj);
        groupsLocationMap.set(locName, obj0);
    })

    groups.forEach(v => {
        if (v.name.endsWith(locSuffix) || v.name.endsWith(locAutoSuffix)) return;
        v.proxies.splice(2, 0, ...groupsLocationMap.keys());
        console.log('在', v.name, '组中添加了', groupsLocationMap.keys());
    })

    obj.rules = obj.rules.filter((v) => !v.includes(',google,'))
    obj.rules.unshift('DOMAIN-KEYWORD,openai,openai');
    obj.rules.unshift('DOMAIN-KEYWORD,oaistatic,openai');
    obj.rules.unshift('DOMAIN-KEYWORD,google,openai');
    obj.rules.unshift('DOMAIN-KEYWORD,chatgpt,openai');
    obj.rules.unshift('DOMAIN-KEYWORD,oaiusercontent,openai');
    console.log('已修改rules');

    let defined = new Map([
        ['openai', '日本' + locAutoSuffix],
        ['🚀 节点选择', '香港' + locAutoSuffix],
        ['🐟 漏网之鱼', '日本' + locAutoSuffix],
    ]);
    console.log('已定义选中项');

    if (selected) {
        for (let select of selected) {
            console.log('选中项：', select.name, '选中', select.now)
            for (let [key, value] of defined) {
                if (select.name == key) {
                    if (select.now !== value) {
                        select.now = value;
                        console.log('已修改选中项：', select.name, '选中', select.now)
                    }
                    defined.delete(key);
                }
            }
        }
        defined.forEach((now, name) => {
            selected.push({ name, now });
            console.log('已添加选中项：', name, '选中', now)
        });
    }
    console.log('预处理成功')
    return yaml.stringify(obj)
}