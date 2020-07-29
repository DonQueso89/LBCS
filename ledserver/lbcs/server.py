import json
import logging
import os
from dataclasses import asdict
from typing import Dict

import tornado.ioloop
import tornado.options
import tornado.web
from tornado.options import define, options

from lbcs import config

RED = (255, 0, 0)
YELLOW = (255, 150, 0)
GREEN = (255, 0, 0)
CYAN = (0, 255, 255)
BLUE = (0, 0, 255)
PURPLE = (180, 0, 255)
OFF = (0, 0, 0)

DEFAULT_CONFIG = os.path.join(
    os.path.abspath(os.path.dirname(__file__)), "example_config.ini"
)
define("config_file", help="absolute path to config file", default=DEFAULT_CONFIG)

logger = logging.getLogger(__file__)


def translate_lednumber(columns, lednumber):
    """Translate a contiguous sequence to a zig zag sequence"""
    row = lednumber // columns
    if row % 2 == 0:
        return lednumber
    return (row + 1) * columns - (lednumber % columns) - 1


class BaseHandler(tornado.web.RequestHandler):
    def initialize(
        self,
        leds: Dict[int, int],
        rows: int,
        columns: int,
        debug: bool,
        pixels,
        **ignored,
    ):
        self.pixels = pixels
        self.debug = debug
        self.leds = leds
        self.rows = rows
        self.columns = columns
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Content-Type", "application/json")

    def render(self):
        for i in range(self.rows):
            logger.info(
                " ".join(
                    [
                        "*" if self.leds[i * self.columns + j] else " "
                        for j in range(self.columns)
                    ]
                )
            )


class AllStateHandler(BaseHandler):
    def get(self):
        state = dict(self.leds)
        state["rows"] = self.rows
        state["columns"] = self.columns
        self.write(json.dumps(state))


class StateHandler(BaseHandler):
    def get(self, lednumber):
        state = "off"
        if self.leds[int(lednumber)]:
            state = "on"
        self.write(f"{state}")

    def post(self, lednumber, state):
        state = int(state)

        lednumber = int(lednumber)
        self.leds[lednumber] = state

        try:
            self.pixels[translate_lednumber(self.columns, lednumber)] = {
                1: GREEN,
                0: OFF,
            }[state]
            self.pixels.show()
        except Exception as e:
            state_verbose = {1: "on", 0: "off"}[state]
            logger.error(
                f"An error ocurred while setting {lednumber} to {state_verbose}:\n {e}"
            )
            self.leds[lednumber] = int(not state)

        self.write("")

        if self.debug:
            self.render()


class DimensionsHandler(BaseHandler):
    def get(self):
        self.set_header("Content-Type", "application/json")
        self.write(json.dumps({"rows": self.rows, "columns": self.columns}))


class AliveHandler(BaseHandler):
    def get(self):
        self.write("")


class LBCSServer(tornado.web.Application):
    def __init__(self, cfg: config.LBCSConfig, leds: Dict[int, int]):
        import neopixel
        import board

        pixels = neopixel.NeoPixel(
            getattr(board, cfg.pixel_pin), len(leds), brightness=1, auto_write=False
        )
        ctx = dict(leds=leds, pixels=pixels, **asdict(cfg))

        handlers = (
            (r"/alive/", AliveHandler, ctx),
            (r"/dimensions/", DimensionsHandler, ctx),
            (r"/state/([0-9]+)/([0-1]{1})/", StateHandler, ctx),
            (r"/state/([0-9]+)/", StateHandler, ctx),
            (r"/state/", AllStateHandler, ctx),
        )
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
