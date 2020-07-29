from lbcs.server import translate_lednumber


def test_lednumber_translation():
    assert [translate_lednumber(5, x) for x in range(20)] == [
        0,
        1,
        2,
        3,
        4,
        9,
        8,
        7,
        6,
        5,
        10,
        11,
        12,
        13,
        14,
        19,
        18,
        17,
        16,
        15,
    ]
