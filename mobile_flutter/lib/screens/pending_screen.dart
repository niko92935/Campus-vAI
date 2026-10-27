import 'package:flutter/material.dart' hide Card, Badge;

import '../theme.dart';
import '../widgets.dart';

class PendingScreen extends StatefulWidget {
  final Map<String, dynamic>? request;
  final String emailNote;
  final VoidCallback onBackToLogin;
  const PendingScreen({
    super.key,
    required this.onBackToLogin,
    required this.emailNote,
    this.request,
  });

  @override
  State<PendingScreen> createState() => _PendingScreenState();
}

class _PendingScreenState extends State<PendingScreen> {
  @override
  Widget build(BuildContext context) {
    final req = widget.request ?? const {};
    final role = (req['role'] ?? 'student').toString() == 'teacher' ? 'Teacher' : 'Student';
    final name = (req['name'] ?? '').toString();
    final email = (req['email'] ?? '').toString();

    return Scaffold(
      backgroundColor: C.bg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(22, 40, 22, 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  color: C.goldSoft,
                  border: Border.all(color: C.gold.withValues(alpha: 0.38), width: 1),
                ),
                child: const Icon(Icons.hourglass_top_rounded, color: C.gold, size: 26),
              ),
              const SizedBox(height: 20),
              Text('Request received.', style: T.display.copyWith(fontSize: 27)),
              const SizedBox(height: 8),
              Text('$role request is waiting for the school admin to review it. This usually takes a school day.', style: T.body),
              if (name.isNotEmpty || email.isNotEmpty) ...[
                const SizedBox(height: 22),
                Card(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('YOUR REQUEST', style: T.eyebrow.copyWith(fontSize: 9)),
                      const SizedBox(height: 12),
                      _row('Name', name.isEmpty ? '-' : name),
                      const SizedBox(height: 8),
                      _row('Email', email.isEmpty ? '-' : email),
                      const SizedBox(height: 8),
                      _row('Role', role),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 18),
              Card(
                color: C.goldFaint,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.mark_email_unread_outlined, size: 16, color: C.gold),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(widget.emailNote, style: T.small.copyWith(color: C.text, height: 1.5)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              GhostButton(
                label: 'Back to sign in',
                onPress: widget.onBackToLogin,
                icon: Icons.arrow_back_rounded,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _row(String k, String v) => Row(
        children: [
          SizedBox(width: 56, child: Text(k, style: T.tiny)),
          Expanded(child: Text(v, style: T.small.copyWith(color: C.text))),
        ],
      );
}
