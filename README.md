# Little Bull Climbing System

![Architexture](./architexture.png)

## Local setup

### Client
- install the expo-cli
```bash
npm install -g expo-cli
```
- we should also install the expo dependencies. This can be done by running `expo install`
- now `cd` into `lbcsClient` repo and type `npm start`
- you can either emulate the app using the expo app from play store [here](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en) or from the app store [here](https://apps.apple.com/nl/app/expo-client/id982107779)
- you can also use the various browsers to emulate the app client using android studio [here](https://docs.expo.io/workflow/android-studio-emulator/)

### ledserver and backend

`docker-compose up`

makes the backend available at `9999` and the ledserver at `8888`

The ledserver has a simple HTML UI which simulates the changes applied to the board.

## Deployment

### ledserver

The ledserver is available as a Python package on [pypi](https://pypi.org/project/lbcs/) and should be installed on an RPI together
with the libraries for controlling the ledstrips.

(on the RPI)

- `sudo pip3 install adafruit-circuitpython-neopixel`
- `pip3 install lbcs`
- run the server with `lbcs-server --config_file <abs-path-to-config>`

If no custom config file is provided, [the example config](./ledserver/lbcs/example_config.ini) is used.

### backend

We currently deploy the backend to Azure App Service manually.

`az webapp up` for (re)deployment
`az webapp config appsettings set --settings K=V` for env var configuration

### mobile client

TODO
