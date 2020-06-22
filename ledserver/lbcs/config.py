from configparser import ConfigParser
from dataclasses import asdict, dataclass, fields


@dataclass
class LBCSConfig:
    port: str
    rows: int
    columns: int
    debug: bool

    def normalized(self):
        return self.__class__(
            **{f.name: f.type(getattr(self, f.name)) for f in fields(self)}
        )

    def pretty(self):
        cfg_ = asdict(self)
        return "\n".join(
            f"{k}".ljust(max(len(x) for x in cfg_)) + ": " + f"{v}"
            for k, v in cfg_.items()
        )


def get(fname: str) -> LBCSConfig:
    cfg = ConfigParser()
    cfg.read(fname)
    return LBCSConfig(**dict(cfg["app"])).normalized()
