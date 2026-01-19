/**
 * SettingsScreen
 * User preferences and app settings
 * Design: Flighty-inspired dark UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { ScreenProps } from '../../navigation/types';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { storageService } from '../../services/storage';
import { UserPreferences } from '../../types/storage';

type Props = ScreenProps<'Settings'>;

interface SettingRowProps {
  icon?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  label,
  value,
  onPress,
  showChevron = false,
  destructive = false,
}) => {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {icon && (
        <View style={[styles.settingIcon, destructive && styles.settingIconDestructive]}>
          <Text style={styles.settingIconText}>{icon}</Text>
        </View>
      )}
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, destructive && styles.settingLabelDestructive]}>
          {label}
        </Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {showChevron && <Text style={styles.chevron}>›</Text>}
      </View>
    </TouchableOpacity>
  );
};

interface SettingRowWithSwitchProps {
  icon?: string;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const SettingRowWithSwitch: React.FC<SettingRowWithSwitchProps> = ({
  icon,
  label,
  value,
  onValueChange,
}) => {
  return (
    <View style={styles.settingRow}>
      {icon && (
        <View style={styles.settingIcon}>
          <Text style={styles.settingIconText}>{icon}</Text>
        </View>
      )}
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.background.tertiary, true: colors.accent.primary }}
        thumbColor={colors.text.primary}
        ios_backgroundColor={colors.background.tertiary}
      />
    </View>
  );
};

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    distanceUnit: 'km',
    hapticFeedbackEnabled: true,
  });
  const [showDistanceUnitPicker, setShowDistanceUnitPicker] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await storageService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('[SettingsScreen] Failed to load preferences:', error);
    }
  };

  const handleDistanceUnitChange = async (unit: 'km' | 'mi') => {
    try {
      await storageService.setPreference('distanceUnit', unit);
      setPreferences(prev => ({ ...prev, distanceUnit: unit }));
      setShowDistanceUnitPicker(false);
    } catch (error) {
      console.error('[SettingsScreen] Failed to update distance unit:', error);
    }
  };

  const handleHapticFeedbackChange = async (enabled: boolean) => {
    try {
      await storageService.setPreference('hapticFeedbackEnabled', enabled);
      setPreferences(prev => ({ ...prev, hapticFeedbackEnabled: enabled }));
    } catch (error) {
      console.error('[SettingsScreen] Failed to update haptic feedback:', error);
    }
  };

  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Clear Search History',
      'Are you sure you want to clear all search history? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearHistory();
              Alert.alert('Success', 'Search history has been cleared.');
            } catch (error) {
              console.error('[SettingsScreen] Failed to clear history:', error);
              Alert.alert('Error', 'Failed to clear search history. Please try again.');
            }
          },
        },
      ],
    );
  }, []);

  const handleOpenPrivacyPolicy = useCallback(() => {
    Alert.alert(
      'Privacy Policy',
      'Privacy policy will be available at launch.\n\nFaceIt stores all data locally on your device. We do not collect or share your personal information.',
    );
  }, []);

  const handleOpenTerms = useCallback(() => {
    Alert.alert(
      'Terms of Service',
      'Terms of service will be available at launch.\n\nFaceIt is provided as-is for orientation purposes. Not intended for critical navigation.',
    );
  }, []);

  const handleOpenHelp = useCallback(() => {
    Alert.alert(
      'Help & Support',
      'Need help?\n\n1. Search for any location in the world\n2. Face the direction shown on the compass\n3. Use favorites to save important locations\n\nFor support, contact: support@faceit.app',
    );
  }, []);

  const getDistanceUnitLabel = (unit: 'km' | 'mi'): string => {
    return unit === 'km' ? 'Kilometers' : 'Miles';
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <View style={styles.backButtonInner}>
              <Text style={styles.backIcon}>←</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.settingGroup}>
              <SettingRow
                icon="📏"
                label="Distance Units"
                value={getDistanceUnitLabel(preferences.distanceUnit)}
                onPress={() => setShowDistanceUnitPicker(true)}
                showChevron
              />
              <View style={styles.settingDivider} />
              <SettingRowWithSwitch
                icon="📳"
                label="Haptic Feedback"
                value={preferences.hapticFeedbackEnabled}
                onValueChange={handleHapticFeedbackChange}
              />
            </View>
          </View>

          {/* Data Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data</Text>
            <View style={styles.settingGroup}>
              <SettingRow
                icon="🗑️"
                label="Clear Search History"
                onPress={handleClearHistory}
                showChevron
                destructive
              />
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.settingGroup}>
              <SettingRow
                icon="🔒"
                label="Privacy Policy"
                onPress={handleOpenPrivacyPolicy}
                showChevron
              />
              <View style={styles.settingDivider} />
              <SettingRow
                icon="📄"
                label="Terms of Service"
                onPress={handleOpenTerms}
                showChevron
              />
              <View style={styles.settingDivider} />
              <SettingRow icon="❓" label="Help & Support" onPress={handleOpenHelp} showChevron />
              <View style={styles.settingDivider} />
              <SettingRow icon="📱" label="Version" value="1.0.0" />
            </View>
          </View>

          {/* App Info Card */}
          <View style={styles.appInfoCard}>
            <LinearGradient
              colors={[colors.gradient.start + '15', colors.gradient.end + '15']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.appInfoGradient}
            >
              <LinearGradient
                colors={[colors.gradient.start, colors.gradient.end]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.appInfoBadge}
              >
                <Text style={styles.appInfoIcon}>◎</Text>
              </LinearGradient>
              <View style={styles.appInfoContent}>
                <Text style={styles.appInfoTitle}>FaceIt</Text>
                <Text style={styles.appInfoSubtitle}>Face any direction in the world</Text>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>

        {/* Distance Unit Picker Bottom Sheet */}
        <BottomSheet
          visible={showDistanceUnitPicker}
          onClose={() => setShowDistanceUnitPicker(false)}
        >
          <View style={styles.bottomSheetContent}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>Distance Units</Text>
            <Text style={styles.bottomSheetSubtitle}>
              Choose your preferred unit for distance display
            </Text>
            <View style={styles.pickerOptions}>
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  preferences.distanceUnit === 'km' && styles.pickerOptionActive,
                ]}
                onPress={() => handleDistanceUnitChange('km')}
              >
                <View style={styles.pickerOptionContent}>
                  <Text style={styles.pickerOptionIcon}>🌍</Text>
                  <View>
                    <Text
                      style={[
                        styles.pickerOptionLabel,
                        preferences.distanceUnit === 'km' && styles.pickerOptionLabelActive,
                      ]}
                    >
                      Kilometers
                    </Text>
                    <Text style={styles.pickerOptionHint}>Metric system</Text>
                  </View>
                </View>
                {preferences.distanceUnit === 'km' && (
                  <View style={styles.pickerCheckmark}>
                    <Text style={styles.pickerCheckmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pickerOption,
                  preferences.distanceUnit === 'mi' && styles.pickerOptionActive,
                ]}
                onPress={() => handleDistanceUnitChange('mi')}
              >
                <View style={styles.pickerOptionContent}>
                  <Text style={styles.pickerOptionIcon}>🇺🇸</Text>
                  <View>
                    <Text
                      style={[
                        styles.pickerOptionLabel,
                        preferences.distanceUnit === 'mi' && styles.pickerOptionLabelActive,
                      ]}
                    >
                      Miles
                    </Text>
                    <Text style={styles.pickerOptionHint}>Imperial system</Text>
                  </View>
                </View>
                {preferences.distanceUnit === 'mi' && (
                  <View style={styles.pickerCheckmark}>
                    <Text style={styles.pickerCheckmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheet>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: colors.text.primary,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  settingGroup: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingIconDestructive: {
    backgroundColor: colors.error.main + '20',
  },
  settingIconText: {
    fontSize: 18,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  settingLabelDestructive: {
    color: colors.error.main,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  settingValue: {
    fontSize: 15,
    color: colors.text.tertiary,
  },
  chevron: {
    fontSize: 22,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  settingDivider: {
    height: 1,
    backgroundColor: colors.background.tertiary,
    marginLeft: spacing.lg + 36 + spacing.md,
  },
  appInfoCard: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  appInfoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.accent.primary + '20',
  },
  appInfoBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appInfoIcon: {
    fontSize: 24,
    color: colors.background.primary,
  },
  appInfoContent: {
    flex: 1,
  },
  appInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  appInfoSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  bottomSheetContent: {
    padding: spacing.xl,
    paddingTop: spacing.md,
  },
  bottomSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.background.tertiary,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  bottomSheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  pickerOptions: {
    gap: spacing.sm,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pickerOptionActive: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.primary + '10',
  },
  pickerOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pickerOptionIcon: {
    fontSize: 28,
  },
  pickerOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 2,
  },
  pickerOptionLabelActive: {
    color: colors.text.primary,
  },
  pickerOptionHint: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  pickerCheckmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerCheckmarkText: {
    fontSize: 16,
    color: colors.background.primary,
    fontWeight: '700',
  },
});
