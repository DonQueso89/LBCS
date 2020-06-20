import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';

// or any pure javascript modules available in npm
import { Card } from 'react-native-paper';

function Cell(props) {
  const [selected, setSelected] = useState(0);
  const cellStyle =   {
    flex: 1,
    backgroundColor: selected ? "red" : "skyBlue",
    borderColor: "black", 
    borderWidth: 1, 
    borderRadius: 5
  }
  
  
  return <TouchableOpacity style={cellStyle} onPress={() => setSelected(prevState => !prevState)} ></TouchableOpacity>
}

function Row(props) {
  const cells = Array(props.cols).fill(null).map(x => <Cell columns={props.cols}/>)  

  return <View style={styles.row}>{cells}</View>
}

function Grid(props) {
  const width = 100 / props.cols;
  const rows = Array(props.rows).fill(null).map(x => <Row cols={props.cols}/>)  
  return <View style={styles.container}>{rows}</View>
}

export default function App() {
  return (
    <View style={styles.container}>
      <Grid rows={12} cols={12}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'stretch'
  }
});
