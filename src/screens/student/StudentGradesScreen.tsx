/**
 * StudentGradesScreen - MBEST Mobile App
 * Grades list for student
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import {
  studentService,
  type Grade,
  type GradesResponse,
} from '../../services/api/student';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, shadows } from '../../constants/spacing';
import { textStyles } from '../../constants/typography';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icon';
import type { StudentStackParamList } from '../../types/navigation';
import type { ApiResponse } from '../../types/api';

type NavigationPropType = NavigationProp<StudentStackParamList>;

const clampPercentage = (value: number): number => {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value));
};

const getProgressColor = (percentage: number): string => {
  const value = clampPercentage(percentage);

  if (value >= 90) {
    return colors.success;
  }
  if (value >= 50 && value <= 80) {
    return `${colors.successLight}90`;
  }
  if (value >= 10 && value <= 40) {
    return colors.error;
  }
  if (value > 80 && value < 90) {
    return colors.success;
  }
  return colors.info;
};

const getProgressMessage = (percentage: number): string | undefined => {
  const value = clampPercentage(percentage);

  if (value >= 10 && value <= 40) {
    if (value < 25) {
      return 'Critical zone — immediate improvement needed.';
    }
    return `Needs improvement — currently at ${value}%.`;
  }

  return undefined;
};

export const StudentGradesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationPropType>();
  const { token } = useAuthStore();

  const { data, isLoading, error, refetch, isFetching } = useQuery<
    ApiResponse<GradesResponse>
  >({
    queryKey: ['studentGrades'],
    queryFn: () => studentService.getGrades(),
    enabled: !!token,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Grades" showProfile={true} />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>Error loading grades</Text>
          <Button
            title="Retry"
            onPress={() => refetch()}
            variant="primary"
            style={styles.retryButton}
          />
        </View>
      </View>
    );
  }

  const gradesResponse = data?.data;
  const paginatedData = gradesResponse?.data;
  const grades: Grade[] = Array.isArray(paginatedData)
    ? paginatedData
    : paginatedData?.data || [];
  const overallAverage = gradesResponse?.overall_average || 0;
  const clampedOverallAverage = clampPercentage(overallAverage);
  const overallMessage = getProgressMessage(clampedOverallAverage);
  const isRefreshing = isFetching && !isLoading;

  return (
    <View style={styles.container}>
      <Header title="Grades" showProfile={true} />
      {/* Overall Average Card */}
      {overallAverage > 0 && (
        <View style={styles.summarySection}>
          <Card variant="elevated" style={styles.summaryCard}>
            <View style={styles.summaryContent}>
              <View style={styles.summaryIconContainer}>
                <Icon name="star" size={24} color={colors.textInverse} />
              </View>
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryLabel}>Overall Average</Text>
                <Text style={styles.summaryValue}>
                  {clampedOverallAverage.toFixed(1)}%
                </Text>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      styles.summaryProgressFill,
                      {
                        width: `${clampedOverallAverage}%`,
                        backgroundColor: getProgressColor(
                          clampedOverallAverage,
                        ),
                      },
                    ]}
                  />
                </View>
                {overallMessage && (
                  <Text style={styles.progressMessage}>{overallMessage}</Text>
                )}
              </View>
            </View>
          </Card>
        </View>
      )}

      <FlatList
        data={grades}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={[
          styles.listContent,
          grades.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => refetch()}
            tintColor={colors.success}
            colors={[colors.success]}
          />
        }
        renderItem={({ item }) => {
          const gradeValue = parseFloat(item.grade || '0');
          const rawMaxGrade = parseFloat(item.max_grade || '100');
          const maxGrade = rawMaxGrade > 0 ? rawMaxGrade : 100;
          const percentage = Math.round((gradeValue / maxGrade) * 100);
          const clampedPercentage = clampPercentage(percentage);
          const progressColor = getProgressColor(clampedPercentage);
          const progressMessage = getProgressMessage(clampedPercentage);
          const isExcellent = clampedPercentage >= 90;
          const isGood = clampedPercentage >= 70;
          const isPassing = clampedPercentage >= 60;

          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('GradeDetails', { gradeId: item.id })
              }
              activeOpacity={0.7}
            >
              <Card variant="elevated" style={styles.gradeCard}>
                <View style={styles.gradeCardHeader}>
                  <View
                    style={[
                      styles.gradeIconContainer,
                      isExcellent && styles.gradeIconExcellent,
                      isGood && !isExcellent && styles.gradeIconGood,
                      isPassing && !isGood && styles.gradeIconPassing,
                      !isPassing && styles.gradeIconFail,
                    ]}
                  >
                    <Icon
                      name={
                        isExcellent
                          ? 'trophy'
                          : isGood
                          ? 'award'
                          : isPassing
                          ? 'bar-chart'
                          : 'file-text'
                      }
                      size={22}
                      color={colors.textInverse}
                    />
                  </View>
                  <View style={styles.gradeInfo}>
                    <Text
                      style={styles.gradeAssignment}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.assessment ||
                        item.assignment?.title ||
                        'Untitled Assignment'}
                    </Text>
                    {item.subject && (
                      <Text style={styles.gradeSubject} numberOfLines={1}>
                        {item.subject}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.gradeDetails}>
                  <View style={styles.gradeScoreContainer}>
                    <View style={styles.scoreRow}>
                      <Text style={styles.scoreLabel}>Score:</Text>
                      <Text style={styles.scoreValue}>
                        {gradeValue.toFixed(1)}/{maxGrade.toFixed(1)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.percentageBadge,
                        isExcellent && styles.percentageBadgeExcellent,
                        isGood && !isExcellent && styles.percentageBadgeGood,
                        isPassing && !isGood && styles.percentageBadgePassing,
                        !isPassing && styles.percentageBadgeFail,
                      ]}
                    >
                      <Text style={styles.percentageText}>
                        {clampedPercentage}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${clampedPercentage}%`,
                          backgroundColor: progressColor,
                        },
                      ]}
                    />
                  </View>
                  {progressMessage && (
                    <Text style={styles.progressMessage}>
                      {progressMessage}
                    </Text>
                  )}
                  <View style={styles.gradeDateContainer}>
                    <Icon
                      name="calendar"
                      size={14}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.gradeDate}>
                      {new Date(item.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    {item.category && (
                      <>
                        <Text style={styles.dateLabel}> • </Text>
                        <Text style={styles.gradeDate}>{item.category}</Text>
                      </>
                    )}
                  </View>
                  {item.notes && (
                    <View style={styles.gradeNotes}>
                      <View style={styles.notesLabelRow}>
                        <Icon
                          name="message-circle"
                          size={12}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.notesLabel}>Notes:</Text>
                      </View>
                      <Text
                        style={styles.notesText}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {item.notes}
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bar-chart" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Grades Yet</Text>
            <Text style={styles.emptyText}>
              Your grades will appear here once assignments are graded.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  summarySection: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  summaryCard: {
    padding: spacing.md,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.md,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 34,
    includeFontPadding: false,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  summaryProgressFill: {
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  progressMessage: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: '600',
    color: colors.error,
    lineHeight: 16,
    includeFontPadding: false,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  gradeCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  gradeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  gradeIconContainer: {
    width: 45,
    height: 45,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    ...shadows.sm,
  },
  gradeIconExcellent: {
    backgroundColor: colors.successLight,
  },
  gradeIconGood: {
    backgroundColor: colors.info,
  },
  gradeIconPassing: {
    backgroundColor: colors.warningLight,
  },
  gradeIconFail: {
    backgroundColor: colors.errorLight,
  },
  gradeInfo: {
    flex: 1,
  },
  gradeAssignment: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs / 2,
    lineHeight: 22,
    includeFontPadding: false,
  },
  gradeSubject: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 18,
    includeFontPadding: false,
    marginBottom: spacing.xs,
  },
  gradeNotes: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
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
  gradeDetails: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  gradeScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  scoreLabel: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 24,
    includeFontPadding: false,
  },
  percentageBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  percentageBadgeExcellent: {
    backgroundColor: colors.successLight,
  },
  percentageBadgeGood: {
    backgroundColor: colors.info,
  },
  percentageBadgePassing: {
    backgroundColor: colors.warningLight,
  },
  percentageBadgeFail: {
    backgroundColor: colors.errorLight,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textInverse,
    lineHeight: 18,
    includeFontPadding: false,
  },
  gradeDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  dateLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  notesLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    marginBottom: spacing.xs,
  },
  gradeDate: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.lg,
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
