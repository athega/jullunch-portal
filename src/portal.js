var hw = process.binding('hw'),
    buttonLib = require('tessel-gpio-button'),
    tessel = require('tessel'),
    pixels = 299 + 24 + 12, // Number of neopixels connected
    debug = false;

if (debug) console.log('Initializing, v.', 20161206.1403);


// Show status using build-in LED:s
var led1 = tessel.led[0].output(1),
    led2 = tessel.led[1].output(0);


// Generate pulse sequence
if (debug) console.log('Creating pulse');
var pulse = {
        name: 'pulse',
        frames: [],
        frame: 0,
        done: function() {
            if (debug) console.log('Looping pulse');
            // Toggle build in LED:s to indicate status
            led1.toggle();
            led2.toggle();
        }
    },
    animation = pulse;


// Generate flash sequence
if (debug) console.log('Creating flash');
var flash = {
        name: 'flash',
        frames: [],
        frame: 0,
        play: function(event) {
            if (debug) console.log('Flash!');
            // Toggle build in LED:s to indicate status
            led1.toggle();
            led2.toggle();

            animation = flash;
        },
        done: function() {
            if (debug) console.log('Resuming pulse');
            // Toggle build in LED:s to indicate status
            led1.toggle();
            led2.toggle();

            animation = pulse;
        }
    };


// Reading buffers from binary file.
if (debug) console.log('Reading buffers from file');
var path = require('path'),
    tm = process.binding('tm'),
    pathname = path.resolve(process.cwd(), 'frames.data'),
    file = tm.fs_open(pathname, tm.OPEN_EXISTING | tm.RDONLY)[0];

function readFrames(frames) {
    var lengthBuffer = tm.fs_read(file, 2)[0],
        length = lengthBuffer[0] * 256 + lengthBuffer[1];
    if (debug) console.log('Reading', length, 'frames');
    for (var i = 0; i < length; i++) {
        var delayBuffer = tm.fs_read(file, 2)[0],
            delay = delayBuffer[0] * 256 + delayBuffer[1],
            frameBuffer = tm.fs_read(file, pixels * 3)[0];
        frames.push([frameBuffer, delay]);
    }
}
readFrames(pulse.frames);
readFrames(flash.frames);
tm.fs_close(file);


// Run animation loop
(function updateAnimationFrame() {
    var frame = animation.frames[animation.frame],
        buffer = frame[0],
        delay = frame[1];

//    if (debug) console.log('Playing', animation.name, 'frame', animation.frame, 'delay', delay, 'buffer', buffer);

    hw.neopixel_animation_buffer(buffer.length, buffer);

    setTimeout(updateAnimationFrame, delay);

    if (++animation.frame >= animation.frames.length) {
        animation.frame = 0;
        if (animation.done) animation.done();
    }
})();
if (debug) console.log('Running...');


// Trigger flash on config button or external button press.
var button = buttonLib.use(tessel.port['GPIO'].pin['G3']);
tessel.button.on('press', flash.play);
button.on('press', flash.play);
