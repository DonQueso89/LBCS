import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  useWindowDimensions,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import WallManager from "./components/WallManager"
import Settings from "./components/Settings"
import { Provider as PaperProvider} from "react-native-paper"
import { MaterialCommunityIcons } from "react-native-vector-icons"

const Tab = createBottomTabNavigator();


export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="WallManager" component={WallManager} options={{tabBarIcon: () =>  <MaterialCommunityIcons name="wall" size={24} /> }} />
          <Tab.Screen name="Settings" component={Settings} options={{tabBarIcon: () =>  <MaterialCommunityIcons name="settings" size={24} /> }}/>
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
