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
    for(let select of selected){
        if(select.name == '☝openai'){
            select.now = '江苏联通转日本NTT5[倍率:0.8]'
        }else if(select.name.includes('国外')){
            select.now = '深港专线转香港BGP[M][倍率:2.5]'
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
        console.log('开始预处理')
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
        console.log('预处理成功')
        return yaml.stringify(obj)
      }
 */