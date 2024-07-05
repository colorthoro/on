(async () => {
    // DDNS Downloader Client with Gitee
    const GITEE_TOKEN = '4afb627b2979b9d5c653246be733ab27'
    const GITEE_GIST_ID = 'k9b54vytfj2g3xa7hoi0n78'
    let content;
    let ok, err, p = new Promise((i, j) => (ok = i, err = j));
    try { window && (window.dns = p); } catch (e) { window = null; }
    let res = await fetch(`https://gitee.com/api/v5/gists/${GITEE_GIST_ID}?access_token=${GITEE_TOKEN}`).then(res => res.json());
    try {
        content = res['files']['dns.json']['content']
        window && ok(JSON.parse(content));
        console.log('dddcg get success', content);
    } catch (e) {
        console.error('dddcg get nothing');
        window && err(e);
    }
    return p;
})();