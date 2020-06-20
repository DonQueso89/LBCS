from typing import Dict
from dataclasses import asdict
import configparser
import json
import logging
import os

import tornado.ioloop
import tornado.options
import tornado.web
from tornado.options import define, options

from lbcs import config

DEFAULT_CONFIG = os.path.join(
    os.path.abspath(os.path.dirname(__file__)), "example_config.ini"
)
define("config_file", help="absolute path to config file", default=DEFAULT_CONFIG)

logger = logging.getLogger(__file__)


class BaseHandler(tornado.web.RequestHandler):
    def initialize(self, leds: Dict[int, int]):
        self.leds = leds


class AllStateHandler(BaseHandler):
    def get(self):
        self.write(json.dumps(self.leds))


class StateHandler(BaseHandler):
    def get(self, lednumber):
        state = "off"
        if self.leds[int(lednumber)]:
            state = "on"
        self.write(f"led {lednumber} is switched {state}")

    def post(self, lednumber, state):
        state = int(state)
        new_state = "off"
        if state:
            new_state = "on"

        self.leds[int(lednumber)] = state
        self.write(f"Turned led {lednumber} {new_state}")


class DimensionsHandler(BaseHandler):
    def initialize(self, rows, columns, **kwargs):
        self.rows = rows
        self.columns = columns

    def get(self):
        self.write(json.dumps({"rows": self.rows, "columns": self.columns}))


class LBCSServer(tornado.web.Application):
    def __init__(self, cfg: config.LBCSConfig, leds: Dict[int, int]):
        handlers = [
            (r"/dimensions/", DimensionsHandler, asdict(cfg)),
            (r"/state/([0-9]+)/([0-1]{1})/", StateHandler, {"leds": leds}),
            (r"/state/([0-9]+)/", StateHandler, {"leds": leds}),
            (r"/state/", AllStateHandler, {"leds": leds}),
        ]
        super().__init__(handlers, debug=cfg.debug)


def main():
    tornado.options.parse_command_line()
    cfg = config.get(options.config_file)
    leds = {i: 0 for i in range(cfg.rows * cfg.columns)}

    app = LBCSServer(cfg, leds)
    app.listen(cfg.port)

    logger.info(f"Parsed server config\n{cfg.pretty()}\n")
    logger.info(f"Starting Little Bull Climbing Server server on port {cfg.port}")
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
