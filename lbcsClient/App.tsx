import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from "react";
import FlashMessage from "react-native-flash-message";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import WallManager from "./components/WallManager";
import SettingsManager, { SettingsContext } from "./components/Settings";
import { Provider as PaperProvider } from "react-native-paper";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import { loadSettings, saveSettings, Settings } from "./storage";

const Tab = createBottomTabNavigator();

export default function App() {
  const [settings, setSettings] = useState({});
  useEffect(() => {
    const load = async () => {
      if (Object.keys(settings).length === 0) {
        const loadedSettings = await loadSettings();
        setSettings(loadedSettings);
      }
    };
    load();
  }, []);

  const handleSettingsUpdate = (newSettings) => {
    const updatedSettings = {...settings, ...newSettings};
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };
  return (
    <PaperProvider>
      <NavigationContainer>
        <SettingsContext.Provider value={[settings, handleSettingsUpdate]}>
          <Tab.Navigator>
            <Tab.Screen
              name="WallManager"
              component={WallManager}
              options={{
                tabBarIcon: () => (
                  <MaterialCommunityIcons name="wall" size={24} />
                ),
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsManager}
              options={{
                tabBarIcon: () => (
                  <MaterialCommunityIcons name="settings" size={24} />
                ),
              }}
            />
          </Tab.Navigator>
        </SettingsContext.Provider>
          <FlashMessage position={"top"} />
      </NavigationContainer>
    </PaperProvider>
  );
}
