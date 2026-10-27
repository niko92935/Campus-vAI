import 'package:flutter/material.dart' hide Card, Badge;

import '../theme.dart';
import '../widgets.dart';

class CoursesScreen extends StatelessWidget {
  final List<dynamic> courses;
  final void Function(String courseId) onOpenCourse;
  const CoursesScreen({super.key, required this.courses, required this.onOpenCourse});

  @override
  Widget build(BuildContext context) {
    final count = courses.length;
    int totalLessons = 0;
    for (final c in courses) totalLessons += ((c['lessons'] as List<dynamic>?) ?? []).length;

    return Scaffold(
      backgroundColor: C.bg,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(22, 22, 22, 30),
          children: [
            Text('Courses', style: T.display.copyWith(fontSize: 28)),
            const SizedBox(height: 7),
            Text('$count enrolled · $totalLessons lessons this term', style: T.body),
            const SizedBox(height: 20),
            if (courses.isEmpty)
              const Card(child: Text('Courses load from the school server as soon as it is reachable.', style: T.small)),
            ...courses.map((course) {
              final lessons = (course['lessons'] as List<dynamic>? ?? []);
              final done = lessons.where((l) => l['completed'] == true).length;
              final (:fg, :bg) = accentOf((course['accent'] ?? 'gold').toString());
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: InkWell(
                  borderRadius: BorderRadius.circular(T.rLg),
                  onTap: () => onOpenCourse(course['id']),
                  child: Padding(
                    padding: const EdgeInsets.all(15),
                    child: Row(
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
                              Text((course['title'] ?? '').toString(), style: T.h3),
                              const SizedBox(height: 4),
                              Text('${(course['schedule'] ?? '').toString()} · ${lessons.length} lessons',
                                  style: T.tiny, maxLines: 1, overflow: TextOverflow.ellipsis),
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
          ],
        ),
      ),
    );
  }
}
