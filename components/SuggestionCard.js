import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Dimensions, Image, useWindowDimensions, Platform, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MMKV } from 'react-native-mmkv';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import TravelTicketForm from '../components/Travel';

// Initialize
const { width } = Dimensions.get('window');
const storage = new MMKV();

// Create a separate BookingCard component
const BookingCard = ({ title, price, image }) => {
return (
<Pressable
      style={{
        backgroundColor: '#07062D',
        marginRight: 16, // Add horizontal margin
        width: 175, // Fixed width for horizontal cards
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}
      className='p-5 border border-slate-800 rounded-3xl'
    >
      <Image
        source={image}
        style={{
          width: '100%',
          height: 120,
          resizeMode: 'cover'
        }}
        className='rounded-xl'
      />
      <View style={{ padding: 0 }} className='pt-5'>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{title}</Text>
          
        </View>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }} className='text-slate-500'>
            ${price.toFixed(2)}
          </Text>
 
      </View>
    </Pressable>
);
};

export default BookingCard;