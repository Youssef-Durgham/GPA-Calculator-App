import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView,
  Dimensions,
  useWindowDimensions 
} from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { LineChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const storage = new MMKV();

export default function HomeScreen({ route }) {
  const { width, height } = useWindowDimensions();
  const screenHeight = height;
  const screenWidth = width;
  const RPH = (percentage) => (percentage / 100) * screenHeight;
  const RPW = (percentage) => (percentage / 100) * screenWidth;
  const navigation = useNavigation();
  
  const userName = storage.getString('userName') || 'Guest';

  // Default total credit hours required in AUIB (American University in Baghdad)
  const targetCredits = 130;

  // State for semesters
  const [semesters, setSemesters] = useState([]);

  // Load data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const storedSemesters = storage.getString('SEMESTERS_DATA');
      if (storedSemesters) {
        try {
          const parsed = JSON.parse(storedSemesters);
          // Optionally, force collapse all semesters on load:
          const collapsed = parsed.map(sem => ({ ...sem, isExpanded: false }));
          setSemesters(collapsed);
        } catch (e) {
          console.log('Error parsing stored semesters:', e);
        }
      } else {
        // If no data is stored, load sample data or leave empty
        setSemesters([]);
      }
    }, [])
  );

  // AUIB grade mapping (max 4.0)
  const gradeMap = {
    'A+': 4.0,
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'D-': 0.7,
    'F': 0.0
  };

  // Calculate GPA for a single semester
  const calculateSemesterGPA = (semester) => {
    if (!semester.courses || semester.courses.length === 0) return 0;
    let totalQualityPoints = 0;
    let totalCredits = 0;
    semester.courses.forEach(course => {
      const points = gradeMap[course.grade] || 0;
      totalQualityPoints += points * course.creditHours;
      totalCredits += course.creditHours;
    });
    return totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0;
  };

  // Calculate cumulative GPA progressively as an array.
  const calculateCumulativeGPAs = () => {
    let totalQualityPoints = 0;
    let totalCredits = 0;
    return semesters.map(semester => {
      semester.courses.forEach(course => {
        const points = gradeMap[course.grade] || 0;
        totalQualityPoints += points * course.creditHours;
        totalCredits += course.creditHours;
      });
      return totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0;
    });
  };

  // Overall cumulative GPA.
  const calculateOverallGPA = () => {
    let totalQualityPoints = 0;
    let totalCredits = 0;
    semesters.forEach(semester => {
      semester.courses.forEach(course => {
        const points = gradeMap[course.grade] || 0;
        totalQualityPoints += points * course.creditHours;
        totalCredits += course.creditHours;
      });
    });
    return totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0;
  };

  // Calculate total credit hours per semester.
  const calculateSemesterCredits = (semester) => {
    if (!semester.courses) return 0;
    return semester.courses.reduce((sum, course) => sum + course.creditHours, 0);
  };

  // Overall credits earned.
  const calculateOverallCredits = () => {
    return semesters.reduce((acc, sem) => acc + calculateSemesterCredits(sem), 0);
  };

  // Prepare safe data arrays for charts.
  const semesterGPAs = semesters.map(s => calculateSemesterGPA(s));
  const cumulativeGPAs = calculateCumulativeGPAs();
  const creditDataArray = semesters.map(s => calculateSemesterCredits(s));

  // Provide fallback values if the arrays are empty.
  const safeLabels = semesters.length > 0 ? semesters.map((s, i) => `Sem ${i + 1}`) : ['N/A'];
  const safeSemesterGPAs = semesterGPAs.length > 0 ? semesterGPAs : [0];
  const safeCumulativeGPAs = cumulativeGPAs.length > 0 ? cumulativeGPAs : [0];
  const safeCreditDataArray = creditDataArray.length > 0 ? creditDataArray : [0];

  // Prepare data for the combined line chart.
  const lineChartData = {
    labels: safeLabels,
    datasets: [
      {
        data: safeSemesterGPAs,
        color: (opacity = 1) => `rgba(255, 111, 97, ${opacity})`,
        strokeWidth: 2,
        withDots: true,
        label: 'Semester GPA'
      },
      {
        data: safeCumulativeGPAs,
        color: (opacity = 1) => `rgba(97, 205, 187, ${opacity})`,
        strokeWidth: 2,
        withDots: true,
        label: 'Cumulative GPA'
      }
    ],
    legend: ['Semester GPA', 'Cumulative GPA']
  };

  // Prepare data for the bar chart.
  const creditData = {
    labels: safeLabels,
    datasets: [
      {
        data: safeCreditDataArray
      }
    ]
  };

  // Progress chart: overall credits earned vs target.
  const overallCredits = calculateOverallCredits();
  // Clamp the fraction so that it never exceeds 1
  const progressFraction = Math.min(overallCredits / targetCredits, 1);
  const progressData = {
    data: [progressFraction]
  };

  const overallGPA = calculateOverallGPA();

  // Chart configuration (modern dark theme).
  const chartConfig = {
    backgroundGradientFrom: "#1A1A6B",
    backgroundGradientTo: "#0B0B3B",
    color: (opacity = 1) => `rgba(255, 111, 97, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#FF6F61"
    },
    style: {
      borderRadius: 16
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B3B' }}>
      <ScrollView contentContainerStyle={{ padding: RPW(5), paddingBottom: RPH(5) }}>
        <Text style={{ 
          color: '#fff', 
          fontSize: RPW(7), 
          fontWeight: 'bold', 
          textAlign: 'center',
          marginBottom: RPH(2)
        }}>
          AUIB Dashboard
        </Text>
        <Text style={{ 
          color: '#fff', 
          fontSize: RPW(4), 
          textAlign: 'center',
          marginBottom: RPH(2)
        }}>
          Welcome, {userName}
        </Text>

        {/* Combined Line Chart for GPA Progress */}
        <Text style={{ color: '#fff', fontSize: RPW(5), marginBottom: RPH(2) }}>
          GPA Progress
        </Text>
        <LineChart
          data={lineChartData}
          width={screenWidth - RPW(10)}
          height={260}
          chartConfig={chartConfig}
          bezier
          style={{ marginVertical: RPH(2), borderRadius: 16 }}
          onDataPointClick={(data) => {
            alert(`Data Point: ${data.value}`);
          }}
        />

        {/* Bar Chart for Total Credit Hours per Semester */}
        <Text style={{ color: '#fff', fontSize: RPW(5), marginBottom: RPH(2) }}>
          Credit Hours per Semester
        </Text>
        <BarChart
          data={creditData}
          width={screenWidth - RPW(10)}
          height={220}
          chartConfig={chartConfig}
          style={{ marginVertical: RPH(2), borderRadius: 16 }}
          onDataPointClick={(data) => {
            alert(`Data Point: ${data.value}`);
          }}
        />

        {/* Progress Chart for Credit Completion */}
        <Text style={{ color: '#fff', fontSize: RPW(5), marginBottom: RPH(2) }}>
          Credit Completion Progress
        </Text>
        <ProgressChart
          data={progressData}
          width={screenWidth - RPW(10)}
          height={220}
          chartConfig={chartConfig}
          style={{ marginVertical: RPH(2), borderRadius: 16 }}
        />

        <Text style={{ 
          color: '#fff', 
          fontSize: RPW(4), 
          textAlign: 'center', 
          marginTop: RPH(2) 
        }}>
          Overall Cumulative GPA: {overallGPA.toFixed(2)}
        </Text>
        <Text style={{ 
          color: '#fff', 
          fontSize: RPW(4), 
          textAlign: 'center', 
          marginTop: RPH(1)
        }}>
          Total Credits: {overallCredits} / {targetCredits}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
