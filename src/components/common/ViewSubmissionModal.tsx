/**
 * ViewSubmissionModal - Modal for viewing submission details
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Modal } from './Modal';
import { Button } from './Button';
import { Icon } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';
import { studentService } from '../../services/api/student';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, shadows } from '../../constants/spacing';
import { textStyles } from '../../constants/typography';

interface ViewSubmissionModalProps {
  visible: boolean;
  onClose: () => void;
  assignmentId: number | null;
}

export const ViewSubmissionModal: React.FC<ViewSubmissionModalProps> = ({
  visible,
  onClose,
  assignmentId,
}) => {
  const { token } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['submissionDetails', assignmentId],
    queryFn: () => studentService.getSubmissionDetails(assignmentId!),
    enabled: !!token && !!assignmentId && visible,
  });
  console.log('data', data);
  if (!assignmentId) return null;

  if (isLoading) {
    return (
      <Modal visible={visible} onClose={onClose} title="Submission Details">
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </Modal>
    );
  }

  if (error || !data) {
    return (
      <Modal visible={visible} onClose={onClose} title="Submission Details">
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>Error loading submission details</Text>
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

  const submission = data?.data || data;

  if (!submission) {
    return (
      <Modal visible={visible} onClose={onClose} title="Submission Details">
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>Submission data not available</Text>
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

  const submittedDate = submission.submitted_at
    ? new Date(submission.submitted_at)
    : null;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Submission Details"
      scrollable={false}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.modalContent}
      >
        <View style={styles.headerSection}>
          <Icon name="file-text" size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>Submission Details</Text>
        </View>

        {/* Assignment Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.assignmentTitle}>
            {submission.title || 'Assignment'}
          </Text>
          {submission.description && (
            <Text style={styles.assignmentDescription} numberOfLines={3}>
              {submission.description}
            </Text>
          )}
          <View style={styles.detailsRow}>
            {submission.due_date && (
              <Text style={styles.detailText}>
                Due:{' '}
                {new Date(submission.due_date).toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric',
                })}
              </Text>
            )}
            {submission.max_points && (
              <Text style={styles.detailText}>
                Points: {submission.max_points}
              </Text>
            )}
          </View>
        </View>

        {/* Submission Status Card */}
        <View style={styles.submissionCard}>
          <View style={styles.submissionHeader}>
            <Text style={styles.submissionTitle}>Your Submission</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {submission.status || 'submitted'}
              </Text>
            </View>
          </View>

          {/* Submitted Date */}
          {submittedDate && (
            <View style={styles.submissionDetail}>
              <Icon name="calendar" size={18} color={colors.textSecondary} />
              <Text style={styles.submissionDetailLabel}>Submitted:</Text>
              <Text style={styles.submissionDetailValue}>
                {submittedDate.toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}

          {/* Text Submission */}
          {submission.text_submission && (
            <View style={styles.contentSection}>
              <Text style={styles.contentLabel}>Submission Text:</Text>
              <View style={styles.textSubmissionBox}>
                <Text style={styles.textSubmissionContent} numberOfLines={10}>
                  {submission.text_submission}
                </Text>
              </View>
            </View>
          )}

          {/* File Submission */}
          {submission.file_url && (
            <View style={styles.contentSection}>
              <Text style={styles.contentLabel}>Submitted File:</Text>
              <View style={styles.fileBox}>
                <Icon name="file" size={24} color={colors.primary} />
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>Submitted File</Text>
                  <Text style={styles.fileHint}>
                    File uploaded successfully
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Grade Section */}
          {submission.grade !== null && submission.grade !== undefined && (
            <View style={styles.gradeSection}>
              <View style={styles.gradeSectionHeader}>
                <Icon name="award" size={20} color={colors.success} />
                <Text style={styles.gradeSectionTitle}>Grade</Text>
              </View>
              <Text style={styles.gradeValue}>{submission.grade}</Text>
              {submission.feedback && (
                <View style={styles.feedbackBox}>
                  <Text style={styles.feedbackLabel}>Feedback:</Text>
                  <Text style={styles.feedbackText}>{submission.feedback}</Text>
                </View>
              )}
            </View>
          )}

          {/* Pending Grade */}
          {(submission.grade === null || submission.grade === undefined) && (
            <View style={styles.pendingGradeBox}>
              <Icon name="clock" size={20} color={colors.warning} />
              <Text style={styles.pendingGradeText}>
                Your submission is pending review
              </Text>
            </View>
          )}
        </View>

        {/* Close Button */}
        <View style={styles.actions}>
          <Button
            title="Close"
            onPress={onClose}
            variant="primary"
            style={styles.closeButtonAction}
          />
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    includeFontPadding: false,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    includeFontPadding: false,
    lineHeight: 24,
  },
  assignmentDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 20,
    includeFontPadding: false,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  submissionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  submissionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    includeFontPadding: false,
  },
  statusBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textInverse,
    includeFontPadding: false,
    textTransform: 'lowercase',
  },
  submissionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  submissionDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  submissionDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    includeFontPadding: false,
  },
  contentSection: {
    marginTop: spacing.sm,
  },
  contentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    includeFontPadding: false,
  },
  textSubmissionBox: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  textSubmissionContent: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 20,
    includeFontPadding: false,
  },
  fileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs / 2,
    includeFontPadding: false,
  },
  fileHint: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  gradeSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  gradeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  gradeSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    includeFontPadding: false,
  },
  gradeValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.success,
    marginBottom: spacing.md,
    includeFontPadding: false,
  },
  feedbackBox: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    includeFontPadding: false,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 20,
    includeFontPadding: false,
  },
  pendingGradeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningLight + '20',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.warningLight,
  },
  pendingGradeText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    includeFontPadding: false,
  },
  actions: {
    marginTop: spacing.sm,
    alignItems: 'flex-end',
  },
  closeButtonAction: {
    minWidth: 120,
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
  closeButton: {
    minWidth: 100,
  },
});
