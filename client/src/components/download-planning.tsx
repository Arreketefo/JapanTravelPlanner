import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Document, Page, PDFDownloadLink, StyleSheet, Text, View } from '@react-pdf/renderer';
import { useQuery } from "@tanstack/react-query";
import type { Suggestion, Expense } from "@shared/schema";

const YEN_TO_EUR = 0.00625;

const cityNames = {
  osaka: "Osaka",
  kyoto: "Kyoto",
  tokyo: "Tokyo"
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a1a1a',
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: '#f0f7ff',
    borderRadius: 5,
  },
  section: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    border: '1 solid #e6e6e6',
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 15,
    color: '#1a1a1a',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderRadius: 6,
  },
  dayTitle: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 10,
    color: '#2a2a2a',
    fontWeight: 'bold',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 4,
    borderLeft: '3 solid #3b82f6',
  },
  periodTitle: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 8,
    color: '#4a4a4a',
    fontWeight: 'bold',
    backgroundColor: '#f9fafb',
    padding: 6,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  suggestion: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    border: '1 solid #f0f0f0',
  },
  placeName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2a2a2a',
    marginBottom: 4,
  },
  description: {
    fontSize: 10,
    color: '#4a4a4a',
    marginBottom: 4,
    lineHeight: 1.4,
  },
  link: {
    fontSize: 9,
    color: '#3b82f6',
    textDecoration: 'underline',
  },
  expenses: {
    marginTop: 20,
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 8,
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
    textAlign: 'center',
    backgroundColor: '#e5e7eb',
    padding: 8,
    borderRadius: 4,
  },
  expense: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
    borderBottom: '1 solid #e5e7eb',
  },
  expenseText: {
    fontSize: 10,
    color: '#4a4a4a',
  },
  expenseAmount: {
    fontSize: 10,
    color: '#2a2a2a',
    fontWeight: 'bold',
  },
  total: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'right',
    color: '#1a1a1a',
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: '#f0f7ff',
    borderRadius: 4,
  },
  divider: {
    borderBottom: '1 solid #e5e7eb',
    marginVertical: 10,
  }
});

const PlanningPDF = ({ 
  osakaData, 
  kyotoData, 
  tokyoData,
  expenses,
  totalExpenses 
}: { 
  osakaData: Suggestion[], 
  kyotoData: Suggestion[], 
  tokyoData: Suggestion[],
  expenses: Expense[],
  totalExpenses: number
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Plan de viaje a Japón</Text>

      {/* Gastos */}
      <View style={styles.section}>
        <Text style={styles.expenseTitle}>Resumen de Gastos</Text>
        <View style={styles.expenses}>
          {expenses?.map(expense => (
            <View key={expense.id} style={styles.expense}>
              <Text style={styles.expenseText}>{expense.concept}</Text>
              <Text style={styles.expenseAmount}>
                €{(expense.amount * YEN_TO_EUR).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <Text style={styles.total}>
            Total: €{(totalExpenses * YEN_TO_EUR).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Itinerario por Ciudad */}
      {Object.entries(cityNames).map(([cityKey, cityName]) => {
        const suggestions = {
          osaka: osakaData,
          kyoto: kyotoData,
          tokyo: tokyoData
        }[cityKey];

        // Agrupar por día
        const groupedByDay = suggestions?.reduce((acc, suggestion) => {
          if (!acc[suggestion.day]) {
            acc[suggestion.day] = {
              morning: [],
              afternoon: []
            };
          }
          if (suggestion.period === 'morning') {
            acc[suggestion.day].morning.push(suggestion);
          } else {
            acc[suggestion.day].afternoon.push(suggestion);
          }
          return acc;
        }, {} as Record<number, { morning: Suggestion[], afternoon: Suggestion[] }>);

        return (
          <View key={cityKey} style={styles.section}>
            <Text style={styles.sectionTitle}>{cityName}</Text>
            {Object.entries(groupedByDay || {})
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([day, periods]) => (
                <View key={day}>
                  <Text style={styles.dayTitle}>Día {day}</Text>

                  {/* Mañana */}
                  <View style={styles.periodTitle}>
                    <Text>Mañana</Text>
                  </View>
                  {periods.morning
                    .sort((a, b) => a.order - b.order)
                    .map(suggestion => (
                      <View key={suggestion.id} style={styles.suggestion}>
                        <Text style={styles.placeName}>{suggestion.placeName}</Text>
                        <Text style={styles.description}>{suggestion.description}</Text>
                        {suggestion.link && (
                          <Text style={styles.link}>{suggestion.link}</Text>
                        )}
                      </View>
                    ))}

                  {/* Tarde */}
                  <View style={styles.periodTitle}>
                    <Text>Tarde</Text>
                  </View>
                  {periods.afternoon
                    .sort((a, b) => a.order - b.order)
                    .map(suggestion => (
                      <View key={suggestion.id} style={styles.suggestion}>
                        <Text style={styles.placeName}>{suggestion.placeName}</Text>
                        <Text style={styles.description}>{suggestion.description}</Text>
                        {suggestion.link && (
                          <Text style={styles.link}>{suggestion.link}</Text>
                        )}
                      </View>
                    ))}
                </View>
              ))}
          </View>
        );
      })}
    </Page>
  </Document>
);

export default function DownloadPlanning() {
  const { data: osakaData = [] } = useQuery<Suggestion[]>({
    queryKey: ["/api/suggestions/osaka"],
  });

  const { data: kyotoData = [] } = useQuery<Suggestion[]>({
    queryKey: ["/api/suggestions/kyoto"],
  });

  const { data: tokyoData = [] } = useQuery<Suggestion[]>({
    queryKey: ["/api/suggestions/tokyo"],
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);

  return (
    <PDFDownloadLink
      document={
        <PlanningPDF 
          osakaData={osakaData} 
          kyotoData={kyotoData} 
          tokyoData={tokyoData}
          expenses={expenses}
          totalExpenses={totalExpenses}
        />
      }
      fileName="plan-viaje-japon.pdf"
    >
      {({ loading }) => (
        <Button disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          {loading ? "Generando Planning..." : "Descargar Planning Completo"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
