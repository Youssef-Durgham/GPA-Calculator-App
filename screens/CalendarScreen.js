// CalendarScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Calendar } from 'react-native-calendars';

const { width } = Dimensions.get('window');

const CalendarScreen = ({ route, navigation }) => {
  const { from, to } = route.params;
  const [selected, setSelected] = useState('');

  // Example flight price data - Replace with your actual data
  const flightPrices = {
    '2025-01-21': { prices: [299, 399], dots: [{color: '#6E48A6'}, {color: '#A764AD'}] },
    '2025-01-22': { prices: [199], dots: [{color: '#6E48A6'}] },
    '2025-01-23': { prices: [299, 349, 499], dots: [{color: '#6E48A6'}, {color: '#A764AD'}, {color: '#D889A8'}] },
    '2025-01-25': { prices: [279], dots: [{color: '#6E48A6'}] },
  };

  const markedDates = {};
  Object.keys(flightPrices).forEach(date => {
    markedDates[date] = {
      dots: flightPrices[date].dots,
      marked: true,
      selected: date === selected,
      selectedColor: 'rgba(110, 72, 166, 0.2)',
    };
  });

  if (selected) {
    markedDates[selected] = {
      ...markedDates[selected],
      selected: true,
      selectedColor: 'rgba(110, 72, 166, 0.2)',
    };
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {from} → {to}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <Calendar
        style={styles.calendar}
        theme={{
          backgroundColor: 'transparent',
          calendarBackground: 'transparent',
          textSectionTitleColor: '#fff',
          selectedDayBackgroundColor: '#6E48A6',
          selectedDayTextColor: '#fff',
          todayTextColor: '#6E48A6',
          dayTextColor: '#fff',
          textDisabledColor: 'rgba(255,255,255,0.3)',
          dotColor: '#6E48A6',
          selectedDotColor: '#fff',
          arrowColor: '#fff',
          monthTextColor: '#fff',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14,
        }}
        markedDates={markedDates}
        onDayPress={(day) => setSelected(day.dateString)}
        markingType="multi-dot"
        enableSwipeMonths={true}
      />

      {selected && flightPrices[selected] && (
        <View style={styles.bottomSheet}>
          <Text style={styles.selectedDateText}>
            Available flights on {selected}
          </Text>
          {flightPrices[selected].prices.map((price, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.priceButton}
              onPress={() => {
                navigation.navigate('FlightDetails', {
                  from,
                  to,
                  date: selected,
                  price,
                  flightOption: index + 1
                });
              }}
            >
              <View>
                <Text style={styles.priceButtonText}>
                  ${price}
                </Text>
                <Text style={styles.flightOptionText}>
                  Flight Option {index + 1}
                </Text>
              </View>
              <Icon name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B3B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  calendar: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedDateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  priceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6E48A6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  priceButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  flightOptionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  backButton: {
    padding: 8,
  },
});

export default CalendarScreen;