import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { ColorPicker, fromHsv, toHsv } from "react-native-color-picker";

const Settings = (props) => {
  const [selectedColor, setSelectedColor] = useState(null);
  return (
    <View style={styles.colorPickerContainer}>
      <ColorPicker
        onColorSelected={(color) => console.log(`Color selected: ${color}`)}
        style={styles.colorPicker}
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
    height: "100%"
  },
});

export default Settings;
