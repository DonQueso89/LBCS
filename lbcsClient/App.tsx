import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import lbcsApi from './api';

// or any pure javascript modules available in npm
import { Avatar, Appbar, Menu } from 'react-native-paper';

function Cell({ ledNumber }) {
  const [selected, setSelected] = useState(0);
  const handleSelect = (prevState) => {
    lbcsApi.setLed(ledNumber, !prevState).then(r => r.json()).then(d => console.log(d))
    setSelected(!prevState)
  }

  const cellStyle =   {
    flex: 1,
    backgroundColor: selected ? "blue" : "skyBlue",
    borderColor: "black", 
    borderWidth: 1, 
    borderRadius: 5
  }
  
  
  return <TouchableOpacity style={cellStyle} onPress={() => setSelected(handleSelect)} ></TouchableOpacity>
}

function Row({ cols, startIndex }) {
  const cells = Array(cols).fill(null).map((_, i) => <Cell columns={cols} ledNumber={startIndex + i}/>)  

  return <View style={styles.row}>{cells}</View>
}

function Grid(props) {
  const rows = Array(props.rows).fill(null).map((_, i) => <Row cols={props.cols} startIndex={props.cols * i}/>)  
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
      <Menu closeMenu={() => setMenuVisible(false)} visible={menuVisible}/>
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
