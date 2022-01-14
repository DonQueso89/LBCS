#!/bin/bash
# pip install -e . can't find setuptools for some reason
# so we invoke setup.py directly
python setup.py develop
lbcs-server