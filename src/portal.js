var hw = process.binding('hw'),
    EventSource = require('eventsource'),
    tessel = require('tessel'),
    eventURL = 'http://10.0.0.74/stream', // Use HTTP for testing, there might be a problem with using HTTPS.
//    eventURL = 'https://jullunch-backend.athega.se/stream',
    eventName = 'jullunch.check-in';


console.log('Initializing buffers');
var buffers = require('./buffers');

// Show status using build-in LED:s
var led1 = tessel.led[0].output(1),
    led2 = tessel.led[1].output(0);


// Generate pulse sequence
console.log('Creating pulse');
var pulse = {
        frames: buffers.pulse,
        frame: 0,
    },
    animation = pulse;


// Generate flash sequence
console.log('Creating flash');
var flash = {
        frames: buffers.flash,
        frame: 0,
        done: function() {
            console.log('Resuming pulse');
            // Toggle build in LED:s to indicate status
            led1.toggle();
            led2.toggle();

            animation = pulse;
        }
    };


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
