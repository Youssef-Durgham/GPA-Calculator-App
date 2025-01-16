import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { styled } from 'nativewind';

export default function SettingsScreen({ auth }) {
  const { isSignedIn, signOut } = auth;
  
  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold mb-4">
        Settings Screen
      </Text>

      {isSignedIn ? (
        <Pressable
          className="bg-red-500 px-4 py-2 rounded-full"
          onPress={signOut}
        >
          <Text className="text-white font-semibold">Sign Out</Text>
        </Pressable>
      ) : (
        <Text className="text-gray-500">You are not signed in.</Text>
      )}
    </View>
  );
}
