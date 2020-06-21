import React, { useState, useMemo } from 'react';
import { Text, View, StyleSheet, TouchableHighlight } from 'react-native';
import Constants from 'expo-constants';
import lbcsApi from './api';
import FlashMessage, { showMessage } from 'react-native-flash-message';

// or any pure javascript modules available in npm
import { Avatar, Appbar, Menu } from 'react-native-paper';

function Cell({ ledNumber, initialState }) {
  const [selected, setSelected] = useState(initialState);
  const handleSelect = (prevState: boolean) => {
    lbcsApi.setLed(ledNumber, !prevState).then(response => {
      if (!response.ok) {
          showMessage({message: `Something went wrong while toggling ${ledNumber}`, type: "danger"})
      } 
    })
    return !prevState
  }

  const cellStyle ={
      flex: 1,
      backgroundColor: selected ? "blue" : "beige",
      borderColor: "black", 
      borderWidth: 1, 
      borderRadius: 5
    }
  
  return <TouchableHighlight style={cellStyle} onPress={() => setSelected(handleSelect)} ><Text>{selected ? "ON" : "OFF"}</Text></TouchableHighlight>
}

function Row({ cols, startIndex }) {
  const cells = Array(cols).fill(null).map((_, i) => <Cell columns={cols} ledNumber={startIndex + i} key={i} initialState={false} />)  

  return <View style={styles.row}>{cells}</View>
}

function Grid(props) {
  const rows = Array(props.rows).fill(null).map((_, i) => <Row cols={props.cols} startIndex={props.cols * i} key={i}/>)  
  return <View style={styles.container}>{rows}</View>
}


export default function App() {
  const [menuVisible, setMenuVisible] = useState(false)
  return (
    <View style={styles.container}>
      <Appbar.Header dark={true}>
        <Avatar.Image size={48} source={"https://cdn3.iconfinder.com/data/icons/animals-105/150/icon_animal_touro-128.png"}/>
        <Appbar.Content title="Little Bull Climbing System"/> 
        <Appbar.Action icon="dots-vertical" onPress={() => null} size={32} />
      </Appbar.Header>
      <Grid rows={12} cols={12}/>
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
