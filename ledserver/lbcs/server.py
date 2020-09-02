import json
import socket

import logging
import os
from dataclasses import asdict
from typing import Dict
from enum import Enum
from random import random as rnd

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


def _reverse_mapping(columns, rows):
    reverse_mapping = {}
    for row in range(rows):
        for i, col in enumerate(reversed(range(columns))):
            reverse_mapping[row * columns + i] = row * columns + col
    return reverse_mapping

def right_left_zig_zag(columns, rows, mult=1):
    """Translate a contiguous sequence from top left to bottom right from 0 to n
    to a reversed zigzag sequence"""
    reverse_mapping = _reverse_mapping(columns, rows)
    led_mapping = {}
    for lednumber in range(columns * rows):
        row = lednumber // columns
        if row % 2 == 0:
            led_mapping[lednumber] = reverse_mapping[lednumber] * mult
        else: 
            led_mapping[lednumber] = reverse_mapping[(row + 1) * columns - (lednumber % columns) - 1] * mult
    return led_mapping

def top_bottom_zig_zag(columns, rows, mult=1):
    """Translate a contiguous sequence from top left to bottom right from 0 to n
    to a reversed top bottom zigzag sequence"""
    zigzag = {}
    for lednumber in range(columns * rows):
        row = lednumber // columns
        if row % 2 == 0:
            zigzag[lednumber] = lednumber
        else:
            zigzag[lednumber] = (row + 1) * columns - (lednumber % columns) - 1
    
    # non reversed zigzag rotated 90 degrees clockwise
    rotated_zigzag = {}     
    for y in range(rows):
        for x in range(columns):
            row, column = x, y  # swap row and column
            column = columns - column - 1 # count column backwards
            rotated_zigzag[row * columns + column] = zigzag[y * columns + x] * 2

    return rotated_zigzag

class LedIndexMapAlgo(Enum):
    RIGHT_LEFT_ZIG_ZAG = 0  # right left top bottom zig zag
    TOP_BOTTOM_ZIG_ZAG = 1  # top bottom right left zig zag

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
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Content-Type", "application/json")

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
        led_index_mapping: Dict[int, int],
        q: Queue,
        **ignored,
    ):
        self.pixels = pixels
        self.debug = debug
        self.leds = leds
        self.rows = rows
        self.columns = columns
        self.led_index_mapping = led_index_mapping
        self.q = q
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Content-Type", "application/json")

    def prepare(self):
        if self.request.headers.get('Content-Type') == 'application/x-json':
            self.args = json.loads(self.request.body)

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

    def translate_lednumber(self, lednumber: int):
        return self.led_index_mapping[lednumber]


class IndexHandler(tornado.web.RequestHandler):
    def initialize(self, cfg: config.LBCSConfig, leds: Dict[int, int], led_index_mapping: Dict[int, int], **ignored):
        self.cfg = cfg
        self.leds = leds
        self.led_index_mapping = led_index_mapping

    def get(self):
        websocket_url = f"ws://{socket.gethostbyname(socket.gethostname())}:{self.cfg.port}/websocket/"
        self.render(
            "index.html",
            title="LBCS",
            header="Little Bull Climbing Server",
            cfg=self.cfg,
            state=self.leds,
            computed_indices=self.led_index_mapping,
            websocket_url=websocket_url
        )


def rndrgbtriple():
    rndbyte = lambda: int(rnd() * 256)
    return (rndbyte(), rndbyte(), rndbyte())


class AllStateHandler(BaseHandler):
    def get(self):
        state = dict(self.leds)
        state["rows"] = self.rows
        state["columns"] = self.columns
        self.write(json.dumps(state))
    
    def post(self):
        """Reset the grid and set a complete route"""
        mutations = []
        route = self.args['route']
        for lednumber in self.leds:
            red, green, blue = 0, 0, 0
            if str(lednumber) in route:
                red, green, blue = [int(x) for x in route[str(lednumber)]]
            self.leds[lednumber] = (red, green, blue)
            self.pixels[self.translate_lednumber(lednumber)] = (green, red, blue)
            mutations.append({
                'lednumber': lednumber,
                'red': red,
                'green': green,
                'blue': blue 
            })
        self.pixels.show()
        self.q.put(mutations)
        self.write("")
        self.render_grid()
    
    def delete(self):
        """Switch off all leds"""
        mutations = []
        for k, v in self.leds.items():
            if v != (0, 0, 0):
                self.leds[k] = (0, 0, 0)
                self.pixels[self.translate_lednumber(k)] = (0, 0, 0)
                mutations.append({
                    'lednumber': k,
                    'red': 0,
                    'green': 0,
                    'blue': 0 
                })
        self.pixels.show()
        self.q.put(mutations)
        self.write("")





class StateHandler(BaseHandler):
    def get(self, lednumber):
        state = "off"
        if self.leds[int(lednumber)]:
            state = "on"
        self.write(f"{state}")

    def post(self, lednumber, red, green, blue):
        red,  green, blue = int(red), int(green), int(blue)
        lednumber = int(lednumber)
        triple = (green, red, blue) # neopixel uses grb

        _prev_state = self.leds[lednumber]
        self.leds[lednumber] = triple

        try:
            self.pixels[self.translate_lednumber(lednumber)] = triple
            self.pixels.show()
            self.q.put([{"lednumber": lednumber, "red": red, "green": green, "blue": blue}])
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
    def __init__(self, cfg: config.LBCSConfig, leds: Dict[int, int], led_index_mapping: Dict[int, int]):
        pixels = neopixel.NeoPixel(
            getattr(board, cfg.pixel_pin), len(leds), brightness=1, auto_write=False
        )
        q: Queue = Queue()

        ctx = dict(q=q, cfg=cfg, leds=leds, pixels=pixels, led_index_mapping=led_index_mapping, **asdict(cfg))

        handlers = (
            (r"/websocket/", DebugGridWebSocketHandler, {"q": q}, 'websocket'),
            (r"/alive/", AliveHandler, ctx),
            (r"/dimensions/", DimensionsHandler, ctx),
            (r"/state/([0-9]+)/([0-9]{3})/([0-9]{3})/([0-9]{3})/", StateHandler, ctx),
            (r"/state/([0-9]+)/", StateHandler, ctx),
            (r"/state/", AllStateHandler, ctx),
            (r"/state/all/", AllStateHandler, ctx, 'all_leds'),
            (r"/", IndexHandler, ctx),
        )
        super().__init__(handlers, debug=cfg.debug, static_path=os.path.dirname(os.path.realpath(__file__)))


def main():
    tornado.options.parse_command_line()
    cfg = config.get(options.config_file)

    # these are indexed contiguously from 0 to n top left to bottom right because
    # that is how clients see the grid
    leds = {i: (0, 0, 0) for i in range(cfg.rows * cfg.columns)}

    led_index_mapping = {
        LedIndexMapAlgo.RIGHT_LEFT_ZIG_ZAG.name: lambda: right_left_zig_zag(cfg.columns, cfg.rows, mult=cfg.skip + 1),
        LedIndexMapAlgo.TOP_BOTTOM_ZIG_ZAG.name: lambda: top_bottom_zig_zag(cfg.columns, cfg.rows, mult=cfg.skip + 1),
    }[cfg.map_algo]()

    app = LBCSServer(cfg, leds, led_index_mapping)
    app.listen(cfg.port)

    logger.info(f"Parsed server config\n{cfg.pretty()}\n")
    logger.info(f"Starting Little Bull Climbing Server server on port {cfg.port}")
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
