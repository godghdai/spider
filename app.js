var Koa = require('koa');
var app = new Koa();
var cors = require('koa-cors');
var static = require('koa-static');
var convert = require('koa-convert');
var router = require('./Routers/default');
router(app);
app.use(convert(cors()));
app.use(static(__dirname + '/ext-4.2.1.883'));
app.listen(3000);
console.log('listening on port 3000');
let child_process = require('child_process'),
    openurl = 'http://localhost:3000/',
    cmd;

if (process.platform == 'win32') {
    cmd = 'start "%ProgramFiles%\Internet Explorer\iexplore.exe"';
} else if (process.platform == 'linux') {
    cmd = 'xdg-open';
} else if (process.platform == 'darwin') {
    cmd = 'open';
}

console.dir(process.platform);
child_process.exec(`${cmd} "${openurl}"`);



