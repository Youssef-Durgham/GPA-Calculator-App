import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MMKV } from 'react-native-mmkv';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';

const storage = new MMKV(); // Initialize MMKV storage

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
  const animation = useRef(null);
  useEffect(() => {
    animation.current?.play();
  }, []);
  return (
    <View className="flex-1 items-center justify-center">
      <LinearGradient
        colors={['#87CEEB', '#FFC0CB']}
        style={{ flex: 1, width: '100%', position: 'relative' }}
      >
        <LottieView
          ref={animation}
          style={{ height: '50%', width: '100%', position: 'absolute', top: '35%', left: '0%', transform: [{ scale: 1.45 }] }}
          source={require('../animation/plane2.json')}
          autoPlay
          loop
        />
        <Image
          source={require('../animation/vecteezy_smooth_soft_cumulus_clouds_cut_out_transparent_background.png')}
          className="absolute w-32 h-24"
          style={[{ top: '15%', left: '10%' }]}
        />
        <Image
          source={require('../animation/vecteezy_smooth_soft_cumulus_clouds_cut_out_transparent_background.png')}
          className="absolute w-24 h-20"
          style={[{ top: '25%', right: '15%' }]}
        />
        <Image
          source={require('../animation/vecteezy_smooth_soft_cumulus_clouds_cut_out_transparent_background.png')}
          className="absolute -bottom-20 w-full h-72"
          resizeMode="repeat"
        />
      </LinearGradient>
      <View className="flex-1 items-center justify-center">
        {/* Add your booking cards here */}
        <Text>Booking Card 1</Text>
        <Text>Booking Card 2</Text>
        <Text>Booking Card 3</Text>
      </View>
      <Pressable
        className="bg-blue-500 py-2 px-4 rounded-lg mb-4"
        onPress={handlePayPress}
      >
        <Text className="text-white text-lg">Pay Now</Text>
      </Pressable>
    </View>
  );
}