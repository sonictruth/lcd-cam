const {
	init,
	drawFrame,
} = require('ws2812draw');

const {
	screenHeight,
	screenWidth,
	screenBrightness,
	serverPort,
} = require('./settings.js');

const camServer = require('./camServer.js');

(async () => {
	init(screenHeight, screenWidth, screenBrightness);
	const camEventEmitter = await camServer(serverPort);
	camEventEmitter.on('update', screen => drawFrame(screen));
}) ()
