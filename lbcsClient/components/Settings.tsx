import React, { useState, useContext, useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import { ColorPicker, fromHsv, toHsv } from "react-native-color-picker";
import { Settings } from "../storage";

const SettingsContext = React.createContext({});

const SettingsManager = () => {
  const [settings, updateSettings] = useContext(SettingsContext);
  const setColor = (color: string) =>
    updateSettings({ defaultColor: fromHsv(color) });
  const color = useMemo(() => toHsv(settings.defaultColor), [settings]);

  console.log(settings);
  return (
    <View style={styles.colorPickerContainer}>
      <ColorPicker
        onColorChange={setColor}
        style={styles.colorPicker}
        color={color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  colorPickerContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  colorPicker: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export default SettingsManager;

export { SettingsContext };
