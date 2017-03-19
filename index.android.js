/**
* Edward Lee <edlee1@stanford.edu>
* CS 193A, Winter 2017 (instructor: Marty Stepp)
* Homework Assignment 7
* To-Do List - A re-written version of Homework Assignment 2, a basic to-do list
* app that allows users to keep track of certain tasks. And once done with
* several of those tasks, delete them with a long-press on the item.
* 
* Now on React Native! iOS users, welcome too! 😎 (except not really, there's
* probably a bunch of Android-specific stuff here)
*/

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  ListView,
  AsyncStorage,
  ToastAndroid,
  Button
} from 'react-native';

const listKey="@ToDoList:listkey";
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

/**
* Main class for entire app
*/
export default class ToDoList extends Component {
  // Consntructor
  constructor(props) {
    super(props);
    const rows = [];
    this.state = {
      db: rows,
      dataSource: ds.cloneWithRows(rows),
      text: ""
    }
    this._genRows();
  }
  // Called when ListView gets displayed
  componentDidMount() {
    this._genRows().done();
  }
  // Called when app closes
  // (doesn't seem to do what it's intended to do, though)
  componentWillUnmount() {
    this._storeRows().done();
  }
  // Gets the list items from the persistent data storage
  async _genRows() {
    try {
      let storedDataStr = await AsyncStorage.getItem(listKey);
      ToastAndroid.show("Stored: " + storedDataStr, ToastAndroid.SHORT);
      let storedData = storedDataStr.split(',');
      if (storedData !== null) {
        this.setState({
          db: storedData,
          dataSource: ds.cloneWithRows(storedData),
        });
      } else {
        ToastAndroid.show("No data stored.", ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show(error.toString(), ToastAndroid.SHORT);
    }
  }
  // Stores the list items back into persistent data storage
  _storeRows() {
    AsyncStorage.setItem(listKey, this.state.db.toString());
  }
  // Add an item into the list
  // The list item stored is continuously stored in the state
  // (it was easier that way :p)
  _addItem() {
    let text = this.state.text; // hideous work-around, I know
    if (!text || text.length === 0) return;
    this.state.db = this.state.db.concat(text);
    this.setState({
      dataSource: ds.cloneWithRows(this.state.db),
      text: ""
    });
    this._textInput.clear();
  }
  // Delete the item given the rowID
  _deleteItem(rowID: number) {
    this.state.db.splice(rowID, 1);
    this.setState({
      dataSource: ds.cloneWithRows(this.state.db),
    });
    this._storeRows();
  }
  // Display everything!
  render() {
    return (
      <View
        style={styles.paddingBox}>
        <View
          style={styles.backgroundBox}>
          <Text
            style={styles.titleText} >
            TO-DO LIST APP!
          </Text>
        </View>
        <TextInput
          onSubmitEditing={() => {
            this._addItem();
            this._storeRows()
          }}
          onChangeText={(text) => {this.setState({text: text})}}
          placeholder="write your todo-list item here"
          style={{height: 40}}
          ref={(component) => this._textInput = component}
        />
        <ListView
          dataSource={this.state.dataSource}
          renderRow={(rowData, sectionID, rowID) =>
            <Text
              style={{padding: 10}}
              onLongPress={()=>{
                this._deleteItem(rowID)
                this._storeRows()}}>
              {rowData}
            </Text>}
          renderSeparator={(sectionID, rowID) =>
            <View
              key={`${sectionID}-${rowID}`}
              style={{
                height: 1,
                backgroundColor: '#CCCCCC'
              }}
            />
          }
        />
      </View>
    );
  }
}

// so stylish 😎
const styles = StyleSheet.create({
  baseText: {
    fontFamily: 'Cochin',
  },
  titleText: {
    fontSize: 40,
    fontWeight: 'bold'
  },
  paddingBox: {
    padding: 20
  },
  backgroundBox: {
    backgroundColor: 'powderblue',
    alignItems: 'center'
  }
});

// Aww yeah, it's an app!
AppRegistry.registerComponent('ToDoList', () => ToDoList);
