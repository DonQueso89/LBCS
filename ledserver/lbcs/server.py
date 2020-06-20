import configparser
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


class BaseHandler(tornado.web.RequestHandler):
    def get_ledstate(n: int) -> int:
        return 1


class AllStateHandler(BaseHandler):
    def get(self):
        self.write("all state")


class StateHandler(BaseHandler):
    def get(self):
        self.write("single state")


class LBCSServer(tornado.web.Application):
    def __init__(self, cfg: configparser.ConfigParser):
        handlers = [
            (r"/state/", AllStateHAndler),
            (r"/state/([0-9]+)/", SingleStateHandler),
        ]
        super().__init__(self, handlers, debug=bool(cfg["debug"]))


def main():
    options = tornado.options.parse_command_line()
    print(options)
    cfg = config.get(options.config_file)
    app = LBCSServer(cfg)
    app.listen(int(cfg["port"]))
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
