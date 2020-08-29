import AsyncStorage from "@react-native-community/async-storage";
import objectid from "bson-objectid";
import { showMessage } from "react-native-flash-message";

const DEFAULT_COLOR = "#46ff00";
const SETTINGS_KEY = "SETTINGS";

interface Wall {
  id?: string;
  name?: string;
  imageUri?: string;
  serverUrl?: string;
}

interface Problem {
  id: string;
  name: string;
  route: [number, number, number, number][];
}

interface Settings {
  defaultColor: string;
}

const deleteWall = async (id: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(id);
  } catch (e) {
    showMessage({
      type: "danger",
      message: "Something went wrong while deleting wall",
    });
  }
};

const getWalls = async (): Promise<Wall[]> => {
  const walls: string[] = [];
  try {
    const keys = await AsyncStorage.getAllKeys();
    const loadedWalls = await AsyncStorage.multiGet(keys);
    return loadedWalls
      .filter(([k, _]) => k !== SETTINGS_KEY)
      .map(([_, w]) => JSON.parse(w));
  } catch (e) {
    showMessage({
      type: "danger",
      message: "Something went wrong while getting walls from device",
    });
  }
  return walls.map((w) => JSON.parse(w));
};

const loadWall = async (id: string): Promise<Wall | undefined> => {
  try {
    const wall = await AsyncStorage.getItem(id);
    if (wall !== null) {
      return JSON.parse(wall);
    }
    throw new Error();
  } catch (e) {
    showMessage({
      message: "Something went wrong while getting wall from device",
      type: "danger",
    });
  }
};

const loadSettings = async (): Promise<Settings | undefined> => {
  try {
    const settings = await AsyncStorage.getItem(SETTINGS_KEY);
    if (settings !== null) {
      return JSON.parse(settings);
    }
    return { defaultColor: DEFAULT_COLOR };
  } catch (e) {
    showMessage({
      message: "Something went wrong while getting settings from device",
      type: "danger",
    });
  }
};

const saveWall = async (wall: Wall): Promise<string> => {
  const id = wall.id || new objectid().toHexString();

  try {
    await AsyncStorage.setItem(id, JSON.stringify({ id, ...wall }));
    showMessage({
      message: "Wall successfully saved to device",
      type: "success",
    });
  } catch (e) {
    showMessage({
      message: "Something went wrong while getting wall from device",
      type: "danger",
    });
  }
  return id;
};

const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    showMessage({
      message: "Settings successfully saved to device",
      type: "success",
    });
  } catch (e) {
    showMessage({
      message: "Something went wrong while saving settings to device",
      type: "danger",
    });
  }
};
export {
  loadWall,
  loadSettings,
  saveWall,
  saveSettings,
  getWalls,
  deleteWall,
  Problem,
  Wall,
  Settings,
};
