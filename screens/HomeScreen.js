import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
  LayoutAnimation,
  UIManager,
  Alert,
  Share
} from 'react-native';
import { MMKV } from 'react-native-mmkv';
import Collapsible from 'react-native-collapsible';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { captureRef } from 'react-native-view-shot';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const storage = new MMKV();

export default function HomeScreen() {
  // Screen dimensions and responsive helpers
  const { width, height } = Dimensions.get('window');
  const RPH = (percentage) => (percentage / 100) * height;
  const RPW = (percentage) => (percentage / 100) * width;
  const navigation = useNavigation();

  // Get user name from storage.
  const userName = storage.getString('userName') || 'Guest';

  // Default target credit hours for AUIB (American University in Baghdad)
  const targetCredits = 130;

  /** STATE VARIABLES **/

  // Semesters – each semester includes a "name" field.
  const [semesters, setSemesters] = useState([]);

  // Modal controls for adding/editing a course.
  const [isCourseModalVisible, setIsCourseModalVisible] = useState(false);
  const [currentSemesterIndex, setCurrentSemesterIndex] = useState(null);
  const [currentCourseIndex, setCurrentCourseIndex] = useState(null);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [selectedCreditHours, setSelectedCreditHours] = useState('3');
  const [selectedGrade, setSelectedGrade] = useState('A');

  // Modal controls for deleting a semester.
  const [isDeleteSemesterModalVisible, setIsDeleteSemesterModalVisible] = useState(false);
  const [semesterToDeleteIndex, setSemesterToDeleteIndex] = useState(null);

  // Modal for creating a new semester.
  const [isSemesterModalVisible, setIsSemesterModalVisible] = useState(false);
  const [semesterName, setSemesterName] = useState('');

  // Modal for CGPA Goal Predictor.
  const [isGoalPredictorModalVisible, setIsGoalPredictorModalVisible] = useState(false);
  const [targetCGPA, setTargetCGPA] = useState('');
  // We'll store an object with required GPA, completed & remaining credits, and total required credits.
  const [goalData, setGoalData] = useState(null);

  // Modal for Grade Conversion Reference.
  const [isGradeConversionModalVisible, setIsGradeConversionModalVisible] = useState(false);

  // Reference for exporting GPA summary as an image.
  const summaryRef = useRef();

  /** OPTIONS for dropdowns **/

  const creditOptions = [
    { label: '1 Credit Hour', value: '1' },
    { label: '2 Credit Hours', value: '2' },
    { label: '3 Credit Hours', value: '3' },
    { label: '4 Credit Hours', value: '4' },
    { label: '5 Credit Hours', value: '5' },
    { label: '6 Credit Hours', value: '6' },
    { label: '7 Credit Hours', value: '7' },
    { label: '8 Credit Hours', value: '8' },
    { label: '9 Credit Hours', value: '9' },
    { label: '10 Credit Hours', value: '10' },
    { label: '11 Credit Hours', value: '11' }
  ];

  const gradeOptions = [
    { label: 'A+', value: 'A+' },
    { label: 'A', value: 'A' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B', value: 'B' },
    { label: 'B-', value: 'B-' },
    { label: 'C+', value: 'C+' },
    { label: 'C', value: 'C' },
    { label: 'C-', value: 'C-' },
    { label: 'D+', value: 'D+' },
    { label: 'D', value: 'D' },
    { label: 'D-', value: 'D-' },
    { label: 'F', value: 'F' }
  ];

  // Grade-to-point mapping (max 4.0).
  const gradePoints = {
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

  /** PERSISTENCE WITH MMKV **/

  useFocusEffect(
    useCallback(() => {
      const storedSemesters = storage.getString('SEMESTERS_DATA');
      if (storedSemesters) {
        try {
          const parsed = JSON.parse(storedSemesters);
          const updated = parsed.map((sem, index) => ({
            ...sem,
            isExpanded: false,
            name: sem.name || `Semester ${index + 1}`
          }));
          setSemesters(updated);
        } catch (e) {
          console.log('Error parsing stored semesters:', e);
        }
      }
    }, [])
  );

  useEffect(() => {
    storage.set('SEMESTERS_DATA', JSON.stringify(semesters));
  }, [semesters]);

  /** CUSTOM DROPDOWN COMPONENT **/
  // Wrapped options in a ScrollView with nestedScrollEnabled.
  const CustomDropdown = ({ options, selectedValue, onValueChange, placeholder }) => {
    const [open, setOpen] = useState(false);
    return (
      <View style={{ marginBottom: RPH(2), width: '100%' }}>
        <TouchableOpacity
          onPress={() => setOpen(!open)}
          style={{
            backgroundColor: '#1A1A6B',
            padding: RPW(3),
            borderRadius: RPW(2),
            borderWidth: 1,
            borderColor: '#FF6F61',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Text style={{ color: '#fff', fontSize: RPW(4) }}>
            {selectedValue ? selectedValue : placeholder}
          </Text>
          <Text style={{ color: '#fff', fontSize: RPW(4) }}>{open ? '-' : '+'}</Text>
        </TouchableOpacity>
        {open && (
          <View
            style={{
              backgroundColor: '#1A1A6B',
              borderRadius: RPW(2),
              marginTop: RPH(1),
              borderWidth: 1,
              borderColor: '#FF6F61',
              width: '100%',
              maxHeight: RPH(30)
            }}
          >
            <ScrollView nestedScrollEnabled={true}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  style={{
                    padding: RPW(3),
                    borderBottomWidth: index === options.length - 1 ? 0 : 1,
                    borderColor: '#FF6F61'
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: RPW(4) }}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  /** HELPER FUNCTIONS **/

  // Calculate GPA for one semester.
  const calculateSemesterGPA = (semester) => {
    if (!semester.courses || semester.courses.length === 0) return 'N/A';
    let totalQualityPoints = 0;
    let totalCredits = 0;
    semester.courses.forEach((course) => {
      const points = gradePoints[course.grade] || 0;
      totalQualityPoints += course.creditHours * points;
      totalCredits += course.creditHours;
    });
    return totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : 'N/A';
  };

  // Calculate cumulative GPA from all semesters.
  const calculateCumulativeGPA = () => {
    let totalQualityPoints = 0;
    let totalCredits = 0;
    semesters.forEach((semester) => {
      semester.courses.forEach((course) => {
        const points = gradePoints[course.grade] || 0;
        totalQualityPoints += course.creditHours * points;
        totalCredits += course.creditHours;
      });
    });
    return totalCredits > 0 ? (totalQualityPoints / totalCredits).toFixed(2) : 'N/A';
  };

  // Create a new semester – open the semester modal.
  const openSemesterModal = () => {
    setSemesterName('');
    setIsSemesterModalVisible(true);
  };

  // Submit new semester.
  const submitSemesterModal = () => {
    const newSemesterName = semesterName.trim() || `Semester ${semesters.length + 1}`;
    const newSemester = {
      id: Date.now(),
      semesterNumber: semesters.length + 1,
      name: newSemesterName,
      isExpanded: false,
      courses: []
    };
    setSemesters([...semesters, newSemester]);
    setIsSemesterModalVisible(false);
  };

  // Toggle a semester's expansion.
  const toggleSemester = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSemesters(prevSemesters =>
      prevSemesters.map((sem, i) =>
        i === index ? { ...sem, isExpanded: !sem.isExpanded } : sem
      )
    );
  };

  // Delete an individual course.
  const deleteCourse = (semesterIndex, courseIndex) => {
    const updatedSemesters = [...semesters];
    updatedSemesters[semesterIndex].courses.splice(courseIndex, 1);
    setSemesters(updatedSemesters);
  };

  // Open the add-course modal for a new course.
  const openAddCourseModal = (semesterIndex) => {
    setCurrentSemesterIndex(semesterIndex);
    setIsCourseModalVisible(true);
    setIsEditingCourse(false);
    setCourseCode('');
    setSelectedCreditHours('3');
    setSelectedGrade('A');
    setCurrentCourseIndex(null);
  };

  // Open the edit-course modal.
  const openEditCourseModal = (semesterIndex, courseIndex) => {
    setCurrentSemesterIndex(semesterIndex);
    setCurrentCourseIndex(courseIndex);
    setIsEditingCourse(true);
    const course = semesters[semesterIndex].courses[courseIndex];
    if (course) {
      setCourseCode(course.courseCode);
      setSelectedCreditHours(course.creditHours.toString());
      setSelectedGrade(course.grade);
    }
    setIsCourseModalVisible(true);
  };

  // Submit the add/edit course modal.
  const submitCourseModal = () => {
    if (!courseCode) return;
    const newCourse = {
      id: Date.now(),
      courseCode,
      creditHours: parseInt(selectedCreditHours, 10),
      grade: selectedGrade
    };
    const updatedSemesters = [...semesters];
    if (isEditingCourse && currentCourseIndex !== null) {
      updatedSemesters[currentSemesterIndex].courses[currentCourseIndex] = newCourse;
    } else {
      updatedSemesters[currentSemesterIndex].courses.push(newCourse);
    }
    setSemesters(updatedSemesters);
    setIsCourseModalVisible(false);
    setIsEditingCourse(false);
    setCurrentCourseIndex(null);
  };

  // Open the delete semester modal.
  const openDeleteSemesterModal = (semesterIndex) => {
    setSemesterToDeleteIndex(semesterIndex);
    setIsDeleteSemesterModalVisible(true);
  };

  // Delete the selected semester.
  const deleteSemester = () => {
    if (semesterToDeleteIndex === null) return;
    const updatedSemesters = [...semesters];
    updatedSemesters.splice(semesterToDeleteIndex, 1);
    updatedSemesters.forEach((sem, index) => sem.semesterNumber = index + 1);
    setSemesters(updatedSemesters);
    setIsDeleteSemesterModalVisible(false);
    setSemesterToDeleteIndex(null);
  };

  // --- CGPA Goal Predictor ---
  // Open the predictor modal.
  const openGoalPredictorModal = () => {
    setTargetCGPA('');
    setGoalData(null);
    setIsGoalPredictorModalVisible(true);
  };

  // Compute goal data including required GPA, completed credits, remaining credits, and total required credits.
  const computeGoalData = () => {
    const target = parseFloat(targetCGPA);
    const currentCumulativeGPA = parseFloat(calculateCumulativeGPA());
    const completedCredits = semesters.reduce((acc, sem) => {
      return acc + (sem.courses ? sem.courses.reduce((sum, course) => sum + course.creditHours, 0) : 0);
    }, 0);
    const remainingCredits = targetCredits - completedCredits;
    if (remainingCredits <= 0 || isNaN(target) || isNaN(currentCumulativeGPA)) return null;
    const reqGPA = ((target * targetCredits) - (currentCumulativeGPA * completedCredits)) / remainingCredits;
    return {
      requiredGPA: reqGPA.toFixed(2),
      completedCredits,
      remainingCredits,
      totalRequiredCredits: targetCredits,
      achievable: reqGPA <= 4.0
    };
  };

  const submitGoalPredictor = () => {
    const data = computeGoalData();
    setGoalData(data);
  };

  // --- Export GPA Data as an Image ---
  const exportGPAData = async () => {
    try {
      const uri = await captureRef(summaryRef, {
        format: 'png',
        quality: 0.8
      });
      await Share.share({
        url: uri,
        message: 'Check out my GPA summary!'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export GPA data as image.');
    }
  };

  // --- Grade Conversion Reference Text ---
  const gradeConversionText = `
A+ : 4.0
A  : 4.0
A- : 3.7
B+ : 3.3
B  : 3.0
B- : 2.7
C+ : 2.3
C  : 2.0
C- : 1.7
D+ : 1.3
D  : 1.0
D- : 0.7
F  : 0.0
  `;

  /** RENDER **/
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B3B' }}>
      <ScrollView contentContainerStyle={{ padding: RPW(5), paddingBottom: RPH(5) }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: RPH(2) }}>
          <Text style={{ fontSize: RPW(7), color: '#fff', fontWeight: 'bold' }}>
            AUIB GPA/CGPA Calculator
          </Text>
          <Text style={{ fontSize: RPW(4), color: '#fff', marginTop: RPH(1) }}>
            (American University in Iraq)
          </Text>
          {/* Extra features buttons */}
          <View style={{ flexDirection: 'row', marginTop: RPH(2) }}>
            <TouchableOpacity
              onPress={openGoalPredictorModal}
              style={{ backgroundColor: '#FF6F61', padding: RPW(2), borderRadius: RPW(2), marginHorizontal: RPW(1) }}
            >
              <Text style={{ color: '#fff', fontSize: RPW(3.5) }}>CGPA Goal Predictor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsGradeConversionModalVisible(true)}
              style={{ backgroundColor: '#FF6F61', padding: RPW(2), borderRadius: RPW(2), marginHorizontal: RPW(1) }}
            >
              <Text style={{ color: '#fff', fontSize: RPW(3.5) }}>Grade Conversion</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={exportGPAData}
              style={{ backgroundColor: '#FF6F61', padding: RPW(2), borderRadius: RPW(2), marginHorizontal: RPW(1) }}
            >
              <Text style={{ color: '#fff', fontSize: RPW(3.5) }}>Export GPA Data</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* GPA Summary View (to be exported as image) */}
        <View ref={summaryRef} style={{ marginBottom: RPH(3), alignItems: 'center', borderWidth: 1, borderColor: '#FF6F61', padding: RPW(2), borderRadius: RPW(2) }}>
          <Text style={{ fontSize: RPW(5), color: '#fff', fontWeight: '600' }}>
            Cumulative GPA: {calculateCumulativeGPA()}
          </Text>
          <Text style={{ fontSize: RPW(4), color: '#fff', marginTop: RPH(1) }}>
            Total Credits: {
              semesters.reduce((acc, sem) => acc + (sem.courses ? sem.courses.reduce((sum, course) => sum + course.creditHours, 0) : 0), 0)
            } / {targetCredits}
          </Text>
        </View>

        {/* Button to Create New Semester */}
        <TouchableOpacity
          onPress={openSemesterModal}
          style={{
            backgroundColor: '#FF6F61',
            padding: RPW(3),
            borderRadius: RPW(2),
            alignItems: 'center',
            marginBottom: RPH(3)
          }}
        >
          <Text style={{ color: '#fff', fontSize: RPW(4) }}>Create New Semester</Text>
        </TouchableOpacity>

        {/* List of Semesters */}
        {semesters.map((semester, semIndex) => (
          <View
            key={semester.id}
            style={{
              backgroundColor: '#1A1A6B',
              borderRadius: RPW(2),
              padding: RPW(3),
              marginBottom: RPH(2)
            }}
          >
            {/* Semester Header with name, GPA and delete semester button */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => toggleSemester(semIndex)} style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: RPW(5), fontWeight: '600' }}>
                  {semester.name}
                </Text>
                <Text style={{ color: '#fff', fontSize: RPW(4) }}>
                  GPA: {calculateSemesterGPA(semester)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openDeleteSemesterModal(semIndex)}
                style={{
                  backgroundColor: '#FF6F61',
                  padding: RPW(1.5),
                  borderRadius: RPW(1),
                  marginLeft: RPW(2)
                }}
              >
                <Text style={{ color: '#fff', fontSize: RPW(3.5) }}>Delete</Text>
              </TouchableOpacity>
            </View>

            {/* Collapsible Content: Courses */}
            <Collapsible collapsed={!semester.isExpanded} duration={300}>
              <View style={{ marginTop: RPH(1) }}>
                {semester.courses && semester.courses.length > 0 ? (
                  semester.courses.map((course, courseIndex) => (
                    <View
                      key={course.id}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: RPH(1)
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: RPW(4), flex: 1 }}>
                        {course.courseCode} | {course.creditHours} Credit(s) | {course.grade}
                      </Text>
                      <TouchableOpacity
                        onPress={() => openEditCourseModal(semIndex, courseIndex)}
                        style={{
                          backgroundColor: '#FF6F61',
                          padding: RPW(1.5),
                          borderRadius: RPW(1),
                          marginLeft: RPW(2)
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: RPW(3.5) }}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteCourse(semIndex, courseIndex)}
                        style={{
                          backgroundColor: '#FF6F61',
                          padding: RPW(1.5),
                          borderRadius: RPW(1),
                          marginLeft: RPW(1)
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: RPW(3.5) }}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#ccc', fontSize: RPW(4) }}>No courses added.</Text>
                )}
                <TouchableOpacity
                  onPress={() => openAddCourseModal(semIndex)}
                  style={{
                    backgroundColor: '#FF6F61',
                    padding: RPW(2),
                    borderRadius: RPW(2),
                    alignItems: 'center',
                    marginTop: RPH(1)
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: RPW(4) }}>Add Course</Text>
                </TouchableOpacity>
              </View>
            </Collapsible>
          </View>
        ))}
      </ScrollView>

      {/* Modal for Creating a New Semester */}
      <Modal
        visible={isSemesterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSemesterModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <View
            style={{
              width: RPW(90),
              backgroundColor: '#0B0B3B',
              borderRadius: RPW(5),
              padding: RPW(5)
            }}
          >
            <Text style={{ fontSize: RPW(5), color: '#fff', fontWeight: '600', marginBottom: RPH(2) }}>
              New Semester
            </Text>
            <TextInput
              value={semesterName}
              onChangeText={setSemesterName}
              placeholder="Enter Semester Name (e.g., Fall 2024)"
              placeholderTextColor="#888"
              style={{
                backgroundColor: '#1A1A6B',
                color: '#fff',
                borderRadius: RPW(2),
                padding: RPW(3),
                marginBottom: RPH(2)
              }}
            />
            <TouchableOpacity
              onPress={submitSemesterModal}
              style={{
                backgroundColor: '#FF6F61',
                padding: RPW(3),
                borderRadius: RPW(2),
                alignItems: 'center',
                marginBottom: RPH(2)
              }}
            >
              <Text style={{ color: '#fff', fontSize: RPW(4) }}>Create Semester</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsSemesterModalVisible(false)}
              style={{ alignItems: 'center' }}
            >
              <Text style={{ color: '#FF6F61', fontSize: RPW(4) }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for Adding/Editing a Course (Centered) */}
      <Modal
        visible={isCourseModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCourseModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <View
            style={{
              width: RPW(90),
              backgroundColor: '#0B0B3B',
              borderRadius: RPW(5),
              padding: RPW(5)
            }}
          >
            <Text style={{ fontSize: RPW(5), color: '#fff', fontWeight: '600', marginBottom: RPH(2) }}>
              {isEditingCourse ? 'Edit Course' : 'Add Course'}
            </Text>
            <TextInput
              value={courseCode}
              onChangeText={setCourseCode}
              placeholder="Course Code"
              placeholderTextColor="#888"
              style={{
                backgroundColor: '#1A1A6B',
                color: '#fff',
                borderRadius: RPW(2),
                padding: RPW(3),
                marginBottom: RPH(2)
              }}
            />
            <CustomDropdown
              options={creditOptions}
              selectedValue={selectedCreditHours}
              onValueChange={setSelectedCreditHours}
              placeholder="Select Credit Hours"
            />
            <CustomDropdown
              options={gradeOptions}
              selectedValue={selectedGrade}
              onValueChange={setSelectedGrade}
              placeholder="Select Grade"
            />
            <TouchableOpacity
              onPress={submitCourseModal}
              style={{
                backgroundColor: '#FF6F61',
                padding: RPW(3),
                borderRadius: RPW(2),
                alignItems: 'center',
                marginBottom: RPH(2)
              }}
            >
              <Text style={{ color: '#fff', fontSize: RPW(4) }}>
                {isEditingCourse ? 'Update Course' : 'Add Course'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsCourseModalVisible(false);
                setIsEditingCourse(false);
                setCurrentCourseIndex(null);
              }}
              style={{ alignItems: 'center' }}
            >
              <Text style={{ color: '#FF6F61', fontSize: RPW(4) }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for Delete Semester Confirmation (Centered) */}
      <Modal
        visible={isDeleteSemesterModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsDeleteSemesterModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <View
            style={{
              width: RPW(80),
              backgroundColor: '#0B0B3B',
              borderRadius: RPW(5),
              padding: RPW(5)
            }}
          >
            <Text style={{ fontSize: RPW(5), color: '#fff', fontWeight: '600', marginBottom: RPH(2) }}>
              Warning
            </Text>
            <Text style={{ fontSize: RPW(4), color: '#fff', marginBottom: RPH(2) }}>
              Are you sure you want to delete {semesterToDeleteIndex !== null ? semesters[semesterToDeleteIndex].name : ''}? This action cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <TouchableOpacity
                onPress={() => setIsDeleteSemesterModalVisible(false)}
                style={{
                  backgroundColor: '#1A1A6B',
                  padding: RPW(3),
                  borderRadius: RPW(2),
                  minWidth: RPW(30),
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#fff', fontSize: RPW(4) }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={deleteSemester}
                style={{
                  backgroundColor: '#FF6F61',
                  padding: RPW(3),
                  borderRadius: RPW(2),
                  minWidth: RPW(30),
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#fff', fontSize: RPW(4) }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for CGPA Goal Predictor (Centered) */}
      <Modal
        visible={isGoalPredictorModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsGoalPredictorModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <View
            style={{
              width: RPW(90),
              backgroundColor: '#0B0B3B',
              borderRadius: RPW(5),
              padding: RPW(5)
            }}
          >
            <Text style={{ fontSize: RPW(5), color: '#fff', fontWeight: '600', marginBottom: RPH(2) }}>
              CGPA Goal Predictor
            </Text>
            <TextInput
              value={targetCGPA}
              onChangeText={setTargetCGPA}
              placeholder="Enter Target CGPA (e.g., 3.8)"
              placeholderTextColor="#888"
              keyboardType="numeric"
              style={{
                backgroundColor: '#1A1A6B',
                color: '#fff',
                borderRadius: RPW(2),
                padding: RPW(3),
                marginBottom: RPH(2)
              }}
            />
            <TouchableOpacity
              onPress={submitGoalPredictor}
              style={{
                backgroundColor: '#FF6F61',
                padding: RPW(3),
                borderRadius: RPW(2),
                alignItems: 'center',
                marginBottom: RPH(2)
              }}
            >
              <Text style={{ color: '#fff', fontSize: RPW(4) }}>Calculate Required GPA</Text>
            </TouchableOpacity>
            {goalData !== null ? (
              <View style={{ marginBottom: RPH(2), alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: RPW(4), textAlign: 'center' }}>
                  Total Required Credits: {goalData.totalRequiredCredits}
                </Text>
                <Text style={{ color: '#fff', fontSize: RPW(4), textAlign: 'center' }}>
                  Completed Credits: {goalData.completedCredits}
                </Text>
                <Text style={{ color: '#fff', fontSize: RPW(4), textAlign: 'center' }}>
                  Remaining Credits: {goalData.remainingCredits}
                </Text>
                <Text style={{ color: '#fff', fontSize: RPW(4), textAlign: 'center' }}>
                  Required Semester GPA: {goalData.requiredGPA}
                </Text>
                {parseFloat(goalData.requiredGPA) > 4.0 && (
                  <Text style={{ color: '#FF6F61', fontSize: RPW(4), textAlign: 'center' }}>
                    Warning: Required GPA exceeds 4.0!
                  </Text>
                )}
              </View>
            ) : (
              <Text style={{ color: '#fff', fontSize: RPW(4), textAlign: 'center', marginBottom: RPH(2) }}>
                Enter target CGPA and tap Calculate.
              </Text>
            )}
            <TouchableOpacity
              onPress={() => setIsGoalPredictorModalVisible(false)}
              style={{ alignItems: 'center' }}
            >
              <Text style={{ color: '#FF6F61', fontSize: RPW(4) }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for Grade Conversion Reference (Centered) */}
      <Modal
        visible={isGradeConversionModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsGradeConversionModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <View
            style={{
              width: RPW(80),
              backgroundColor: '#0B0B3B',
              borderRadius: RPW(5),
              padding: RPW(5)
            }}
          >
            <Text style={{ fontSize: RPW(5), color: '#fff', fontWeight: '600', marginBottom: RPH(2) }}>
              Grade Conversion Reference
            </Text>
            <Text style={{ color: '#fff', fontSize: RPW(4), marginBottom: RPH(2) }}>
              {gradeConversionText}
            </Text>
            <TouchableOpacity
              onPress={() => setIsGradeConversionModalVisible(false)}
              style={{ alignItems: 'center' }}
            >
              <Text style={{ color: '#FF6F61', fontSize: RPW(4) }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
