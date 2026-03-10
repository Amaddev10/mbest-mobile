/**
 * SubmitAssignmentModal - Modal for submitting assignments
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { pick, types } from '@react-native-documents/picker';
import { Modal } from './Modal';
import { Button } from './Button';
import { Icon } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';
import { studentService } from '../../services/api/student';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, shadows } from '../../constants/spacing';
import { textStyles } from '../../constants/typography';

interface Assignment {
  id: number;
  title: string;
  description?: string;
  due_date: string;
  max_points?: number;
  subject?: string;
  class?: string;
  tutor_name?: string;
  instructor?: string;
  submission_type?: 'text' | 'file';
}

interface SubmitAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  assignmentId: number | null;
  assignment?: Assignment | null;
  onSubmit: (data: { text_submission?: string; file?: any }) => void;
}

export const SubmitAssignmentModal: React.FC<SubmitAssignmentModalProps> = ({
  visible,
  onClose,
  assignmentId,
  assignment: assignmentProp,
  onSubmit,
}) => {
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const { token } = useAuthStore();

  // Fetch assignment details if assignmentId is provided
  const { data: assignmentData, isLoading } = useQuery({
    queryKey: ['assignmentDetails', assignmentId],
    queryFn: () => studentService.getAssignmentDetails(assignmentId!),
    enabled: !!token && !!assignmentId && visible && !assignmentProp,
  });

  const assignment = assignmentProp || assignmentData?.data || assignmentData;

  if (isLoading && !assignmentProp) {
    return (
      <Modal visible={visible} onClose={onClose} title="Submit Assignment">
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </Modal>
    );
  }

  if (!assignment || !(assignment as any).due_date) {
    return (
      <Modal visible={visible} onClose={onClose} title="Submit Assignment">
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>Assignment not found</Text>
          <Button title="Close" onPress={onClose} variant="outline" style={styles.closeButton} />
        </View>
      </Modal>
    );
  }

  const dueDate = new Date((assignment as any).due_date);
  const now = new Date();
  const isOverdue = dueDate < now;
  const daysOverdue = isOverdue
    ? Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const submissionType = (assignment as any)?.submission_type || 'text';

  const handlePickFile = async () => {
    try {
      const result = await pick({
        type: [types.allFiles],
        allowMultiSelection: false,
      });

      if (result.length > 0) {
        setSelectedFile(result[0]);
      }
    } catch (err: any) {
      if (err?.code === 'DOCUMENT_PICKER_CANCELED' || err?.message?.includes('cancel')) {
        return;
      }
      Alert.alert('Error', 'Failed to pick file');
      console.error('DocumentPicker Error:', err);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = () => {
    if (submissionType === 'text') {
      if (submissionText.trim()) {
        onSubmit({ text_submission: submissionText });
        setSubmissionText('');
        onClose();
      }
    } else if (submissionType === 'file') {
      if (selectedFile) {
        onSubmit({ file: selectedFile });
        setSelectedFile(null);
        onClose();
      }
    }
  };

  const isSubmitDisabled = submissionType === 'text' 
    ? !submissionText.trim() 
    : !selectedFile;

  return (
    <Modal visible={visible} onClose={onClose} title="Submit Assignment">
      {/* Assignment Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.assignmentTitle}>{(assignment as any)?.title || 'Untitled Assignment'}</Text>
        {(assignment as any)?.description && (
          <Text style={styles.assignmentDescription}>{(assignment as any).description}</Text>
        )}
        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>
            Due: {dueDate.toLocaleDateString('en-US', { 
              month: '2-digit', 
              day: '2-digit', 
              year: 'numeric' 
            })}
          </Text>
          {(assignment as any)?.max_points && (
            <Text style={styles.detailText}>Points: {(assignment as any).max_points}</Text>
          )}
        </View>
        {isOverdue && (
          <View style={styles.warningBox}>
            <Icon name="alert-circle" size={20} color={colors.warning} />
            <Text style={styles.warningText}>
              This assignment is {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue. You can still submit, but it may be marked as late.
            </Text>
          </View>
        )}
      </View>

      {/* Submission Input - Conditional based on submission_type */}
      {submissionType === 'text' ? (
        <View style={styles.textAreaContainer}>
          <Text style={styles.label}>Submission Text</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter your assignment submission here..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={8}
            value={submissionText}
            onChangeText={setSubmissionText}
            textAlignVertical="top"
          />
        </View>
      ) : (
        <View style={styles.fileUploadContainer}>
          <Text style={styles.label}>Upload File</Text>
          {!selectedFile ? (
            <TouchableOpacity 
              style={styles.fileUploadBox} 
              onPress={handlePickFile}
              activeOpacity={0.7}
            >
              <Icon name="upload" size={32} color={colors.primary} />
              <Text style={styles.fileUploadText}>Tap to select a file</Text>
              <Text style={styles.fileUploadHint}>
                Any file type accepted
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.selectedFileContainer}>
              <View style={styles.selectedFileInfo}>
                <Icon name="file" size={24} color={colors.primary} />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.fileSize}>
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.removeFileButton}
                onPress={handleRemoveFile}
                activeOpacity={0.7}
              >
                <Icon name="x" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Cancel"
          onPress={onClose}
          variant="outline"
          style={styles.cancelButton}
        />
        <Button
          title="Submit Assignment"
          onPress={handleSubmit}
          variant="primary"
          style={styles.submitButton}
          disabled={isSubmitDisabled}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
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
    marginBottom: spacing.md,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: colors.warningLight + '30',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.warningLight,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 18,
    includeFontPadding: false,
  },
  textAreaContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    includeFontPadding: false,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
    minHeight: 150,
    backgroundColor: colors.background,
    ...shadows.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 0.8,
    paddingHorizontal: spacing.xs,
  },
  submitButton: {
    flex: 1.2,
    paddingHorizontal: spacing.xs,
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
  fileUploadContainer: {
    marginBottom: spacing.lg,
  },
  fileUploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight + '10',
    minHeight: 150,
  },
  fileUploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    includeFontPadding: false,
  },
  fileUploadHint: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    marginTop: spacing.xs,
    includeFontPadding: false,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  selectedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs / 2,
    includeFontPadding: false,
  },
  fileSize: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  removeFileButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.errorLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

