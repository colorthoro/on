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
            interval: 300,
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
        module.exports.parse = async (raw, { axios, yaml, notify, console }, { name, url, interval, selected }) => {
            console.log(name, url, interval, selected);
            console.log('js模块开始预处理')
            const obj = yaml.parse(raw)
            let proxies = null;
            let groups = obj['proxy-groups'];
            for(let group of groups){
                if(group.name.includes('国外')){
                    proxies = group.proxies;
                    break;
                }
            }
            groups.push({
                name:'☝openai',
                type:'select',
                proxies
            });
            [].filter((v)=>!v.includes(',google,'))
            obj.rules.unshift('DOMAIN-KEYWORD,openai.com,☝openai');
            obj.rules.unshift('DOMAIN-KEYWORD,google,☝openai');
            notify('预处理', `成功添加 ☝openai 规则`);
            if(selected) for(let select of selected){
                if(select.name == '☝openai'){
                    select.now = '广东移动转日本NTT2[倍率:0.8]'
                }else if(select.name.includes('国外')){
                    select.now = '深港专线转香港BGP[M][倍率:2.5]'
                }
                console.log(select.name, select.now)
            }
            console.log('预处理成功')
            return yaml.stringify(obj)
        }
 */