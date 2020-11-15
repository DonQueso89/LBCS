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
  id?: string;
  name: string;
  gridState: { [key: string]: [number, number, number]};
  rows: number;
  columns: number;
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
  try {
    const keys = await AsyncStorage.getAllKeys();
    const loadedWalls = await AsyncStorage.multiGet(keys);
    return loadedWalls
      .filter(([k, _]) => k !== SETTINGS_KEY && !k.startsWith("P"))
      .map(([_, w]) => JSON.parse(w));
  } catch (e) {
    showMessage({
      type: "danger",
      message: "Something went wrong while getting walls from device",
    });
  }
  return [];
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
  const id = wall.id || `W${new objectid().toHexString()}`;

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


const saveProblem = async (problem: Problem): Promise<string> => {
  const id = problem.id || `P${new objectid().toHexString()}`;

  try {
    await AsyncStorage.setItem(id, JSON.stringify({ id, ...problem }));
    showMessage({
      message: "Problem successfully saved to device",
      type: "success",
    });
  } catch (e) {
    showMessage({
      message: "Something went wrong while saving Problem to device",
      type: "danger",
    });
  }
  return id;
};

const getProblems = async (): Promise<Problem[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const loadedProblems = await AsyncStorage.multiGet(keys);
    return loadedProblems
      .filter(([k, _]) => k !== SETTINGS_KEY && !k.startsWith("W"))
      .map(([_, p]) => JSON.parse(p));
  } catch (e) {
    showMessage({
      type: "danger",
      message: "Something went wrong while getting problems from device",
    });
  }
  return [];
};

export {
  loadWall,
  loadSettings,
  saveWall,
  saveSettings,
  getWalls,
  deleteWall,
  getProblems,
  saveProblem,
  Problem,
  Wall,
  Settings,
};
