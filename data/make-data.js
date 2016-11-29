
var frames = require('./frames'),
    fs = require('fs'),
    anims = {pulse: true, flash: true},
    file = fs.openSync('./src/frames.data', 'w');

for (var name in anims) {
    console.log(name);
    var bytes = 0;
    for (var i = 0; i < frames[name].length; i++) {
        var frameBuffer = frames[name][i][0],
            delay = frames[name][i][1],
            delayBuffer = new Buffer(2);

        delayBuffer[0] = delay / 256;
        delayBuffer[1] = delay % 256;

        bytes += fs.writeSync(file, delayBuffer, 0, delayBuffer.length);
        bytes += fs.writeSync(file, frameBuffer, 0, frameBuffer.length);
    }
    console.log('Written', bytes, 'bytes to file');
}