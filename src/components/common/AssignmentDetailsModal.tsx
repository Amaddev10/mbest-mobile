/**
 * AssignmentDetailsModal - Modal for viewing assignment details
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Modal } from './Modal';
import { Button } from './Button';
import { Icon } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';
import {
  studentService,
  type AssignmentDetails,
} from '../../services/api/student';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';

interface AssignmentDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  assignmentId: number | null;
  onStartAssignment?: () => void;
  onEditSubmission?: () => void;
}

export const AssignmentDetailsModal: React.FC<AssignmentDetailsModalProps> = ({
  visible,
  onClose,
  assignmentId,
  onStartAssignment,
  onEditSubmission,
}) => {
  const { token } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['assignmentDetails', assignmentId],
    queryFn: () => studentService.getAssignmentDetails(assignmentId!),
    enabled: !!token && !!assignmentId && visible,
  });

  if (!assignmentId) return null;

  if (isLoading) {
    return (
      <Modal
        visible={visible}
        onClose={onClose}
        title="Assignment Details"
        maxHeight={600}
      >
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </Modal>
    );
  }

  if (error || !data) {
    return (
      <Modal visible={visible} onClose={onClose} title="Assignment Details">
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>Error loading assignment details</Text>
          <Button
            title="Close"
            onPress={onClose}
            variant="outline"
            style={styles.closeButton}
          />
        </View>
      </Modal>
    );
  }

  const assignment: AssignmentDetails | undefined = data?.data || data;

  if (!assignment || !assignment.due_date) {
    return (
      <Modal visible={visible} onClose={onClose} title="Assignment Details">
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>Assignment data not available</Text>
          <Button
            title="Close"
            onPress={onClose}
            variant="outline"
            style={styles.closeButton}
          />
        </View>
      </Modal>
    );
  }

  const dueDate = new Date(assignment.due_date);
  const now = new Date();
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 1;
  const hasHighPriority =
    assignment.priority === 'high' ||
    assignment.priority === 'urgent' ||
    assignment.priority === 'High' ||
    assignment.priority === 'Urgent';

  const submissions = (assignment as any).submissions || [];
  const hasSubmission = submissions.length > 0;
  const latestSubmission = hasSubmission ? submissions[0] : null;
  const submittedDate = latestSubmission?.submitted_at
    ? new Date(latestSubmission.submitted_at)
    : null;

  return (
    <Modal visible={visible} onClose={onClose} title="Assignment Details" scrollable={false}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <View style={styles.headerSection}>
            <Icon name="file-text" size={24} color={colors.primary} />
            <Text style={styles.headerTitle}>Assignment Details</Text>
          </View>
          <View style={styles.titleSection}>
            <Text style={styles.assignmentTitle}>{assignment.title}</Text>
            {hasHighPriority && (
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityBadgeText}>high priority</Text>
              </View>
            )}
          </View>
          {assignment.description && (
            <Text style={styles.description}>{assignment.description}</Text>
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name="user" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Instructor</Text>
                <Text style={styles.infoValue}>
                  {assignment.tutor?.user?.name ||
                    assignment.class_model?.tutor?.user?.name ||
                    'N/A'}
                </Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name="book" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Class</Text>
                <Text style={styles.infoValue}>
                  {assignment.class_model?.name ||
                    assignment.class?.name ||
                    assignment.class?.subject ||
                    'N/A'}
                </Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name="calendar" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Due Date</Text>
                <Text style={styles.infoValue}>
                  {dueDate.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Icon name="target" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Points</Text>
                <Text style={styles.infoValue}>
                  {assignment.max_points || 0} points
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.timeRemainingHeader}>
            <Icon name="clock" size={20} color={colors.primary} />
            <Text style={styles.timeRemainingLabel}>Time Remaining</Text>
          </View>
          <Text
            style={[
              styles.timeRemainingText,
              isDueSoon && styles.timeRemainingWarning,
            ]}
          >
            {daysUntilDue < 0
              ? 'Overdue'
              : daysUntilDue === 0
              ? 'Due today'
              : daysUntilDue === 1
              ? 'Due tomorrow'
              : `Due in ${daysUntilDue} days`}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Submission Requirements:</Text>
          <View style={styles.requirementsList}>
            <Text style={styles.requirementItem}>
              • Submit as {assignment.submission_type || 'text entry'}
            </Text>
            {assignment.allowed_file_types &&
              Array.isArray(assignment.allowed_file_types) &&
              assignment.allowed_file_types.length > 0 && (
                <Text style={styles.requirementItem}>
                  • Allowed file types:{' '}
                  {assignment.allowed_file_types.join(', ')}
                </Text>
              )}
            <Text style={styles.requirementItem}>
              • Original work required - no plagiarism
            </Text>
            <Text style={styles.requirementItem}>
              • Follow proper formatting guidelines
            </Text>
          </View>
        </View>

        {assignment.instructions && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Instructions:</Text>
            <View style={styles.instructionsList}>
              {assignment.instructions
                .split(/\n|\n/)
                .filter(line => line.trim())
                .map((instruction, index) => (
                  <Text key={index} style={styles.instructionItem}>
                    {index + 1}. {instruction.trim()}
                  </Text>
                ))}
            </View>
          </View>
        )}

        {hasSubmission && (
          <View style={styles.submissionStatusSection}>
            <View style={styles.submissionStatusHeader}>
              <Icon name="check-circle" size={24} color={colors.success} />
              <Text style={styles.submissionStatusTitle}>
                Submission Status
              </Text>
            </View>

            <View style={styles.submissionStatusContent}>
              <View style={styles.submissionBadges}>
                <View style={styles.submittedBadge}>
                  <Icon
                    name="check-circle"
                    size={16}
                    color={colors.textInverse}
                  />
                  <Text style={styles.submittedBadgeText}>Submitted</Text>
                </View>
                <View style={styles.statusTextBadge}>
                  <Text style={styles.statusText}>
                    {latestSubmission?.status || 'submitted'}
                  </Text>
                </View>
              </View>

              {submittedDate && (
                <Text style={styles.submittedDateText}>
                  Submitted:{' '}
                  {submittedDate.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                  })}
                </Text>
              )}

              <View style={styles.submissionActions}>
                {onEditSubmission && (
                  <Button
                    title="Edit Submission"
                    onPress={onEditSubmission}
                    variant="primary"
                    style={styles.editSubmissionButton}
                  />
                )}
              </View>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="Close"
            onPress={onClose}
            variant="outline"
            style={styles.closeButton}
          />
          {onStartAssignment && (
            <Button
              title="Start Assignment"
              onPress={onStartAssignment}
              variant="primary"
              style={styles.startButton}
            />
          )}
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    includeFontPadding: false,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  assignmentTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    includeFontPadding: false,
    lineHeight: 28,
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
  description: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.lg,
    includeFontPadding: false,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
    includeFontPadding: false,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    includeFontPadding: false,
  },
  timeRemainingSection: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  timeRemainingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  timeRemainingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    includeFontPadding: false,
  },
  timeRemainingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xs,
    includeFontPadding: false,
  },
  timeRemainingWarning: {
    color: colors.error,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    includeFontPadding: false,
  },
  requirementsList: {
    gap: spacing.xs,
  },
  requirementItem: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 20,
    includeFontPadding: false,
  },
  instructionsList: {
    gap: spacing.xs,
  },
  instructionItem: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 20,
    includeFontPadding: false,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  closeButton: {
    minWidth: 100,
  },
  startButton: {
    minWidth: 150,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    textAlign: 'center',
    includeFontPadding: false,
  },
  submissionStatusSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  submissionStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  submissionStatusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    includeFontPadding: false,
  },
  submissionStatusContent: {
    gap: spacing.sm,
  },
  submissionBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  submittedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  submittedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textInverse,
    includeFontPadding: false,
  },
  statusTextBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
    includeFontPadding: false,
  },
  submittedDateText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  submissionActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  viewSubmissionButton: {
    flex: 1,
  },
  editSubmissionButton: {
    flex: 1,
  },
});
