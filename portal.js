var Npx = require('npx'),
    EventSource = require('eventsource'),
    tessel = require('tessel'),
    eventURL = 'http://10.0.0.74/stream', // Use HTTP for testing, there might be a problem with using HTTPS.
//    eventURL = 'https://jullunch-backend.athega.se/stream',
    eventName = 'jullunch.check-in';

console.log('Loaded tessel, Npx and EventSource');

// Show status using build-in LED:s
var led1 = tessel.led[0].output(1);
var led2 = tessel.led[1].output(0);


// Initialize npx object with number of neopixels
// replace '60' wit the number of neopixels connect to tessel
var le = (60*4),
    npx  = new Npx(le),
    npx2 = new Npx(le);

console.log('Initialized npx');


// Create colored animations
var animationRed = npx2.newAnimation(1).setAll('#FF0000');
var animationBlue = npx2.newAnimation(1).setAll('#0000FF');
var animationGreen = npx2.newAnimation(1).setAll('#00FF00');
var animationYellow = npx2.newAnimation(1).setAll('#FFFF00');
var animationPurple = npx2.newAnimation(1).setAll('#FF00FF');
var animationCyan = npx2.newAnimation(1).setAll('#00FFFF');
var animationWhite = npx2.newAnimation(1).setAll('#FFFFFF');
var animationBlack = npx2.newAnimation(1).setAll('#000000');


// fn from Craig Buckler
// http://www.sitepoint.com/javascript-generate-lighter-darker-color/
var calculateColorLuminance = function(hex, luminosity) {
    // takes hex with or without #
    // luminosity is a decimal
    // .2 would result in a 20% increase
    // -.4 would result in a 40% decrease

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    luminosity = luminosity || 0;

    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + (c * luminosity)), 255)).toString(16);
    rgb += ("00" + c).substr(c.length);
    }

    return rgb;
};

var createAndSaveAnimation = function(hex, delay, numberOfFrames) {
    // Create an animation of n frames, defaults to 1
    var animation = npx.newAnimation(numberOfFrames || 1);
    // Set patten on animation
    animation.setAll(hex);
    // Queue animation with a delay
    npx.enqueue(animation, delay);
};

var pulse = function(startHex, steps) {
    var luminosity = 0;
    var reductionRate = 1 / steps;
    // start luminosity as no different than startHex
    createAndSaveAnimation(startHex, 5);

    // fade out
    for (var i = 0; i < steps; i++) {
    luminosity += reductionRate;
    createAndSaveAnimation(calculateColorLuminance(startHex, -1 * luminosity), 5);
    }

    // start again with no luminosity
    createAndSaveAnimation('#000000', 5);

    // fade in
    for (var i = 0; i < steps; i++) {
    luminosity -= reductionRate;
    createAndSaveAnimation(calculateColorLuminance( startHex, -1 * luminosity ), 5);
    }
};

console.log('Creating pulse');
// set hex and steps
pulse( '#000033', 30);


console.log('Creating flash');
npx2.enqueue(animationWhite, 500)
    .enqueue(animationBlack, 500)
    .enqueue(animationWhite, 500)
    .enqueue(animationBlack, 500)

    .enqueue(animationRed, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationRed, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationRed, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationRed, 10)
    .enqueue(animationBlack, 50)

    .enqueue(animationGreen, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationGreen, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationGreen, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationGreen, 10)
    .enqueue(animationBlack, 50)

    .enqueue(animationBlue, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationBlue, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationBlue, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationBlue, 10)
    .enqueue(animationBlack, 50)

    .enqueue(animationYellow, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationYellow, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationYellow, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationYellow, 10)
    .enqueue(animationBlack, 50)

    .enqueue(animationPurple, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationPurple, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationPurple, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationPurple, 10)
    .enqueue(animationBlack, 50)

    .enqueue(animationCyan, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationCyan, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationCyan, 10)
    .enqueue(animationBlack, 10)
    .enqueue(animationCyan, 10)
    .enqueue(animationBlack, 50)


    .enqueue(animationWhite, 1000)
    .enqueue(animationBlack, 1);

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
