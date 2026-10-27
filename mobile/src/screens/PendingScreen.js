import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, fonts, radii, softShadow } from '../theme';

export default function PendingScreen({ request, onBackToLogin }) {
  const initials = (request?.name || 'U')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  return (
    <View style={styles.screen}>
      <View style={styles.glowLarge} />
      <View style={styles.glowSmall} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.stepRow}>
          <View style={styles.stepDone}>
            <Text style={styles.stepDoneText}>✓</Text>
          </View>
          <View style={[styles.stepLine, styles.lineDone]} />
          <View style={styles.stepActive}>
            <Text style={styles.stepActiveText}>⏳</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepTodo}>
            <Text style={styles.stepTodoText}>✓</Text>
          </View>
        </View>

        <View style={styles.labels}>
          <Text style={[styles.stepLabel, styles.labelDone]}>Submitted</Text>
          <Text style={[styles.stepLabel, styles.labelActive]}>Under review</Text>
          <Text style={styles.stepLabel}>Approved</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.title}>Request submitted</Text>
          <Text style={styles.subtitle}>
            {request?.name ? `${request.name}, your` : 'Your'}{' '}
            {request?.role === 'teacher' ? 'teacher' : 'student'} account request is being reviewed by your school admin.
          </Text>

          {request?.email ? (
            <View style={styles.emailBox}>
              <Text style={styles.emailLabel}>REQUEST BY</Text>
              <Text style={styles.emailValue}>{request.email}</Text>
            </View>
          ) : null}

          <View style={styles.points}>
            <View style={styles.point}>
              <Text style={styles.pointIcon}>🪪</Text>
              <Text style={styles.pointText}>
                Your ID card (both sides) has been submitted for verification.
              </Text>
            </View>
            <View style={styles.point}>
              <Text style={styles.pointIcon}>🔔</Text>
              <Text style={styles.pointText}>
                Once approved, sign in with your email & password — nothing else to do.
              </Text>
            </View>
            <View style={styles.point}>
              <Text style={styles.pointIcon}>⏱️</Text>
              <Text style={styles.pointText}>
                This usually takes a few minutes during school hours.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.8}
            onPress={() => onBackToLogin && onBackToLogin()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Back to Sign in</Text>
            <Text style={styles.backArrow}>→</Text>
          </TouchableOpacity>

          <Text style={styles.note}>You can close the app and come back after approval.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  glowLarge: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(212,175,55,0.05)',
    top: -150,
    right: -140,
  },
  glowSmall: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(212,175,55,0.035)',
    bottom: -80,
    left: -100,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepDone: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.goldBright,
  },
  stepDoneText: {
    color: colors.bgDeep,
    fontSize: 12,
    fontWeight: '800',
  },
  stepActive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.5)',
  },
  stepActiveText: {
    fontSize: 11,
  },
  stepTodo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepTodoText: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '800',
  },
  stepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: colors.border,
  },
  lineDone: {
    backgroundColor: 'rgba(212,175,55,0.55)',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 26,
    paddingHorizontal: 2,
  },
  stepLabel: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  labelDone: {
    color: colors.gold,
  },
  labelActive: {
    color: colors.gold,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 22,
    alignItems: 'center',
    gap: 10,
    ...softShadow,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: '800',
  },
  title: {
    ...fonts.h2,
    fontSize: 20,
    color: colors.text,
    marginTop: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  emailBox: {
    alignSelf: 'stretch',
    backgroundColor: '#15120F',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  emailLabel: {
    color: colors.textDim,
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 1,
  },
  emailValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  points: {
    alignSelf: 'stretch',
    gap: 9,
    marginTop: 6,
  },
  point: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'flex-start',
  },
  pointIcon: {
    fontSize: 12,
    marginTop: 1,
  },
  pointText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 10.5,
    lineHeight: 15,
  },
  backButton: {
    alignSelf: 'stretch',
    height: 46,
    borderRadius: radii.md,
    backgroundColor: colors.gold,
    borderWidth: 1,
    borderColor: colors.goldBright,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    ...softShadow,
  },
  backButtonText: {
    color: colors.bgDeep,
    fontSize: 13,
    fontWeight: '800',
  },
  backArrow: {
    color: colors.bgDeep,
    fontSize: 14,
    fontWeight: '800',
  },
  note: {
    color: colors.textDim,
    fontSize: 9,
    textAlign: 'center',
  },
});
