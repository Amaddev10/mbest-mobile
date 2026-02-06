/**
 * AskQuestionModal - Modal for asking questions about assignments
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
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
  onSend: (question: { subject: string; priority: string; category: string; message: string }) => void;
}

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const CATEGORIES = [
  'Assignment Help',
  'Concept Clarification',
  'Technical Issue',
  'Grading Question',
  'General Question',
];

export const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  visible,
  onClose,
  assignmentId,
  assignment: assignmentProp,
  onSend,
}) => {
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Assignment Help');
  const [message, setMessage] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
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

  const handleSend = () => {
    if (subject.trim() && message.trim()) {
      onSend({ subject, priority, category, message });
      // Reset form
      setSubject('');
      setPriority('Medium');
      setCategory('Assignment Help');
      setMessage('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Ask a Question">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Icon */}
        <View style={styles.headerSection}>
          <Icon name="message-circle" size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>Ask a Question</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Ask about: {assignment.title} • {assignment.class_model?.name || assignment.subject || assignment.class || 'General'} • {assignment.tutor?.user?.name || assignment.tutor_name || assignment.instructor || 'Instructor'}
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.priorityScroll}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.priorityOption,
                  priority === p && styles.priorityOptionActive,
                ]}
                onPress={() => setPriority(p)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.priorityOptionText,
                    priority === p && styles.priorityOptionTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Priority Badge Display */}
        <View style={styles.priorityBadgeContainer}>
          <Text style={styles.label}>Priority:</Text>
          <View style={[styles.priorityBadge, priority === 'High' || priority === 'Urgent' ? styles.priorityBadgeHigh : {}]}>
            <Text style={styles.priorityBadgeText}>{priority.toLowerCase()}</Text>
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
            <Text style={styles.categoryDropdownText}>{category}</Text>
            <Icon 
              name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={colors.textSecondary} 
            />
          </TouchableOpacity>
          {showCategoryDropdown && (
            <View style={styles.categoryDropdownList}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    category === cat && styles.categoryOptionActive,
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryDropdown(false);
                  }}
                  activeOpacity={0.7}
                >
                  {category === cat && (
                    <Icon name="check" size={16} color={colors.primary} />
                  )}
                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === cat && styles.categoryOptionTextActive,
                    ]}
                  >
                    {cat}
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
            <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
              <Icon name="paperclip" size={18} color={colors.primary} />
              <Text style={styles.attachButtonText}>Attach Files</Text>
            </TouchableOpacity>
            <Text style={styles.attachLimitText}>Max 3 files (PDF, DOC, images)</Text>
          </View>
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
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
});

