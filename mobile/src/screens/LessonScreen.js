import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Avatar,
  Badge,
  Card,
  PrimaryButton,
  ScreenHeader,
  SecondaryButton,
  TextButton,
} from '../components/UI';
import { accents, colors, fonts, radii } from '../theme';

function getInstructorInitials(name) {
  return name
    .split(' ')
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function LessonScreen({
  course,
  lesson,
  onBack,
  onToggleComplete,
  onOpenLesson,
  notify,
}) {
  const accent = accents[course.accent];
  const index = course.lessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = index >= 0 ? course.lessons[index + 1] : null;
  const previousLesson = index > 0 ? course.lessons[index - 1] : null;
  const mediaGlyph = lesson.type === 'Video' ? '▶' : lesson.type === 'Quiz' ? '?' : 'Aa';

  const handleMediaPress = () => {
    if (lesson.type === 'Video') {
      notify('Opening the lesson player...');
    } else if (lesson.type === 'Quiz') {
      notify('Practice quiz is ready - opening your assessment...');
    } else {
      notify('Opening the reading view...');
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={course.code}
        onBack={onBack}
        right={<Text style={styles.headerCount}>{index + 1} / {course.lessons.length}</Text>}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.lessonHeading}>
          <View style={styles.badges}>
            <Badge label={lesson.type} color={accent.fg} background={accent.bg} />
            {lesson.completed ? (
              <Badge label="Completed" color={colors.green} background={colors.greenSoft} />
            ) : (
              <Text style={styles.durationLabel}>{lesson.duration} min</Text>
            )}
          </View>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonSub}>
            Lesson {index + 1} · {course.title}
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.9}
          onPress={handleMediaPress}
          style={[styles.media, { backgroundColor: accent.bg, borderColor: accent.border }]}
        >
          <View style={[styles.mediaOrb, { borderColor: accent.fg }]} />
          <View style={[styles.mediaOrbSmall, { borderColor: accent.fg }]} />
          <View style={styles.mediaCenter}>
            <View style={[styles.mediaBadge, { backgroundColor: accent.fg }]}>
              <Text style={styles.mediaBadgeText}>{mediaGlyph}</Text>
            </View>
            <Text style={styles.mediaTitle}>
              {lesson.type === 'Video'
                ? 'Lesson video'
                : lesson.type === 'Quiz'
                  ? 'Practice quiz'
                  : 'Guided reading'}
            </Text>
            <Text style={styles.mediaMeta}>
              {lesson.type} · {lesson.duration} min
            </Text>
          </View>
          <View style={styles.mediaFooter}>
            <Text style={styles.mediaFooterText}>Tap to open</Text>
            <View style={styles.mediaFooterDot} />
          </View>
        </TouchableOpacity>

        <Card style={styles.overviewCard}>
          <Text style={styles.sectionLabel}>OVERVIEW</Text>
          <Text style={styles.overviewText}>{lesson.summary}</Text>
        </Card>

        <View style={styles.takeawaysHeader}>
          <Text style={styles.sectionHeading}>Key takeaways</Text>
          <Text style={styles.takeawaysCount}>{lesson.takeaways.length} points</Text>
        </View>
        <View style={styles.takeaways}>
          {lesson.takeaways.map((takeaway, itemIndex) => (
            <View key={takeaway} style={styles.takeawayRow}>
              <View style={styles.takeawayCheck}>
                <Text style={styles.takeawayCheckText}>✓</Text>
              </View>
              <Text style={styles.takeawayText}>{takeaway}</Text>
              <Text style={styles.takeawayNumber}>0{itemIndex + 1}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeading}>Lesson resources</Text>
        <Card style={styles.resourcesCard}>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.75}
            onPress={() => notify('Downloading lesson slides...')}
            style={styles.resourceRow}
          >
            <View style={styles.resourceIcon}>
              <Text style={styles.resourceIconText}>▤</Text>
            </View>
            <View style={styles.resourceText}>
              <Text style={styles.resourceTitle}>Lesson slides</Text>
              <Text style={styles.resourceMeta}>PDF · 1.8 MB</Text>
            </View>
            <Text style={styles.resourceAction}>↓</Text>
          </TouchableOpacity>
          <View style={styles.resourceDivider} />
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.75}
            onPress={() => notify('Downloading practice worksheet...')}
            style={styles.resourceRow}
          >
            <View style={styles.resourceIcon}>
              <Text style={styles.resourceIconText}>✎</Text>
            </View>
            <View style={styles.resourceText}>
              <Text style={styles.resourceTitle}>Practice worksheet</Text>
              <Text style={styles.resourceMeta}>PDF · 620 KB</Text>
            </View>
            <Text style={styles.resourceAction}>↓</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.instructorCard}>
          <Avatar
            initials={getInstructorInitials(course.instructor)}
            size={38}
            style={styles.instructorAvatar}
          />
          <View style={styles.instructorText}>
            <Text style={styles.instructorName}>{course.instructor}</Text>
            <Text style={styles.instructorRole}>{course.instructorRole}</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.75}
            onPress={() => notify('Opening a message to your instructor...')}
            style={styles.askButton}
          >
            <Text style={styles.askButtonText}>Ask</Text>
          </TouchableOpacity>
        </Card>

        {nextLesson ? (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={() => onOpenLesson(course.id, nextLesson.id)}
            style={styles.nextLesson}
          >
            <View style={styles.nextLessonText}>
              <Text style={styles.nextLessonLabel}>UP NEXT</Text>
              <Text style={styles.nextLessonTitle} numberOfLines={1}>{nextLesson.title}</Text>
            </View>
            <Text style={styles.nextLessonArrow}>→</Text>
          </TouchableOpacity>
        ) : null}

        {previousLesson && !lesson.completed ? (
          <TextButton
            label={`← Previous: ${previousLesson.title}`}
            onPress={() => onOpenLesson(course.id, previousLesson.id)}
            color={colors.textMuted}
            style={styles.previousLink}
          />
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {lesson.completed ? (
          nextLesson ? (
            <PrimaryButton
              label="Next lesson"
              onPress={() => onOpenLesson(course.id, nextLesson.id)}
              icon="→"
            />
          ) : (
            <SecondaryButton label="Back to course" onPress={onBack} />
          )
        ) : (
          <PrimaryButton
            label="Mark lesson complete"
            icon="✓"
            onPress={() => {
              onToggleComplete(course.id, lesson.id);
              notify('Lesson complete - your progress has been updated.');
            }}
          />
        )}
        <View style={styles.footerMeta}>
          <Text style={styles.footerMetaText}>
            {lesson.completed ? 'Completed' : `${lesson.duration} min lesson`}
          </Text>
          <View style={[styles.footerDot, lesson.completed && styles.footerDotDone]} />
          <Text style={styles.footerMetaText}>
            {index + 1} of {course.lessons.length}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerCount: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  lessonHeading: {
    gap: 6,
    marginBottom: 14,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationLabel: {
    color: colors.textDim,
    fontSize: 9.5,
    fontWeight: '600',
  },
  lessonTitle: {
    ...fonts.h1,
    fontSize: 24,
    lineHeight: 30,
    marginTop: 2,
  },
  lessonSub: {
    color: colors.textMuted,
    fontSize: 11,
  },
  media: {
    height: 178,
    borderRadius: radii.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  mediaOrb: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    opacity: 0.14,
    right: -80,
    top: -80,
  },
  mediaOrbSmall: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    opacity: 0.1,
    left: -40,
    bottom: -60,
  },
  mediaCenter: {
    alignItems: 'center',
    gap: 5,
  },
  mediaBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  mediaBadgeText: {
    color: colors.bgDeep,
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 2,
  },
  mediaTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  mediaMeta: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  mediaFooter: {
    position: 'absolute',
    bottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mediaFooterText: {
    color: colors.textDim,
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  mediaFooterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  overviewCard: {
    gap: 7,
    padding: 16,
  },
  sectionLabel: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  overviewText: {
    color: colors.textMuted,
    fontSize: 12.5,
    lineHeight: 20,
  },
  takeawaysHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeading: {
    ...fonts.h3,
    fontSize: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  takeawaysCount: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 10,
  },
  takeaways: {
    gap: 8,
  },
  takeawayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 12,
  },
  takeawayCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  takeawayCheckText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
  },
  takeawayText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 11.5,
    lineHeight: 17,
  },
  takeawayNumber: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
  },
  resourcesCard: {
    padding: 0,
    overflow: 'hidden',
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
  },
  resourceIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceIconText: {
    color: colors.gold,
    fontSize: 15,
  },
  resourceText: {
    flex: 1,
    gap: 1,
  },
  resourceTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  resourceMeta: {
    color: colors.textDim,
    fontSize: 9,
  },
  resourceAction: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '700',
  },
  resourceDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 58,
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    padding: 13,
  },
  instructorAvatar: {
    backgroundColor: colors.surfaceRaised,
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
  askButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
  },
  askButtonText: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: '800',
  },
  nextLesson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    padding: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.28)',
    backgroundColor: colors.goldFaint,
  },
  nextLessonText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  nextLessonLabel: {
    color: colors.textDim,
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  nextLessonTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  nextLessonArrow: {
    color: colors.gold,
    fontSize: 17,
    fontWeight: '700',
  },
  previousLink: {
    alignSelf: 'center',
    marginTop: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#0D0B09',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 7,
  },
  footerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerMetaText: {
    color: colors.textDim,
    fontSize: 8.5,
    fontWeight: '600',
  },
  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textDim,
  },
  footerDotDone: {
    backgroundColor: colors.green,
  },
});
