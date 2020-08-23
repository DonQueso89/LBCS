# LBCS

## LBCS client setup
- install the expo-cli
```bash
npm install -g expo-cli
```
- now `cd` into `lbcsClient` repo and type `npm start`
- you can either emulate the app using the expo app from play store [here](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en) or from the app store [here](https://apps.apple.com/nl/app/expo-client/id982107779)
- you can also use the various browsers to emulate the app client using android studio [here](https://docs.expo.io/workflow/android-studio-emulator/)

## LBCS server setup
- install poetry using `pip`
```python
pip3 install poetry
```
- use poetry to install the requirements. `cd` into the `ledserver` repo and type:
```python
poetry install 
```
this should install all the dependencies

- cd into the `lbcs` repo and run `poetry server.py` this should start the server up

