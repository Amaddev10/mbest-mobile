/**
 * StudentAssignmentsScreen - MBEST Mobile App
 * Assignments list for student
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../../services/api/student';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, shadows } from '../../constants/spacing';
import { textStyles } from '../../constants/typography';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { SubmitAssignmentModal } from '../../components/common/SubmitAssignmentModal';
import { AssignmentDetailsModal } from '../../components/common/AssignmentDetailsModal';
import { AskQuestionModal } from '../../components/common/AskQuestionModal';
import { ViewSubmissionModal } from '../../components/common/ViewSubmissionModal';
import { FilterTabs } from '../../components/common/FilterTabs';
import type { FilterTabItem } from '../../components/common/FilterTabs';

export const StudentAssignmentsScreen: React.FC = () => {
  const { token } = useAuthStore();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'due' | 'submitted'>(
    'all',
  );
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    number | null
  >(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAskQuestionModal, setShowAskQuestionModal] = useState(false);
  const [showViewSubmissionModal, setShowViewSubmissionModal] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['studentAssignments'],
    queryFn: () => studentService.getAssignments(),
    enabled: !!token,
  });

  const submitMutation = useMutation({
    mutationFn: ({
      assignmentId,
      submissionData,
    }: {
      assignmentId: number;
      submissionData: { text_submission?: string; file?: any };
    }) => studentService.submitAssignment(assignmentId, submissionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentAssignments'] });
      Alert.alert('Success', 'Assignment submitted successfully!');
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to submit assignment',
      );
    },
  });

  const questionMutation = useMutation({
    mutationFn: (questionData: {
      subject: string;
      question: string;
      class_id?: number | string;
      assignment_id?: number | string;
      tutor_id?: number | string;
      priority?: string;
      category?: string;
      attachments?: any[];
    }) => studentService.submitQuestion(questionData),
    onSuccess: () => {
      console.log('questionMutation', questionMutation);
      Alert.alert('Success', 'Question submitted successfully!');
    },
    onError: (error: any) => {
      console.log('questionMutation', questionMutation);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to submit question',
      );
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Assignments" showProfile={true} />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>Error loading assignments</Text>
        </View>
      </View>
    );
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isDueSoon = (dueDate: string) => {
    const days = getDaysUntilDue(dueDate);
    return days >= 0 && days <= 2;
  };

  const isOverdue = (dueDate: string, status: string) => {
    return (
      new Date(dueDate) < new Date() &&
      status !== 'graded' &&
      status !== 'submitted'
    );
  };

  // Handle nested API response structures
  const assignments =
    (data as any)?.data?.data || (data as any)?.data || data || [];

  const hasSubmission = (assignment: any) =>
    Array.isArray(assignment?.submissions) && assignment.submissions.length > 0;

  const isSubmissionPending = (assignment: any) =>
    assignment.status !== 'graded' && assignment.status !== 'submitted';

  const isDueSoonAssignment = (assignment: any) =>
    isSubmissionPending(assignment) && isDueSoon(assignment.due_date);

  const getFilterCount = (
    filterType: 'all' | 'due' | 'submitted',
  ) => {
    if (filterType === 'all') return assignments.length;
    return assignments.filter((assignment: any) => {
      if (filterType === 'due')
        return isDueSoonAssignment(assignment);
      if (filterType === 'submitted')
        return assignment.status === 'submitted' || hasSubmission(assignment);
      return false;
    }).length;
  };

  const filterTabs: FilterTabItem[] = [
    {
      key: 'all',
      label: 'All Assignments',
      icon: 'file-text',
      count: getFilterCount('all'),
    },
    {
      key: 'due',
      label: 'Due Soon',
      icon: 'clock',
      count: getFilterCount('due'),
    },
    {
      key: 'submitted',
      label: 'Submitted',
      icon: 'check-circle',
      count: getFilterCount('submitted'),
    },
    // {
    //   key: 'graded',
    //   label: 'Graded',
    //   icon: 'check',
    //   count: getFilterCount('graded'),
    // },
  ];

  const filteredAssignments = assignments.filter((assignment: any) => {
    if (filter === 'all') return true;
    if (filter === 'due')
      return isDueSoonAssignment(assignment);
    if (filter === 'submitted')
      return assignment.status === 'submitted' || hasSubmission(assignment);
    if (filter === 'graded') return assignment.status === 'graded';
    return true;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Assignments" showProfile={true} />

      {/* Filter Tabs */}
      <View style={styles.filterTabsWrapper}>
        <FilterTabs
          items={filterTabs}
          selectedKey={filter}
          onSelect={key =>
            setFilter(key as 'all' | 'due' | 'submitted')
          }
          style={styles.filterTabsScroll}
        />
      </View>

      <FlatList
        data={filteredAssignments}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={[
          styles.listContent,
          filteredAssignments.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => {
          const dueDate = new Date(item.due_date);
          const daysUntilDue = getDaysUntilDue(item.due_date);
          const dueSoon = isDueSoon(item.due_date);
          const overdue = isOverdue(item.due_date, item.status || '');
          const hasHighPriority =
            item.priority === 'high' || item.priority === 'urgent';
          const submission = item.submissions?.[0];
          const gradeValue = submission?.grade;

          return (
            <Card variant="elevated" style={styles.assignmentCard}>
              {/* Header with Icon, Title, and Badges */}
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name="file-text" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.titleContainer}>
                    <Text style={styles.assignmentTitle} numberOfLines={2}>
                      {item.title || 'Untitled Assignment'}
                    </Text>
                    <Text style={styles.assignmentMeta} numberOfLines={1}>
                      {item.subject || item.class || 'General'} •{' '}
                      {item.tutor_name || item.instructor || 'Instructor'}
                    </Text>
                  </View>
                </View>
                <View style={styles.badgesContainer}>
                  {hasHighPriority && (
                    <View style={styles.priorityBadge}>
                      <Text style={styles.priorityBadgeText}>
                        high priority
                      </Text>
                    </View>
                  )}
                  {dueSoon && !overdue && (
                    <View style={styles.dueSoonBadge}>
                      <Icon
                        name="alert-circle"
                        size={12}
                        color={colors.textInverse}
                      />
                      <Text style={styles.dueSoonBadgeText}>Due soon</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Description */}
              {item.description && (
                <Text style={styles.description} numberOfLines={3}>
                  {item.description}
                </Text>
              )}

              {/* Due Date and Points */}
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Icon
                    name="calendar"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.detailLabel}>Due: </Text>
                  <Text style={styles.detailValue}>
                    {dueDate.toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                {item.max_points && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Points: </Text>
                    <Text style={styles.detailValue}>{item.max_points}</Text>
                  </View>
                )}
                {gradeValue && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Grade: </Text>
                    <Text style={styles.detailValue}>{gradeValue}%</Text>
                  </View>
                )}
                {(dueSoon || overdue) && (
                  <Text style={styles.dueWarningText}>
                    {overdue
                      ? 'Overdue'
                      : daysUntilDue === 0
                      ? 'Due today'
                      : daysUntilDue === 1
                      ? 'Due tomorrow'
                      : `Due in ${daysUntilDue} days`}
                  </Text>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                {item.submissions && item.submissions.length > 0 ? (
                  <Button
                    title="View Submission"
                    onPress={() => {
                      setSelectedAssignment(item);
                      setSelectedAssignmentId(item.id);
                      setShowViewSubmissionModal(true);
                    }}
                    variant="primary"
                    style={styles.submitButton}
                  />
                ) : (
                  <Button
                    title="Submit Assignment"
                    onPress={() => {
                      setSelectedAssignment(item);
                      setSelectedAssignmentId(item.id);
                      setShowSubmitModal(true);
                    }}
                    variant="primary"
                    style={styles.submitButton}
                  />
                )}
                <View style={styles.secondaryButtons}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedAssignment(item);
                      setSelectedAssignmentId(item.id);
                      setShowDetailsModal(true);
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedAssignment(item);
                      setSelectedAssignmentId(item.id);
                      setShowAskQuestionModal(true);
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>Ask Question</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    activeOpacity={0.7}
                    onPress={() => {
                      navigation.navigate('MyQuestions');
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>
                      View Q&A Thread
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Status Badge */}
              {item.status && (
                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'graded' && styles.statusBadgeGraded,
                    item.status === 'submitted' && styles.statusBadgeSubmitted,
                    overdue && styles.statusBadgeOverdue,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              )}
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon
              name="clipboard"
              size={80}
              color={colors.textTertiary}
              style={{ opacity: 0.5, marginBottom: spacing.xl }}
            />
            <Text style={styles.emptyTitle}>No Assignments Found</Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? "You don't have any assignments yet."
                : `No ${filter} assignments at the moment.`}
            </Text>
          </View>
        }
      />

      {/* Modals */}
      <SubmitAssignmentModal
        visible={showSubmitModal}
        onClose={() => {
          setShowSubmitModal(false);
          setSelectedAssignment(null);
          setSelectedAssignmentId(null);
        }}
        assignmentId={selectedAssignmentId || selectedAssignment?.id || null}
        assignment={selectedAssignment}
        onSubmit={submissionData => {
          const assignmentId = selectedAssignmentId || selectedAssignment?.id;
          if (assignmentId) {
            submitMutation.mutate({
              assignmentId,
              submissionData,
            });
            setShowSubmitModal(false);
            setSelectedAssignment(null);
            setSelectedAssignmentId(null);
          }
        }}
      />

      <AssignmentDetailsModal
        visible={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAssignment(null);
          setSelectedAssignmentId(null);
        }}
        assignmentId={selectedAssignmentId}
        onStartAssignment={() => {
          setShowDetailsModal(false);
          setSelectedAssignmentId(null);
          setShowSubmitModal(true);
        }}
        onEditSubmission={() => {
          setShowDetailsModal(false);
          setShowSubmitModal(true);
        }}
      />

      <AskQuestionModal
        visible={showAskQuestionModal}
        onClose={() => {
          setShowAskQuestionModal(false);
          setSelectedAssignment(null);
          setSelectedAssignmentId(null);
        }}
        assignmentId={selectedAssignmentId || selectedAssignment?.id || null}
        assignment={selectedAssignment}
        onSend={(question) => {
          const questionData = {
            subject: question.subject,
            question: question.message,
            class_id:
              selectedAssignment?.class_id ||
              selectedAssignment?.class_model?.id,
            assignment_id: selectedAssignmentId || selectedAssignment?.id,
            tutor_id:
              selectedAssignment?.tutor_id ||
              selectedAssignment?.tutor?.id,
            priority: question.priority,
            category: question.category,
            attachments: question.attachments || [],
          };
          questionMutation.mutate(questionData);
          setShowAskQuestionModal(false);
          setSelectedAssignment(null);
          setSelectedAssignmentId(null);
        }}
      />

      <ViewSubmissionModal
        visible={showViewSubmissionModal}
        onClose={() => {
          setShowViewSubmissionModal(false);
          setSelectedAssignment(null);
          setSelectedAssignmentId(null);
        }}
        assignmentId={selectedAssignmentId || selectedAssignment?.id || null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  filterTabsWrapper: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...shadows.sm,
  },
  filterTabsScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  assignmentCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs / 2,
    lineHeight: 24,
    includeFontPadding: false,
  },
  assignmentMeta: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 18,
    includeFontPadding: false,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  priorityBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textInverse,
    includeFontPadding: false,
    textTransform: 'lowercase',
  },
  dueSoonBadge: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
    gap: spacing.xs / 2,
  },
  dueSoonBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textInverse,
    includeFontPadding: false,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.md,
    includeFontPadding: false,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    includeFontPadding: false,
  },
  dueWarningText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.error,
    includeFontPadding: false,
    marginLeft: 'auto',
  },
  actionButtonsContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  submitButton: {
    marginBottom: spacing.sm,
  },
  secondaryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  secondaryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    includeFontPadding: false,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  statusBadgeGraded: {
    backgroundColor: colors.success,
  },
  statusBadgeSubmitted: {
    backgroundColor: colors.info,
  },
  statusBadgeOverdue: {
    backgroundColor: colors.error,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textInverse,
    letterSpacing: 0.5,
    includeFontPadding: false,
    textTransform: 'capitalize',
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
    marginTop: spacing.lg,
    includeFontPadding: false,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...textStyles.h3,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
    includeFontPadding: false,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    includeFontPadding: false,
  },
});
