import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const VisaRequestScreen = () => {
  const starAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(starAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, [starAnim]);

  const starInterpolation = starAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.stars, { transform: [{ rotate: starInterpolation }] }]} />
      <Text style={styles.text}>Visa Passport Request</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stars: {
    position: 'absolute',
    width: width * 2,
    height: height * 2,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: width,
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default VisaRequestScreen;