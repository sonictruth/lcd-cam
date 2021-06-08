const url = `wss://${document.location.hostname}:${document.location.port}`;
const socket = new WebSocket(url);

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const startBtn = document.querySelector('#start');
const video = document.querySelector('video');

startBtn.addEventListener('click', () => init());
socket.addEventListener('close', () => reloadPage());

const width = 32;
const height = 8;
canvas.width = width;
canvas.height = height

let lcd = new Array(height).fill(0).map(() =>
    new Array(width).fill(0));

function reloadPage() {
    setTimeout(() => document.location.reload(), 1000);
}

function handleSuccess(stream) {

    const videoTracks = stream.getVideoTracks();

    video.srcObject = stream;

    let timeoutId;
    function loop() {
        clearTimeout(timeoutId);

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(video, 0, 0, width, height);
        const image = ctx.getImageData(0, 0, width, height);
    
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (width * y + x) << 2;
                const r = image.data[idx];
                const g = image.data[idx + 1];
                const b = image.data[idx + 2];
                // LCD is HxW BGR
                lcd[y][x] = (b << 16) | (g << 8) | (r << 0);
               
            }
        }
        socket.send(JSON.stringify(lcd));
        timeoutId = setTimeout(loop, 100);
    }
    loop();
}

function init() {
    startBtn.remove();
    navigator.mediaDevices
        .getUserMedia({
            audio: false,
            video: true
        })
        .then(handleSuccess)
        .catch(error => alert('navigator.MediaDevices.getUserMedia error: ' + error.message));
}