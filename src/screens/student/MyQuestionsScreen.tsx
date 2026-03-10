/**
 * MyQuestionsScreen - Display and manage student questions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icon';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { studentService } from '../../services/api/student';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, shadows } from '../../constants/spacing';

type QuestionStatus = 'all' | 'pending' | 'answered' | 'closed';

interface Question {
  id: number;
  student_id: string;
  tutor_id: string;
  assignment_id: string;
  class_id: string;
  subject: string;
  question: string;
  priority: string;
  category: string;
  status: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
  tutor?: {
    user?: {
      name: string;
    };
  };
  assignment?: {
    title: string;
  };
  class_model?: {
    name: string;
  };
  attachments?: Array<{
    id: number;
    file_name: string;
    file_type: string;
  }>;
}

export const MyQuestionsScreen: React.FC = () => {
  const { token } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState<QuestionStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['studentQuestions'],
    queryFn: () => studentService.getQuestions(),
    enabled: !!token,
  });

  const questions: Question[] = data?.data?.data || [];

  const filteredQuestions = questions.filter((question) => {
    const matchesStatus =
      selectedStatus === 'all' || question.status === selectedStatus;
    const matchesSearch =
      searchQuery === '' ||
      question.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusCount = (status: QuestionStatus) => {
    if (status === 'all') return questions.length;
    return questions.filter((q) => q.status === status).length;
  };

  const renderFilterTab = (
    status: QuestionStatus,
    label: string,
    icon: string,
  ) => {
    const isActive = selectedStatus === status;
    const count = getStatusCount(status);

    return (
      <TouchableOpacity
        style={[styles.filterTab, isActive && styles.filterTabActive]}
        onPress={() => setSelectedStatus(status)}
        activeOpacity={0.7}
      >
        <Icon
          name={icon as any}
          size={16}
          color={isActive ? colors.primary : colors.textSecondary}
        />
        <Text
          style={[styles.filterTabText, isActive && styles.filterTabTextActive]}
        >
          {label}
        </Text>
        <View
          style={[
            styles.filterTabBadge,
            isActive && styles.filterTabBadgeActive,
          ]}
        >
          <Text
            style={[
              styles.filterTabBadgeText,
              isActive && styles.filterTabBadgeTextActive,
            ]}
          >
            {count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderQuestionCard = ({ item }: { item: Question }) => {
    const createdDate = new Date(item.created_at);
    const hasAttachments = item.attachments && item.attachments.length > 0;

    return (
      <TouchableOpacity style={styles.questionCard} activeOpacity={0.7}>
        <View style={styles.questionHeader}>
          <View style={styles.questionHeaderLeft}>
            <Icon name="message-circle" size={20} color={colors.primary} />
            <Text style={styles.questionSubject}>{item.subject}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              item.status === 'answered' && styles.statusBadgeAnswered,
              item.status === 'closed' && styles.statusBadgeClosed,
            ]}
          >
            <Text style={styles.statusBadgeText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.questionText} numberOfLines={2}>
          {item.question}
        </Text>

        <View style={styles.questionMeta}>
          <View style={styles.metaItem}>
            <Icon name="book" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>
              {item.class_model?.name || 'N/A'}
            </Text>
          </View>
          {item.assignment && (
            <View style={styles.metaItem}>
              <Icon name="file-text" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.assignment.title}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.questionFooter}>
          <View style={styles.footerLeft}>
            <Icon name="user" size={14} color={colors.textSecondary} />
            <Text style={styles.footerText}>
              {item.tutor?.user?.name || 'Tutor'}
            </Text>
          </View>
          <View style={styles.footerRight}>
            {hasAttachments && (
              <View style={styles.attachmentIndicator}>
                <Icon name="link" size={14} color={colors.textSecondary} />
                <Text style={styles.footerText}>
                  {item.attachments!.length}
                </Text>
              </View>
            )}
            <Text style={styles.footerText}>
              {createdDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="My Questions" showBack={true} />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>Error loading questions</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Questions" showBack={true} />

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          View and manage your questions to tutors
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions by subject or content..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.filterTabs}>
          {renderFilterTab('all', 'All Questions', 'file-text')}
          {/* {renderFilterTab('pending', 'Pending', 'clock')} */}
          {renderFilterTab('answered', 'Answered', 'check-circle')}
          {renderFilterTab('closed', 'Closed', 'x')}
        </View>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="message-circle" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No questions found.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredQuestions}
            renderItem={renderQuestionCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={false}
                onRefresh={refetch}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    includeFontPadding: false,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    includeFontPadding: false,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs / 2,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  filterTabTextActive: {
    color: colors.textInverse,
    fontWeight: '600',
  },
  filterTabBadge: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabBadgeActive: {
    backgroundColor: colors.textInverse,
  },
  filterTabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  filterTabBadgeTextActive: {
    color: colors.primary,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  questionHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  questionSubject: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    includeFontPadding: false,
  },
  statusBadge: {
    backgroundColor: colors.warningLight + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
  },
  statusBadgeAnswered: {
    backgroundColor: colors.success + '20',
  },
  statusBadgeClosed: {
    backgroundColor: colors.textSecondary + '20',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.warningLight,
    includeFontPadding: false,
    textTransform: 'lowercase',
  },
  questionText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
    includeFontPadding: false,
  },
  questionMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    minWidth: '45%',
  },
  metaText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  attachmentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: spacing.md,
    includeFontPadding: false,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
    marginTop: spacing.lg,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
