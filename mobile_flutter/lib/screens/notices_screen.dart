import 'package:flutter/material.dart' hide Card, Badge;

import '../theme.dart';
import '../widgets.dart';

class NoticesScreen extends StatelessWidget {
  final List<dynamic> notices;
  final void Function(String noticeId) onOpenNotice;
  final VoidCallback onMarkAllRead;
  const NoticesScreen({
    super.key,
    required this.notices,
    required this.onOpenNotice,
    required this.onMarkAllRead,
  });

  ({Color fg, Color bg}) catColor(String? category) {
    switch (category) {
      case 'Academic':
        return (fg: C.blue, bg: C.blueSoft);
      case 'Events':
        return (fg: C.purple, bg: C.purpleSoft);
      case 'Exam':
        return (fg: C.orange, bg: C.orangeSoft);
      case 'Urgent':
        return (fg: C.red, bg: C.redSoft);
      default:
        return (fg: C.gold, bg: C.goldSoft);
    }
  }

  @override
  Widget build(BuildContext context) {
    final unread = notices.where((n) => n['read'] != true).length;
    final pinned = notices.where((n) => n['pinned'] == true);
    final normal = notices.where((n) => n['pinned'] != true);

    return Scaffold(
      backgroundColor: C.bg,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(22, 22, 22, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Notices', style: T.display.copyWith(fontSize: 28)),
                  const SizedBox(height: 7),
                  Row(
                    children: [
                      Expanded(child: Text('$totalLabel notices · $unread unread', style: T.body)),
                      if (unread > 0)
                        TextButton(
                          onPressed: onMarkAllRead,
                          child: Text('Mark all read', style: T.small.copyWith(color: C.gold, fontWeight: FontWeight.w700)),
                          style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero),
                        ),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(22, 18, 22, 30),
                children: [
                  if (notices.isEmpty)
                    const Card(child: Text('Notices load from the school server as soon as it is reachable.', style: T.small)),
                  if (pinned.isNotEmpty) ...[
                    Text('PINNED', style: T.eyebrow.copyWith(fontSize: 9)),
                    const SizedBox(height: 10),
                    ...pinned.map((n) => _noticeCard(n, true)),
                    const SizedBox(height: 16),
                  ],
                  ...normal.map((n) => _noticeCard(n, false)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String get totalLabel => notices.length.toString();

  Widget _noticeCard(dynamic n, bool isPinned) {
    final (:fg, :bg) = catColor(n['category']?.toString());
    final id = n['id'].toString();
    final unread = n['read'] != true;
    return Card(
      margin: const EdgeInsets.only(bottom: 11),
      color: unread ? C.surfaceRaised : C.surface,
      child: InkWell(
        borderRadius: BorderRadius.circular(T.rLg),
        onTap: () => onOpenNotice(id),
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
                  color: bg,
                  border: Border.all(color: fg.withValues(alpha: 0.24), width: 1),
                ),
                alignment: Alignment.center,
                child: Text((n['category'] ?? '?').toString().substring(0, 1),
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: fg)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text((n['category'] ?? '').toString(), style: T.tiny.copyWith(fontSize: 9.5, fontWeight: FontWeight.w800, letterSpacing: 0.8, color: fg)),
                        const SizedBox(width: 7),
                        if (unread) Container(width: 6, height: 6, decoration: const BoxDecoration(shape: BoxShape.circle, color: C.gold)),
                      ],
                    ),
                    const SizedBox(height: 5),
                    Text((n['title'] ?? '').toString(),
                        style: T.h3.copyWith(fontSize: 14.5, color: C.text),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 5),
                    Text((n['preview'] ?? '').toString(), style: T.tiny, maxLines: 2, overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 6),
                    Text('${(n['author'] ?? '').toString()} · ${(n['date'] ?? '').toString()}', style: T.tiny),
                  ],
                ),
              ),
              if (isPinned) const Icon(Icons.push_pin_rounded, size: 15, color: C.textDim),
            ],
          ),
        ),
      ),
    );
  }
}
