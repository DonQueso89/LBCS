import React, { useState, useRef, useEffect, useCallback } from "react";
import {Asset} from "expo-asset"
import { useWindowDimensions, View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import Constants from "expo-constants";
import LBCSApi from "./api";
import FlashMessage, { showMessage } from "react-native-flash-message";
import * as R from "ramda";

import { Avatar, Appbar, Menu, TextInput } from "react-native-paper";
import Canvas, { Image } from "react-native-canvas"


const HOST = ""

export default function App() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [gridState, setGridState] = useState({});
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [serverUrl, setServerUrl] = useState(`http://${HOST}:8888/`);
  const [lbcsApi, setApi] = useState(new LBCSApi(`http://${HOST}:8888/`));
  const [serverUrlText, setServerUrlText] = useState(
    `http://${HOST}:8888/`
  );
  const windowDimensions = useWindowDimensions();
  const [cellWidth, cellHeight] = [windowDimensions.width / cols, windowDimensions.width / rows]
  const [coordinateLednumberMapping, setCoordinateLednumberMapping] = useState({})
  const [forceRedrawCounter, setForceRedrawCounter] = useState(0)
  const canvasRef = useRef(null)

  const initCanvas = () => {
    const canvas = canvasRef.current
    if (rows && cols && canvas) {
      canvas.width = windowDimensions.width
      canvas.height = windowDimensions.width
      const ctx = canvas.getContext('2d');
      const img = new Image(canvas, 1, 1)
      img.src = Asset.fromModule(require('./assets/proto.jpeg')).uri
      
      img.addEventListener("load", () => {
        const mapping = {}
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        Array(rows).fill(null).map((_, y) => Array(cols).fill(null).map((_, x) => {
          const ledNumber = y * cols + x
          const [gridX, gridY] = [x * cellWidth, y * cellHeight]
          mapping[(`${gridX}${gridY}`).toString()] = ledNumber

          const [red, green, blue] = gridState[ledNumber] || [0, 0, 0]
          ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, .3)`
          ctx.fillRect(gridX, gridY, cellWidth, cellHeight);
          ctx.fillStyle = null
        }))

        setCoordinateLednumberMapping(mapping)
      })

    }
  }

  const syncWithServer = async () => {
    /* Load grid state and dimensions */
    const response = await lbcsApi.state();
    if (!response.ok) {
      showMessage({
        message: "Something went wrong while getting grid from server",
        type: "danger"
      });
    } else {
      const data = await response.json();
      setGridState(data);
      setRows(data.rows);
      setCols(data.columns);
      setForceRedrawCounter(x => {
        return x + 1;
      })
    }
  };

  useEffect(() => {
    syncWithServer();
  }, [lbcsApi]);

  useEffect(() => {
    initCanvas()
  }, [forceRedrawCounter])

  const handleToggle = (e) => {
    const cellX = Math.floor(e.nativeEvent.locationX / cellWidth) * cellWidth
    const cellY = Math.floor(e.nativeEvent.locationY / cellHeight) * cellHeight
    const ledNumber = coordinateLednumberMapping[(`${cellX}${cellY}`).toString()]

    setGridState(prevState => {
      const newState = { ...prevState };
      const [red, green, blue] = newState[ledNumber];
      const isOn = [red, green, blue].reduce((a,b) => a+b)
      const rndColor = () => Math.floor(Math.random() * 255)
      const newColor = isOn ? [0, 0, 0] : [rndColor(), rndColor(), rndColor()]
      lbcsApi.setLed(ledNumber, ...newColor).then(response => {
        if (!response.ok) {
          showMessage({
            message: `Something went wrong while toggling ${ledNumber}`,
            type: "danger"
          });
        }
      });
      newState[ledNumber] = newColor;

      return newState;
    });
    setForceRedrawCounter(x => x + 1)
  };

  const handleServerUrl = useCallback(
    newServerUrl => {
      setServerUrlText(newServerUrl);
      try {
        new URL(newServerUrl);
      } catch (e) {
        return;
      }

      if (newServerUrl === serverUrl) {
        return;
      }

      setApi(new LBCSApi(newServerUrl));
      setServerUrl(newServerUrl);
    },
    [setServerUrl, setApi, setServerUrlText, serverUrl]
  );

  return (
    <View style={styles.container}>
      <Appbar.Header dark={true}>
        <Avatar.Image
          size={48}
          source={
            "https://cdn3.iconfinder.com/data/icons/animals-105/150/icon_animal_touro-128.png"
          }
        />
        <Appbar.Content title="Little Bull Climbing System" />
        <Appbar.Action icon="sync" onPress={syncWithServer} />
        <Appbar.Action icon="dots-vertical" onPress={() => null} size={32} />
        <TextInput
          label="Server"
          value={serverUrlText}
          onChangeText={handleServerUrl}
        />
      </Appbar.Header>
      <TouchableWithoutFeedback onPress={handleToggle}>
        <View>
          <Canvas ref={canvasRef} />
        </View>
      </TouchableWithoutFeedback>
      <FlashMessage position={"top"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#ecf0f1",
    padding: 8
  },
  row: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "stretch"
  }
});
