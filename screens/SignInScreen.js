import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SignInScreen({ auth }) {
  const navigation = useNavigation();
  const { signIn } = auth;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    // In a real app, do your auth logic here
    signIn();
    navigation.replace('BottomTabs'); 
  };

  const handleSkip = () => {
    navigation.replace('BottomTabs');
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Sign In</Text>

      <TextInput
        className="border border-gray-300 w-64 p-2 mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        className="border border-gray-300 w-64 p-2 mb-4"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        className="bg-blue-500 px-4 py-2 rounded-full mb-2"
        onPress={handleSignIn}
      >
        <Text className="text-white font-semibold">Sign In</Text>
      </Pressable>

      {/* Skip button */}
      <Pressable
        className="bg-gray-200 px-4 py-2 rounded-full"
        onPress={handleSkip}
      >
        <Text className="text-black font-semibold">Skip</Text>
      </Pressable>
    </View>
  );
}
