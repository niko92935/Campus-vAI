import 'package:flutter/material.dart' hide Card, Badge;

import '../theme.dart';
import '../widgets.dart';

class LessonScreen extends StatefulWidget {
  final Map<String, dynamic> lesson;
  final List<dynamic> siblings;
  final VoidCallback onBack;
  final void Function(String targetLessonId) onToggleComplete;
  final void Function(String lessonId) onOpenLesson;
  const LessonScreen({
    super.key,
    required this.lesson,
    required this.siblings,
    required this.onBack,
    required this.onToggleComplete,
    required this.onOpenLesson,
  });

  @override
  State<LessonScreen> createState() => _LessonScreenState();
}

class _LessonScreenState extends State<LessonScreen> {
  bool get completed => widget.lesson['completed'] == true;

  List<dynamic> get takeaways => (widget.lesson['takeaways'] as List<dynamic>? ?? []);

  Map<String, dynamic>? findSibling(int offset) {
    final list = widget.siblings;
    final idx = list.indexWhere((l) => l['id'] == widget.lesson['id']);
    final target = idx + offset;
    if (idx < 0 || target < 0 || target >= list.length) return null;
    return list[target] as Map<String, dynamic>;
  }

  @override
  Widget build(BuildContext context) {
    final prev = findSibling(-1);
    final next = findSibling(1);

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
                      onTap: widget.onBack,
                      borderRadius: BorderRadius.circular(9),
                      child: const Padding(
                        padding: EdgeInsets.all(4),
                        child: Icon(Icons.arrow_back_rounded, size: 19, color: C.textMuted),
                      ),
                    ),
                    const Spacer(),
                    const Badge(label: 'LESSON'),
                  ]),
                  const SizedBox(height: 14),
                  Text((widget.lesson['title'] ?? '').toString(), style: T.h2),
                  const SizedBox(height: 6),
                  Text('${(widget.lesson['type'] ?? '').toString()} · ${widget.lesson['duration']} min',
                      style: T.tiny.copyWith(fontSize: 11)),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(22, 20, 22, 30),
                children: [
                  Text((widget.lesson['summary'] ?? '').toString(), style: T.bodyText.copyWith(fontSize: 14.5, height: 1.65)),
                  if (takeaways.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    Text('KEY TAKEAWAYS', style: T.eyebrow.copyWith(fontSize: 9)),
                    const SizedBox(height: 10),
                    ...takeaways.map((t) => Card(
                          color: C.goldFaint,
                          margin: const EdgeInsets.only(bottom: 9),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.star_rounded, size: 14, color: C.gold),
                              const SizedBox(width: 9),
                              Expanded(child: Text(t.toString(), style: T.small.copyWith(color: C.text, height: 1.5))),
                            ],
                          ),
                        )),
                  ],
                  const SizedBox(height: 14),
                  // full-width toggle card
                  Material(
                    color: completed ? C.greenSoft : C.goldSoft,
                    borderRadius: BorderRadius.circular(T.rMd),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(T.rMd),
                      onTap: () => setState(() => widget.onToggleComplete(widget.lesson['id'])),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 13),
                        child: Row(
                          children: [
                            Icon(completed ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                                size: 19, color: completed ? C.green : C.gold),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                completed ? 'Marked as complete' : 'Mark this lesson as complete',
                                style: T.small.copyWith(
                                    color: C.text,
                                    fontWeight: FontWeight.w600),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  Row(
                    children: [
                      Expanded(
                        child: GhostButton(
                          label: prev == null ? 'Back' : 'Previous',
                          icon: Icons.arrow_back_rounded,
                          onPress: prev == null ? widget.onBack : () => widget.onOpenLesson(prev['id']),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: GhostButton(
                          label: next == null ? 'Up to date' : 'Next lesson',
                          icon: Icons.arrow_forward_rounded,
                          onPress: next == null ? null : () => widget.onOpenLesson(next['id']),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
