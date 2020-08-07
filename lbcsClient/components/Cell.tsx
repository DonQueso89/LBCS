import React from "react"
import { TouchableHighlight, Text } from 'react-native'


function Cell({ ledNumber, rgbState, handleToggle }) {
  const [red, green, blue] = rgbState.map(Number)
  const isOn = [red, green, blue].reduce((a,b) => a+b)
  const cellStyle = {
    flex: 1,
    backgroundColor: isOn ? `rgb(${red}, ${green}, ${blue})` : "beige",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5
  };
  const rndColor = () => Math.floor(Math.random() * 255)
  const colorArgs = isOn ? [0, 0, 0] : [rndColor(), rndColor(), rndColor()]

  return (
    <TouchableHighlight
      style={cellStyle}
      onPress={() => handleToggle(ledNumber, ...colorArgs)}
    >
      <Text>{isOn ? "ON" : "OFF"}</Text>
    </TouchableHighlight>
  );
}

export default Cell