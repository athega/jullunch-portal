var hw = process.binding('hw'),
    EventSource = require('eventsource'),
    tessel = require('tessel'),
    eventURL = 'http://10.0.0.74/stream', // Use HTTP for testing, there might be a problem with using HTTPS.
//    eventURL = 'https://jullunch-backend.athega.se/stream',
    eventName = 'jullunch.check-in',
    pixels = 60 * 5; // Number of neopixels connected

console.log('Initializing, v.', 20161130.1417);


// Show status using build-in LED:s
var led1 = tessel.led[0].output(1),
    led2 = tessel.led[1].output(0);


// Generate pulse sequence
console.log('Creating pulse');
var pulse = {
        name: 'pulse',
        frames: [],
        frame: 0,
        length: 188,
        done: function() {
            console.log('Looping pulse');
            // Toggle build in LED:s to indicate status
            led1.toggle();
            led2.toggle();
        }
    },
    animation = pulse;


// Generate flash sequence
console.log('Creating flash');
var flash = {
        name: 'flash',
        frames: [],
        frame: 0,
        length: 60,
        play: function(event) {
            console.log('Flash!');
            // Toggle build in LED:s to indicate status
            led1.toggle();
            led2.toggle();

            animation = flash;
        },
        done: function() {
            console.log('Resuming pulse');
            // Toggle build in LED:s to indicate status
            led1.toggle();
            led2.toggle();

            animation = pulse;
        }
    };


// Reading buffers from binary file.
console.log('Reading buffers from file');
var fs = require('fs'),
    file = fs.readFileSync('frames.data'),
    offset = 0;

function readFrames(frames, count) {
    for (var i = 0; i < count; i++) {
        var delay = file[offset++] * 256 + file[offset++],
            end = offset + pixels * 3;
        frames.push([file.slice(offset, end), delay]);
        offset = end;
    }
}
readFrames(pulse.frames, pulse.length);
readFrames(flash.frames, flash.length);


// Run animation loop
(function updateAnimationFrame() {
    var frame = animation.frames[animation.frame],
        buffer = frame[0],
        delay = frame[1];

//    console.log('Playing', animation.name, 'frame', animation.frame, 'delay', delay, 'buffer', buffer);

    hw.neopixel_animation_buffer(buffer.length, buffer);

    setTimeout(updateAnimationFrame, delay);

    if (++animation.frame >= animation.frames.length) {
        animation.frame = 0;
        if (animation.done) animation.done();
    }
})();
console.log('Running...');


// Trigger flash on config button press.
tessel.button.on('press', flash.play);

// Trigger flash on check in event.
var eventSource = new EventSource(eventURL, { rejectUnauthorized: false });
eventSource.addEventListener(eventName, flash.play);
console.log('Listening to "'+ eventName + '" from ' + eventURL);
