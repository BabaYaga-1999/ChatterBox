// Styles.js
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
