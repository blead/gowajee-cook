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