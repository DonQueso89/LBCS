import React, { useState, useRef, useEffect, useCallback } from "react";
import {Asset} from "expo-asset"
import { useWindowDimensions, View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import Constants from "expo-constants";
import LBCSApi from "./api";
import FlashMessage, { showMessage } from "react-native-flash-message";
import * as R from "ramda";

import { Avatar, Appbar, Menu, TextInput, Provider as PaperProvider, Divider  } from "react-native-paper";
import Canvas, { Image } from "react-native-canvas"
import ImagePickerModal from "./components/ImagePickerModal"


const DEFAULT_COLOR = [70, 255, 0] // gbr

const HOST = "raspberrypi.local"

interface Wall {
  id: string
  name: string
  uri?: string
  server_url?: string
}

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
  const [imagePickerVisible, setImagePickerVisible] = useState(false)
  const [wallImageUri, setWallImageUri] = useState(null)
  const [wallName, setWallName] = useState(null)


  const showImagePicker = () => setImagePickerVisible(true)
  const hideImagePicker = () => setImagePickerVisible(false)
  const showMenu = () => setMenuVisible(true)
  const hideMenu = () => setMenuVisible(false)

  const initBackgroundCanvas = useCallback((backgroundCanvas) =>  {
    if (rows && cols && backgroundCanvas) {
      backgroundCanvas.width = windowDimensions.width
      backgroundCanvas.height = windowDimensions.width
      const ctx = backgroundCanvas.getContext('2d');
      const img = new Image(backgroundCanvas, 1, 1)
      img.src = wallImageUri || Asset.fromModule(require('./assets/proto.jpeg')).uri
      
      img.addEventListener("load", () => {
        const mapping = {}
        ctx.drawImage(img, 0, 0, backgroundCanvas.width, backgroundCanvas.height)
        initGridCanvas()
      })

    }
  }, [forceRedrawCounter, wallImageUri])

  const initGridCanvas = () => {
    const canvas = canvasRef.current
    if (rows && cols && canvas) {
      canvas.width = windowDimensions.width
      canvas.height = windowDimensions.width
      const ctx = canvas.getContext('2d');
      
      const mapping = {}
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
    initGridCanvas()
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
      const [newRed, newGreen, newBlue] = newColor
      const ctx = canvasRef.current.getContext("2d")
      ctx.clearRect(cellX, cellY, cellWidth, cellHeight)

      ctx.fillStyle = `rgba(${newRed}, ${newGreen}, ${newBlue}, .3)`
      ctx.fillRect(cellX, cellY, cellWidth, cellHeight);

      return newState;
    });
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

  const handleWallUri = (newUri) => {
    hideImagePicker()
    setWallImageUri(newUri)
  }

  const handleWallReset = () => {
    hideMenu()
    setWallImageUri(null)
    setWallName(null)
  }

  return (
    <PaperProvider>
    <View style={styles.container}>
      <Appbar.Header dark={true}>
        <Avatar.Image
          size={48}
          source={
            require("./assets/splash.png")
          }
        />
        <Appbar.Content title="Little Bull Climbing System" subtitle={wallName ? `Working on: ${wallName}` : "No wall loaded"} />
      </Appbar.Header>
      <Appbar>
        <Appbar.Action icon="sync" onPress={syncWithServer} />
        <Menu
          visible={menuVisible}
          anchor={<Appbar.Action icon="dots-vertical" onPress={showMenu} size={32} />}
          onDismiss={hideMenu}
        >
          <Menu.Item icon="wall" onPress={handleWallReset} title="New wall" />
          <Menu.Item icon="wall" onPress={() => {}} title="Load wall" />
          <Menu.Item icon="wall" onPress={() => {}} title="Save wall" />
          <Menu.Item icon="camera" onPress={() => { hideMenu(); showImagePicker(); }} title="Add image" />
          <Divider />
          <Menu.Item icon="map-marker-path" onPress={() => {}} title="Load Problem" />
          <Menu.Item icon="map-marker-path" onPress={() => {}} title="Save Problem" />
          <Divider />
          <Menu.Item icon="settings-outline" onPress={() => {}} title="Settings" />
        </Menu>
        <TextInput
          label="Server"
          value={serverUrlText}
          onChangeText={handleServerUrl}
          style={{flex: 1}}
        />
      </Appbar>
      <TouchableWithoutFeedback onPress={handleToggle}>
        <View>
          <Canvas ref={initBackgroundCanvas} style={styles.backgroundCanvas}/>
          <Canvas ref={canvasRef} style={styles.gridCanvas}/>
        </View>
      </TouchableWithoutFeedback>
      <ImagePickerModal handleUpdate={handleWallUri} visible={imagePickerVisible} onDismiss={hideImagePicker} />
      <FlashMessage position={"top"} />
    </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  backgroundCanvas: {
    position: "absolute",
    zIndex: 1,
  },
  gridCanvas: {
    position: "relative",
    zIndex: 2,
  },
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
