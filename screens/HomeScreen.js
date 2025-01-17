import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MMKV } from 'react-native-mmkv';
const storage = new MMKV();  // Initialize MMKV storage

export default function HomeScreen() {
  const navigation = useNavigation();
  const signedInFlag = storage.getString('signedIn');


  const handlePayPress = () => {
    // If user is not signed in, go to SignIn
    // If they are signed in, go to Payment
    if (!signedInFlag) {
      navigation.navigate('SignIn');
    } else {
      navigation.navigate('Payment');
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-4 bg-white">
      <Text className="text-2xl font-bold mb-4 text-black">Home Screen</Text>
      <Pressable
        className="bg-green-500 px-4 py-2 rounded-full"
        onPress={handlePayPress}
      >
        <Text className="text-white font-semibold">Pay Now</Text>
      </Pressable>
    </View>
  );
}
