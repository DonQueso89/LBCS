## LBCS server

A simple HTTP API to control a matrix of neopixel leds.
Devices that want to connect need to be on the same local network as the host (typically an RPI) running this process.

### Installation on led controlling host (RPI)

1) Run `pip install lbcs-server` (globally or inside venv)
2) Copy the [example config](./example_config.ini) to the RPI
3) Replace the values in the config with the ones applicable to your setup
4) Run `sudo lbcs-server --config-file=<abs path to config>`

Note that `lbcs-server` must be run as a superuser since the Neopixel requires root access to the underlying hardware.

### Debugging

- There is an HTML page with some debug info available at the root url.
- For health checks, make an HTTP GET to `<rpi-hostname>:<lbcs-server-port>/alive/` (returns 200 if the server is up)