
import React from "react"
import { StyleSheet, View }  from "react-native"
import { Modal, Portal, List, Button } from "react-native-paper" 


function LoadWallModal({ visible, onDismiss, handleUpdate, handleDelete, walls }) {
    return <Portal>
        <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal} >
          <View style={styles.modalContent}>
            { walls.map( wall =>  
            <List.Item
                style={styles.wallEntry}
                left={props => <List.Icon {...props} icon="wall" />}
                right={props => <Button icon="delete" {...props} onPress={() => handleDelete(wall.id)} />}
                title={wall.name}
                onPress={() => handleUpdate(wall.id)}
                key={wall.id}
              />
            )
            }
          </View>
        </Modal>
    </Portal>
}

const styles = StyleSheet.create({
  modal: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 5,
    width: "95%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  wallEntry: {
    width: "100%",
  }
});


export default LoadWallModal