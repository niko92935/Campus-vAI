import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import {
  Avatar,
  Badge,
  Card,
  ListRow,
  PrimaryButton,
  SecondaryButton,
  Sheet,
} from '../components/UI';
import { API_BASE_URL, APP_VERSION, checkForUpdate } from '../api';

import * as Updates from 'expo-updates';
import { accents, colors, fonts, radii } from '../theme';
import { getCompletedCount, getCourseProgress, getCourseStats } from '../data';
import { getTimeLabel } from '../utils';

function InfoLine({ label, value, last = false }) {
  return (
    <View style={[styles.infoLine, !last && styles.infoLineBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen({ student, courses, onSignOut, notify }) {
  const [notifications, setNotifications] = useState(true);
  const [autoUpdates, setAutoUpdates] = useState(true);
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [ota, setOta] = useState({
    state: 'idle',
    version: APP_VERSION,
    message: 'Check for the latest learning bundle from your school server.',
  });

  const stats = getCourseStats(courses);
  const completedLessons = courses.reduce((sum, course) => sum + getCompletedCount(course), 0);

  const otaBadge =
    ota.state === 'latest'
      ? { label: 'Up to date', color: colors.green, background: colors.greenSoft }
      : ota.state === 'available'
        ? { label: 'Update ready', color: colors.gold, background: colors.goldSoft }
        : ota.state === 'offline'
          ? { label: 'Offline', color: colors.orange, background: colors.orangeSoft }
          : { label: 'Ready', color: colors.textMuted, background: colors.surfaceRaised };

  const handleCheckUpdate = async () => {
    setChecking(true);
    setOta((previous) => ({
      ...previous,
      state: 'checking',
      message: 'Contacting the MindLink update server...',
    }));

    try {
      // 1) real OTA: expo-updates checks u.expo.dev and can apply a new JS bundle right away
      let nativeFailNote = '';
      try {
        const check = await Updates.checkForUpdateAsync();
        if (check.isAvailable) {
          const fetched = await Updates.fetchUpdateAsync();
          if (fetched.isNew) {
            await Updates.reloadAsync(); // restarts with the new bundle
            return;
          }
        }
      } catch (otaError) {
        void otaError; // native path unavailable (web / no config) - fall back below
        nativeFailNote = Updates.isEnabled
          ? ' (EAS update check failed - showing server status instead.)'
          : ' (Native updater not in this build - install the latest APK from the school office to enable OTA.)';
      }

      // 2) server status banner (informational)
      const result = await checkForUpdate(APP_VERSION);
      setLastChecked(getTimeLabel());
      if (result.updateAvailable) {
        setOta({
          state: 'available',
          version: result.version || APP_VERSION,
          message: result.message || 'A new learning bundle is ready to install.',
        });
        notify(`Update v${result.version || APP_VERSION} is ready to install.`);
      } else {
        setOta({
          state: 'latest',
          version: result.version || APP_VERSION,
          message: `You are running the latest bundle. Your courses are fully synced.${nativeFailNote}`,
        });
        notify(nativeFailNote ? 'No EAS update found. Native updater status is shown above.' : "You're on the latest version.");
      }
    } catch (error) {
      setLastChecked(getTimeLabel());
      setOta({
        state: 'offline',
        version: APP_VERSION,
        message: 'Update server unavailable. Offline lessons and saved progress still work.',
      });
      notify('Update server unavailable - running in offline mode.');
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = () => {
    setSheet(null);
    onSignOut();
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>MY ACCOUNT</Text>
            <Text style={styles.title}>Profile</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.75}
            onPress={() => setSheet('personal')}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.profileCard}>
          <View style={styles.profileGlow} />
          <View style={styles.avatarRing}>
            <Avatar initials={student.initials} size={68} />
          </View>
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.email}>{student.email}</Text>
          <View style={styles.profileTags}>
            <Badge label="Verified student" color={colors.green} background={colors.greenSoft} />
            <Badge label={student.program} color={colors.gold} background={colors.goldSoft} />
          </View>
          <Text style={styles.memberMeta}>
            {student.id} · Member since {student.joined}
          </Text>

          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{courses.length}</Text>
              <Text style={styles.profileStatLabel}>Courses</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{completedLessons}</Text>
              <Text style={styles.profileStatLabel}>Lessons done</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={[styles.profileStatValue, { color: colors.gold }]}>{student.streak}</Text>
              <Text style={styles.profileStatLabel}>Day streak</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <Card style={styles.menuCard}>
          <ListRow
            icon="👤"
            title="Personal details"
            subtitle="Name, email, student ID and cohort"
            onPress={() => setSheet('personal')}
          />
          <View style={styles.rowDivider} />
          <ListRow
            icon="🎓"
            title="Academic record"
            subtitle="Grades, progress and transcript"
            onPress={() => setSheet('academic')}
          />
          <View style={styles.rowDivider} />
          <ListRow
            icon="🔔"
            title="Push notifications"
            subtitle="Class reminders and new notices"
            right={
              <Switch
                value={notifications}
                onValueChange={(value) => {
                  setNotifications(value);
                  notify(value ? 'Push notifications enabled.' : 'Push notifications paused.');
                }}
                trackColor={{ false: colors.surfaceRaised, true: 'rgba(212,175,55,0.45)' }}
                thumbColor={notifications ? colors.gold : '#8A8177'}
                ios_backgroundColor={colors.surfaceRaised}
                style={styles.switch}
              />
            }
            showChevron={false}
          />
          <View style={styles.rowDivider} />
          <ListRow
            icon="⚡"
            title="Auto-update lessons"
            subtitle="Download new bundles over Wi-Fi"
            right={
              <Switch
                value={autoUpdates}
                onValueChange={(value) => {
                  setAutoUpdates(value);
                  notify(value ? 'Automatic updates enabled.' : 'Automatic updates disabled.');
                }}
                trackColor={{ false: colors.surfaceRaised, true: 'rgba(212,175,55,0.45)' }}
                thumbColor={autoUpdates ? colors.gold : '#8A8177'}
                ios_backgroundColor={colors.surfaceRaised}
                style={styles.switch}
              />
            }
            showChevron={false}
          />
        </Card>

        <Text style={styles.sectionLabel}>APP & SUPPORT</Text>

        <Card style={styles.updateCard}>
          <View style={styles.updateTop}>
            <View style={styles.updateHeading}>
              <View style={styles.updateIcon}>
                <Text style={styles.updateIconText}>⚡</Text>
              </View>
              <View>
                <Text style={styles.updateTitle}>App updates</Text>
                <Text style={styles.updateSub}>OTA bundle from MindLink server</Text>
              </View>
            </View>
            <Badge label={otaBadge.label} color={otaBadge.color} background={otaBadge.background} />
          </View>

          <View style={styles.versionRow}>
            <View>
              <Text style={styles.versionLabel}>INSTALLED VERSION</Text>
              <Text style={styles.versionValue}>v{ota.version}</Text>
            </View>
            <Text style={styles.versionDivider}>·</Text>
            <View style={styles.lastCheck}>
              <Text style={styles.versionLabel}>LAST CHECK</Text>
              <Text style={styles.lastCheckValue}>{lastChecked || 'Not checked yet'}</Text>
            </View>
          </View>

          <Text style={styles.updateMessage}>{ota.message}</Text>

          <PrimaryButton
            label={checking ? 'Checking for updates...' : 'Check for updates'}
            loading={checking}
            compact
            onPress={handleCheckUpdate}
            style={styles.updateButton}
          />

          <Text style={styles.serverLine} numberOfLines={1}>
            Server · {API_BASE_URL}
          </Text>
        </Card>

        <Card style={styles.menuCard}>
          <ListRow
            icon="💬"
            title="Help & support"
            subtitle="Messages, wellbeing and IT support"
            onPress={() => setSheet('help')}
          />
          <View style={styles.rowDivider} />
          <ListRow
            icon="🔒"
            title="Privacy & security"
            subtitle="Data controls and account safety"
            onPress={() => setSheet('privacy')}
          />
          <View style={styles.rowDivider} />
          <ListRow
            icon="ℹ"
            title="About MindLink"
            subtitle="Version, credits and legal"
            onPress={() => setSheet('about')}
          />
        </Card>

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.75}
          onPress={() => setSheet('signout')}
          style={styles.signOutButton}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <View style={styles.footerNote}>
          <Text style={styles.footerBrand}>MindLink<Text style={styles.footerDot}>.AI</Text></Text>
          <Text style={styles.footerMeta}>Student Portal v{APP_VERSION} · Learning without limits</Text>
        </View>
        <View style={styles.bottomSpace} />
      </ScrollView>

      <Sheet
        visible={sheet === 'personal'}
        title="Personal details"
        onClose={() => setSheet(null)}
        footer={
          <SecondaryButton
            label="Request a change"
            onPress={() => {
              setSheet(null);
              notify('Opening a request with the academic office...');
            }}
          />
        }
      >
        <Text style={styles.sheetIntro}>
          Your school office manages the information below. Contact them if anything needs updating.
        </Text>
        <View style={styles.infoCard}>
          <InfoLine label="Full name" value={student.name} />
          <InfoLine label="Email address" value={student.email} />
          <InfoLine label="Student ID" value={student.id} />
          <InfoLine label="Programme" value={student.program} />
          <InfoLine label="Cohort" value={student.cohort} />
          <InfoLine label="Enrolled" value={student.joined} last />
        </View>
      </Sheet>

      <Sheet
        visible={sheet === 'academic'}
        title="Academic record"
        onClose={() => setSheet(null)}
        footer={
          <SecondaryButton
            label="Download transcript"
            onPress={() => {
              setSheet(null);
              notify('Preparing your transcript download...');
            }}
          />
        }
      >
        <View style={styles.academicSummary}>
          <View style={styles.academicStat}>
            <Text style={styles.academicValue}>{student.averageScore}%</Text>
            <Text style={styles.academicLabel}>Term average</Text>
          </View>
          <View style={styles.academicStat}>
            <Text style={styles.academicValue}>{stats.completedLessons}/{stats.totalLessons}</Text>
            <Text style={styles.academicLabel}>Lessons complete</Text>
          </View>
          <View style={styles.academicStat}>
            <Text style={styles.academicValue}>#{student.rank}</Text>
            <Text style={styles.academicLabel}>Cohort rank</Text>
          </View>
        </View>
        {courses.map((course, index) => {
          const progress = getCourseProgress(course);
          const accent = accents[course.accent];
          return (
            <View
              key={course.id}
              style={[styles.recordRow, index !== courses.length - 1 && styles.recordRowBorder]}
            >
              <View style={[styles.recordDot, { backgroundColor: accent.fg }]} />
              <View style={styles.recordText}>
                <Text style={styles.recordTitle}>{course.title}</Text>
                <Text style={styles.recordMeta}>{course.code} · {course.instructor}</Text>
              </View>
              <Text style={[styles.recordValue, { color: accent.fg }]}>{progress}%</Text>
            </View>
          );
        })}
        <Text style={styles.sheetFootnote}>
          Grades are provisional until the end-of-term review is signed off.
        </Text>
      </Sheet>

      <Sheet
        visible={sheet === 'help'}
        title="Help & support"
        onClose={() => setSheet(null)}
      >
        <Text style={styles.sheetIntro}>
          We're here to help. Choose the team that best matches your question.
        </Text>
        <Card style={styles.sheetMenu}>
          <ListRow
            icon="🏫"
            title="Student office"
            subtitle="Enrolment, fees and general questions"
            onPress={() => {
              setSheet(null);
              notify('Opening a message to the student office...');
            }}
          />
          <View style={styles.rowDivider} />
          <ListRow
            icon="🛠"
            title="IT support"
            subtitle="Sign-in, app and device issues"
            onPress={() => {
              setSheet(null);
              notify('Opening IT support chat...');
            }}
          />
          <View style={styles.rowDivider} />
          <ListRow
            icon="💚"
            title="Wellbeing team"
            subtitle="Confidential support and counselling"
            onPress={() => {
              setSheet(null);
              notify('Opening a confidential wellbeing chat...');
            }}
          />
          <View style={styles.rowDivider} />
          <ListRow
            icon="📞"
            title="Support line"
            subtitle="24/7 · +880 9612 000 482"
            showChevron={false}
            right={<Text style={styles.callAction}>Call</Text>}
            onPress={() => notify('Calling the student support line...')}
          />
        </Card>
        <Text style={styles.sheetFootnote}>
          Average response time during school hours is under 15 minutes.
        </Text>
      </Sheet>

      <Sheet
        visible={sheet === 'privacy'}
        title="Privacy & security"
        onClose={() => setSheet(null)}
      >
        <View style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>Your data, protected</Text>
          <Text style={styles.privacyText}>
            MindLink stores only the information needed to run your learning experience. Course
            progress is linked to your student ID and is never sold or shared with advertisers.
          </Text>
        </View>
        <ListRow
          icon="🔐"
          title="Sign-in protection"
          subtitle="Your account is protected by your school identity"
          showChevron={false}
          right={<Badge label="Active" color={colors.green} background={colors.greenSoft} />}
        />
        <ListRow
          icon="📥"
          title="Download my data"
          subtitle="Request a copy of your activity"
          onPress={() => notify('Preparing your data export...')}
        />
        <ListRow
          icon="🗑"
          title="Delete my account"
          subtitle="Contact the student office to begin"
          onPress={() => notify('Account deletion requests are handled by the student office.')}
        />
        <Text style={styles.sheetFootnote}>
          Read the full student privacy policy at mindlink.ai/privacy.
        </Text>
      </Sheet>

      <Sheet
        visible={sheet === 'about'}
        title="About MindLink"
        onClose={() => setSheet(null)}
      >
        <View style={styles.aboutHero}>
          <View style={styles.aboutLogo}>
            <Text style={styles.aboutLogoText}>M</Text>
          </View>
          <Text style={styles.aboutName}>
            MindLink<Text style={styles.footerDot}>.AI</Text>
          </Text>
          <Text style={styles.aboutVersion}>Student Portal · Version {APP_VERSION}</Text>
        </View>
        <Text style={styles.aboutText}>
          MindLink is a connected learning platform for students, teachers and families. This app
          brings your courses, live classes, notices and progress into one calm, focused space.
        </Text>
        <View style={styles.aboutBullets}>
          <Text style={styles.aboutBullet}>* Adaptive learning paths</Text>
          <Text style={styles.aboutBullet}>* Live classes and recordings</Text>
          <Text style={styles.aboutBullet}>* Instant OTA updates from your school server</Text>
        </View>
        <Text style={styles.sheetFootnote}>
          © 2026 MindLink.AI · Built for curious minds.
        </Text>
      </Sheet>

      <Sheet
        visible={sheet === 'signout'}
        title="Sign out?"
        onClose={() => setSheet(null)}
        footer={
          <View style={styles.signOutActions}>
            <SecondaryButton
              label="Cancel"
              onPress={() => setSheet(null)}
              style={styles.signOutCancel}
            />
            <PrimaryButton
              label="Sign out"
              onPress={handleSignOut}
              style={styles.signOutConfirm}
              textStyle={styles.signOutConfirmText}
            />
          </View>
        }
      >
        <Text style={styles.sheetIntro}>
          You'll need to sign in again to access your courses and saved progress. Your work is
          already synced.
        </Text>
        <View style={styles.signedInAs}>
          <Avatar initials={student.initials} size={38} />
          <View>
            <Text style={styles.signedInName}>{student.name}</Text>
            <Text style={styles.signedInEmail}>{student.email}</Text>
          </View>
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  eyebrow: {
    ...fonts.eyebrow,
    color: colors.textDim,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  title: {
    ...fonts.h1,
    marginTop: 4,
  },
  editButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  editButtonText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
  },
  profileCard: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    gap: 4,
    overflow: 'hidden',
  },
  profileGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(212,175,55,0.06)',
    top: -140,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.38)',
    marginBottom: 6,
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  email: {
    color: colors.textMuted,
    fontSize: 11,
  },
  profileTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 5,
  },
  memberMeta: {
    color: colors.textDim,
    fontSize: 8.5,
    marginTop: 4,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 14,
    paddingTop: 13,
  },
  profileStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  profileStatValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  profileStatLabel: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  profileStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  sectionLabel: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginTop: 22,
    marginBottom: 9,
  },
  menuCard: {
    paddingVertical: 2,
    paddingHorizontal: 14,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 50,
  },
  switch: {
    transform: [{ scale: 0.8 }],
  },
  updateCard: {
    gap: 12,
    backgroundColor: '#15120E',
    borderColor: 'rgba(212,175,55,0.22)',
  },
  updateTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  updateHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },
  updateIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateIconText: {
    fontSize: 16,
  },
  updateTitle: {
    color: colors.text,
    fontSize: 13.5,
    fontWeight: '700',
  },
  updateSub: {
    color: colors.textDim,
    fontSize: 9,
    marginTop: 1,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 11,
  },
  versionLabel: {
    color: colors.textDim,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  versionValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  versionDivider: {
    color: colors.borderStrong,
    fontSize: 16,
    marginTop: 6,
  },
  lastCheck: {
    flex: 1,
  },
  lastCheckValue: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
  },
  updateMessage: {
    color: colors.textMuted,
    fontSize: 10.5,
    lineHeight: 15,
  },
  updateButton: {
    minHeight: 42,
  },
  serverLine: {
    color: colors.textDim,
    fontSize: 8,
    textAlign: 'center',
  },
  signOutButton: {
    marginTop: 20,
    height: 46,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.24)',
    backgroundColor: 'rgba(248,113,113,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: colors.red,
    fontSize: 12,
    fontWeight: '700',
  },
  footerNote: {
    alignItems: 'center',
    gap: 3,
    marginTop: 24,
  },
  footerBrand: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  footerDot: {
    color: colors.gold,
  },
  footerMeta: {
    color: colors.textDim,
    fontSize: 8.5,
  },
  bottomSpace: {
    height: 6,
  },
  sheetIntro: {
    color: colors.textMuted,
    fontSize: 11.5,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 13,
    marginTop: 2,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 11,
  },
  infoLineBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '600',
  },
  infoValue: {
    flex: 1,
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
  },
  academicSummary: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 12,
  },
  academicStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  academicValue: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '800',
  },
  academicLabel: {
    color: colors.textDim,
    fontSize: 7.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 10,
  },
  recordRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recordDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  recordText: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  recordTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  recordMeta: {
    color: colors.textDim,
    fontSize: 8.5,
  },
  recordValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  sheetFootnote: {
    color: colors.textDim,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },
  sheetMenu: {
    paddingVertical: 2,
    paddingHorizontal: 12,
  },
  callAction: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
  },
  privacyCard: {
    backgroundColor: colors.goldFaint,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    borderRadius: radii.md,
    padding: 14,
    gap: 5,
  },
  privacyTitle: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  privacyText: {
    color: colors.textMuted,
    fontSize: 10.5,
    lineHeight: 16,
  },
  aboutHero: {
    alignItems: 'center',
    paddingVertical: 6,
    gap: 3,
  },
  aboutLogo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  aboutLogoText: {
    color: colors.gold,
    fontSize: 28,
    fontWeight: '800',
  },
  aboutName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  aboutVersion: {
    color: colors.textDim,
    fontSize: 9.5,
  },
  aboutText: {
    color: colors.textMuted,
    fontSize: 11.5,
    lineHeight: 18,
  },
  aboutBullets: {
    gap: 6,
  },
  aboutBullet: {
    color: colors.textMuted,
    fontSize: 11,
  },
  signOutActions: {
    flexDirection: 'row',
    gap: 10,
  },
  signOutCancel: {
    flex: 1,
  },
  signOutConfirm: {
    flex: 1,
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  signOutConfirmText: {
    color: colors.white,
  },
  signedInAs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 12,
  },
  signedInName: {
    color: colors.text,
    fontSize: 11.5,
    fontWeight: '700',
  },
  signedInEmail: {
    color: colors.textDim,
    fontSize: 9.5,
    marginTop: 1,
  },
});
