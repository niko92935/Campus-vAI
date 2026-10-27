import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { colors, fonts, radii, shadow, softShadow } from '../theme';

export function Card({ children, style, raised = false }) {
  return <View style={[styles.card, raised && styles.cardRaised, style]}>{children}</View>;
}

export function Badge({ label, color = colors.gold, background = colors.goldSoft, dot = true, style }) {
  return (
    <View style={[styles.badge, { backgroundColor: background }, style]}>
      {dot ? <View style={[styles.badgeDot, { backgroundColor: color }]} /> : null}
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ value = 0, color = colors.gold, track = colors.surfaceRaised, height = 6, style }) {
  const width = `${Math.max(0, Math.min(100, value))}%`;
  return (
    <View style={[styles.progressTrack, { height, borderRadius: height / 2 }, style]}>
      <View style={[styles.progressFill, { width, backgroundColor: color, borderRadius: height / 2 }]} />
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled = false,
  loading = false,
  compact = false,
  style,
  textStyle,
}) {
  const inactive = disabled || loading;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.82}
      disabled={inactive}
      onPress={onPress}
      style={[
        styles.primaryButton,
        compact && styles.primaryButtonCompact,
        inactive && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.bgDeep} />
      ) : (
        <View style={styles.buttonInner}>
          {icon ? <Text style={styles.primaryButtonIcon}>{icon}</Text> : null}
          <Text style={[styles.primaryButtonText, textStyle]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function SecondaryButton({ label, onPress, icon, style, compact = false, textStyle }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.78}
      onPress={onPress}
      style={[styles.secondaryButton, compact && styles.secondaryButtonCompact, style]}
    >
      <View style={styles.buttonInner}>
        {icon ? <Text style={styles.secondaryButtonIcon}>{icon}</Text> : null}
        <Text style={[styles.secondaryButtonText, textStyle]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function TextButton({ label, onPress, color = colors.gold, style }) {
  return (
    <TouchableOpacity accessibilityRole="button" activeOpacity={0.7} onPress={onPress} style={style}>
      <Text style={[styles.textButton, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function IconButton({ children, onPress, style, accessibilityLabel }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.iconButton, style]}
    >
      {children}
    </TouchableOpacity>
  );
}

export function SectionHeader({ title, actionLabel, onAction, style }) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity accessibilityRole="button" activeOpacity={0.7} onPress={onAction}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function Avatar({ initials, size = 44, style, textStyle }) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.34 }, textStyle]}>{initials}</Text>
    </View>
  );
}

export function StatTile({ icon, value, label, accent = colors.gold, style }) {
  return (
    <View style={[styles.statTile, style]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function IconTile({ children, accent, size = 52, style }) {
  return (
    <View
      style={[
        styles.iconTile,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: accent ? accent.bg : colors.surfaceRaised,
          borderColor: accent ? accent.border : colors.border,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: size * 0.45, color: accent ? accent.fg : colors.gold }}>{children}</Text>
    </View>
  );
}

export function ScreenHeader({ title, onBack, right, style }) {
  return (
    <View style={[styles.screenHeader, style]}>
      <IconButton accessibilityLabel="Go back" onPress={onBack} style={styles.backButton}>
        <Text style={styles.backArrow}>←</Text>
      </IconButton>
      <Text style={styles.screenTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerRight}>{right}</View>
    </View>
  );
}

export function EmptyState({ icon = '*', title, message, actionLabel, onAction }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>{icon}</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {actionLabel && onAction ? (
        <SecondaryButton label={actionLabel} onPress={onAction} compact style={{ marginTop: 8 }} />
      ) : null}
    </View>
  );
}

export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

export function ListRow({ icon, title, subtitle, onPress, right, showChevron = true, style }) {
  const content = (
    <>
      {icon ? (
        <View style={styles.listIcon}>
          <Text style={styles.listIconText}>{icon}</Text>
        </View>
      ) : null}
      <View style={styles.listText}>
        <Text style={styles.listTitle}>{title}</Text>
        {subtitle ? <Text style={styles.listSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
      {onPress && showChevron ? <Text style={styles.chevron}>></Text> : null}
    </>
  );

  if (!onPress) {
    return <View style={[styles.listRow, style]}>{content}</View>;
  }

  return (
    <TouchableOpacity accessibilityRole="button" activeOpacity={0.72} onPress={onPress} style={[styles.listRow, style]}>
      {content}
    </TouchableOpacity>
  );
}

export function Sheet({ visible, title, onClose, children, footer }) {
  if (!visible) return null;

  return (
    <View style={styles.sheetLayer}>
      <TouchableOpacity
        accessibilityLabel="Close"
        activeOpacity={1}
        onPress={onClose}
        style={styles.sheetBackdrop}
      />
      <View style={styles.sheetCard}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <IconButton accessibilityLabel="Close" onPress={onClose} style={styles.sheetClose}>
            <Text style={styles.sheetCloseText}>×</Text>
          </IconButton>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        {footer ? <View style={styles.sheetFooter}>{footer}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 18,
  },
  cardRaised: {
    backgroundColor: colors.surfaceAlt,
    ...softShadow,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  badgeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  badgeText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  progressTrack: {
    width: '100%',
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: radii.md,
    backgroundColor: colors.gold,
    borderWidth: 1,
    borderColor: colors.goldBright,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    ...softShadow,
  },
  primaryButtonCompact: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  primaryButtonText: {
    color: colors.bgDeep,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  primaryButtonIcon: {
    color: colors.bgDeep,
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryButtonCompact: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButtonIcon: {
    color: colors.text,
    fontSize: 13,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  textButton: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    ...fonts.h3,
    fontSize: 15,
  },
  sectionAction: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  avatar: {
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.goldBright,
  },
  avatarText: {
    color: colors.bgDeep,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statTile: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 3,
  },
  statIcon: {
    fontSize: 15,
    marginBottom: 1,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 9,
    lineHeight: 12,
    color: colors.textDim,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  iconTile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  backButton: {
    width: 38,
    height: 38,
  },
  backArrow: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '600',
  },
  screenTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  headerRight: {
    minWidth: 38,
    alignItems: 'flex-end',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyIconText: {
    color: colors.gold,
    fontSize: 24,
  },
  emptyTitle: {
    ...fonts.h3,
    textAlign: 'center',
  },
  emptyMessage: {
    ...fonts.small,
    textAlign: 'center',
    maxWidth: 280,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  listIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listIconText: {
    fontSize: 16,
  },
  listText: {
    flex: 1,
    gap: 2,
  },
  listTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  listSubtitle: {
    color: colors.textDim,
    fontSize: 11,
    lineHeight: 15,
  },
  chevron: {
    color: colors.textDim,
    fontSize: 20,
    lineHeight: 22,
    marginLeft: 2,
  },
  sheetLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 60,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheetCard: {
    backgroundColor: colors.surfaceAlt,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.borderStrong,
    paddingTop: 8,
    maxHeight: '84%',
    ...shadow,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  sheetTitle: {
    ...fonts.h2,
    fontSize: 18,
  },
  sheetClose: {
    width: 32,
    height: 32,
    backgroundColor: colors.surface,
  },
  sheetCloseText: {
    color: colors.textMuted,
    fontSize: 20,
    lineHeight: 22,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    gap: 12,
  },
  sheetFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
});
