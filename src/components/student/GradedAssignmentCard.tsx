import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, shadows } from '../../constants/spacing';
import { Icon } from '../common/Icon';

interface GradedAssignmentCardProps {
  title: string;
  subject: string;
  scoreLabel: string;
  percentageLabel: string;
  dateLabel: string;
  onPress?: () => void;
}

export const GradedAssignmentCard: React.FC<GradedAssignmentCardProps> = ({
  title,
  subject,
  scoreLabel,
  percentageLabel,
  dateLabel,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          <Icon name="award" size={20} color={colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subject} numberOfLines={1}>
            {subject}
          </Text>
        </View>
        <View style={styles.percentagePill}>
          <Text style={styles.percentageText}>{percentageLabel}</Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <Text style={styles.scoreLabel}>Score:</Text>
        <Text style={styles.scoreValue}>{scoreLabel}</Text>
      </View>

      <View style={styles.footerRow}>
        <Icon name="calendar" size={14} color={colors.textSecondary} />
        <Text style={styles.dateText}>{dateLabel}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    includeFontPadding: false,
  },
  subject: {
    fontSize: 13,
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  percentagePill: {
    minWidth: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textInverse,
    includeFontPadding: false,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  scoreLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    includeFontPadding: false,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    fontSize: 13,
    color: colors.textSecondary,
    includeFontPadding: false,
  },
});
