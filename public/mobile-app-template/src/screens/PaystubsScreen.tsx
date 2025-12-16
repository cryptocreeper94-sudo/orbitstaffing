import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { BRANDING, THEME } from '../config/branding';

interface Paystub {
  id: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  grossPay: number;
  netPay: number;
  hoursWorked: number;
  hourlyRate: number;
  deductions: {
    name: string;
    amount: number;
  }[];
}

export default function PaystubsScreen() {
  const [paystubs, setPaystubs] = useState<Paystub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaystub, setSelectedPaystub] = useState<Paystub | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPaystubs();
  }, []);

  const loadPaystubs = async () => {
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      
      const response = await fetch(`${BRANDING.apiBaseUrl}/worker/paystubs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPaystubs(data);
      }
    } catch (error) {
      console.error('Failed to load paystubs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const openPaystubDetail = (paystub: Paystub) => {
    setSelectedPaystub(paystub);
    setShowModal(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadPaystubs} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Pay History</Text>
          <Text style={styles.subtitle}>View your earnings and deductions</Text>
        </View>

        {paystubs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={THEME.colors.textSecondary} />
            <Text style={styles.emptyText}>No paystubs yet</Text>
            <Text style={styles.emptySubtext}>Your pay history will appear here</Text>
          </View>
        ) : (
          <View style={styles.paystubList}>
            {paystubs.map((paystub) => (
              <TouchableOpacity
                key={paystub.id}
                style={styles.paystubCard}
                onPress={() => openPaystubDetail(paystub)}
              >
                <View style={styles.paystubHeader}>
                  <View>
                    <Text style={styles.payPeriod}>
                      {formatDateRange(paystub.payPeriodStart, paystub.payPeriodEnd)}
                    </Text>
                    <Text style={styles.payDate}>Paid on {formatDate(paystub.payDate)}</Text>
                  </View>
                  <View style={styles.netPayContainer}>
                    <Text style={styles.netPayLabel}>Net Pay</Text>
                    <Text style={styles.netPayAmount}>{formatCurrency(paystub.netPay)}</Text>
                  </View>
                </View>
                <View style={styles.paystubDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color={THEME.colors.textSecondary} />
                    <Text style={styles.detailText}>{paystub.hoursWorked} hours</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={16} color={THEME.colors.textSecondary} />
                    <Text style={styles.detailText}>{formatCurrency(paystub.hourlyRate)}/hr</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={THEME.colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        {selectedPaystub && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={THEME.colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Paystub Details</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Pay Period</Text>
                <Text style={styles.sectionValue}>
                  {formatDateRange(selectedPaystub.payPeriodStart, selectedPaystub.payPeriodEnd)}
                </Text>
                <Text style={styles.payDateText}>
                  Paid on {formatDate(selectedPaystub.payDate)}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Earnings</Text>
                <View style={styles.lineItem}>
                  <Text style={styles.lineItemLabel}>Hours Worked</Text>
                  <Text style={styles.lineItemValue}>{selectedPaystub.hoursWorked} hrs</Text>
                </View>
                <View style={styles.lineItem}>
                  <Text style={styles.lineItemLabel}>Hourly Rate</Text>
                  <Text style={styles.lineItemValue}>{formatCurrency(selectedPaystub.hourlyRate)}</Text>
                </View>
                <View style={[styles.lineItem, styles.totalLine]}>
                  <Text style={styles.totalLabel}>Gross Pay</Text>
                  <Text style={styles.totalValue}>{formatCurrency(selectedPaystub.grossPay)}</Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Deductions</Text>
                {selectedPaystub.deductions.map((deduction, index) => (
                  <View key={index} style={styles.lineItem}>
                    <Text style={styles.lineItemLabel}>{deduction.name}</Text>
                    <Text style={styles.deductionValue}>-{formatCurrency(deduction.amount)}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.netPaySection}>
                <Text style={styles.netPayModalLabel}>Net Pay</Text>
                <Text style={styles.netPayModalAmount}>{formatCurrency(selectedPaystub.netPay)}</Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    padding: THEME.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: THEME.spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
    marginTop: THEME.spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.xs,
  },
  paystubList: {
    padding: THEME.spacing.lg,
    paddingTop: 0,
  },
  paystubCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paystubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.md,
  },
  payPeriod: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  payDate: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.xs,
  },
  netPayContainer: {
    alignItems: 'flex-end',
  },
  netPayLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  netPayAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BRANDING.primaryColor,
  },
  paystubDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: THEME.spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: THEME.spacing.lg,
    gap: THEME.spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  modalContent: {
    flex: 1,
    padding: THEME.spacing.lg,
  },
  modalSection: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.sm,
    textTransform: 'uppercase',
  },
  sectionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  payDateText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.xs,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  lineItemLabel: {
    fontSize: 14,
    color: THEME.colors.text,
  },
  lineItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  deductionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.error,
  },
  totalLine: {
    borderBottomWidth: 0,
    marginTop: THEME.spacing.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  netPaySection: {
    backgroundColor: BRANDING.primaryColor,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.lg,
    alignItems: 'center',
  },
  netPayModalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  netPayModalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: THEME.spacing.xs,
  },
});
