import 'package:flutter/material.dart' hide Card, Badge;

import '../theme.dart';
import '../widgets.dart';

class CourseDetailScreen extends StatelessWidget {
  final Map<String, dynamic> course;
  final VoidCallback onBack;
  final void Function(String lessonId) onOpenLesson;
  const CourseDetailScreen({
    super.key,
    required this.course,
    required this.onBack,
    required this.onOpenLesson,
  });

  @override
  Widget build(BuildContext context) {
    final lessons = (course['lessons'] as List<dynamic>? ?? []);
    final done = lessons.where((l) => l['completed'] == true).length;
    final (:fg, :bg) = accentOf((course['accent'] ?? 'gold').toString());
    final totalMinutes = lessons.fold<int>(0, (sum, l) => sum + ((l['duration'] ?? 0) as num).toInt());
    final hours = (totalMinutes / 60).toStringAsFixed(1);

    return Scaffold(
      backgroundColor: C.bg,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(22, 18, 22, 20),
              decoration: BoxDecoration(
                color: C.surface,
                border: Border(bottom: BorderSide(color: C.border, width: 1)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    InkWell(
                      onTap: onBack,
                      borderRadius: BorderRadius.circular(9),
                      child: const Padding(
                        padding: EdgeInsets.all(4),
                        child: Icon(Icons.arrow_back_rounded, size: 19, color: C.textMuted),
                      ),
                    ),
                    const Spacer(),
                    Text('COURSE', style: T.tiny.copyWith(fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 1.1)),
                  ]),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Container(
                        width: 46,
                        height: 46,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(13),
                          color: bg,
                          border: Border.all(color: fg.withValues(alpha: 0.26), width: 1),
                        ),
                        alignment: Alignment.center,
                        child: Text((course['icon'] ?? '').toString(), style: const TextStyle(fontSize: 19)),
                      ),
                      const SizedBox(width: 13),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text((course['title'] ?? '').toString(), style: T.h2, maxLines: 2, overflow: TextOverflow.ellipsis),
                            const SizedBox(height: 3),
                            Text((course['code'] ?? '').toString(), style: T.tiny),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(children: [
                    const Icon(Icons.person_outline_rounded, size: 13, color: C.textDim),
                    const SizedBox(width: 5),
                    Expanded(
                      child: Text(
                        '${(course['instructor'] ?? '').toString()} · ${(course['schedule'] ?? '').toString()}',
                        style: T.tiny,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text('$hours h · $done/${lessons.length} lessons',
                        style: T.tiny.copyWith(fontWeight: FontWeight.w700, color: fg)),
                  ]),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(22, 18, 22, 30),
                children: [
                  Text((course['description'] ?? '').toString(), style: T.body),
                  const SizedBox(height: 18),
                  Text('LESSONS', style: T.eyebrow.copyWith(fontSize: 9)),
                  const SizedBox(height: 10),
                  ...lessons.asMap().entries.map((entry) {
                    final index = entry.key;
                    final lesson = entry.value as Map<String, dynamic>;
                    final isCompleted = lesson['completed'] == true;
                    return Card(
                      margin: const EdgeInsets.only(bottom: 10),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(T.rLg),
                        onTap: () => onOpenLesson(lesson['id'].toString()),
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Row(
                            children: [
                              Container(
                                width: 30,
                                height: 30,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: isCompleted ? C.greenSoft : C.surfaceAlt,
                                  border: Border.all(
                                      color: isCompleted ? C.green.withValues(alpha: 0.4) : C.border, width: 1),
                                ),
                                child: isCompleted
                                    ? const Icon(Icons.check_rounded, size: 15, color: C.green)
                                    : Center(
                                        child: Text('${index + 1}',
                                            style: T.tiny.copyWith(fontWeight: FontWeight.w800))),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text((lesson['title'] ?? '').toString(),
                                        style: T.h3.copyWith(fontSize: 14),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis),
                                    const SizedBox(height: 3),
                                    Text('${(lesson['type'] ?? '').toString()} · ${lesson['duration']} min',
                                        style: T.tiny),
                                  ],
                                ),
                              ),
                              const Icon(Icons.chevron_right_rounded, size: 17, color: C.textDim),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
