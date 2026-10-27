import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Avatar,
  Badge,
  Card,
  IconTile,
  ProgressBar,
  PrimaryButton,
  ScreenHeader,
} from '../components/UI';
import { accents, colors, fonts, radii } from '../theme';
import { getCompletedCount, getCourseProgress, getNextLesson } from '../data';

function getInstructorInitials(name) {
  return name
    .split(' ')
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function CourseDetailScreen({ course, onBack, onOpenLesson }) {
  const accent = accents[course.accent];
  const progress = getCourseProgress(course);
  const completed = getCompletedCount(course);
  const nextLesson = getNextLesson(course);
  const isComplete = progress === 100;
  const totalMinutes = course.lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
  const hours = (totalMinutes / 60).toFixed(1);
  const targetLesson = nextLesson || course.lessons[0];

  return (
    <View style={styles.screen}>
      <ScreenHeader title={course.code} onBack={onBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, { backgroundColor: accent.bg, borderColor: accent.border }]}>
          <View style={[styles.heroGlow, { backgroundColor: accent.fg }]} />
          <View style={styles.heroTop}>
            <IconTile accent={accent} size={58}>
              {course.icon}
            </IconTile>
            <View style={styles.heroHeading}>
              <Text style={[styles.heroCode, { color: accent.fg }]}>{course.code}</Text>
              <Text style={styles.heroTitle}>{course.title}</Text>
              <Text style={styles.heroMeta}>
                {course.category} · {course.schedule}
              </Text>
            </View>
          </View>
          <Text style={styles.heroDescription}>{course.description}</Text>
          <View style={styles.instructorRow}>
            <Avatar
              initials={getInstructorInitials(course.instructor)}
              size={36}
              style={styles.instructorAvatar}
            />
            <View style={styles.instructorText}>
              <Text style={styles.instructorName}>{course.instructor}</Text>
              <Text style={styles.instructorRole}>{course.instructorRole}</Text>
            </View>
            <Badge
              label={`★ ${course.rating}`}
              color={colors.gold}
              background={colors.goldSoft}
              dot={false}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{course.lessons.length}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{hours}h</Text>
            <Text style={styles.statLabel}>Content</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{course.learners}</Text>
            <Text style={styles.statLabel}>Learners</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{progress}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>

        <Card style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressTitle}>Your progress</Text>
            {isComplete ? (
              <Badge label="Completed" color={colors.green} background={colors.greenSoft} />
            ) : (
              <Text style={styles.progressPercent}>{progress}%</Text>
            )}
          </View>
          <ProgressBar value={progress} height={7} color={isComplete ? colors.green : accent.fg} />
          <Text style={styles.progressMeta}>
            {completed} of {course.lessons.length} lessons complete
          </Text>
          <View style={styles.nextBox}>
            <View style={styles.nextIcon}>
              <Text style={styles.nextIconText}>{isComplete ? '✓' : '→'}</Text>
            </View>
            <View style={styles.nextText}>
              <Text style={styles.nextLabel}>{isComplete ? 'COURSE COMPLETE' : 'UP NEXT'}</Text>
              <Text style={styles.nextTitle} numberOfLines={1}>
                {isComplete ? 'Review your favourite lesson' : targetLesson.title}
              </Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.75}
              onPress={() => onOpenLesson(course.id, targetLesson.id)}
              style={styles.nextAction}
            >
              <Text style={styles.nextActionText}>{isComplete ? 'Review' : 'Start'}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <View style={styles.lessonsHeader}>
          <Text style={styles.lessonsTitle}>Course lessons</Text>
          <Text style={styles.lessonsMeta}>
            {completed}/{course.lessons.length} done
          </Text>
        </View>

        <Card style={styles.lessonList}>
          {course.lessons.map((lesson, index) => {
            const isNext = nextLesson && nextLesson.id === lesson.id;
            return (
              <TouchableOpacity
                key={lesson.id}
                accessibilityRole="button"
                activeOpacity={0.75}
                onPress={() => onOpenLesson(course.id, lesson.id)}
                style={[
                  styles.lessonRow,
                  isNext && styles.lessonRowNext,
                  index !== course.lessons.length - 1 && styles.lessonRowBorder,
                ]}
              >
                <View
                  style={[
                    styles.lessonStep,
                    lesson.completed && styles.lessonStepDone,
                    isNext && styles.lessonStepNext,
                  ]}
                >
                  <Text
                    style={[
                      styles.lessonStepText,
                      lesson.completed && styles.lessonStepTextDone,
                      isNext && styles.lessonStepTextNext,
                    ]}
                  >
                    {lesson.completed ? '✓' : index + 1}
                  </Text>
                </View>
                <View style={styles.lessonText}>
                  <View style={styles.lessonTitleRow}>
                    <Text
                      style={[styles.lessonTitle, lesson.completed && styles.lessonTitleDone]}
                      numberOfLines={1}
                    >
                      {lesson.title}
                    </Text>
                    {isNext ? <Badge label="Next" color={colors.gold} /> : null}
                  </View>
                  <Text style={styles.lessonMeta}>
                    {lesson.type} · {lesson.duration} min
                  </Text>
                </View>
                <Text style={styles.lessonChevron}>›</Text>
              </TouchableOpacity>
            );
          })}
        </Card>

        <Text style={styles.footerNote}>
          Lessons unlock in sequence. Your progress syncs automatically.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerText}>
          <Text style={styles.footerLabel}>{isComplete ? 'COURSE COMPLETE' : 'UP NEXT'}</Text>
          <Text style={styles.footerTitle} numberOfLines={1}>
            {isComplete ? 'Revisit any lesson' : targetLesson.title}
          </Text>
        </View>
        <PrimaryButton
          label={isComplete ? 'Review' : 'Continue'}
          compact
          onPress={() => onOpenLesson(course.id, targetLesson.id)}
          style={styles.footerButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  hero: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.05,
    right: -70,
    top: -80,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroHeading: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  heroCode: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroMeta: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  heroDescription: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 12,
  },
  instructorAvatar: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.borderStrong,
  },
  instructorText: {
    flex: 1,
    gap: 1,
  },
  instructorName: {
    color: colors.text,
    fontSize: 11.5,
    fontWeight: '700',
  },
  instructorRole: {
    color: colors.textDim,
    fontSize: 9,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statLabel: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  progressCard: {
    marginTop: 12,
    gap: 8,
    padding: 16,
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  progressPercent: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '800',
  },
  progressMeta: {
    color: colors.textDim,
    fontSize: 9.5,
  },
  nextBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 10,
    marginTop: 4,
  },
  nextIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextIconText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '800',
  },
  nextText: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  nextLabel: {
    color: colors.textDim,
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  nextTitle: {
    color: colors.text,
    fontSize: 11.5,
    fontWeight: '700',
  },
  nextAction: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    backgroundColor: colors.goldSoft,
  },
  nextActionText: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: '800',
  },
  lessonsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 10,
  },
  lessonsTitle: {
    ...fonts.h3,
    fontSize: 15,
  },
  lessonsMeta: {
    color: colors.textDim,
    fontSize: 9.5,
    fontWeight: '600',
  },
  lessonList: {
    padding: 0,
    overflow: 'hidden',
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  lessonRowNext: {
    backgroundColor: colors.goldFaint,
  },
  lessonRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lessonStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonStepDone: {
    backgroundColor: colors.gold,
    borderColor: colors.goldBright,
  },
  lessonStepNext: {
    backgroundColor: colors.goldSoft,
    borderColor: colors.gold,
  },
  lessonStepText: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '800',
  },
  lessonStepTextDone: {
    color: colors.bgDeep,
  },
  lessonStepTextNext: {
    color: colors.gold,
  },
  lessonText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lessonTitle: {
    flexShrink: 1,
    color: colors.text,
    fontSize: 12.5,
    fontWeight: '700',
  },
  lessonTitleDone: {
    color: colors.textMuted,
  },
  lessonMeta: {
    color: colors.textDim,
    fontSize: 9,
  },
  lessonChevron: {
    color: colors.textDim,
    fontSize: 19,
    lineHeight: 20,
  },
  footerNote: {
    color: colors.textDim,
    fontSize: 9,
    lineHeight: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#0D0B09',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  footerText: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  footerLabel: {
    color: colors.textDim,
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  footerTitle: {
    color: colors.text,
    fontSize: 11.5,
    fontWeight: '700',
  },
  footerButton: {
    minWidth: 104,
  },
});
