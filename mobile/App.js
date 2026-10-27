import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import BottomNav from './src/components/BottomNav';
import CourseDetailScreen from './src/screens/CourseDetailScreen';
import CoursesScreen from './src/screens/CoursesScreen';
import HomeScreen from './src/screens/HomeScreen';
import LessonScreen from './src/screens/LessonScreen';
import LoginScreen from './src/screens/LoginScreen';
import NoticeDetailScreen from './src/screens/NoticeDetailScreen';
import NoticesScreen from './src/screens/NoticesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { COURSES, NOTICES, STUDENT } from './src/data';
import { colors, radii, shadow } from './src/theme';
import { getTimeLabel } from './src/utils';

function FallbackScreen({ onBack }) {
  return (
    <View style={styles.fallback}>
      <Text style={styles.fallbackTitle}>Something went missing</Text>
      <Text style={styles.fallbackText}>This item is no longer available.</Text>
      <Text style={styles.fallbackLink} onPress={onBack}>
        Go back
      </Text>
    </View>
  );
}

export default function App() {
  const { width } = useWindowDimensions();
  const showFrame = Platform.OS === 'web' && width > 560;

  const [session, setSession] = useState(STUDENT);
  const [activeTab, setActiveTab] = useState('home');
  const [stack, setStack] = useState([]);
  const [courses, setCourses] = useState(COURSES);
  const [notices, setNotices] = useState(NOTICES);

  const [toastMessage, setToastMessage] = useState('');
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const notify = useCallback(
    (message) => {
      setToastMessage(message);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastAnim.stopAnimation();
      toastAnim.setValue(0);
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: false,
      }).start();
      toastTimer.current = setTimeout(() => {
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: false,
        }).start(({ finished }) => {
          if (finished) setToastMessage('');
        });
      }, 2700);
    },
    [toastAnim]
  );

  const goTab = (tab) => {
    setActiveTab(tab);
    setStack([]);
  };

  const push = (screen, params = {}) => {
    setStack((previous) => [
      ...previous,
      { screen, params, key: `${screen}-${Date.now()}` },
    ]);
  };

  const pop = () => {
    setStack((previous) => previous.slice(0, -1));
  };

  const openCourse = (courseId) => push('course', { courseId });

  const openLesson = (courseId, lessonId) => {
    setStack((previous) => {
      const entry = {
        screen: 'lesson',
        params: { courseId, lessonId },
        key: `lesson-${courseId}-${lessonId}`,
      };
      const top = previous[previous.length - 1];
      if (top && top.screen === 'lesson') {
        return [...previous.slice(0, -1), entry];
      }
      return [...previous, entry];
    });
  };

  const openNotice = (noticeId) => {
    setNotices((previous) =>
      previous.map((notice) =>
        notice.id === noticeId ? { ...notice, read: true } : notice
      )
    );
    push('notice', { noticeId });
  };

  const markAllNoticesRead = () => {
    const unread = notices.filter((notice) => !notice.read).length;
    setNotices((previous) => previous.map((notice) => ({ ...notice, read: true })));
    if (unread > 0) {
      notify(`Marked ${unread} ${unread === 1 ? 'notice' : 'notices'} as read.`);
    }
  };

  const toggleLessonComplete = (courseId, lessonId) => {
    setCourses((previous) =>
      previous.map((course) => {
        if (course.id !== courseId) return course;
        return {
          ...course,
          lessons: course.lessons.map((lesson) =>
            lesson.id === lessonId ? { ...lesson, completed: !lesson.completed } : lesson
          ),
        };
      })
    );
  };

  const handleSignIn = () => {
    setSession(STUDENT);
    setStack([]);
    setActiveTab('home');
    notify(`Welcome back, ${STUDENT.firstName}.`);
  };

  const handleSignOut = () => {
    setSession(null);
    setStack([]);
    setActiveTab('home');
    notify('You have been signed out.');
  };

  const top = stack[stack.length - 1];
  const unreadCount = notices.filter((notice) => !notice.read).length;

  let content = null;
  let showNav = false;

  if (!session) {
    content = <LoginScreen onSignIn={handleSignIn} />;
  } else if (!top) {
    showNav = true;
    if (activeTab === 'home') {
      content = (
        <HomeScreen
          student={session}
          courses={courses}
          notices={notices}
          onOpenCourse={openCourse}
          onOpenLesson={openLesson}
          onOpenCourses={() => goTab('courses')}
          onOpenNotices={() => goTab('notices')}
          onOpenNotice={openNotice}
          onOpenProfile={() => goTab('profile')}
          notify={notify}
        />
      );
    } else if (activeTab === 'courses') {
      content = <CoursesScreen courses={courses} onOpenCourse={openCourse} />;
    } else if (activeTab === 'notices') {
      content = (
        <NoticesScreen
          notices={notices}
          onOpenNotice={openNotice}
          onMarkAllRead={markAllNoticesRead}
        />
      );
    } else {
      content = (
        <ProfileScreen
          student={session}
          courses={courses}
          onSignOut={handleSignOut}
          notify={notify}
        />
      );
    }
  } else if (top.screen === 'course') {
    const course = courses.find((item) => item.id === top.params.courseId);
    content = course ? (
      <CourseDetailScreen
        course={course}
        onBack={pop}
        onOpenLesson={openLesson}
      />
    ) : (
      <FallbackScreen onBack={pop} />
    );
  } else if (top.screen === 'lesson') {
    const course = courses.find((item) => item.id === top.params.courseId);
    const lesson = course
      ? course.lessons.find((item) => item.id === top.params.lessonId)
      : null;
    content = course && lesson ? (
      <LessonScreen
        course={course}
        lesson={lesson}
        onBack={pop}
        onToggleComplete={toggleLessonComplete}
        onOpenLesson={openLesson}
        notify={notify}
      />
    ) : (
      <FallbackScreen onBack={pop} />
    );
  } else if (top.screen === 'notice') {
    const notice = notices.find((item) => item.id === top.params.noticeId);
    content = notice ? (
      <NoticeDetailScreen notice={notice} onBack={pop} notify={notify} />
    ) : (
      <FallbackScreen onBack={pop} />
    );
  }

  const toastTranslate = toastAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });

  return (
    <View style={[styles.root, showFrame && styles.rootWeb]}>
      {showFrame ? (
        <>
          <View style={styles.ambientLarge} />
          <View style={styles.ambientSmall} />
        </>
      ) : null}

      <View style={[styles.frame, showFrame && styles.frameWeb]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        {showFrame ? (
          <View style={styles.webStatusBar}>
            <Text style={styles.webStatusTime}>{getTimeLabel()}</Text>
            <View style={styles.webStatusRight}>
              <View style={styles.signalBars}>
                <View style={[styles.signalBar, { height: 4 }]} />
                <View style={[styles.signalBar, { height: 6 }]} />
                <View style={[styles.signalBar, { height: 8 }]} />
              </View>
              <Text style={styles.webNetwork}>5G</Text>
              <View style={styles.battery}>
                <View style={styles.batteryFill} />
              </View>
            </View>
          </View>
        ) : null}

        <SafeAreaView style={styles.safe}>
          <View style={styles.content}>{content}</View>
          {showNav ? (
            <BottomNav active={activeTab} onChange={goTab} unread={unreadCount} />
          ) : null}

          {toastMessage ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.toast,
                showNav ? styles.toastWithNav : styles.toastNoNav,
                { opacity: toastAnim, transform: [{ translateY: toastTranslate }] },
              ]}
            >
              <View style={styles.toastDot} />
              <Text style={styles.toastText}>{toastMessage}</Text>
            </Animated.View>
          ) : null}
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rootWeb: {
    paddingVertical: 16,
  },
  ambientLarge: {
    position: 'absolute',
    width: 620,
    height: 620,
    borderRadius: 310,
    backgroundColor: 'rgba(212,175,55,0.025)',
    top: -280,
    left: -220,
  },
  ambientSmall: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: 'rgba(212,175,55,0.02)',
    bottom: -240,
    right: -160,
  },
  frame: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  frameWeb: {
    maxWidth: 460,
    maxHeight: 900,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 32,
    ...shadow,
  },
  webStatusBar: {
    height: 28,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
  },
  webStatusTime: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  webStatusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1.5,
    height: 8,
  },
  signalBar: {
    width: 2.5,
    borderRadius: 1,
    backgroundColor: colors.textMuted,
  },
  webNetwork: {
    color: colors.textMuted,
    fontSize: 7,
    fontWeight: '700',
  },
  battery: {
    width: 17,
    height: 8,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.textMuted,
    padding: 1.5,
    marginLeft: 1,
  },
  batteryFill: {
    flex: 1,
    backgroundColor: colors.textMuted,
    borderRadius: 0.5,
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 6,
  },
  fallbackTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  fallbackText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  fallbackLink: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  toast: {
    position: 'absolute',
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1C1712',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.34)',
    borderRadius: radii.md,
    paddingHorizontal: 13,
    paddingVertical: 11,
    zIndex: 80,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  toastWithNav: {
    bottom: 82,
  },
  toastNoNav: {
    bottom: 18,
  },
  toastDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
  toastText: {
    flex: 1,
    color: colors.text,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: '600',
  },
});
