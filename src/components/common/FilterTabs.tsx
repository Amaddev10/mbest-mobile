/**
 * FilterTabs - Reusable horizontal filter tabs component with counts
 */

import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';

export interface FilterTabItem {
  key: string;
  label: string;
  icon: IconName;
  count: number;
}

interface FilterTabsProps {
  items: FilterTabItem[];
  selectedKey: string;
  onSelect: (key: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  items,
  selectedKey,
  onSelect,
  style,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsContainer}
      style={style}
    >
      {items.map((item) => {
        const isActive = item.key === selectedKey;

        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onSelect(item.key)}
            activeOpacity={0.7}
          >
            <Icon
              name={item.icon}
              size={16}
              color={isActive ? colors.textInverse : colors.textSecondary}
            />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {item.label}
            </Text>
            <View style={[styles.badge, isActive && styles.badgeActive]}>
              <Text
                style={[styles.badgeText, isActive && styles.badgeTextActive]}
              >
                {typeof item.count === 'number' && item.count > 9
                  ? '9+'
                  : item.count}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    includeFontPadding: false,
  },
  tabTextActive: {
    color: colors.textInverse,
  },
  badge: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: {
    backgroundColor: colors.textInverse,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  badgeTextActive: {
    color: colors.primary,
  },
});
