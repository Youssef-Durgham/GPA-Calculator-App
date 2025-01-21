import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  Animated, 
  Dimensions, 
  Image, 
  useWindowDimensions, 
  Platform, 
  FlatList, 
  ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MMKV } from 'react-native-mmkv';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import TravelTicketForm from '../components/Travel';
import BookingCard from '../components/SuggestionCard';

const { width } = Dimensions.get('window');
const storage = new MMKV();

const bookingCards = [
  {
    id: 1,
    title: "Istanbul",
    description: "Luxury travel with premium amenities and dedicated service",
    price: 299.99,
    image: require('../animation/turkey.jpg'),
    perks: ["Priority Boarding", "Lounge Access", "Gourmet Meals"]
  },
  {
    id: 2,
    title: "Paris",
    description: "Enhanced comfort with extra legroom and improved service",
    price: 149.99,
    image: require('../animation/paris.jpg'),
    perks: ["Extra Legroom", "Priority Check-in", "Complimentary Drinks"]
  },
  {
    id: 3,
    title: "sulaymanya",
    description: "Affordable travel with essential amenities",
    price: 99.99,
    image: require('../animation/sulaymanya.jpg'),
    perks: ["Standard Seat", "In-flight Entertainment", "Meal Service"]
  }
];

// Helper: stable random integer
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const clouds = [
  {
    id: 1,
    startX: width + 100,
    endX: -200,
    width: 120,
    height: 80,
    duration: 10000,
    yRange: [10, 20],
  },
  {
    id: 2,
    startX: width + 150,
    endX: -250,
    width: 90,
    height: 60,
    duration: 14000,
    yRange: [20, 30],
  },
  {
    id: 3,
    startX: width + 300,
    endX: -400,
    width: 400,
    height: 200,
    duration: 18000,
    yRange: [40, 60],
  },
  {
    id: 4,
    startX: width + 80,
    endX: -180,
    width: 140,
    height: 90,
    duration: 12000,
    yRange: [10, 25],
  },
  {
    id: 5,
    startX: width + 250,
    endX: -300,
    width: 220,
    height: 130,
    duration: 16000,
    yRange: [30, 50],
  },
];

export default function HomeScreen({ route }) {
  const { width, height } = useWindowDimensions();
  const screenHeight = height;
  const screenWidth = width;
  const bottomTabBarHeight = Platform.OS === 'android' ? height * 0.1 : height * 0.1;
  const bottomTabBarHeight2 = Platform.OS === 'android' ? 0 : 0;
  const RPH = (percentage) => (percentage / 100) * screenHeight;
  const RPW = (percentage) => (percentage / 100) * screenWidth;
  const navigation = useNavigation();
  
  const userName = storage.getString('userName') || 'Guest';

  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [formHeight, setFormHeight] = useState(0);

  const airplaneAnim = useRef(null);
  const cloudRefs = useRef(
    clouds.map((cloud) => ({
      x: new Animated.Value(cloud.startX),
      y: randomInt(cloud.yRange[0], cloud.yRange[1]),
    }))
  ).current;

  useEffect(() => {
    airplaneAnim.current?.play();
    clouds.forEach((cloud, idx) => {
      startCloudAnimation({
        animValue: cloudRefs[idx].x,
        duration: cloud.duration,
        startPos: cloud.startX,
        endPos: cloud.endX,
      });
    });
  }, []);

  const startCloudAnimation = ({ animValue, duration, startPos, endPos }) => {
    animValue.setValue(startPos);
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: endPos,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: startPos,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleReverseLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  useEffect(() => {
    if (route.params?.selectedLocation && route.params?.type) {
      const { selectedLocation, type } = route.params;
      if (type === 'from') {
        setFromLocation(selectedLocation);
      } else {
        setToLocation(selectedLocation);
      }
    }
  }, [route.params]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0B3B' }}>
      <View style={{ height: RPH(100) - bottomTabBarHeight, paddingBottom: bottomTabBarHeight2 }}>
        <LinearGradient
          colors={['#1B1F6C', '#3E3188', '#6E48A6', '#A764AD', '#D889A8']}
          style={{ height: '50%', width: '100%', position: 'absolute' }}
        >
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 48,
            paddingBottom: 16,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('../animation/profile.webp')}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: 12,
                  borderWidth: 2,
                  borderColor: '#ffffff',
                }}
              />
              <View>
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '500' }}>
                  {getGreeting()}
                </Text>
                <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>
                  {userName}
                </Text>
              </View>
            </View>
            <Image
              source={require('../animation/logo.png')}
              style={{ width: 40, height: 80, resizeMode: 'cover' }}
            />
          </View>
          <LottieView
            ref={airplaneAnim}
            style={{
              height: '100%',
              width: '100%',
              position: 'absolute',
              top: '5%',
              left: 0,
              transform: [{ scale: 1.45 }],
            }}
            source={require('../animation/plane2.json')}
            autoPlay={false}
            loop
          />
          {clouds.map((cloud, index) => (
            <Animated.Image
              key={cloud.id}
              source={require('../animation/vecteezy_smooth_soft_cumulus_clouds_cut_out_transparent_background.png')}
              style={{
                position: 'absolute',
                width: cloud.width,
                height: cloud.height,
                top: `${cloudRefs[index].y}%`,
                transform: [{ translateX: cloudRefs[index].x }],
              }}
              resizeMode="contain"
            />
          ))}
        </LinearGradient>

        <ScrollView 
          contentContainerStyle={{ paddingBottom: 20 }} 
          showsVerticalScrollIndicator={false}
        >
          <TravelTicketForm
            fromLocation={fromLocation}
            setFromLocation={setFromLocation}
            toLocation={toLocation}
            setToLocation={setToLocation}
            handleReverseLocations={handleReverseLocations}
            onHeightChange={(height) => setFormHeight(height)}
          />
          <View style={{
            padding: 10,
            marginTop: formHeight + 360,
          }}>
            <View style={{
              marginBottom: 16,
              paddingHorizontal: 12
            }}>
              <Text style={{
                color: '#ffffff',
                fontSize: 24,
                fontWeight: 'bold',
                marginBottom: 4
              }}>
                Suggested For You
              </Text>
            </View>
            <FlatList
              data={bookingCards}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <BookingCard
                  title={item.title}
                  price={item.price}
                  image={item.image}
                />
              )}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingLeft: 10,
                paddingRight: 32,
              }}
              snapToAlignment="center"
              decelerationRate="fast"
              snapToInterval={316}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
