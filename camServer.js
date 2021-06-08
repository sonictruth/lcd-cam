const https = require('https');
const WebSocket = require('ws');
const fs = require('fs');
const { EventEmitter } = require('events');
const controllerEventEmitter = new EventEmitter();

const ecstatic = require('ecstatic')({
    root: `${__dirname}/public`,
    showDir: true,
    autoIndex: true,
});

require('esbuild').build({
    entryPoints: ['camClient.js'],
    bundle: true,
    outfile: './public/app.min.js',
    watch: {
        onRebuild(error, result) {
            if (error) console.error('Client rebuild failed:', error)
            else console.log('Client rebuild.')
        },
    },
}).catch(() => process.exit(1))


module.exports = (serverPort) => {
    return new Promise((resolve, reject) => {
        const options = {
            key: fs.readFileSync('key.pem'),
            cert: fs.readFileSync('cert.pem'),
        };
        const server = https.createServer(options, ecstatic);
        server.listen(serverPort, '0.0.0.0', () => {
            const wss = new WebSocket.Server({ server });

            wss.on('connection', ws =>
                ws.on('message', message =>
                    controllerEventEmitter.emit('update', JSON.parse(message))
                ));

            resolve(controllerEventEmitter);
        });
    })
}
