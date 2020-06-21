import React, { useState, useMemo, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableHighlight } from 'react-native';
import Constants from 'expo-constants';
import lbcsApi from './api';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import * as R from 'ramda';

// or any pure javascript modules available in npm
import { Avatar, Appbar, Menu } from 'react-native-paper';

function Cell({ ledNumber, selected, handleToggle }) {
  const cellStyle ={
      flex: 1,
      backgroundColor: selected ? "blue" : "beige",
      borderColor: "black", 
      borderWidth: 1, 
      borderRadius: 5
    }
  
  return <TouchableHighlight style={cellStyle} onPress={() => handleToggle(ledNumber)} ><Text>{selected ? "ON" : "OFF"}</Text></TouchableHighlight>
}

function Row({ cols, startIndex, gridState, handleToggle }) {
  const cells = Array(cols).fill(null).map((_, i) => <Cell columns={cols} ledNumber={startIndex + i} key={i} selected={gridState[startIndex + i]} handleToggle={handleToggle} />)  

  return <View style={styles.row}>{cells}</View>
}

function Grid({ rows, cols, handleToggle, gridState }) {
  const rowComponents = Array(rows).fill(null).map((_, i) => <Row cols={cols} startIndex={cols * i} key={i} gridState={gridState} handleToggle={handleToggle} />)  
  return <View style={styles.container}>{rowComponents}</View>
}


export default function App() {
  const [menuVisible, setMenuVisible] = useState(false)
  const [gridState, setGridState] = useState({})
  const [rows, setRows] = useState(0)
  const [cols, setCols] = useState(0)

  const syncWithServer = async () => {
    /* Load grid state and dimensions */
    const response = await lbcsApi.state()
    if (!response.ok) {
        showMessage({ message: "Something went wrong while getting grid from server", type: "danger"})
    } else {
        const data = await response.json()
        setGridState(data)
        setRows(data.rows)
        setCols(data.columns)
    }
  }

  useEffect(() => {
    syncWithServer();
  }, [lbcsApi])

  const handleToggle = (ledNumber: number) => {
    setGridState((prevState) => {
      const newState = {...prevState}
      const value = newState[ledNumber]

      lbcsApi.setLed(ledNumber, !value).then(response => {
        if (!response.ok) {
          showMessage({message: `Something went wrong while toggling ${ledNumber}`, type: "danger"})
        } 
      })
      newState[ledNumber] = !value
      return newState
    })
  }
  
  return (
    <View style={styles.container}>
      <Appbar.Header dark={true}>
        <Avatar.Image size={48} source={"https://cdn3.iconfinder.com/data/icons/animals-105/150/icon_animal_touro-128.png"}/>
        <Appbar.Content title="Little Bull Climbing System"/> 
        <Appbar.Action icon="sync" onPress={syncWithServer} />
        <Appbar.Action icon="dots-vertical" onPress={() => null} size={32} />
      </Appbar.Header>
      <Grid rows={rows} cols={cols} gridState={gridState} handleToggle={handleToggle} />
      <FlashMessage position={"top"} />
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
