const fs = require('fs');
const https = require('https');

if (!fs.existsSync('src/data')) {
    fs.mkdirSync('src/data', { recursive: true });
}

const url = 'https://raw.githubusercontent.com/apisit/thailand.json/master/thailand.json';
const file = fs.createWriteStream('src/data/thailandGeo.json');

https.get(url, { headers: { 'User-Agent': 'Node.js' } }, function (res) {
    if (res.statusCode !== 200) {
        console.error('Failed HTTP status: ' + res.statusCode);
        return;
    }
    res.pipe(file);
    res.on('end', () => console.log('Successfully written thailandGeo.json!'));
}).on('error', (e) => {
    console.error(e);
});
