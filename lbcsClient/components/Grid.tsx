import React from "react"
import { View, StyleSheet } from 'react-native'
import Row from './Row'

import Constants from "expo-constants";

function Grid({ rows, cols, handleToggle, gridState }) {
  const rowComponents = Array(rows)
    .fill(null)
    .map((_, i) => (
      <Row
        cols={cols}
        startIndex={cols * i}
        key={i}
        gridState={gridState}
        handleToggle={handleToggle}
      />
    ));
  return <View style={styles.container}>{rowComponents}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#ecf0f1",
    padding: 8
  }
});

export default Grid
