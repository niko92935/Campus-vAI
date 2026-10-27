import 'package:flutter/material.dart' hide Card, Badge;

import '../theme.dart';
import '../widgets.dart';

class HomeScreen extends StatelessWidget {
  final Map<String, dynamic> student;
  final List<dynamic> courses;
  final List<dynamic> notices;
  final Map<String, dynamic> texts;
  final void Function(String courseId) onOpenCourse;
  final void Function(String courseId, String lessonId) onOpenLesson;
  final void Function() onOpenCourses;
  final void Function() onOpenNotices;
  final void Function() onOpenProfile;
  const HomeScreen({
    super.key,
    required this.student,
    required this.courses,
    required this.notices,
    required this.texts,
    required this.onOpenCourse,
    required this.onOpenLesson,
    required this.onOpenCourses,
    required this.onOpenNotices,
    required this.onOpenProfile,
  });

  int _completedOf(List<dynamic> lessons) => lessons.where((l) => l['completed'] == true).length;

  @override
  Widget build(BuildContext context) {
    final firstName = (student['firstName'] ?? 'there').toString();
    int totalLessons = 0;
    int completedCount = 0;
    for (final course in courses) {
      final lessons = (course['lessons'] as List<dynamic>? ?? []);
      totalLessons += lessons.length;
      completedCount += _completedOf(lessons);
    }
    final headline = (texts['homeHeadline'] ?? 'Welcome back').toString();
    final sub = (texts['homeSub'] ?? '').toString();
    final unread = notices.where((n) => n['read'] != true).length;
    final pinned = notices.where((n) => n['pinned'] == true).toList();
    final latest = (pinned.isNotEmpty ? pinned : notices).take(1).toList();

    return Scaffold(
      backgroundColor: C.bg,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(22, 22, 22, 30),
          children: [
            // header
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('GOOD TO SEE YOU', style: T.eyebrow.copyWith(fontSize: 9)),
                      const SizedBox(height: 6),
                      Text(firstName, style: T.h2),
                    ],
                  ),
                ),
                const Icon(Icons.shield_outlined, size: 15, color: C.goldDeep),
                const SizedBox(width: 5),
                const Badge(label: 'ACTIVE'),
                const SizedBox(width: 10),
                InkWell(
                  onTap: onOpenProfile,
                  borderRadius: BorderRadius.circular(999),
                  child: Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: C.goldSoft,
                      border: Border.all(color: C.gold.withValues(alpha: 0.38), width: 1),
                    ),
                    alignment: Alignment.center,
                    child: Text((student['initials'] ?? '').toString(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: C.gold)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // momentum card (server-driven texts - spot check #1)
            Card(
              color: C.surfaceRaised,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('MOMENTUM', style: T.eyebrow.copyWith(fontSize: 9)),
                  const SizedBox(height: 10),
                  Text(headline, style: T.h1.copyWith(fontSize: 23)),
                  const SizedBox(height: 6),
                  if (sub.isNotEmpty) Text(sub, style: T.body),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      _MiniStat(value: '$completedCount of $totalLessons', label: 'LESSONS DONE', onTap: onOpenCourses),
                      const SizedBox(width: 9),
                      _MiniStat(value: '$unread', label: 'UNREAD NOTICES', onTap: onOpenNotices),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // continue learning
            Row(
              children: [
                Text('CONTINUE LEARNING', style: T.eyebrow.copyWith(fontSize: 9)),
                const Spacer(),
                TextButton(
                  onPressed: onOpenCourses,
                  child: Text('All courses', style: T.small.copyWith(color: C.gold, fontWeight: FontWeight.w700)),
                  style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero),
                ),
              ],
            ),
            const SizedBox(height: 10),
            if (courses.isEmpty)
              const Card(child: Text('Courses load from the school server as soon as it is reachable.', style: T.small)),
            ...courses.map((course) {
              final lessons = (course['lessons'] as List<dynamic>? ?? []);
              final done = _completedOf(lessons);
              final (:fg, :bg) = accentOf((course['accent'] ?? 'gold').toString());
              final nextLesson = lessons.firstWhere((l) => l['completed'] != true,
                  orElse: () => lessons.isNotEmpty ? lessons.last : null);
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: InkWell(
                  borderRadius: BorderRadius.circular(T.rLg),
                  onTap: nextLesson == null ? null : () => onOpenLesson(course['id'], nextLesson['id']),
                  child: Padding(
                    padding: const EdgeInsets.all(15),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(13),
                            color: bg,
                            border: Border.all(color: fg.withValues(alpha: 0.26), width: 1),
                          ),
                          alignment: Alignment.center,
                          child: Text((course['icon'] ?? '').toString(), style: const TextStyle(fontSize: 18)),
                        ),
                        const SizedBox(width: 13),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text((course['title'] ?? '').toString(), style: T.h3, maxLines: 1, overflow: TextOverflow.ellipsis),
                              const SizedBox(height: 4),
                              Text(
                                nextLesson == null ? 'All caught up' : 'Next: ${(nextLesson['title'] ?? '').toString()}',
                                style: T.tiny,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 8),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(999),
                                child: Container(
                                  height: 4,
                                  color: C.border,
                                  child: FractionallySizedBox(
                                    alignment: Alignment.centerLeft,
                                    widthFactor: lessons.isEmpty ? 0 : (done / lessons.length).clamp(0.0, 1.0),
                                    child: Container(color: fg),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        Text('$done/${lessons.length}', style: T.small.copyWith(fontWeight: FontWeight.w700, color: fg)),
                        const SizedBox(width: 6),
                        const Icon(Icons.chevron_right_rounded, size: 18, color: C.textDim),
                      ],
                    ),
                  ),
                ),
              );
            }),

            // notice preview
            const SizedBox(height: 6),
            Row(
              children: [
                Text('SCHOOL NOTICEBOARD', style: T.eyebrow.copyWith(fontSize: 9)),
                const Spacer(),
                TextButton(
                  onPressed: onOpenNotices,
                  child: Text('Open board', style: T.small.copyWith(color: C.gold, fontWeight: FontWeight.w700)),
                  style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero),
                ),
              ],
            ),
            const SizedBox(height: 10),
            if (latest.isEmpty)
              const Card(child: Text('Notices load from the school server as soon as it is reachable.', style: T.small)),
            ...latest.map((n) => Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(T.rLg),
                    onTap: () => onOpenNotices(),
                    child: Padding(
                      padding: const EdgeInsets.all(15),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(11),
                              color: C.blueSoft,
                              border: Border.all(color: C.blue.withValues(alpha: 0.24), width: 1),
                            ),
                            child: const Icon(Icons.campaign_rounded, size: 18, color: C.blue),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text((n['title'] ?? '').toString(), style: T.h3.copyWith(fontSize: 14.5), maxLines: 2, overflow: TextOverflow.ellipsis),
                                const SizedBox(height: 5),
                                Text((n['preview'] ?? '').toString(), style: T.tiny, maxLines: 2, overflow: TextOverflow.ellipsis),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                )),
          ],
        ),
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  final String value;
  final String label;
  final VoidCallback onTap;
  const _MiniStat({required this.value, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(T.rMd),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: C.surfaceAlt,
            borderRadius: BorderRadius.circular(T.rMd),
            border: Border.all(color: C.border, width: 1),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: T.h2.copyWith(fontSize: 17, color: C.goldBright)),
              const SizedBox(height: 3),
              Text(label, style: T.tiny.copyWith(fontSize: 8.5, letterSpacing: 1)),
            ],
          ),
        ),
      ),
    );
  }
}
