var Npx = require('npx'),
    EventSource = require('eventsource'),
    tessel = require('tessel'),
    eventURL = 'http://10.0.0.74/stream', // Use HTTP for testing, there might be a problem with using HTTPS.
//    eventURL = 'https://jullunch-backend.athega.se/stream',
    eventName = 'jullunch.check-in';

console.log('Loaded tessel, Npx and EventSource');

// Show status using build-in LED:s
var led1 = tessel.led[0].output(1),
    led2 = tessel.led[1].output(0);


// Initialize npx object with number of neopixels
// replace '60' wit the number of neopixels connect to tessel
var l = 60 * 4,
    npx  = new Npx(l),
    npx2 = new Npx(l);

console.log('Initialized npx');


console.log('Creating pulse');

var pulseStepDuration = 3,
    steps = 50;

function addColor(i) {
    var color = '#0000' + (i < 16 ? '0' : '') + i.toString(16);
    npx.enqueue(npx.newAnimation(1).setAll(color), pulseStepDuration);
}

for (var i = 0; i < steps; i++) addColor(i);
for (var i = steps; i > 0; i--) addColor(i);


console.log('Creating flash');

var flashDuration = 500,
    flashPause = 500,
    flickerDuration = 10,
    flickerDelay = 10,
    flickerPause = 50,
    red    = npx2.newAnimation(1).setAll('#ff0000'),
    blue   = npx2.newAnimation(1).setAll('#0000ff'),
    green  = npx2.newAnimation(1).setAll('#00ff00'),
    yellow = npx2.newAnimation(1).setAll('#ffff00'),
    purple = npx2.newAnimation(1).setAll('#ff00ff'),
    cyan   = npx2.newAnimation(1).setAll('#00ffff'),
    white  = npx2.newAnimation(1).setAll('#ffffff'),
    black  = npx2.newAnimation(1).setAll('#000000'),
    colors = [red, green, blue, yellow, purple, cyan];

npx2.enqueue(white, flashDuration)
    .enqueue(black, flashPause)
    .enqueue(white, flashDuration)
    .enqueue(black, flashPause);

for (var i = 0; i < colors.length; i++) {
    for (var n = 0; n < 4; n++) {
        npx2.enqueue(colors[i], flickerDuration)
            .enqueue(black, flickerDelay);
    }
    npx2.enqueue(black, flickerPause);
}

npx2.enqueue(white, flashDuration * 2)
    .enqueue(black, 1);


function flash() {
    // Toggle build in LED:s to indicate status
    led1.toggle();
    led2.toggle();

    console.log('Pausing puls');
    npx.pause();

    console.log('Flash!');
    npx2.run(true).then(function() {
        console.log('Flash done!');

        console.log('Resuming puls');
        npx.loop(true);
    });
};


// Trigger flash on event
var eventsource = new EventSource(eventURL, { rejectUnauthorized: false });
eventsource.addEventListener(eventName, flash);
console.log('Listening to "'+ eventName + '" from ' + eventURL);


// Start initial loop
console.log('Pulsing...');
npx.loop(true);
