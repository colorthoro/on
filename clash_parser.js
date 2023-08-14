/**
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
    obj.rules.push('DOMAIN-KEYWORD,openai.com,☝openai');
    notify('预处理', `成功添加 ☝openai 规则`);
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
        obj.rules.push('DOMAIN-KEYWORD,openai.com,☝openai');
        notify('预处理', `成功添加 ☝openai 规则`);
        console.log('预处理成功')
        return yaml.stringify(obj)
      }
 */