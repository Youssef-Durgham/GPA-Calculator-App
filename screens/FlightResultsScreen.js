// FlightResultsScreen.js
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const fakeFlights = [
  {
    id: '1',
    airline: 'AirBlue',
    departure: '08:00 AM',
    arrival: '10:00 AM',
    price: '$199',
    duration: '2h',
  },
  {
    id: '2',
    airline: 'SkyHigh',
    departure: '11:00 AM',
    arrival: '01:30 PM',
    price: '$249',
    duration: '2h 30m',
  },
  {
    id: '3',
    airline: 'FlyFast',
    departure: '02:00 PM',
    arrival: '04:00 PM',
    price: '$179',
    duration: '2h',
  },
  // Add more fake flights as needed
];

const FlightResultsScreen = ({ route, navigation }) => {
  const { from, to, tripType } = route.params;

  const renderFlightItem = ({ item }) => (
    <TouchableOpacity style={styles.flightCard}>
      <View style={styles.flightRow}>
        <Text style={styles.airlineText}>{item.airline}</Text>
        <Text style={styles.priceText}>{item.price}</Text>
      </View>
      <View style={styles.flightRow}>
        {/* Wrap the route details in a container that forces LTR */}
        <View style={styles.routeContainer}>
          <Text style={styles.infoText}>{from}</Text>
          <Text style={[styles.infoText, styles.arrowText]}> → </Text>
          <Text style={styles.infoText}>{to}</Text>
        </View>
        <Text style={styles.infoText}>{item.duration}</Text>
      </View>
      <View style={styles.flightRow}>
        <Icon name="flight-takeoff" size={16} color="#fff" />
        <Text style={styles.timeText}>{item.departure}</Text>
        <Icon
          name="flight-land"
          size={16}
          color="#fff"
          style={{ marginLeft: 10 }}
        />
        <Text style={styles.timeText}>{item.arrival}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#1B1F6C', '#3E3188', '#6E48A6']}
      style={styles.container}>
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Flight Results</Text>
        </View>
        <FlatList
          data={fakeFlights}
          keyExtractor={(item) => item.id}
          renderItem={renderFlightItem}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  flightCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  flightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  airlineText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    // Force text writing direction LTR
    writingDirection: 'ltr',
  },
  arrowText: {
    marginHorizontal: 4,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // This ensures the entire container is rendered LTR
    direction: 'ltr',
  },
});

export default FlightResultsScreen;
