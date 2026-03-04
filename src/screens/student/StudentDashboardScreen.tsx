/**
 * StudentDashboardScreen - MBEST Mobile App
 * Student dashboard with statistics and recent activities
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp as RNStackNavigationProp } from '@react-navigation/stack';
import { studentService, type StudentDashboardData } from '../../services/api/student';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, shadows } from '../../constants/spacing';
import { textStyles } from '../../constants/typography';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icon';
import type { StudentStackParamList, StudentTabParamList } from '../../types/navigation';

type TabNavigationProp = BottomTabNavigationProp<StudentTabParamList>;
type StackNavProp = RNStackNavigationProp<StudentStackParamList>;
type NavigationPropType = CompositeNavigationProp<
  TabNavigationProp,
  StackNavProp
>;

export const StudentDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationPropType>();
  const { token } = useAuthStore();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const insets = useSafeAreaInsets();

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: () => studentService.getDashboard(),
    enabled: !!token,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading dashboard</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Handle different API response structures
  const dashboardData: StudentDashboardData | undefined = (data?.data || data) as StudentDashboardData | undefined;
  
  // Format overall grade
  const overallGrade = dashboardData?.overall_grade 
    ? parseFloat(String(dashboardData.overall_grade)).toFixed(1)
    : '0';

  const QuickActionsMenu = () => (
    <Modal
      visible={showQuickActions}
      transparent
      animationType="fade"
      onRequestClose={() => setShowQuickActions(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowQuickActions(false)}
      >
        <View style={styles.quickActionsMenu}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => {
              setShowQuickActions(false);
              navigation.navigate('StudentTabs', { screen: 'StudentClasses' });
            }}
            activeOpacity={0.7}
          >
            <Icon name="book" size={24} color={colors.text} />
            <Text style={styles.quickActionText}>View Classes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => {
              setShowQuickActions(false);
              navigation.navigate('StudentTabs', { screen: 'StudentAssignments' });
            }}
            activeOpacity={0.7}
          >
            <Icon name="file-text" size={24} color={colors.text} />
            <Text style={styles.quickActionText}>Assignments</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => {
              setShowQuickActions(false);
              navigation.navigate('StudentTabs', { screen: 'StudentGrades' });
            }}
            activeOpacity={0.7}
          >
            <Icon name="star" size={24} color={colors.text} />
            <Text style={styles.quickActionText}>Grades</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Calculate safe bottom padding (tab bar height + safe area)
  const bottomPadding = Math.max(insets.bottom, 60) + spacing.lg;

  return (
    <View style={styles.container}>
      <Header
        title="Dashboard"
        showProfile={true}
        rightAction={
          <TouchableOpacity
            onPress={() => setShowQuickActions(true)}
            activeOpacity={0.7}
            style={styles.quickActionsButton}
          >
            <Icon name="zap" size={20} color={colors.textInverse} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPadding }
        ]}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
      >
        {/* Statistics Cards */}
        <View style={styles.statsGrid}>
          <Card variant="elevated" style={[styles.statCard, styles.statCardPrimary]}>
            <View style={styles.statCardContent}>
              <View style={styles.statIconWrapper}>
                <Icon name="book" size={22} color={colors.textInverse} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue} numberOfLines={1}>
                  {dashboardData?.enrolled_classes || 0}
                </Text>
                <Text style={styles.statLabel} numberOfLines={2}>
                  Enrolled Classes
                </Text>
              </View>
            </View>
          </Card>

          <Card variant="elevated" style={[styles.statCard, styles.statCardWarning]}>
            <View style={styles.statCardContent}>
              <View style={styles.statIconWrapper}>
                <Icon name="file-text" size={20} color={colors.textInverse} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue} numberOfLines={1}>
                  {dashboardData?.assignments_due || 0}
                </Text>
                <Text style={styles.statLabel} numberOfLines={2}>
                  Assignments Due
                </Text>
              </View>
            </View>
          </Card>

          <Card variant="elevated" style={[styles.statCard, styles.statCardSuccess]}>
            <View style={styles.statCardContent}>
              <View style={styles.statIconWrapper}>
                <Icon name="check-circle" size={20} color={colors.textInverse} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue} numberOfLines={1}>
                  {dashboardData?.completed_assignments || 0}
                </Text>
                <Text style={styles.statLabel} numberOfLines={2}>
                  Completed
                </Text>
              </View>
            </View>
          </Card>

          <Card variant="elevated" style={[styles.statCard, styles.statCardSecondary]}>
            <View style={styles.statCardContent}>
              <View style={styles.statIconWrapper}>
                <Icon name="star" size={20} color={colors.textInverse} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue} numberOfLines={1}>
                  {overallGrade}%
                </Text>
                <Text style={styles.statLabel} numberOfLines={2}>
                  Overall Grade
                </Text>
              </View>
            </View>
          </Card>
        </View>


        {/* Upcoming Classes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Classes</Text>
        {dashboardData?.upcoming_classes && dashboardData.upcoming_classes.length > 0 ? (
          dashboardData.upcoming_classes.map((cls: any) => {
            const classDate = new Date(cls.date);
            const startTime = cls.start_time?.substring(0, 5) || '';
            const endTime = cls.end_time?.substring(0, 5) || '';
            const teacherName = cls.teacher?.user?.name || 'Tutor TBD';
            const location = cls.location === 'home' ? 'Home' : 'Centre';
            const sessionType = cls.session_type === '1:1' ? '1-on-1' : 'Group';
            // Use class_id instead of id (id might be lesson_id)
            const classId = cls.class_id || cls.id;
            
            return (
              <TouchableOpacity
                key={cls.id}
                onPress={() => navigation.navigate('ClassDetails', { classId: Number(classId) })}
                activeOpacity={0.7}
              >
                <Card variant="elevated" style={styles.classCard}>
                  <View style={styles.classCardHeader}>
                    <View style={[styles.classIconContainer, { backgroundColor: cls.color || colors.primaryLight }]}>
                      <Icon name="book" size={20} color={colors.textInverse} />
                    </View>
                    <View style={styles.classInfo}>
                      <Text style={styles.className} numberOfLines={1} ellipsizeMode="tail">
                        {cls.subject || 'Class'}
                      </Text>
                      <Text style={styles.classSubject} numberOfLines={1}>
                        {cls.year_level || ''} • {sessionType}
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={20} color={colors.textTertiary} />
                  </View>
                  <View style={styles.classCardFooter}>
                    <View style={styles.classDetailsRow}>
                      <View style={styles.classDetailItem}>
                        <Icon name="graduation-cap" size={12} color={colors.textSecondary} />
                        <Text style={styles.classDetailText} numberOfLines={1}>
                          {teacherName}
                        </Text>
                      </View>
                      <View style={styles.classDetailItem}>
                        <Icon name="calendar" size={12} color={colors.textSecondary} />
                        <Text style={styles.classDetailText}>
                          {classDate.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.classDetailsRow}>
                      <View style={styles.classDetailItem}>
                        <Icon name="clock" size={12} color={colors.textSecondary} />
                        <Text style={styles.classDetailText}>{startTime} - {endTime}</Text>
                      </View>
                      <View style={styles.classDetailItem}>
                        <Icon name={cls.location === 'home' ? 'home' : 'building'} size={12} color={colors.textSecondary} />
                        <Text style={styles.classDetailText}>{location}</Text>
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        ) : (
          <Card variant="outlined" style={styles.emptyCard}>
            <Text style={styles.emptyText}>No upcoming classes</Text>
          </Card>
        )}
      </View>

        {/* Recent Grades */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Grades</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('StudentTabs', { screen: 'StudentGrades' })}
              activeOpacity={0.7}
            >
              <View style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
                <Icon name="chevron-right" size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        {dashboardData?.recent_grades && dashboardData.recent_grades.length > 0 ? (
          dashboardData.recent_grades.map((grade: any) => {
            const gradeValue = parseFloat(grade.grade || 0);
            const maxGrade = parseFloat(grade.max_grade || grade.max_points || 100);
            const percentage = Math.round((gradeValue / maxGrade) * 100);
            const isExcellent = percentage >= 90;
            const isGood = percentage >= 70;
            const isPassing = percentage >= 60;
            const assessmentName = grade.assessment || grade.assignment?.title || 'Assignment';
            const subject = grade.subject || grade.assignment?.class_id || '';
            const gradeDate = new Date(grade.date);
            
            return (
              <Card key={grade.id} variant="elevated" style={styles.gradeCard}>
                <View style={styles.gradeCardHeader}>
                  <View style={[
                    styles.gradeIconContainer,
                    isExcellent && styles.gradeIconExcellent,
                    isGood && !isExcellent && styles.gradeIconGood,
                    isPassing && !isGood && styles.gradeIconPassing,
                    !isPassing && styles.gradeIconFail,
                  ]}>
                    <Icon 
                      name={isExcellent ? 'trophy' : isGood ? 'award' : isPassing ? 'bar-chart' : 'file-text'} 
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
                      {assessmentName}
                    </Text>
                    {subject && (
                      <View style={styles.subjectRow}>
                        <Icon name="book" size={12} color={colors.textSecondary} />
                        <Text style={styles.gradeSubject} numberOfLines={1}>
                          {subject}
                        </Text>
                      </View>
                    )}
                    <View style={styles.dateRow}>
                      <Icon name="calendar" size={12} color={colors.textSecondary} />
                      <Text style={styles.gradeDate}>
                        {gradeDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.gradeScoreContainer}>
                  <View style={styles.scoreSection}>
                    <Text style={styles.scoreLabel}>Score</Text>
                    <Text style={styles.scoreValue}>
                      {gradeValue.toFixed(1)}/{maxGrade.toFixed(1)}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.percentageSection}>
                    <Text style={styles.percentageLabel}>Percentage</Text>
                    <Text style={styles.percentageValue}>{percentage}%</Text>
                  </View>
                </View>
                {/* {grade.notes && (
                  <View style={styles.gradeNotes}>
                    <View style={styles.notesLabelRow}>
                      <Icon name="message-circle" size={14} color={colors.textSecondary} />
                      <Text style={styles.notesLabel}>Feedback</Text>
                    </View>
                    <Text style={styles.notesText} numberOfLines={2} ellipsizeMode="tail">
                      {grade.notes}
                    </Text>
                  </View>
                )} */}
              </Card>
            );
          })
        ) : (
          <Card variant="outlined" style={styles.emptyCard}>
            <Text style={styles.emptyText}>No recent grades</Text>
          </Card>
        )}
        </View>
      </ScrollView>
      <QuickActionsMenu />
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
    paddingTop: spacing.lg,
    flexGrow: 1,
  },
  quickActionsButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  quickActionsIcon: {
    fontSize: 20,
    color: colors.textInverse,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingRight: spacing.lg,
  },
  quickActionsMenu: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    minWidth: 180,
    ...shadows.xl,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  quickActionIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    includeFontPadding: false,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xl,
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '47%',
    padding: spacing.md,
    minHeight: 90,
    borderRadius: borderRadius.xl,
  },
  statCardPrimary: {
    backgroundColor: colors.primary,
  },
  statCardWarning: {
    backgroundColor: colors.warning,
  },
  statCardSuccess: {
    backgroundColor: colors.success,
  },
  statCardSecondary: {
    backgroundColor: colors.secondary,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.md,
  },
  statIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textInverse,
    lineHeight: 26,
    includeFontPadding: false,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textInverse,
    opacity: 0.95,
    lineHeight: 18,
    includeFontPadding: false,
  },
  section: {
    marginBottom: spacing.xl,
    width: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 28,
    includeFontPadding: false,
    flex: 1,
    marginBottom: spacing.md,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 20,
    includeFontPadding: false,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    ...shadows.md,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
  },
  actionButtonSecondary: {
    backgroundColor: colors.secondary,
  },
  actionButtonIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textInverse,
    lineHeight: 20,
    includeFontPadding: false,
    letterSpacing: 0.5,
  },
  classCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    minHeight: 90,
    width: '100%',
  },
  classCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  classIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  classIcon: {
    fontSize: 24,
  },
  classInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs / 2,
    lineHeight: 22,
    includeFontPadding: false,
    flex: 1,
  },
  classSubject: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 16,
    includeFontPadding: false,
  },
  classCardFooter: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  classDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  classDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    flex: 1,
    minWidth: '45%',
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  classDetailText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 16,
    includeFontPadding: false,
    flex: 1,
  },
  classTeacher: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 19,
    includeFontPadding: false,
  },
  gradeCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    width: '100%',
  },
  gradeCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  gradeIconContainer: {
    width: 45,
    height: 45,
    borderRadius: borderRadius.full,
    backgroundColor: colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  gradeIconExcellent: {
    backgroundColor: colors.success,
  },
  gradeIconGood: {
    backgroundColor: colors.info,
  },
  gradeIconPassing: {
    backgroundColor: colors.warning,
  },
  gradeIconFail: {
    backgroundColor: colors.error,
  },
  gradeIcon: {
    fontSize: 24,
  },
  gradeInfo: {
    flex: 1,
  },
  gradeAssignment: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 24,
    includeFontPadding: false,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    marginBottom: spacing.xs / 2,
  },
  gradeSubject: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 18,
    includeFontPadding: false,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  gradeDate: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 18,
    includeFontPadding: false,
  },
  gradeScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginBottom: spacing.sm,
  },
  scoreSection: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.borderLight,
  },
  percentageSection: {
    flex: 1,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 14,
    includeFontPadding: false,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 24,
    includeFontPadding: false,
  },
  percentageLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 14,
    includeFontPadding: false,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  percentageValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 26,
    includeFontPadding: false,
  },
  gradeNotes: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: spacing.sm,
  },
  notesLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    marginBottom: spacing.xs,
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
    lineHeight: 20,
    includeFontPadding: false,
  },
  errorText: {
    color: colors.error,
    ...textStyles.body,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    ...shadows.md,
  },
  retryButtonText: {
    color: colors.textInverse,
    ...textStyles.button,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    ...textStyles.body,
    textAlign: 'center',
  },
});

