/**
 * StudentClassesScreen - MBEST Mobile App
 * Classes list for student
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { studentService } from '../../services/api/student';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, shadows } from '../../constants/spacing';
import { textStyles } from '../../constants/typography';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icon';

export const StudentClassesScreen: React.FC = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['studentClasses'],
    queryFn: () => studentService.getClasses(),
    enabled: !!token,
  });

  const enrollMutation = useMutation({
    mutationFn: (id: number) => studentService.enrollInClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentClasses'] });
      Alert.alert('Success', 'Enrolled in class successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to enroll');
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorText}>Error loading classes</Text>
          <Button title="Retry" onPress={() => refetch()} variant="primary" style={styles.retryButton} />
        </View>
      </View>
    );
  }

  // Handle nested API response structures (data.data.data for paginated responses)
  const rawClasses = (data as any)?.data?.data || (data as any)?.data || (Array.isArray(data) ? data : []) || [];
  const classes = Array.isArray(rawClasses) ? rawClasses : [];

  return (
    <View style={styles.container}>
      <Header title="Classes" showProfile={true} />
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={[
          styles.listContent,
          classes.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card variant="elevated" style={styles.classCard}>
            <View style={styles.classCardHeader}>
              <View style={styles.classIconContainer}>
                <Icon name="book" size={28} color={colors.textInverse} />
              </View>
              <View style={styles.classInfo}>
                <Text style={styles.className} numberOfLines={1}>
                  {item.name || 'Unnamed Class'}
                </Text>
                <Text style={styles.classSubject} numberOfLines={1}>
                  {item.category || item.subject || 'General'}
                </Text>
                {item.level && (
                  <Text style={styles.classLevel} numberOfLines={1}>
                    {item.level} • {item.code || ''}
                  </Text>
                )}
              </View>
            </View>
            
            <View style={styles.classDetails}>
              <View style={styles.detailRow}>
                <Icon name="user" size={16} color={colors.textSecondary} style={styles.detailIcon} />
                <Text style={styles.detailText} numberOfLines={1}>
                  {item.tutor?.user?.name || item.tutor_name || 'Tutor TBD'}
                </Text>
              </View>
              {(item.start_date || item.schedule) && (
                <View style={styles.detailRow}>
                  <Icon name="calendar" size={16} color={colors.textSecondary} style={styles.detailIcon} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {item.start_date 
                      ? new Date(item.start_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : item.schedule || 'Schedule TBD'}
                  </Text>
                </View>
              )}
              {item.enrolled && item.capacity && (
                <View style={styles.detailRow}>
                  <Icon name="users" size={16} color={colors.textSecondary} style={styles.detailIcon} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {item.enrolled}/{item.capacity} enrolled
                  </Text>
                </View>
              )}
            </View>

            <Button
              title="Enroll Now"
              onPress={() => enrollMutation.mutate(item.id)}
              loading={enrollMutation.isPending}
              variant="primary"
              size="medium"
              style={styles.enrollButton}
            />
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="book" size={72} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Classes Available</Text>
            <Text style={styles.emptyText}>
              There are no classes available at the moment.{'\n'}
              Check back later or contact your administrator.
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
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  classCard: {
    marginBottom: spacing.lg,
    padding: spacing.xl,
  },
  classCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  classIconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.sm,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    ...textStyles.h4,
    color: colors.text,
    marginBottom: spacing.xs,
    includeFontPadding: false,
  },
  classSubject: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
    includeFontPadding: false,
    marginBottom: spacing.xs,
  },
  classLevel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textTertiary,
    lineHeight: 16,
    includeFontPadding: false,
  },
  classDetails: {
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailIcon: {
    marginRight: spacing.sm,
  },
  detailText: {
    ...textStyles.body,
    color: colors.text,
    flex: 1,
    includeFontPadding: false,
  },
  enrollButton: {
    marginTop: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  errorText: {
    ...textStyles.h4,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.xl,
    includeFontPadding: false,
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

