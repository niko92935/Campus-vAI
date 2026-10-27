import 'package:flutter/material.dart' hide Card, Badge;

import '../theme.dart';
import '../widgets.dart';

class NoticeDetailScreen extends StatelessWidget {
  final Map<String, dynamic> notice;
  final VoidCallback onBack;
  const NoticeDetailScreen({super.key, required this.notice, required this.onBack});

  @override
  Widget build(BuildContext context) {
    final bodyLines = (notice['body'] ?? '').toString().split('\n');

    return Scaffold(
      backgroundColor: C.bg,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(22, 18, 22, 18),
              decoration: BoxDecoration(
                color: C.surface,
                border: Border(bottom: BorderSide(color: C.border, width: 1)),
              ),
              child: Row(children: [
                InkWell(
                  onTap: onBack,
                  borderRadius: BorderRadius.circular(9),
                  child: const Padding(
                    padding: EdgeInsets.all(4),
                    child: Icon(Icons.arrow_back_rounded, size: 19, color: C.textMuted),
                  ),
                ),
                const Spacer(),
                Text('NOTICE', style: T.tiny.copyWith(fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 1.1)),
              ]),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(22, 22, 22, 30),
                children: [
                  Row(
                    children: [
                      const Badge(label: 'CATEGORY'),
                      const SizedBox(width: 8),
                      Badge(label: (notice['category'] ?? '').toString(), fg: C.blue, bg: C.blueSoft),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text((notice['title'] ?? '').toString(), style: T.h1.copyWith(fontSize: 24)),
                  const SizedBox(height: 10),
                  Text('${(notice['author'] ?? '').toString()} · ${(notice['date'] ?? '').toString()}',
                      style: T.tiny.copyWith(fontSize: 11)),
                  const SizedBox(height: 18),
                  ...bodyLines.map((line) {
                    if (line.trim().isEmpty) {
                      return const SizedBox(height: 10);
                    }
                    return Container(
                      alignment: Alignment.centerLeft,
                      margin: const EdgeInsets.only(bottom: 6),
                      child: Text(line, style: T.bodyText.copyWith(fontSize: 14, height: 1.6)),
                    );
                  }),
                  const SizedBox(height: 14),
                  const Card(
                    color: C.goldFaint,
                    child: Text('Posted by the school admin.',
                        style: TextStyle(fontSize: 11, height: 1.5, color: C.textDim)),
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
