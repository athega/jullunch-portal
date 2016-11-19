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

Install dependencies, which are **tessel**, [**lizell/npx**](https://github.com/lizell/npx), and **eventsource**.

`npm install`

### Connect to WiFi

`./node_modules/.bin/tessel wifi -n <ssid> -p <pass>`


## Run script

Run script while tessel is connected via USB:

`./node_modules/.bin/tessel run portal.js`

Install script in memory on device:

`./node_modules/.bin/tessel push portal.js`
