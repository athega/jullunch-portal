var hw = process.binding('hw'),
    EventSource = require('eventsource'),
    tessel = require('tessel'),
    eventURL = 'http://10.0.0.74/stream', // Use HTTP for testing, there might be a problem with using HTTPS.
//    eventURL = 'https://jullunch-backend.athega.se/stream',
    eventName = 'jullunch.check-in',
    pixels = 60 * 5; // Number of neopixels connected

console.log('Initializing');


// Show status using build-in LED:s
var led1 = tessel.led[0].output(1),
    led2 = tessel.led[1].output(0);


// Generate pulse sequence
console.log('Creating pulse');
var pulse = {
        frames: [],
        frame: 0,
        length: 188,
        duration: 50,
    },
    animation = pulse;

for (var t = 0; t < pulse.length; t++) {
    var buffer = new Buffer(pixels * 3),
        pr = t / 60,
        or = 0.009,
        pg = -t / 60,
        og = 0.009,
        pb = t / 30,
        ob = 0.005;

    // Toggle build in LED:s to indicate status
    led1.toggle();
    led2.toggle();

    for (var x = 0; x < buffer.length; x += 3) {
        buffer[x]   = Math.pow(Math.abs(Math.sin(pg += og)), 256) * 255;
        buffer[x+1] = Math.pow(Math.abs(Math.sin(pr += or)), 256) * 255;
        buffer[x+2] =          Math.sin(pb += ob) * 127 + 128;
    }

    pulse.frames.push([buffer, pulse.duration]);
}


// Generate flash sequence
console.log('Creating flash');

function getBuffer(color) {
    var buffer = new Buffer(pixels * 3);

    for (var x = 0; x < buffer.length; x += 3) {
        buffer[x]   = color[1];
        buffer[x+1] = color[0];
        buffer[x+2] = color[2];
    }

    return buffer;
}

var red    = getBuffer([255, 0, 0]),
    green  = getBuffer([0, 255, 0]),
    blue   = getBuffer([0, 0, 255]),
    yellow = getBuffer([255, 255, 0]),
    purple = getBuffer([255, 0, 255]),
    cyan   = getBuffer([0, 255, 255]),
    white  = getBuffer([255, 255, 255]),
    black  = getBuffer([0, 0, 0]),
    colors = [red, green, blue, yellow, purple, cyan],
    flash = {
        frames: [],
        frame: 0,
        flashDuration: 500,
        flashPause: 500,
        flickerDuration: 10,
        flickerDelay: 10,
        flickerPause: 50,
        done: function() {
            console.log('Resuming pulse');
            // Toggle build in LED:s to indicate status
            led1.toggle();
            led2.toggle();

            animation = pulse;
        }
    };

flash.frames.push(
    [white, flash.flashDuration],
    [black, flash.flashPause],
    [white, flash.flashDuration],
    [black, flash.flashPause]
);

for (var i = 0; i < colors.length; i++) {
    for (var n = 0; n < 4; n++) {
        flash.frames.push([colors[i], flash.flickerDuration], [black, flash.flickerDelay]);
    }
    flash.frames.push([black, flash.flickerPause]);
}

flash.frames.push([white, flash.flashDuration * 2], [black, flash.flashPause]);


// Run animation loop
(function updateAnimationFrame() {
    var frame = animation.frames[animation.frame],
        buffer = frame[0],
        delay = frame[1];

    hw.neopixel_animation_buffer(buffer.length, buffer);

    setTimeout(updateAnimationFrame, delay);

    if (++animation.frame >= animation.frames.length) {
        animation.frame = 0;
        if (animation.done) animation.done();
    }
})();
console.log('Running...');


// Trigger flash on check in event.
var eventSource = new EventSource(eventURL, { rejectUnauthorized: false });
eventSource.addEventListener(eventName, function(event) {
    console.log('Flash!');
    // Toggle build in LED:s to indicate status
    led1.toggle();
    led2.toggle();

    animation = flash;
});
console.log('Listening to "'+ eventName + '" from ' + eventURL);
