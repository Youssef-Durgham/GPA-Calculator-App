import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

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
      <Animated.View style={[styles.stars, { transform: [{ rotate: starInterpolation }] }]}> 
        <Icon name="star" size={15} color="#fff" style={[styles.starIcon, { top: 50, left: 20 }]} />
        <Icon name="star" size={10} color="#fff" style={[styles.starIcon, { top: 100, left: 150 }]} />
        <Icon name="star" size={20} color="#fff" style={[styles.starIcon, { top: 200, left: 300 }]} />
      </Animated.View>
      <Text style={styles.text}>Visa Passport Request</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
starIcon: {
    position: 'absolute',
    top: Math.random() * height,
    left: Math.random() * width,
  },
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