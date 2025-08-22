// screens/ReportsScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';

const screenWidth = Dimensions.get('window').width;

const pastelColors = {
  background: '#fef6e4',
  primary: '#8bd3dd',
  accent: '#f582ae',
  text: '#001858',
  cardBackground: '#fff',
  backButtonText: '#001858',
  chartBar: '#8bd3dd',
  chartPie1: '#f582ae', // Rosa
  chartPie2: '#8bd3dd', // Azul claro
  chartPie3: '#001858', // Azul oscuro
  chartPie4: '#a2d5f2', // Celeste
  chartPie5: '#f7b2bd', // Coral
  chartPie6: '#c3e0e5', // Verde azulado claro
  chartPie7: '#ffd670', // Amarillo pastel
  chartPie8: '#e0c3fc', // Lavanda
};

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? getStatusBarHeight(true) : 0;
const HEADER_VERTICAL_PADDING = STATUS_BAR_HEIGHT + 30;

export default function ReportsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [expenseDistributionByDescription, setExpenseDistributionByDescription] = useState([]);
  const [expenseDistributionByCategory, setExpenseDistributionByCategory] = useState([]);
  const [memberSpending, setMemberSpending] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groups, setGroups] = useState([]);

  const loadGroupsForPicker = useCallback(async () => {
    try {
      const storedGroups = await AsyncStorage.getItem('groups');
      const parsedGroups = storedGroups ? JSON.parse(storedGroups) : [];
      setGroups(parsedGroups);
      if (parsedGroups.length > 0 && selectedGroupId === null) {
        setSelectedGroupId(parsedGroups[0].id);
      }
    } catch (error) {
      console.error("Error loading groups for picker:", error);
    }
  }, [selectedGroupId]);

  const processGroupData = useCallback(async () => {
    if (!selectedGroupId) {
      setTotalSpent(0);
      setExpenseDistributionByDescription([]);
      setExpenseDistributionByCategory([]);
      setMemberSpending({ labels: [], datasets: [{ data: [] }] });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const storedGroups = await AsyncStorage.getItem('groups');
      const allGroups = storedGroups ? JSON.parse(storedGroups) : [];
      const currentGroup = allGroups.find(g => g.id === selectedGroupId);

      if (!currentGroup) {
        setTotalSpent(0);
        setExpenseDistributionByDescription([]);
        setExpenseDistributionByCategory([]);
        setMemberSpending({ labels: [], datasets: [{ data: [] }] });
        setLoading(false);
        return;
      }

      const calculatedTotalSpent = currentGroup.expenses.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalSpent(calculatedTotalSpent);

      // Calcular Distribución de Gastos por Descripción (Pie Chart existente)
      const expenseDescriptionMap = {};
      currentGroup.expenses.forEach(expense => {
        const desc = expense.description || 'Sin Descripción';
        expenseDescriptionMap[desc] = (expenseDescriptionMap[desc] || 0) + expense.amount;
      });

      const pieChartDataDescription = Object.keys(expenseDescriptionMap).map((desc, index) => ({
        name: desc,
        population: expenseDescriptionMap[desc],
        color: [
          pastelColors.chartPie1,
          pastelColors.chartPie2,
          pastelColors.chartPie3,
          pastelColors.chartPie4,
          pastelColors.chartPie5,
          pastelColors.chartPie6,
          pastelColors.chartPie7,
          pastelColors.chartPie8,
        ][index % 8],
        legendFontColor: pastelColors.text,
        legendFontSize: 11, // Ligeramente más pequeño para dar más espacio
      }));
      setExpenseDistributionByDescription(pieChartDataDescription);

      // Calcular Distribución de Gastos por Categoría (NUEVO Pie Chart)
      const expenseCategoryMap = {};
      currentGroup.expenses.forEach(expense => {
        const cat = expense.category || 'Sin Categoría';
        expenseCategoryMap[cat] = (expenseCategoryMap[cat] || 0) + expense.amount;
      });

      const pieChartDataCategory = Object.keys(expenseCategoryMap).map((cat, index) => ({
        name: cat,
        population: expenseCategoryMap[cat],
        color: [
          pastelColors.chartPie1,
          pastelColors.chartPie2,
          pastelColors.chartPie3,
          pastelColors.chartPie4,
          pastelColors.chartPie5,
          pastelColors.chartPie6,
          pastelColors.chartPie7,
          pastelColors.chartPie8,
        ][index % 8],
        legendFontColor: pastelColors.text,
        legendFontSize: 11, // Ligeramente más pequeño para dar más espacio
      }));
      setExpenseDistributionByCategory(pieChartDataCategory);


      // Calcular Gasto por Miembro (Bar Chart)
      const memberPaidMap = {};
      currentGroup.members.forEach(member => {
        memberPaidMap[member.id] = 0;
      });
      currentGroup.expenses.forEach(expense => {
        memberPaidMap[expense.payerId] = (memberPaidMap[expense.payerId] || 0) + expense.amount;
      });

      const memberLabels = currentGroup.members.map(m => m.name);
      const memberData = currentGroup.members.map(m => memberPaidMap[m.id] || 0);

      setMemberSpending({
        labels: memberLabels,
        datasets: [{ data: memberData }],
      });

    } catch (error) {
      console.error("Error processing group data for reports:", error);
      Alert.alert('Error', 'No se pudieron generar los informes para este grupo.');
    } finally {
      setLoading(false);
    }
  }, [selectedGroupId]);

  useFocusEffect(
    useCallback(() => {
      loadGroupsForPicker();
      if (selectedGroupId) {
        processGroupData();
      }
    }, [loadGroupsForPicker, processGroupData, selectedGroupId])
  );

  useEffect(() => {
    processGroupData();
  }, [selectedGroupId, processGroupData]);

  const chartConfig = {
    backgroundGradientFrom: pastelColors.cardBackground,
    backgroundGradientTo: pastelColors.cardBackground,
    color: (opacity = 1) => `rgba(0, 24, 88, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 2,
    propsForLabels: {
      fontSize: 10,
      fill: pastelColors.text,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e0e0e0',
    }
  };

  return (
    <View style={styles.container}>
      {/* Encabezado con botón de volver */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Informes y Estadísticas</Text>
        <View style={styles.placeHolderButton}></View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Selector de Grupo */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Seleccionar Grupo:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedGroupId}
              onValueChange={(itemValue) => setSelectedGroupId(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {groups.length === 0 ? (
                <Picker.Item label="No hay grupos disponibles" value={null} />
              ) : (
                groups.map(group => (
                  <Picker.Item key={group.id} label={group.name} value={group.id} />
                ))
              )}
            </Picker>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={pastelColors.primary} style={styles.loadingIndicator} />
        ) : (
          <>
            {selectedGroupId ? (
              <>
                <View style={styles.reportCard}>
                  <Text style={styles.reportTitle}>Total Gastado en el Grupo</Text>
                  <Text style={styles.totalSpentText}>$ {totalSpent.toFixed(2)}</Text>
                </View>

                {/* Gráfico de Barras: Gasto por Miembro */}
                {memberSpending.labels.length > 0 && (
                  <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Gasto por Miembro</Text>
                    <ScrollView horizontal>
                      <BarChart
                        data={memberSpending}
                        width={Math.max(screenWidth - 40, memberSpending.labels.length * 60)}
                        height={220}
                        yAxisLabel="$"
                        chartConfig={chartConfig}
                        verticalLabelRotation={30}
                        style={styles.chartStyle}
                        fromZero={true}
                      />
                    </ScrollView>
                  </View>
                )}

                {/* Gráfico de Pastel: Distribución de Gastos por Categoría (NUEVO) */}
                {expenseDistributionByCategory.length > 0 && (
                  <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Gastos por Categoría</Text>
                    <PieChart
                      data={expenseDistributionByCategory}
                      width={screenWidth - 40}
                      height={220}
                      chartConfig={chartConfig}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="0" // Reducido para dar más espacio a la leyenda
                      absolute
                      style={styles.chartStyle}
                    />
                  </View>
                )}

                {/* Gráfico de Pastel: Distribución de Gastos por Descripción (EXISTENTE) */}
                {expenseDistributionByDescription.length > 0 && (
                  <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Gastos por Descripción</Text>
                    <PieChart
                      data={expenseDistributionByDescription}
                      width={screenWidth - 40}
                      height={220}
                      chartConfig={chartConfig}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="0" // Reducido para dar más espacio a la leyenda
                      absolute
                      style={styles.chartStyle}
                    />
                  </View>
                )}

                {memberSpending.labels.length === 0 && expenseDistributionByDescription.length === 0 && expenseDistributionByCategory.length === 0 && (
                  <View style={styles.noDataCard}>
                    <Text style={styles.noDataText}>No hay gastos registrados en este grupo para generar informes.</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noDataCard}>
                <Text style={styles.noDataText}>Selecciona un grupo para ver los informes.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pastelColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: HEADER_VERTICAL_PADDING,
    paddingBottom: 10,
    backgroundColor: pastelColors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
    width: 60,
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: pastelColors.backButtonText,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: pastelColors.text,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  placeHolderButton: {
    width: 60,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  loadingIndicator: {
    marginTop: 50,
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: pastelColors.cardBackground,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: pastelColors.text,
    marginBottom: 10,
  },
  pickerWrapper: {
    borderColor: pastelColors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: pastelColors.text,
  },
  pickerItem: {
    fontSize: 16,
    color: pastelColors.text,
  },
  reportCard: {
    backgroundColor: pastelColors.cardBackground,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: pastelColors.text,
    marginBottom: 10,
  },
  totalSpentText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: pastelColors.primary,
  },
  chartCard: {
    backgroundColor: pastelColors.cardBackground,
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: pastelColors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  chartStyle: {
    borderRadius: 10,
  },
  noDataCard: {
    backgroundColor: pastelColors.cardBackground,
    borderRadius: 15,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  noDataText: {
    fontSize: 16,
    color: pastelColors.text,
    textAlign: 'center',
  },
});
