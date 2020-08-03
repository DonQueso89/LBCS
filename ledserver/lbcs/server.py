import json

import logging
import os
from dataclasses import asdict
from typing import Dict

import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket

from tornado.options import define, options
from tornado.queues import Queue


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

try:
    import neopixel
    import board
except NotImplementedError:
    logger.debug("No Neopixel devices found, mocking CircuitPython objects")
    from unittest import mock
    board = mock.MagicMock()
    neopixel = mock.MagicMock()


class DebugGridWebSocketHandler(tornado.websocket.WebSocketHandler):
    """Websocket handler that syncs up the debug grid shown on the index page"""
    def initialize(self, q):
        self.q = q

    def open(self):
        logger.info("WebSocket opened")

    async def on_message(self, message):
        logger.info(f"Received {message} from WebSocket client")
        self.write_message(json.dumps(await self.q.get()))

    def on_close(self):
        logger.info("WebSocket closed")


class BaseHandler(tornado.web.RequestHandler):
    def initialize(
        self,
        leds: Dict[int, int],
        rows: int,
        columns: int,
        debug: bool,
        pixels,
        reverse_mapping: Dict[int, int],
        q: Queue,
        **ignored,
    ):
        self.pixels = pixels
        self.debug = debug
        self.leds = leds
        self.rows = rows
        self.columns = columns
        self.reverse_mapping = reverse_mapping
        self.q = q
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Content-Type", "application/json")

    def render_grid(self):
        for i in range(self.rows):
            logger.info(
                " ".join(
                    [
                        "*" if self.leds[i * self.columns + j] != (0, 0, 0) else " "
                        for j in range(self.columns)
                    ]
                )
            )

    def translate_lednumber(self, columns, lednumber):
        """Translate a contiguous sequence from top left to bottom from 0 to n
        to a reversed zig zag sequence"""
        row = lednumber // columns
        if row % 2 == 0:
            return self.reverse_mapping[lednumber]
        return self.reverse_mapping[(row + 1) * columns - (lednumber % columns) - 1]


class IndexHandler(tornado.web.RequestHandler):
    def initialize(self, cfg: config.LBCSConfig, leds: Dict[int, int], **ignored):
        self.cfg = cfg
        self.leds = leds

    def get(self):
        self.render("index.html", title="LBCS", header="Little Bull Climbing Server", cfg=self.cfg, state=self.leds)


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

    def post(self, lednumber, red, green, blue):
        red,  green, blue = int(red), int(green), int(blue)
        lednumber = int(lednumber)
        triple = (red,  green, blue)

        _prev_state = self.leds[lednumber]
        self.leds[lednumber] = triple

        try:
            self.pixels[self.translate_lednumber(self.columns, lednumber)] = triple
            self.pixels.show()
            self.q.put({"lednumber": lednumber, "red": red, "green": green, "blue": blue})
        except Exception as e:
            state_verbose = {(0, 0, 0): "off"}.get(triple, "on")
            logger.error(
                f"An error ocurred while setting {lednumber} to {state_verbose}:\n {e}"
            )
            self.leds[lednumber] = _prev_state

        self.write("")

        if self.debug:
            self.render_grid()


class DimensionsHandler(BaseHandler):
    def get(self):
        self.set_header("Content-Type", "application/json")
        self.write(json.dumps({"rows": self.rows, "columns": self.columns}))


class AliveHandler(BaseHandler):
    def get(self):
        self.write("")


class LBCSServer(tornado.web.Application):
    def __init__(self, cfg: config.LBCSConfig, leds: Dict[int, int], reverse_mapping: Dict[int, int]):
        pixels = neopixel.NeoPixel(
            getattr(board, cfg.pixel_pin), len(leds), brightness=1, auto_write=False
        )
        q: Queue = Queue()
        ctx = dict(q=q, cfg=cfg, leds=leds, pixels=pixels, reverse_mapping=reverse_mapping, **asdict(cfg))


        handlers = (
            (r"/websocket/", DebugGridWebSocketHandler, {"q": q}),
            (r"/alive/", AliveHandler, ctx),
            (r"/dimensions/", DimensionsHandler, ctx),
            (r"/state/([0-9]+)/([0-9]{3})/([0-9]{3})/([0-9]{3})/", StateHandler, ctx),
            (r"/state/([0-9]+)/", StateHandler, ctx),
            (r"/state/", AllStateHandler, ctx),
            (r"/", IndexHandler, ctx),
        )
        super().__init__(handlers, debug=cfg.debug,  static_path=".")


def main():
    tornado.options.parse_command_line()
    cfg = config.get(options.config_file)
    leds = {i: (0, 0, 0) for i in range(cfg.rows * cfg.columns)}
    reverse_mapping = {}
    for row in range(cfg.rows):
        for i, col in enumerate(reversed(range(cfg.columns))):
            reverse_mapping[row * cfg.columns + i] = row * cfg.columns + col

    app = LBCSServer(cfg, leds, reverse_mapping)
    app.listen(cfg.port)

    logger.info(f"Parsed server config\n{cfg.pretty()}\n")
    logger.info(f"Starting Little Bull Climbing Server server on port {cfg.port}")
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
