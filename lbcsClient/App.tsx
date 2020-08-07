import React, { useState, useMemo, useEffect, useCallback } from "react";
import {Asset} from "expo-asset"
import { useWindowDimensions, View, StyleSheet } from "react-native";
import Constants from "expo-constants";
import LBCSApi from "./api";
import FlashMessage, { showMessage } from "react-native-flash-message";
import * as R from "ramda";

import { Avatar, Appbar, Menu, TextInput } from "react-native-paper";
import Grid from "./components/Grid"
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

  const initCanvas = (canvas) => {
    if (rows && cols && canvas) {
      canvas.width = windowDimensions.width
      canvas.height = windowDimensions.width
      const img = new Image(canvas, windowDimensions.width, windowDimensions.width)
      img.src = Asset.fromModule(require('./assets/climbwall.jpg')).uri
      const [cellWidth, cellHeight] = [canvas.width / cols, canvas.height / rows]
      console.log(cellHeight, cellWidth)
      const ctx = canvas.getContext('2d');
      
      img.addEventListener("load", () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        Array(rows).fill(null).map((_, y) => Array(cols).fill(null).map((_, x) => {
          ctx.strokeRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        }))
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
    }
  };

  useEffect(() => {
    syncWithServer();
  }, [lbcsApi]);

  const handleToggle = (ledNumber: number, red: number, green: number, blue: number) => {
    setGridState(prevState => {
      const newState = { ...prevState };
      const value = newState[ledNumber];

      const newColor = lbcsApi.setLed(ledNumber, red, green, blue).then(response => {
        if (!response.ok) {
          showMessage({
            message: `Something went wrong while toggling ${ledNumber}`,
            type: "danger"
          });
        }
      });
      newState[ledNumber] = [red, green, blue];
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
      {/*
      <Grid
        rows={rows}
        cols={cols}
        gridState={gridState}
        handleToggle={handleToggle}
      />
      */}
      <Canvas ref={initCanvas} />
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
