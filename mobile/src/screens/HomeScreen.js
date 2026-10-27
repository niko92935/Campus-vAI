import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Avatar,
  Badge,
  Card,
  IconTile,
  ProgressBar,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
  Sheet,
  StatTile,
} from '../components/UI';
import { accents, colors, fonts, radii } from '../theme';
import {
  LIVE_CLASS,
  SCHEDULE,
  getCourseProgress,
  getCourseStats,
  getNextLesson,
} from '../data';
import { formatDuration, getGreeting, getTodayLabel } from '../utils';

export default function HomeScreen({
  student,
  courses,
  notices,
  onOpenCourse,
  onOpenLesson,
  onOpenCourses,
  onOpenNotices,
  onOpenNotice,
  onOpenProfile,
  notify,
}) {
  const [liveOpen, setLiveOpen] = useState(false);
  const stats = getCourseStats(courses);
  const featured = courses.find((course) => course.id === 'math') || courses[0];
  const nextLesson = featured ? getNextLesson(featured) : null;
  const progress = featured ? getCourseProgress(featured) : 0;
  const unreadCount = notices.filter((notice) => !notice.read).length;
  const pinnedNotice = notices.find((notice) => notice.pinned) || notices[0];

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <View style={styles.brandGroup}>
            <View style={styles.logoMark}>
              <Text style={styles.logoLetter}>M</Text>
            </View>
            <View>
              <Text style={styles.brandName}>
                MindLink<Text style={styles.brandDot}>.AI</Text>
              </Text>
              <Text style={styles.brandSub}>Student Portal</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open notices"
              activeOpacity={0.75}
              onPress={onOpenNotices}
              style={styles.bellButton}
            >
              <Text style={styles.bellIcon}>🔔</Text>
              {unreadCount > 0 ? (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadCount}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              activeOpacity={0.8}
              onPress={onOpenProfile}
            >
              <Avatar initials={student.initials} size={38} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.greetingBlock}>
          <Text style={styles.dateLabel}>{getTodayLabel()}</Text>
          <Text style={styles.greeting}>
            {getGreeting()}, {student.firstName}
          </Text>
          <Text style={styles.greetingSub}>Let’s keep the momentum going today.</Text>
        </View>

        <Card style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroTop}>
            <Text style={styles.heroEyebrow}>TERM PROGRESS</Text>
            <Badge label="On track" color={colors.green} background={colors.greenSoft} />
          </View>
          <View style={styles.heroPercentRow}>
            <Text style={styles.heroPercent}>{stats.progress}%</Text>
            <Text style={styles.heroPercentLabel}>complete</Text>
          </View>
          <ProgressBar value={stats.progress} height={8} style={styles.heroBar} />
          <View style={styles.heroMetaRow}>
            <Text style={styles.heroMeta}>
              {stats.completedLessons} of {stats.totalLessons} lessons
            </Text>
            <Text style={styles.heroMeta}>Week 8 of 12</Text>
          </View>
        </Card>

        <View style={styles.statRow}>
          <StatTile icon="🔥" value={`${student.streak} days`} label="Streak" />
          <StatTile icon="⏱" value={`${student.hours}h`} label="Learned" accent={colors.blue} />
          <StatTile icon="🏅" value={`${student.averageScore}%`} label="Avg. score" accent={colors.green} />
        </View>

        <SectionHeader title="Continue learning" actionLabel="My courses →" onAction={onOpenCourses} style={styles.section} />
        {featured ? (
          <Card style={styles.continueCard}>
            <View style={styles.continueTop}>
              <IconTile accent={accents[featured.accent]}>{featured.icon}</IconTile>
              <View style={styles.continueText}>
                <Badge label="In progress" color={colors.gold} />
                <Text style={styles.continueTitle}>{featured.title}</Text>
                <Text style={styles.continueNext} numberOfLines={1}>
                  Up next · {nextLesson ? nextLesson.title : 'Course complete'}
                </Text>
              </View>
            </View>
            <ProgressBar value={progress} height={6} />
            <View style={styles.continueFooter}>
              <Text style={styles.continueMeta}>
                {Math.round((progress / 100) * featured.lessons.length)} of {featured.lessons.length} lessons
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.8}
                onPress={() => nextLesson && onOpenLesson(featured.id, nextLesson.id)}
                style={styles.continueAction}
              >
                <Text style={styles.continueActionText}>Continue</Text>
                <Text style={styles.continueActionArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : null}

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.88}
          onPress={() => setLiveOpen(true)}
          style={styles.liveCard}
        >
          <View style={styles.liveTop}>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTagText}>Live now</Text>
            </View>
            <Text style={styles.liveStudents}>{LIVE_CLASS.students} students</Text>
          </View>
          <Text style={styles.liveTitle}>{LIVE_CLASS.title}</Text>
          <Text style={styles.liveMeta}>
            {LIVE_CLASS.subject} · {LIVE_CLASS.tutor}
          </Text>
          <View style={styles.liveFooter}>
            <Text style={styles.liveTime}>{LIVE_CLASS.duration} · {LIVE_CLASS.startsAt}</Text>
            <SecondaryButton
              label="Join class"
              compact
              onPress={() => setLiveOpen(true)}
              style={styles.liveButton}
              textStyle={styles.liveButtonText}
            />
          </View>
        </TouchableOpacity>

        <SectionHeader title="Today’s plan" style={styles.section} />
        <Card style={styles.scheduleCard}>
          {SCHEDULE.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              accessibilityRole="button"
              activeOpacity={0.7}
              onPress={() =>
                item.status === 'live' ? setLiveOpen(true) : onOpenCourse(item.courseId)
              }
              style={[
                styles.scheduleRow,
                item.status === 'live' && styles.scheduleRowLive,
                index !== SCHEDULE.length - 1 && styles.scheduleRowBorder,
              ]}
            >
              <View style={styles.scheduleTime}>
                <Text style={[styles.scheduleTimeText, item.status === 'live' && styles.scheduleTimeLive]}>
                  {item.time}
                </Text>
                <Text style={styles.scheduleDuration}>{item.duration}</Text>
              </View>
              <View style={styles.scheduleBody}>
                <Text style={styles.scheduleTitle}>{item.title}</Text>
                <Text style={styles.scheduleMeta}>
                  {item.subject} · {item.tutor}
                </Text>
              </View>
              {item.status === 'live' ? (
                <Badge label="Live" color={colors.green} background={colors.greenSoft} />
              ) : (
                <Text style={styles.scheduleChevron}>›</Text>
              )}
            </TouchableOpacity>
          ))}
        </Card>

        <SectionHeader title="Your courses" actionLabel="View all →" onAction={onOpenCourses} style={styles.section} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalContent}
        >
          {courses.map((course) => {
            const courseProgress = getCourseProgress(course);
            return (
              <TouchableOpacity
                key={course.id}
                accessibilityRole="button"
                activeOpacity={0.85}
                onPress={() => onOpenCourse(course.id)}
                style={styles.miniCourse}
              >
                <View style={styles.miniCourseTop}>
                  <IconTile accent={accents[course.accent]} size={42}>
                    {course.icon}
                  </IconTile>
                  <Text style={styles.miniCourseCode}>{course.code}</Text>
                </View>
                <Text style={styles.miniCourseTitle} numberOfLines={2}>
                  {course.title}
                </Text>
                <ProgressBar value={courseProgress} height={4} />
                <View style={styles.miniCourseMeta}>
                  <Text style={styles.miniCoursePercent}>{courseProgress}%</Text>
                  <Text style={styles.miniCourseLessons}>{course.lessons.length} lessons</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {pinnedNotice ? (
          <>
            <SectionHeader title="Latest notice" style={styles.section} />
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.85}
              onPress={() => onOpenNotice(pinnedNotice.id)}
            >
              <Card style={styles.noticePreview}>
                <View style={styles.noticePreviewTop}>
                  <Badge label={pinnedNotice.category} />
                  <Text style={styles.noticePreviewDate}>{pinnedNotice.date}</Text>
                </View>
                <Text style={styles.noticePreviewTitle}>{pinnedNotice.title}</Text>
                <Text style={styles.noticePreviewBody} numberOfLines={2}>
                  {pinnedNotice.preview}
                </Text>
                <Text style={styles.noticePreviewAction}>Read announcement →</Text>
              </Card>
            </TouchableOpacity>
          </>
        ) : null}

        <View style={styles.footerNote}>
          <Text style={styles.footerSparkle}>✦</Text>
          <Text style={styles.footerText}>One lesson at a time. You’re doing great.</Text>
        </View>
      </ScrollView>

      <Sheet
        visible={liveOpen}
        title="Live classroom"
        onClose={() => setLiveOpen(false)}
        footer={
          <PrimaryButton
            label="Join live room"
            onPress={() => {
              setLiveOpen(false);
              notify('Joining the live classroom as Ayesha…');
            }}
          />
        }
      >
        <View style={styles.liveSheetHeader}>
          <Avatar initials={LIVE_CLASS.tutorInitials} size={48} />
          <View style={styles.liveSheetText}>
            <Badge label="Live now" color={colors.green} background={colors.greenSoft} />
            <Text style={styles.liveSheetTitle}>{LIVE_CLASS.title}</Text>
            <Text style={styles.liveSheetMeta}>
              {LIVE_CLASS.tutor} · {LIVE_CLASS.students} students
            </Text>
          </View>
        </View>
        <View style={styles.liveSheetStats}>
          <View style={styles.liveSheetStat}>
            <Text style={styles.liveSheetStatValue}>{LIVE_CLASS.duration}</Text>
            <Text style={styles.liveSheetStatLabel}>Duration</Text>
          </View>
          <View style={styles.liveSheetStat}>
            <Text style={styles.liveSheetStatValue}>4 min</Text>
            <Text style={styles.liveSheetStatLabel}>Started</Text>
          </View>
          <View style={styles.liveSheetStat}>
            <Text style={styles.liveSheetStatValue}>{LIVE_CLASS.students}</Text>
            <Text style={styles.liveSheetStatLabel}>Joined</Text>
          </View>
        </View>
        <Text style={styles.liveSheetSection}>In this session</Text>
        {LIVE_CLASS.agenda.map((item, index) => (
          <View key={item} style={styles.agendaRow}>
            <View style={styles.agendaNumber}>
              <Text style={styles.agendaNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.agendaText}>{item}</Text>
          </View>
        ))}
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.7}
          onPress={() => {
            setLiveOpen(false);
            notify('Class reminder added to your schedule.');
          }}
          style={styles.reminderRow}
        >
          <Text style={styles.reminderIcon}>🔔</Text>
          <Text style={styles.reminderText}>Remind me when the recording is ready</Text>
        </TouchableOpacity>
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
    paddingTop: 14,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  brandDot: {
    color: colors.gold,
  },
  brandSub: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 15,
  },
  bellBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.gold,
    borderWidth: 1.5,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    color: colors.bgDeep,
    fontSize: 8,
    fontWeight: '800',
  },
  greetingBlock: {
    marginTop: 24,
  },
  dateLabel: {
    ...fonts.eyebrow,
    color: colors.textDim,
    fontSize: 9,
    letterSpacing: 1.1,
  },
  greeting: {
    ...fonts.h1,
    marginTop: 5,
  },
  greetingSub: {
    ...fonts.small,
    marginTop: 4,
    fontSize: 12.5,
  },
  heroCard: {
    marginTop: 18,
    padding: 20,
    borderRadius: radii.xl,
    backgroundColor: '#14110D',
    borderColor: 'rgba(212,175,55,0.28)',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(212,175,55,0.045)',
    right: -70,
    top: -90,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroEyebrow: {
    ...fonts.eyebrow,
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  heroPercentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  heroPercent: {
    color: colors.gold,
    fontSize: 43,
    lineHeight: 46,
    fontWeight: '800',
    letterSpacing: -1.6,
  },
  heroPercentLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  heroBar: {
    marginTop: 12,
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },
  heroMeta: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '600',
  },
  statRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 12,
  },
  section: {
    marginTop: 24,
    marginBottom: 11,
  },
  continueCard: {
    gap: 13,
    padding: 15,
    backgroundColor: colors.surface,
  },
  continueTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  continueText: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  continueTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  continueNext: {
    color: colors.textMuted,
    fontSize: 11,
  },
  continueFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueMeta: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '600',
  },
  continueAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
  },
  continueActionText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  continueActionArrow: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '700',
  },
  liveCard: {
    marginTop: 12,
    backgroundColor: '#17130F',
    borderColor: 'rgba(212,175,55,0.32)',
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 17,
    gap: 4,
    overflow: 'hidden',
  },
  liveTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  liveTagText: {
    color: colors.green,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  liveStudents: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '600',
  },
  liveTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: 6,
  },
  liveMeta: {
    color: colors.textMuted,
    fontSize: 11,
  },
  liveFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  liveTime: {
    color: colors.textDim,
    fontSize: 9.5,
    fontWeight: '600',
  },
  liveButton: {
    minHeight: 34,
    paddingHorizontal: 13,
    backgroundColor: colors.gold,
    borderColor: colors.goldBright,
  },
  liveButtonText: {
    color: colors.bgDeep,
    fontSize: 11,
    fontWeight: '800',
  },
  scheduleCard: {
    padding: 0,
    overflow: 'hidden',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  scheduleRowLive: {
    backgroundColor: colors.goldFaint,
  },
  scheduleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scheduleTime: {
    width: 47,
    gap: 2,
  },
  scheduleTimeText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  scheduleTimeLive: {
    color: colors.gold,
  },
  scheduleDuration: {
    color: colors.textDim,
    fontSize: 8.5,
  },
  scheduleBody: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  scheduleTitle: {
    color: colors.text,
    fontSize: 12.5,
    fontWeight: '700',
  },
  scheduleMeta: {
    color: colors.textDim,
    fontSize: 9.5,
  },
  scheduleChevron: {
    color: colors.textDim,
    fontSize: 20,
  },
  horizontalScroll: {
    marginHorizontal: -20,
  },
  horizontalContent: {
    paddingHorizontal: 20,
    gap: 11,
  },
  miniCourse: {
    width: 190,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: 14,
    gap: 8,
  },
  miniCourseTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniCourseCode: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  miniCourseTitle: {
    color: colors.text,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '700',
    minHeight: 36,
  },
  miniCourseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniCoursePercent: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: '800',
  },
  miniCourseLessons: {
    color: colors.textDim,
    fontSize: 8.5,
  },
  noticePreview: {
    gap: 7,
    backgroundColor: colors.surface,
  },
  noticePreviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noticePreviewDate: {
    color: colors.textDim,
    fontSize: 9,
  },
  noticePreviewTitle: {
    color: colors.text,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '700',
  },
  noticePreviewBody: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  noticePreviewAction: {
    color: colors.gold,
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 2,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 28,
  },
  footerSparkle: {
    color: colors.gold,
    fontSize: 11,
  },
  footerText: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '600',
  },
  liveSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 4,
  },
  liveSheetText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  liveSheetTitle: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
  },
  liveSheetMeta: {
    color: colors.textMuted,
    fontSize: 11,
  },
  liveSheetStats: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  liveSheetStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 2,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  liveSheetStatValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  liveSheetStatLabel: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  liveSheetSection: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  agendaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  agendaNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agendaNumberText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
  },
  agendaText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 6,
  },
  reminderIcon: {
    fontSize: 13,
  },
  reminderText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});
