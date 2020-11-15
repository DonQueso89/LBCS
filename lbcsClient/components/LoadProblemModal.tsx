
import React, {useEffect, useState} from "react"
import { StyleSheet, View }  from "react-native"
import { Modal, Portal, List, Button } from "react-native-paper" 
import { getProblems , Problem} from  "../storage"


function LoadProblemModal({ visible, onDismiss, handleUpdate, handleDelete }) {
    const [problems, setProblems] = useState([])

    useEffect(() => {
      const getProblemsFromStorage = async () => {
        const problems = await getProblems();
        setProblems(problems);
      };
      getProblemsFromStorage();
    }, [visible]);

    const onDelete = (problem: Problem) => {
      setProblems(problems.filter(x => x.id !== problem.id))
      handleDelete(problem.id)
    }



    return <Portal>
        <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal} >
          <View style={styles.modalContent}>
            { problems.map( problem =>  
            <List.Item
                style={styles.problemEntry}
                left={props => <List.Icon {...props} icon="map-marker-path" />}
                right={props => <Button icon="delete" {...props} onPress={() => onDelete(problem)} />}
                title={problem.name}
                onPress={() => handleUpdate(problem)}
                key={problem.id}
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
  problemEntry: {
    width: "100%",
  }
});


export default LoadProblemModal