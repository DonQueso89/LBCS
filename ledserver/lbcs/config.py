from configparser import ConfigParser


def get(fname: str) -> ConfigParser:
    cfg = ConfigParser()
    cfg.read(fname)
    return cfg["app"]
