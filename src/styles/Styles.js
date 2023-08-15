import { StyleSheet } from 'react-native';

export default {
  primaryColor: '#fc5c65',
  accentColor: '#ff6f00',
  iconButtonColor: '#fc5c65',
  androidRipple: {
    color: 'lightgray',
    radius: 20,
  },
  button: {
    backgroundColor: '#fc5c65',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    marginHorizontal: 25,
    // elevation: 5, // for android shadow
    maxWidth: '80%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 15
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: '#f8f8f8',
    // justifyContent: 'center',
    paddingTop: 20,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    // elevation: 5, // for android shadow
  },
  entryContainer: {
    marginVertical: 5,
    // margin: 5,
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#fff',
    // elevation: 5, // for android shadow
    flexDirection: 'row',
    alignItems: 'center',
  },
  entry: {
    flex: 1,
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // fontSize: 18,
    alignItems: 'center',
  },
  entryDescription: {
    fontSize: 18,  // Adjust the font size to suit your needs
  },
  entryCaloriesContainer: {
    backgroundColor: '#fc5c65',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryCalories: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  entryRight: {
    flexDirection: 'row',  // make calories and warning icon align horizontally
    alignItems: 'center',  // center items vertically
    // backgroundColor: '#ddd',  // add background color to calories block
    // padding: 5,  // add padding to calories block
  },
  tabBarLabel: {
    fontSize: 13,  // increase tab bar label font size
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
};

export const chatsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  listViewContent: {
    width: '100%',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    width: '100%',
    height: 65
  },
  rowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#f0f0f0',
    width: '100%',
  },
  backRightBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: 75,
    bottom: 1,
    top: 1,
  },
  backRightBtnLeft: {
    backgroundColor: '#32CD32',
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: '#FF3333',
    right: 0,
  },
  backTextWhite: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export const friendStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderColor: '#ddd',
        borderRadius: 5,
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 10,
        margin: 10,
    },
    searchIcon: {
        marginRight: 5,  // give a little space between icon and placeholder text
    },
    searchInput: {
        flex: 1,
        height: 20,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
        width: '100%',
        height: 60,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15
    },
    friendName: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    // Add the styles related to swipeable buttons
    rowBack: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: '#f0f0f0',
        width: '100%',
    },
    backRightBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        width: 75,
        bottom: 1,
        top: 1,
    },
    backRightBtnLeft: {
        backgroundColor: '#32CD32',
        right: 75,
    },
    backRightBtnRight: {
        backgroundColor: '#FF3333',
        right: 0,
    },
    backTextWhite: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});

export const searchStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: '#ddd',
    borderRadius: 5,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    height: 20,
    fontSize: 16, 
  },
  messageText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#333',
    // backgroundColor: '#e0e0e0',
    // borderRadius: 5,
    // padding: 10,
    fontSize: 16, 
  },
  buttonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  margin: 10,
  },
});

export const loginSignUpStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F5F5",
    alignItems: "stretch",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#552055",
    textAlign: "center",
    marginBottom: 10,
  },
  appDescription: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderColor: "#552055",
    borderWidth: 2,
    borderRadius: 5,
    width: "100%",
    marginVertical: 5,
    padding: 10,
  },
  label: {
    marginLeft: 5,
    fontWeight: 'bold',
    color: "#552055",
  },
  buttonContainer: {
    marginTop: 15,
    width: '70%',
    alignSelf: 'center'
  },
  primaryButton: {
    backgroundColor: "#552055",
    marginVertical: 7,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: "#ddd",
    marginVertical: 7,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
  },
});

export const discoverStyle = StyleSheet.create({
  button:{
    backgroundColor:"white",
    borderRadius:100, 
    shadowColor:"black", 
    shadowOpacity:10, 
    elevation:5
  },
  buttonWrapper:{
    position: 'absolute', 
    top: '70%', 
    left:"85%"
  },
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centerButtonWrapper:{
    position: 'absolute', 
    top: '80%', 
    left:"85%"
  },
})