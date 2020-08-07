import React from "react"
import { View, StyleSheet } from 'react-native'
import Cell from "./Cell"


function Row({ cols, startIndex, gridState, handleToggle }) {
  const cells = Array(cols)
    .fill(null)
    .map((_, i) => (
      <Cell
        columns={cols}
        ledNumber={startIndex + i}
        key={i}
        rgbState={gridState[startIndex + i]}
        handleToggle={handleToggle}
      />
    ));

  return <View style={styles.row}>{cells}</View>;
}


const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "stretch"
  }
});


export default Row
