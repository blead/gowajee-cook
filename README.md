![Gowajee](https://github.com/blead/gowajee-cook/raw/master/app/src/gowajee.png)

# Gowajee Cook
voice-enabled cooking assistant

## Structure
This project contains 2 separable modules:
- **web application**: `/app/src/`  
  The web application is based on [dictate.js](http://kaljurand.github.io/dictate.js/). The whole application is client-side so a server is actually not required. A simple HTTP server based on [Express](http://expressjs.com/) is provided in `/app/` for local testing.
- **speech recognition server**: `/models/`  
  This project utilizes the [dockerized version](https://hub.docker.com/r/jcsilva/docker-kaldi-gstreamer-server/) of [Kaldi GStreamer Server](https://github.com/alumae/kaldi-gstreamer-server/) for portability.

## Setup

### Web Application
Accessing `index.html` directly should work. If issues arise, try to start a local HTTP server by following the steps below.
#### Starting a local Node.js HTTP server
The server code is in `/app/index.js`.  
requirement: [Node.js](https://nodejs.org/en/)
1. Access the directory `/app/`:
```
cd /app
```
2. Install required dependencies:
```
npm install
```
3. Start the server:
```
npm start
```
4. Access the web application on http://localhost/
#### Starting a local Python HTTP server
requirement: [Python](http://python.org/)
1. Access the directory `/app/src/`:
```
cd /app/src
```
2. Start the server:
- For Python 3, run: `python3 -m http.server`
- For Python 2, run: `python -m SimpleHTTPServer`
3. The web application should be accessible on http://localhost:8000/

### Speech Recognition Server
configuration file: `/models/gowajee.yaml`  
model: `/models/thai/gowajee/`  
requirement: [Docker](http://docker.com/)
1. Pull the image:
```
docker pull jcsilva/docker-kaldi-gstreamer-server
```
2. Access the directory `/app/models/`:
```
cd /app/models
```
3. Create a container:  
`./start-docker.sh`  
or  
`docker run -it -p 8080:80 -v /$(pwd):/opt/models jcsilva/docker-kaldi-gstreamer-server:latest /bin/bash`
4. The container will start with an interactive shell. Inside the container, start the service:  
`/opt/models/start-worker.sh`  
or  
`/opt/start.sh -y /opt/models/gowajee.yaml`
5. The speech recognition service should be accessible on http://localhost:8080/

For further information, see https://github.com/jcsilva/docker-kaldi-gstreamer-server

## Commands
When the user speaks, audio data are captured and sent to the recognition server via WebSocket. The application then tries to match the results with available commands.

`/app/src/core/commands.js` contains all commands and their configurable properties:
- `COMMANDS.data`: list of all commands
- `COMMANDS.thresholds`: values used to determine a match between inputs and commands
- `COMMANDS.maxLengths`: maximum length of input.
- `COMMANDS.minLengths`: minimum length of input.

Note that `COMMANDS.data` is actually a list of list, each representing a state or a step of the whole command sequence. The application keeps track of its current state (a number representing an index in the list) and match inputs to available commands inside the list of that state.

For example, we have a list: `[ [{command A}, {command B}], [{command C}] ]`

In the initial state, available commands are `{command A}` and `{command B}`. If the difference between an input and a command is higher than the threshold, the input will be ignored. Threshold values can be separately configured for each state. (`0.0` requires a perfect match, `1.0` accepts anything.) Once a matching command is found, its action is performed and the application advances to the next state. Now, only `{command C}` is available.

Each command contains the following properties:
- `key`: the pattern used to match against inputs
- `action`: a keyword used to trigger an action performed by the application
- `reducer`: a _pure_ function which calculates the next state - this gives very flexible control over the application state and allows more complex commands to be implemented if desired.

Unlike the example given above, the state does not always advance, as it can be controlled freely with the `reducer` function.

## Recipes
`/app/src/core/recipes.js` contains all available recipes. They can be added/modified should the scope of the application change.

## Configurations
`/app/src/core/config.js` contains miscellaneous configurations for the application:
- `CONFIG.recorderWorkerPath`: path to `recorderWorker.js`, required by Dictate.js
- `CONFIG.defaultServer`: address of speech recognition server
- `CONFIG.voice`: configurations for speech synthesis - pitch, rate, and volume can be modified

## Manual Testing
`/app/src/test.html` is provided for manual testing. This page includes a less polished UI, a server selector (a public English speech recognition server is added as an alternative), and a log section. All recognition data are displayed in real-time for ease of testing. On a local HTML server, this page is accessible on http://localhost/test.html or http://localhost:8000/test.html