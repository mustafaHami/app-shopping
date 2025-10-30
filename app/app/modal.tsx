import { Text } from '@react-navigation/elements';
import { StyleSheet, View } from 'react-native';


export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text>This is a modal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
