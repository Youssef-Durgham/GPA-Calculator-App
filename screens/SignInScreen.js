// screens/SignInScreen.js
import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { AuthContext } from '../components/AuthContext';

const SignInScreen = ({ navigation }) => {
  const auth = useContext(AuthContext);
  const handleSignIn = () => {
    auth.signIn();
    navigation.replace('BottomTabs'); // Navigate to the main app screen
  };

  const handleSkip = () => {
    auth.skip();
    navigation.replace('BottomTabs'); // Navigate to the main app screen
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Please Sign In</Text>
      <Button title="Sign In" onPress={handleSignIn} />
      <Button title="Skip" onPress={handleSkip} />
    </View>
  );
};

export default SignInScreen;
