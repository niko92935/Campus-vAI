import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'api.dart';
import 'screens/course_detail_screen.dart';
import 'screens/courses_screen.dart';
import 'screens/home_screen.dart';
import 'screens/lesson_screen.dart';
import 'screens/login_screen.dart';
import 'screens/notice_detail_screen.dart';
import 'screens/notices_screen.dart';
import 'screens/pending_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/signup_screen.dart';
import 'theme.dart';
import 'widgets.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: C.bg,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: C.bgDeep,
    systemNavigationBarIconBrightness: Brightness.light,
  ));
  runApp(const MindLinkApp());
}

class MindLinkApp extends StatelessWidget {
  const MindLinkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MindLink.AI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: C.gold,
          brightness: Brightness.dark,
          surface: C.bg,
        ),
        scaffoldBackgroundColor: C.bgDeep,
        fontFamily: 'Roboto',
      ),
      home: const RootShell(),
    );
  }
}

enum AuthView { login, signup }

class RootShell extends StatefulWidget {
  const RootShell({super.key});

  @override
  State<RootShell> createState() => _RootShellState();
}

class _RootShellState extends State<RootShell> {
  Map<String, dynamic>? student;
  Map<String, dynamic>? pendingReq;
  Map<String, dynamic> texts = {};
  List<dynamic> courses = [];
  List<dynamic> notices = [];
  AuthView authView = AuthView.login;
  bool booting = true;
  bool contentLoaded = false;
  int tab = 0;

  @override
  void initState() {
    super.initState();
    _boot();
  }

  Future<void> _boot() async {
    // restore session
    final saved = await loadSession();
    if (mounted) {
      setState(() {
        if (saved?['status'] == 'pending') {
          pendingReq = (saved?['request'] ?? {'email': saved?['email']}) as Map<String, dynamic>;
        } else if (saved?['status'] == 'active') {
          student = toStudent(saved?['user']);
        }
        booting = false;
      });
    }
    // load server-driven content (courses/notices/texts) in the background
    final content = await fetchContent();
    if (!mounted) return;
    if (content.ok && content.data is Map) {
      final data = content.data as Map<String, dynamic>;
      setState(() {
        texts = Map<String, dynamic>.from(data['texts'] ?? {});
        courses = (data['courses'] ?? []) as List<dynamic>;
        notices = (data['notices'] ?? []) as List<dynamic>;
        contentLoaded = true;
      });
    }
  }

  void closeDetail() => Navigator.of(context).maybePop();
  void openCourse(String courseId) {
    final course = courses.cast<Map<String, dynamic>?>().firstWhere(
          (c) => c?['id'] == courseId,
          orElse: () => null,
        );
    if (course == null) return;
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => CourseDetailScreen(
        course: course,
        onBack: closeDetail,
        onOpenLesson: (lessonId) => openLesson(course, lessonId,
            (course['lessons'] ?? []) as List<dynamic>),
      ),
    ));
  }

  void openLesson(Map<String, dynamic> course, String lessonId, List<dynamic> siblings) {
    final lesson = siblings.cast<Map<String, dynamic>?>().firstWhere(
          (l) => l?['id'] == lessonId,
          orElse: () => null,
        );
    if (lesson == null) return;
    void toggle(String target) {
      setState(() {
        for (final l in siblings) {
          if (l['id'] == target) {
            l['completed'] = l['completed'] != true;
          }
        }
      });
    }

    void popToCourse() => Navigator.of(context).pop();

    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => LessonScreen(
        lesson: lesson,
        siblings: siblings,
        onBack: popToCourse,
        onToggleComplete: toggle,
        onOpenLesson: (id) {
          if (id == lesson['id']) return;
          Navigator.of(context).pop();
          openLesson(course, id, siblings);
        },
      ),
    ));
  }

  void openNotice(String noticeId) {
    final notice = notices.cast<Map<String, dynamic>?>().firstWhere(
          (n) => n?['id'] == noticeId,
          orElse: () => null,
        );
    if (notice == null) return;
    notice['read'] = true;
    setState(() {});
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => NoticeDetailScreen(notice: notice, onBack: closeDetail),
    ));
  }

  void markAllNoticesRead() {
    final unread = notices.where((n) => n['read'] != true).length;
    for (final n in notices) {
      n['read'] = true;
    }
    setState(() {});
    if (unread > 0) {
      showToast(context, 'Marked $unread ${unread == 1 ? 'notice' : 'notices'} as read.');
    }
  }

  void handleSignIn(Map<String, dynamic> result, Map<String, dynamic> s) {
    setState(() {
      student = s;
      pendingReq = null;
      authView = AuthView.login;
      tab = 0;
    });
  }

  Future<void> handleSignOut() async {
    await clearSession();
    if (!mounted) return;
    setState(() {
      student = null;
      pendingReq = null;
      authView = AuthView.login;
      tab = 0;
    });
    showToast(context, 'You have been signed out.');
  }

  void handleSignupSubmitted(Map<String, dynamic> request) {
    saveSession({'status': 'pending', 'request': request});
    setState(() => pendingReq = request);
  }

  void handleBackToLogin() {
    clearSession();
    setState(() {
      pendingReq = null;
      authView = AuthView.login;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (booting) {
      return Scaffold(
        backgroundColor: C.bg,
        body: Center(
          child: Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: C.goldSoft,
              border: Border.all(color: C.gold.withValues(alpha: 0.38), width: 1),
            ),
            alignment: Alignment.center,
            child: const Text('M', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: C.gold)),
          ),
        ),
      );
    }

    Widget content;
    bool showNav = false;

    if (student != null) {
      showNav = true;
      switch (tab) {
        case 0:
          content = HomeScreen(
            student: student!,
            courses: courses,
            notices: notices,
            texts: texts,
            onOpenCourse: openCourse,
            onOpenLesson: (courseId, lessonId) {
              final course = courses.cast<Map<String, dynamic>?>().firstWhere(
                    (c) => c?['id'] == courseId,
                    orElse: () => null,
                  );
              if (course == null) return;
              openLesson(course, lessonId, (course['lessons'] ?? []) as List<dynamic>);
            },
            onOpenCourses: () => setTab(1),
            onOpenNotices: () {
              setTab(2);
            },
            onOpenProfile: () => setTab(3),
          );
          break;
        case 1:
          content = CoursesScreen(courses: courses, onOpenCourse: openCourse);
          break;
        case 2:
          content = NoticesScreen(
            notices: notices,
            onOpenNotice: openNotice,
            onMarkAllRead: markAllNoticesRead,
          );
          break;
        default:
          content = ProfileScreen(
            student: student!,
            courses: courses,
            onSignOut: handleSignOut,
            notify: (m) => showToastWrapper(context, m),
          );
      }
    } else if (pendingReq != null) {
      content = PendingScreen(
        request: pendingReq,
        emailNote: (texts['pendingEmailNote'] ??
                'We will confirm you via email once the admin approves your account.')
            .toString(),
        onBackToLogin: handleBackToLogin,
      );
    } else if (authView == AuthView.signup) {
      content = SignUpScreen(
        onBack: () => setState(() => authView = AuthView.login),
        onSubmitted: handleSignupSubmitted,
        dialogTitle: (texts['signupDialogTitle'] ?? 'Request submitted').toString(),
        dialogBody: (texts['signupDialogBody'] ??
                'Thank you for signing up! We will confirm you via email once your account is approved.')
            .toString(),
      );
    } else {
      content = LoginScreen(
        onSignIn: handleSignIn,
        onGoSignUp: () {
          setState(() {
            pendingReq = null;
            authView = AuthView.signup;
          });
        },
      );
    }

    return Scaffold(
      backgroundColor: C.bgDeep,
      body: SafeArea(top: false, bottom: false, child: content),
      bottomNavigationBar: showNav ? buildNav() : null,
    );
  }

  void setTab(int value) {
    // close any pushed detail screens so tabs land on fresh lists
    final nav = Navigator.of(context);
    while (nav.canPop()) {
      nav.pop();
    }
    setState(() => tab = value);
  }

  void showToastWrapper(BuildContext context, String message) {
    if (mounted) showToast(context, message);
  }

  Widget buildNav() {
    Widget item(int index, IconData icon, String label, {int badge = 0}) {
      final selected = tab == index;
      final color = selected ? C.gold : C.textDim;
      return Expanded(
        child: InkWell(
          onTap: () => setTab(index),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  height: 20,
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Center(child: Icon(icon, size: 19, color: color)),
                      if (badge > 0)
                        Positioned(
                          top: -3,
                          right: 26,
                          child: Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(shape: BoxShape.circle, color: C.gold),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 5),
                Text(label,
                    style: TextStyle(
                        fontSize: 8.5,
                        height: 1.2,
                        fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
                        letterSpacing: 0.4,
                        color: color)),
                const SizedBox(height: 3),
                Container(width: 16, height: 2, color: selected ? C.gold : C.transparent0),
              ],
            ),
          ),
        ),
      );
    }

    final unread = notices.where((n) => n['read'] != true).length;

    return Container(
      decoration: const BoxDecoration(
        color: C.bg,
        border: Border(top: BorderSide(color: C.border, width: 1)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            item(0, Icons.home_outlined, 'HOME'),
            item(1, Icons.menu_book_outlined, 'COURSES'),
            item(2, Icons.notifications_none_rounded, 'NOTICES', badge: unread),
            item(3, Icons.account_circle_outlined, 'PROFILE'),
          ],
        ),
      ),
    );
  }
}
