# Jullunch Portal

Control light sequence of a Neopixel strip using a Tessel in response to events sent over the network.

[![Tessel + Neopixel + EventSource](https://img.youtube.com/vi/NPh-ysGa16k/maxresdefault.jpg)](https://www.youtube.com/watch?v=NPh-ysGa16k)


## Prerequisites

### Hardware:

Tessel with connected Neopixel light strip.

### Software:

Node.js and git


## Setup

Checkout

`git clone https://github.com/athega/jullunch-portal.git`

Install development dependencies. (**tessel**)

`npm install`

Install runtime dependencies. (**eventsource**)

`cd src/`

`npm install`


### Connect to WiFi

`./node_modules/.bin/tessel wifi -n <ssid> -p <pass>`


## Run script

Run script while tessel is connected via USB:

`./node_modules/.bin/tessel run src/portal.js`

Install script in memory on device:

`./node_modules/.bin/tessel push src/portal.js`
