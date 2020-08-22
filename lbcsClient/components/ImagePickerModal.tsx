import React, { useState, useEffect } from "react"
import { StyleSheet, View, Image }  from "react-native"
import { Modal, Portal, Button } from "react-native-paper" 
import Constants from 'expo-constants'
import Permissions from "expo-permissions"
import * as ImagePicker from "expo-image-picker"
import { showMessage } from "react-native-flash-message";



function ImagePickerModal(props) {
    const [uri, setUri] = useState(null)

    useEffect(() => {
        const getPerms = async () => {
            if (Constants.platform.ios) {
                const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
                if (status !== 'granted') {
                    alert('Can not select image without access to camera roll');
                }
            }
        }
        getPerms()
    }, [])

    const _pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });
            if (!result.cancelled) {
                setUri(result.uri);
            }
        } catch (exc) {
            showMessage({
                message: "Something went wrong while updating wall image" + exc.toString(),
                type: "danger"
            });
        }
    };

    return <Portal>
        <Modal {...props} contentContainerStyle={styles.modal} >
          <View style={styles.modalContent}>
                {uri && <>
                    <Image
                            style={styles.imagePreview}
                            source={{
                                uri: uri,
                            }}
                        />
                    <View style={styles.buttonGroup}>
                        <Button style={styles.button} uppercase={false} compact={true} mode="contained" onPress={() => props.handleUpdate(uri)}>Use this image</Button>
                        <Button style={styles.button} uppercase={false} compact={true} mode="contained" onPress={_pickImage}>Select other image</Button>
                    </View>
                </>}
                {!uri && <Button uppercase={false} compact={true} mode="contained" onPress={_pickImage}>Select image</Button>}
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
  imagePreview: {
      width: 200,
      height: 200,
      borderRadius: 3,
      margin: 10
  },
  buttonGroup: {
      flexDirection: "row",
      marginVertical: 10
  },
  button: { 
      marginHorizontal: 5
  },
  dismissButton: {
    marginTop: 0,
    marginRight: 0,
  }
});


export default ImagePickerModal