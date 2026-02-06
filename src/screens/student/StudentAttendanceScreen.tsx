/**
 * StudentAttendanceScreen - MBEST Mobile App
 * Attendance records for student
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../../services/api/student';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, shadows } from '../../constants/spacing';
import { textStyles } from '../../constants/typography';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';

export const StudentAttendanceScreen: React.FC = () => {
  const { token } = useAuthStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['studentAttendance'],
    queryFn: () => studentService.getAttendance(),
    enabled: !!token,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Error loading attendance</Text>
          <Button title="Retry" onPress={() => refetch()} variant="primary" style={styles.retryButton} />
        </View>
      </View>
    );
  }

  // Handle nested API response structures (data.data.data for paginated responses)
  const records = data?.data?.data || data?.data || data || [];
  
  // Calculate stats from records if not provided
  const stats = records.length > 0 ? {
    total_sessions: records.length,
    present_count: records.filter((r: any) => r.attendance_status === 'present' || r.attendance_status === 'Present').length,
    absent_count: records.filter((r: any) => r.attendance_status === 'absent' || r.attendance_status === 'Absent').length,
    late_count: records.filter((r: any) => r.attendance_status === 'late' || r.attendance_status === 'Late').length,
    excused_count: records.filter((r: any) => r.attendance_status === 'excused' || r.attendance_status === 'Excused').length,
    attendance_rate: Math.round(
      (records.filter((r: any) => 
        r.attendance_status === 'present' || 
        r.attendance_status === 'Present' ||
        r.attendance_status === 'excused' ||
        r.attendance_status === 'Excused'
      ).length / records.length) * 100
    ),
  } : {
    total_sessions: 0,
    present_count: 0,
    absent_count: 0,
    late_count: 0,
    excused_count: 0,
    attendance_rate: 0,
  };

  return (
    <View style={styles.container}>
      <Header title="Attendance" showProfile={true} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      {/* Statistics Cards */}
      {stats && (
        <View style={styles.statsGrid}>
          <Card variant="elevated" style={[styles.statCard, styles.statCardPrimary]}>
            <View style={styles.statCardContent}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📚</Text>
              </View>
              <Text style={styles.statValue}>{stats.total_sessions || 0}</Text>
              <Text style={styles.statLabel}>Total Sessions</Text>
            </View>
          </Card>
          <Card variant="elevated" style={[styles.statCard, styles.statCardSuccess]}>
            <View style={styles.statCardContent}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>✅</Text>
              </View>
              <Text style={styles.statValue}>{stats.present_count || 0}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
          </Card>
          <Card variant="elevated" style={[styles.statCard, styles.statCardError]}>
            <View style={styles.statCardContent}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>❌</Text>
              </View>
              <Text style={styles.statValue}>{stats.absent_count || 0}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
          </Card>
          <Card variant="elevated" style={[styles.statCard, styles.statCardWarning]}>
            <View style={styles.statCardContent}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>⏰</Text>
              </View>
              <Text style={styles.statValue}>{stats.late_count || 0}</Text>
              <Text style={styles.statLabel}>Late</Text>
            </View>
          </Card>
        </View>
      )}

      {/* Attendance Rate Card */}
      {stats && (
        <Card variant="elevated" style={styles.rateCard}>
          <View style={styles.rateCardContent}>
            <View style={styles.rateIconContainer}>
              <Text style={styles.rateIcon}>📊</Text>
            </View>
            <View style={styles.rateInfo}>
              <Text style={styles.rateLabel}>Attendance Rate</Text>
              <Text style={[
                styles.rateValue,
                (stats.attendance_rate || 0) >= 80 && styles.rateValueGood,
                (stats.attendance_rate || 0) < 60 && styles.rateValuePoor,
              ]}>
                {stats.attendance_rate || 0}%
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Attendance Records */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance Records</Text>
        {records.length > 0 ? (
          records.map((record: any) => {
            const attendanceStatus = record.attendance_status?.toLowerCase() || '';
            const isPresent = attendanceStatus === 'present';
            const isLate = attendanceStatus === 'late';
            const isAbsent = attendanceStatus === 'absent';
            const isExcused = attendanceStatus === 'excused';
            
            return (
              <Card key={record.id} variant="elevated" style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={[
                    styles.recordIconContainer,
                    isPresent && styles.recordIconPresent,
                    isLate && styles.recordIconLate,
                    isAbsent && styles.recordIconAbsent,
                    isExcused && styles.recordIconExcused,
                  ]}>
                    <Text style={styles.recordIcon}>
                      {isPresent ? '✅' : isLate ? '⏰' : isAbsent ? '❌' : '📝'}
                    </Text>
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={styles.recordDate} numberOfLines={1}>
                      {new Date(record.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.recordSubject} numberOfLines={1}>
                      {record.subject || 'General'}
                    </Text>
                    {record.teacher?.user?.name && (
                      <Text style={styles.recordTeacher} numberOfLines={1}>
                        👨‍🏫 {record.teacher.user.name}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.recordFooter}>
                  <View style={[
                    styles.statusBadge,
                    isPresent && styles.statusBadgePresent,
                    isLate && styles.statusBadgeLate,
                    isAbsent && styles.statusBadgeAbsent,
                    isExcused && styles.statusBadgeExcused,
                  ]}>
                    <Text style={styles.statusText} numberOfLines={1}>
                      {record.attendance_status?.toUpperCase() || 'UNKNOWN'}
                    </Text>
                  </View>
                  {(record.start_time || record.end_time) && (
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeLabel}>🕐</Text>
                      <Text style={styles.recordTime} numberOfLines={1}>
                        {record.start_time?.substring(0, 5) || ''}
                        {record.end_time ? ` - ${record.end_time.substring(0, 5)}` : ''}
                      </Text>
                    </View>
                  )}
                </View>
                {record.attendance_notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>💬 Notes:</Text>
                    <Text style={styles.notesText} numberOfLines={2} ellipsizeMode="tail">
                      {record.attendance_notes}
                    </Text>
                  </View>
                )}
              </Card>
            );
          })
        ) : (
          <Card variant="outlined" style={styles.emptyCard}>
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No Attendance Records</Text>
              <Text style={styles.emptyText}>
                Your attendance records will appear here once classes begin.
              </Text>
            </View>
          </Card>
        )}
      </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.lg,
  },
  statCardPrimary: {
    backgroundColor: colors.primary,
  },
  statCardSuccess: {
    backgroundColor: colors.success,
  },
  statCardError: {
    backgroundColor: colors.error,
  },
  statCardWarning: {
    backgroundColor: colors.warning,
  },
  statCardContent: {
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: spacing.sm,
  },
  statIcon: {
    fontSize: 32,
  },
  statValue: {
    ...textStyles.h2,
    color: colors.textInverse,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.textInverse,
    opacity: 0.9,
    textAlign: 'center',
    fontWeight: '600',
  },
  rateCard: {
    marginBottom: spacing.xl,
    padding: spacing.xl,
  },
  rateCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateIconContainer: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
    ...shadows.md,
  },
  rateIcon: {
    fontSize: 36,
  },
  rateInfo: {
    flex: 1,
  },
  rateLabel: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  rateValue: {
    ...textStyles.h1,
    color: colors.primary,
  },
  rateValueGood: {
    color: colors.success,
  },
  rateValuePoor: {
    color: colors.error,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...textStyles.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  recordCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recordIconContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    backgroundColor: colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.sm,
  },
  recordIconPresent: {
    backgroundColor: colors.successLight,
  },
  recordIconLate: {
    backgroundColor: colors.warningLight,
  },
  recordIconAbsent: {
    backgroundColor: colors.errorLight,
  },
  recordIcon: {
    fontSize: 24,
  },
  recordInfo: {
    flex: 1,
  },
  recordDate: {
    ...textStyles.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  recordSubject: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 20,
    includeFontPadding: false,
    marginBottom: spacing.xs,
  },
  recordTeacher: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 16,
    includeFontPadding: false,
  },
  recordIconExcused: {
    backgroundColor: colors.info,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  statusBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusBadgePresent: {
    backgroundColor: colors.success,
  },
  statusBadgeLate: {
    backgroundColor: colors.warning,
  },
  statusBadgeAbsent: {
    backgroundColor: colors.error,
  },
  statusBadgeExcused: {
    backgroundColor: colors.info,
  },
  statusText: {
    ...textStyles.small,
    color: colors.textInverse,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeLabel: {
    fontSize: 14,
  },
  recordTime: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 18,
    includeFontPadding: false,
  },
  notesContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 16,
    includeFontPadding: false,
  },
  notesText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 18,
    includeFontPadding: false,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...textStyles.h4,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryButton: {
    minWidth: 120,
  },
  emptyCard: {
    padding: spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: spacing.xl,
    opacity: 0.5,
  },
  emptyTitle: {
    ...textStyles.h3,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

