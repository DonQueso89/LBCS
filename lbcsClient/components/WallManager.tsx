import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  useWindowDimensions,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import Constants from "expo-constants";
import LBCSApi from "../api";
import FlashMessage, { showMessage } from "react-native-flash-message";
import * as R from "ramda";
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


import {
  Avatar,
  Appbar,
  Menu,
  TextInput,
  Divider,
  List,
} from "react-native-paper";
import Canvas, { Image } from "react-native-canvas";
import ImagePickerModal from "./ImagePickerModal";
import LoadWallModal from "./LoadWallModal";
import { saveWall, getWalls, deleteWall } from "../storage";
import { Asset } from "expo-asset";

const DEMO_WALL = {
  serverUrl: "http://:8888/",
  imageUri: Asset.fromModule(require("../assets/proto.jpeg")).uri,
  name: "DEMO",
  id: "DEMO",
};


const HOST = "raspberrypi.local";
const DEFAULT_URL = `http://${HOST}:8888/`;

const Tab = createBottomTabNavigator();


const WallManager = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [gridState, setGridState] = useState({});
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [lbcsApi, setApi] = useState(new LBCSApi(DEFAULT_URL));
  const windowDimensions = useWindowDimensions();
  const [cellWidth, cellHeight] = [
    windowDimensions.width / cols,
    windowDimensions.width / rows,
  ];
  const [selectedColor, setSelectedColor] = useState("#1aaa61")
  const [coordinateLednumberMapping, setCoordinateLednumberMapping] = useState(
    {}
  );
  const [forceRedrawCounter, setForceRedrawCounter] = useState(0);
  const [reloadWallsCounter, setReloadWallsCounter] = useState(0);
  const canvasRef = useRef(null);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [wall, setWall] = useState({ serverUrl: DEFAULT_URL });
  const [propsVisible, setPropsVisible] = React.useState(false);
  const [loadWallDialogVisible, setLoadWallDialogVisible] = useState(false);
  const [loadedWalls, setLoadedWalls] = useState([]);

  const showImagePicker = () => setImagePickerVisible(true);
  const hideImagePicker = () => setImagePickerVisible(false);
  const showMenu = () => setMenuVisible(true);
  const hideMenu = () => setMenuVisible(false);
  const showPropsMenu = () => setPropsVisible(true);
  const hidePropsMenu = () => setPropsVisible(false);
  const showWallLoader = () => {
    hideMenu();
    setLoadWallDialogVisible(true);
  };
  const hideWallLoader = () => setLoadWallDialogVisible(false);

  const initBackgroundCanvas = useCallback(
    (backgroundCanvas) => {
      if (rows && cols && backgroundCanvas) {
        backgroundCanvas.width = windowDimensions.width;
        backgroundCanvas.height = windowDimensions.width;
        const ctx = backgroundCanvas.getContext("2d");
        const img = new Image(backgroundCanvas, 1, 1);
        img.src = wall.imageUri || "";

        img.addEventListener("load", () => {
          const mapping = {};
          ctx.drawImage(
            img,
            0,
            0,
            backgroundCanvas.width,
            backgroundCanvas.height
          );
          initGridCanvas();
        });
      }
    },
    [forceRedrawCounter]
  );

  const initGridCanvas = () => {
    const canvas = canvasRef.current;
    if (rows && cols && canvas) {
      canvas.width = windowDimensions.width;
      canvas.height = windowDimensions.width;
      const ctx = canvas.getContext("2d");

      const mapping = {};
      Array(rows)
        .fill(null)
        .map((_, y) =>
          Array(cols)
            .fill(null)
            .map((_, x) => {
              const ledNumber = y * cols + x;
              const [gridX, gridY] = [x * cellWidth, y * cellHeight];
              mapping[`${gridX}${gridY}`.toString()] = ledNumber;

              const [red, green, blue] = gridState[ledNumber] || [0, 0, 0];
              ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, .3)`;
              ctx.fillRect(gridX, gridY, cellWidth, cellHeight);
              ctx.fillStyle = null;
            })
        );

      setCoordinateLednumberMapping(mapping);
    }
  };

  const syncWithServer = async () => {
    /* Load grid state and dimensions */
    const response = await lbcsApi.state();
    if (!response.ok) {
      showMessage({
        message: "Something went wrong while getting grid from server",
        type: "danger",
      });
    } else {
      const data = await response.json();
      setGridState(data);
      setRows(data.rows);
      setCols(data.columns);
      setForceRedrawCounter((x) => {
        return x + 1;
      });
    }
  };

  useEffect(() => {
    syncWithServer();
  }, [lbcsApi]);

  useEffect(() => {
    initGridCanvas();
  }, [forceRedrawCounter]);

  useEffect(() => {
    const getWallsFromStorage = async () => {
      const walls = await getWalls();
      setLoadedWalls([DEMO_WALL, ...walls]);
    };
    getWallsFromStorage();
  }, [reloadWallsCounter]);

  const handleToggle = (e) => {
    const cellX = Math.floor(e.nativeEvent.locationX / cellWidth) * cellWidth;
    const cellY = Math.floor(e.nativeEvent.locationY / cellHeight) * cellHeight;
    const ledNumber = coordinateLednumberMapping[`${cellX}${cellY}`.toString()];

    setGridState((prevState) => {
      const newState = { ...prevState };
      const [red, green, blue] = newState[ledNumber];
      const isOn = [red, green, blue].reduce((a, b) => a + b);
      const rndColor = () => Math.floor(Math.random() * 255);
      const newColor = isOn ? [0, 0, 0] : [rndColor(), rndColor(), rndColor()];
      lbcsApi.setLed(ledNumber, ...newColor).then((response) => {
        if (!response.ok) {
          showMessage({
            message: `Something went wrong while toggling ${ledNumber}`,
            type: "danger",
          });
        }
      });
      newState[ledNumber] = newColor;
      const [newRed, newGreen, newBlue] = newColor;
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(cellX, cellY, cellWidth, cellHeight);

      ctx.fillStyle = `rgba(${newRed}, ${newGreen}, ${newBlue}, .3)`;
      ctx.fillRect(cellX, cellY, cellWidth, cellHeight);

      return newState;
    });
  };

  const handleServerUrl = useCallback(
    (newServerUrl) => {
      setWall({ ...wall, serverUrl: newServerUrl });
      try {
        new URL(newServerUrl);
      } catch (e) {
        return;
      }

      if (newServerUrl === wall.serverUrl) {
        return;
      }

      setApi(new LBCSApi(newServerUrl));
    },
    [setApi, wall.serverUrl]
  );

  const handleWallUri = (newUri: string) => {
    hideImagePicker();
    setWall({ ...wall, imageUri: newUri });
    setForceRedrawCounter((x) => x + 1);
  };

  const handleWallReset = () => {
    hideMenu();
    setWall({ serverUrl: DEFAULT_URL });
    setForceRedrawCounter((x) => x + 1);
    setApi(new LBCSApi(DEFAULT_URL));
  };

  const handleWallSave = async () => {
    if (wall.name === "DEMO") {
      showMessage({ message: "Cannot save demo wall", type: "info" });
    } else if (!wall.name) {
      showMessage({ message: "Please set a wall name", type: "info" });
    } else {
      const wallId = await saveWall(wall);
      setWall({ ...wall, id: wallId });
      hideMenu();
      setReloadWallsCounter((x) => x + 1);
    }
  };

  const handleWallLoad = async (wallId: string): Promise<void> => {
    const loadedWall = loadedWalls.find((x) => x.id == wallId) || {
      serverUrl: DEFAULT_URL,
    };
    setWall(loadedWall);
    hideWallLoader();
    setForceRedrawCounter((x) => x + 1);
    setApi(new LBCSApi(loadedWall.serverUrl));
  };

  const handleWallDelete = async (wallId: string): Promise<void> => {
    if (wallId === "DEMO") {
      showMessage({ message: "Cannot delete demo wall", type: "info" });
    }
    deleteWall(wallId);
    setReloadWallsCounter((x) => x + 1);
  };

  return (
        <View style={styles.container}>
          <Appbar.Header dark={true}>
            <Avatar.Image size={48} source={require("../assets/splash.png")} />
            <Appbar.Content
              title="Little Bull Climbing System"
              subtitle={wall.name ? `Working on: ${wall.name}` : "No wall loaded"}
            />
          </Appbar.Header>
          <Appbar>
            <Appbar.Action icon="sync" onPress={syncWithServer} />
            <Menu
              visible={menuVisible}
              anchor={
                <Appbar.Action
                  icon="dots-vertical"
                  onPress={showMenu}
                  size={32}
                />
              }
              onDismiss={hideMenu}
            >
              <Menu.Item icon="wall" onPress={handleWallReset} title="New wall" />
              <Menu.Item icon="wall" onPress={showWallLoader} title="Load wall" />
              <Menu.Item icon="wall" onPress={handleWallSave} title="Save wall" />
              <Menu.Item
                icon="camera"
                onPress={() => {
                  hideMenu();
                  showImagePicker();
                }}
                title="Add image"
              />
              <Divider />
              <Menu.Item
                icon="map-marker-path"
                onPress={() => {}}
                title="Load Problem"
              />
              <Menu.Item
                icon="map-marker-path"
                onPress={() => {}}
                title="Save Problem"
              />
              <Divider />
            </Menu>
            <Menu
              visible={propsVisible}
              anchor={
                <Appbar.Action icon="folder" onPress={showPropsMenu} size={32} />
              }
              onDismiss={hidePropsMenu}
              style={{ minWidth: "60%" }}
            >
              <TextInput
                label="Server address"
                value={wall.serverUrl}
                onChangeText={handleServerUrl}
                style={{ flex: 1, margin: 0 }}
              />
              <TextInput
                label="Wall name"
                value={wall.name}
                onChangeText={(newName) => setWall({ ...wall, name: newName })}
                style={{ flex: 1, margin: 0 }}
              />
              <Divider />
            </Menu>
          </Appbar>
          <TouchableWithoutFeedback onPress={handleToggle}>
            <View>
              <Canvas
                ref={initBackgroundCanvas}
                style={styles.backgroundCanvas}
              />
              <Canvas ref={canvasRef} style={styles.gridCanvas} />
            </View>
          </TouchableWithoutFeedback>
          <ImagePickerModal
            handleUpdate={handleWallUri}
            visible={imagePickerVisible}
            onDismiss={hideImagePicker}
          />
          <LoadWallModal
            handleUpdate={handleWallLoad}
            visible={loadWallDialogVisible}
            onDismiss={hideWallLoader}
            walls={loadedWalls}
            handleDelete={handleWallDelete}
          />
          <FlashMessage position={"top"} />
        </View>
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
    padding: 8,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "stretch",
  },
});


export default WallManager