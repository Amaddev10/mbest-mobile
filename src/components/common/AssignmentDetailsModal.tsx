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
import { studentService, type AssignmentDetails } from '../../services/api/student';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, shadows } from '../../constants/spacing';
import { textStyles } from '../../constants/typography';

interface AssignmentDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  assignmentId: number | null;
  onStartAssignment?: () => void;
}

export const AssignmentDetailsModal: React.FC<AssignmentDetailsModalProps> = ({
  visible,
  onClose,
  assignmentId,
  onStartAssignment,
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
      <Modal visible={visible} onClose={onClose} title="Assignment Details" maxHeight={600}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </Modal>
    );
  }

  if (error || !data) {
    return (
      <Modal visible={visible} onClose={onClose} title="Assignment Details" maxHeight={600}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>Error loading assignment details</Text>
          <Button title="Close" onPress={onClose} variant="outline" style={styles.closeButton} />
        </View>
      </Modal>
    );
  }

  const assignment: AssignmentDetails | undefined = data?.data || data;

  if (!assignment || !assignment.due_date) {
    return (
      <Modal visible={visible} onClose={onClose} title="Assignment Details" maxHeight={600}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>Assignment data not available</Text>
          <Button title="Close" onPress={onClose} variant="outline" style={styles.closeButton} />
        </View>
      </Modal>
    );
  }

  const dueDate = new Date(assignment.due_date);
  const now = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 1;
  const hasHighPriority = assignment.priority === 'high' || assignment.priority === 'urgent' || assignment.priority === 'High' || assignment.priority === 'Urgent';

  return (
    <Modal visible={visible} onClose={onClose} title="Assignment Details" maxHeight={600}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Icon */}
        <View style={styles.headerSection}>
          <Icon name="file-text" size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>Assignment Details</Text>
        </View>

        {/* Title and Priority Badge */}
        <View style={styles.titleSection}>
          <Text style={styles.assignmentTitle}>{assignment.title}</Text>
          {hasHighPriority && (
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityBadgeText}>high priority</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {assignment.description && (
          <Text style={styles.description}>{assignment.description}</Text>
        )}

        {/* Key Information Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Icon name="user" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>Instructor</Text>
            <Text style={styles.infoValue}>
              {assignment.tutor?.user?.name || assignment.class_model?.tutor?.user?.name || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="book" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>Class</Text>
            <Text style={styles.infoValue}>
              {assignment.class_model?.name || assignment.class?.name || assignment.class?.subject || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="calendar" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>Due Date</Text>
            <Text style={styles.infoValue}>
              {dueDate.toLocaleDateString('en-US', { 
                month: '2-digit', 
                day: '2-digit', 
                year: 'numeric' 
              })}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="target" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>Points</Text>
            <Text style={styles.infoValue}>
              {assignment.max_points || 0} points
            </Text>
          </View>
        </View>

        {/* Time Remaining */}
        <View style={styles.timeRemainingSection}>
          <View style={styles.timeRemainingHeader}>
            <Icon name="clock" size={20} color={colors.primary} />
            <Text style={styles.timeRemainingLabel}>Time Remaining</Text>
          </View>
          <Text style={[
            styles.timeRemainingText,
            isDueSoon && styles.timeRemainingWarning
          ]}>
            {daysUntilDue < 0 
              ? 'Overdue' 
              : daysUntilDue === 0 
              ? 'Due today' 
              : daysUntilDue === 1 
              ? 'Due tomorrow' 
              : `Due in ${daysUntilDue} days`}
          </Text>
        </View>

        {/* Submission Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submission Requirements:</Text>
          <View style={styles.requirementsList}>
            <Text style={styles.requirementItem}>
              • Submit as {assignment.submission_type || 'text entry'}
            </Text>
            {assignment.allowed_file_types && Array.isArray(assignment.allowed_file_types) && assignment.allowed_file_types.length > 0 && (
              <Text style={styles.requirementItem}>
                • Allowed file types: {assignment.allowed_file_types.join(', ')}
              </Text>
            )}
            <Text style={styles.requirementItem}>• Original work required - no plagiarism</Text>
            <Text style={styles.requirementItem}>• Follow proper formatting guidelines</Text>
          </View>
        </View>

        {/* Instructions */}
        {assignment.instructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions:</Text>
            <View style={styles.instructionsList}>
              {assignment.instructions
                .split(/\\n|\n/)
                .filter(line => line.trim())
                .map((instruction, index) => (
                  <Text key={index} style={styles.instructionItem}>
                    {index + 1}. {instruction.trim()}
                  </Text>
                ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
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
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  closeButton: {
    minWidth: 100,
  },
});

