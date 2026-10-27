import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import {
  Badge,
  Card,
  EmptyState,
  IconTile,
  ProgressBar,
} from '../components/UI';
import { accents, colors, fonts, radii } from '../theme';
import { getCompletedCount, getCourseProgress, getNextLesson } from '../data';

const FILTERS = [
  { id: 'all', label: 'All courses' },
  { id: 'progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
];

export default function CoursesScreen({ courses, onOpenCourse }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const visibleCourses = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return courses.filter((course) => {
      const progress = getCourseProgress(course);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'completed' && progress === 100) ||
        (filter === 'progress' && progress < 100);
      const matchesQuery =
        !needle ||
        [course.title, course.code, course.category, course.instructor]
          .join(' ')
          .toLowerCase()
          .includes(needle);
      return matchesFilter && matchesQuery;
    });
  }, [courses, filter, query]);

  const totalLessons = courses.reduce((sum, course) => sum + course.lessons.length, 0);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>LEARNING LIBRARY</Text>
          <Text style={styles.title}>My Courses</Text>
          <Text style={styles.subtitle}>
            {courses.length} enrolled · {totalLessons} lessons this term
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search courses, topics, teachers..."
            placeholderTextColor={colors.textDim}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              activeOpacity={0.7}
              onPress={() => setQuery('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearText}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((item) => {
            const isActive = filter === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                accessibilityRole="button"
                activeOpacity={0.78}
                onPress={() => setFilter(item.id)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.listHeader}>
          <Text style={styles.listCount}>
            {visibleCourses.length} {visibleCourses.length === 1 ? 'course' : 'courses'}
          </Text>
          <Text style={styles.listSort}>By recent activity</Text>
        </View>

        {visibleCourses.length === 0 ? (
          <EmptyState
            icon="⌕"
            title="No courses found"
            message="Try another search term or clear the filter to see all of your enrolled courses."
            actionLabel="Clear filters"
            onAction={() => {
              setQuery('');
              setFilter('all');
            }}
          />
        ) : (
          visibleCourses.map((course) => {
            const progress = getCourseProgress(course);
            const completed = getCompletedCount(course);
            const nextLesson = getNextLesson(course);
            const isComplete = progress === 100;

            return (
              <TouchableOpacity
                key={course.id}
                accessibilityRole="button"
                activeOpacity={0.86}
                onPress={() => onOpenCourse(course.id)}
              >
                <Card style={styles.courseCard}>
                  <View style={styles.courseTop}>
                    <IconTile accent={accents[course.accent]} size={50}>
                      {course.icon}
                    </IconTile>
                    <View style={styles.courseHeading}>
                      <View style={styles.courseMetaTop}>
                        <Text style={styles.courseCode}>{course.code}</Text>
                        {isComplete ? (
                          <Badge label="Completed" color={colors.green} background={colors.greenSoft} />
                        ) : (
                          <Text style={styles.coursePercent}>{progress}%</Text>
                        )}
                      </View>
                      <Text style={styles.courseTitle}>{course.title}</Text>
                      <Text style={styles.courseInstructor}>{course.instructor}</Text>
                    </View>
                  </View>

                  <View style={styles.courseProgress}>
                    <ProgressBar
                      value={progress}
                      height={5}
                      color={isComplete ? colors.green : accents[course.accent].fg}
                    />
                    <View style={styles.courseProgressMeta}>
                      <Text style={styles.courseProgressText}>
                        {completed} of {course.lessons.length} lessons complete
                      </Text>
                      <Text style={styles.courseProgressText}>{course.schedule}</Text>
                    </View>
                  </View>

                  <View style={styles.courseFooter}>
                    <Text style={styles.courseNext} numberOfLines={1}>
                      {isComplete ? 'All lessons complete *' : `Next · ${nextLesson ? nextLesson.title : 'Review'}`}
                    </Text>
                    <Text style={styles.courseChevron}>></Text>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}

        <View style={styles.footerSpace} />
      </ScrollView>
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
    paddingBottom: 26,
  },
  header: {
    marginBottom: 18,
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
  subtitle: {
    ...fonts.small,
    marginTop: 4,
    fontSize: 12.5,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 13,
    height: 46,
  },
  searchIcon: {
    color: colors.textDim,
    fontSize: 19,
    lineHeight: 21,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 12.5,
    height: '100%',
    paddingVertical: 0,
  },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 18,
  },
  filterScroll: {
    marginHorizontal: -20,
    marginTop: 14,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.goldSoft,
    borderColor: 'rgba(212,175,55,0.36)',
  },
  filterText: {
    color: colors.textMuted,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  filterTextActive: {
    color: colors.gold,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  listCount: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  listSort: {
    color: colors.textDim,
    fontSize: 9.5,
  },
  courseCard: {
    gap: 13,
    marginBottom: 11,
    backgroundColor: colors.surface,
  },
  courseTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  courseHeading: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  courseMetaTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  courseCode: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  coursePercent: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
  },
  courseTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  courseInstructor: {
    color: colors.textMuted,
    fontSize: 10.5,
  },
  courseProgress: {
    gap: 7,
  },
  courseProgressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  courseProgressText: {
    color: colors.textDim,
    fontSize: 8.5,
    fontWeight: '600',
  },
  courseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    gap: 8,
  },
  courseNext: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  courseChevron: {
    color: colors.textDim,
    fontSize: 20,
    lineHeight: 20,
  },
  footerSpace: {
    height: 4,
  },
});
