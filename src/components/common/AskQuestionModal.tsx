/**
 * AskQuestionModal - Modal for asking questions about assignments
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { launchImageLibrary } from 'react-native-image-picker';
import { pick, types } from '@react-native-documents/picker';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
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
  subject?: string;
  class?: string;
  class_model?: {
    name: string;
    category?: string;
  };
  tutor?: {
    user?: {
      name: string;
    };
  };
  tutor_name?: string;
  instructor?: string;
}

interface AskQuestionModalProps {
  visible: boolean;
  onClose: () => void;
  assignmentId: number | null;
  assignment?: Assignment | null;
  onSend: (question: {
    subject: string;
    priority: string;
    category: string;
    message: string;
    attachments?: any[];
  }) => void;
}

const PRIORITIES = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

const CATEGORIES = [
  { label: 'Assignment Help', value: 'assignment' },
  { label: 'Concept Clarification', value: 'concept' },
  { label: 'Technical Issue', value: 'technical' },
  { label: 'Grading Question', value: 'grading' },
  { label: 'General Question', value: 'general' },
];

export const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  visible,
  onClose,
  assignmentId,
  assignment: assignmentProp,
  onSend,
}) => {
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState(PRIORITIES[1].value);
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [message, setMessage] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
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
      <Modal visible={visible} onClose={onClose} title="Ask a Question">
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </Modal>
    );
  }

  if (!assignment) return null;

  const handlePickFile = async () => {
    try {
      if (attachedFiles.length >= 3) {
        Alert.alert('Limit Reached', 'You can attach maximum 3 files.');
        return;
      }

      // Use DocumentPicker to allow all file types
      const result = await pick({
        type: [
          types.images, // jpg, png, gif, etc.
          types.pdf, // PDF files
          types.doc, // Word documents
          types.docx, // Word documents
          types.ppt, // PowerPoint
          types.pptx, // PowerPoint
          types.xls, // Excel
          types.xlsx, // Excel
          types.plainText, // Plain text
        ],
        allowMultiSelection: true,
        maxFiles: 3 - attachedFiles.length,
      });

      if (result.length > 0) {
        const newFiles = result.slice(0, 3 - attachedFiles.length);
        setAttachedFiles([...attachedFiles, ...newFiles]);
      }
    } catch (err: any) {
      // Check if user cancelled the picker
      if (
        err?.code === 'DOCUMENT_PICKER_CANCELED' ||
        err?.message?.includes('cancel')
      ) {
        return;
      }

      // Only show error for actual errors
      if (err?.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Failed to pick file');
        console.error('DocumentPicker Error:', err);
      }
    }
  };

  const removeAttachedFile = (index: number) => {
    const newFiles = attachedFiles.filter((_, i) => i !== index);
    setAttachedFiles(newFiles);
  };

  const handleSend = () => {
    if (subject.trim() && message.trim()) {
      onSend({
        subject,
        priority,
        category,
        message,
        attachments: attachedFiles,
      });
      // Reset form
      setSubject('');
      setPriority(PRIORITIES[1].value);
      setCategory(CATEGORIES[0].value);
      setMessage('');
      setAttachedFiles([]);
      onClose();
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Ask a Question">
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.modalContent}
      >
        {/* Header with Icon */}
        <View style={styles.headerSection}>
          <Icon name="message-circle" size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>Ask a Question</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Ask about: {(assignment as any)?.title || 'Untitled Assignment'} •{' '}
          {(assignment as any)?.class_model?.name ||
            (assignment as any)?.subject ||
            (assignment as any)?.class ||
            'General'}{' '}
          •{' '}
          {(assignment as any)?.tutor?.user?.name ||
            (assignment as any)?.tutor_name ||
            (assignment as any)?.instructor ||
            'Instructor'}
        </Text>

        {/* Subject Input */}
        <Input
          label="Subject"
          placeholder="Brief subject line..."
          value={subject}
          onChangeText={setSubject}
        />

        {/* Priority Dropdown */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Priority</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.priorityScroll}
          >
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.priorityOption,
                  priority === p.value && styles.priorityOptionActive,
                ]}
                onPress={() => setPriority(p.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.priorityOptionText,
                    priority === p.value && styles.priorityOptionTextActive,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Priority Badge Display */}
        <View style={styles.priorityBadgeContainer}>
          <Text style={styles.label}>Priority:</Text>
          <View
            style={[
              styles.priorityBadge,
              (priority === 'high' || priority === 'urgent') && styles.priorityBadgeHigh,
            ]}
          >
            <Text style={styles.priorityBadgeText}>
              {PRIORITIES.find((p) => p.value === priority)?.label.toLowerCase() || 'medium'}
            </Text>
          </View>
        </View>

        {/* Category Dropdown */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.categoryDropdown}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryDropdownText}>
              {CATEGORIES.find((cat) => cat.value === category)?.label || 'Assignment Help'}
            </Text>
            <Icon
              name={showCategoryDropdown ? 'chevron-down' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {showCategoryDropdown && (
            <View style={styles.categoryDropdownList}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryOption,
                    category === cat.value && styles.categoryOptionActive,
                  ]}
                  onPress={() => {
                    setCategory(cat.value);
                    setShowCategoryDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  {category === cat.value && (
                    <Icon name="check" size={16} color={colors.primary} />
                  )}
                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === cat.value && styles.categoryOptionTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Attachments */}
        <View style={styles.attachmentsContainer}>
          <Text style={styles.label}>Attachments (Optional)</Text>
          <View style={styles.attachmentsRow}>
            <TouchableOpacity
              style={styles.attachButton}
              activeOpacity={0.7}
              onPress={handlePickFile}
            >
              <Icon name="upload" size={18} color={colors.primary} />
              <Text style={styles.attachButtonText}>Attach Files</Text>
            </TouchableOpacity>
            <Text style={styles.attachLimitText}>
              {attachedFiles.length}/3 files attached
            </Text>
          </View>

          {/* Attached Files List */}
          {attachedFiles.length > 0 && (
            <View style={styles.attachedFilesList}>
              {attachedFiles.map((file, index) => (
                <View key={index} style={styles.attachedFileItem}>
                  <Icon name="file" size={16} color={colors.primary} />
                  <Text style={styles.attachedFileName} numberOfLines={1}>
                    {file.name || `File ${index + 1}`}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeFileButton}
                    onPress={() => removeAttachedFile(index)}
                    activeOpacity={0.7}
                  >
                    <Icon name="x" size={14} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Message Input */}
        <Input
          label="Question"
          placeholder="Enter your question here..."
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={6}
          containerStyle={styles.messageInput}
        />

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="outline"
            style={styles.cancelButton}
          />
          <Button
            title="Send Question"
            onPress={handleSend}
            variant="primary"
            style={styles.sendButton}
            disabled={!subject.trim() || !message.trim()}
          />
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    paddingBottom: spacing.lg,
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
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 18,
    includeFontPadding: false,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    includeFontPadding: false,
  },
  dropdownContainer: {
    marginBottom: spacing.lg,
  },
  priorityScroll: {
    marginTop: spacing.xs,
  },
  priorityOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
  },
  priorityOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  priorityOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    includeFontPadding: false,
  },
  priorityOptionTextActive: {
    color: colors.textInverse,
  },
  priorityBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  priorityBadge: {
    backgroundColor: colors.info,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  priorityBadgeHigh: {
    backgroundColor: colors.error,
  },
  priorityBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textInverse,
    includeFontPadding: false,
    textTransform: 'lowercase',
  },
  categoryDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    backgroundColor: colors.background,
    marginTop: spacing.xs,
  },
  categoryDropdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    includeFontPadding: false,
  },
  categoryDropdownList: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadows.sm,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  categoryOptionActive: {
    backgroundColor: colors.primaryLight + '20',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    includeFontPadding: false,
  },
  categoryOptionTextActive: {
    fontWeight: '600',
    color: colors.primary,
  },
  attachmentsContainer: {
    marginBottom: spacing.lg,
  },
  attachmentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  attachButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    includeFontPadding: false,
  },
  attachLimitText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  messageInput: {
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    minWidth: 100,
  },
  sendButton: {
    minWidth: 150,
  },
  attachedFilesList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  attachedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  attachedFileName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    includeFontPadding: false,
  },
  removeFileButton: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.errorLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
});
