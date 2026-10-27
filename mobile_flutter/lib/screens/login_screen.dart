import 'package:flutter/material.dart' hide Card, Badge;

import '../api.dart';
import '../theme.dart';
import '../widgets.dart';

class LoginScreen extends StatefulWidget {
  final void Function(Map<String, dynamic> session, Map<String, dynamic> student) onSignIn;
  final VoidCallback onGoSignUp;
  const LoginScreen({super.key, required this.onSignIn, required this.onGoSignUp});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final email = TextEditingController();
  final password = TextEditingController();
  final remember = true;
  bool loading = false;

  @override
  void dispose() {
    email.dispose();
    password.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    final em = email.text.trim();
    final pw = password.text;
    if (em.isEmpty || pw.isEmpty) {
      showToast(context, 'Email and password are both required.');
      return;
    }
    setState(() => loading = true);
    final result = await login(em, pw);
    if (!mounted) return;
    setState(() => loading = false);

    if (result.ok) {
      final student = toStudent(result.data['user']);
      if (student == null) {
        showToast(context, 'Unexpected server response.');
        return;
      }
      if (remember) {
        await saveSession({'status': 'active', 'token': result.data['token'], 'user': result.data['user']});
      } else {
        await clearSession();
      }
      widget.onSignIn(result.data, student);
      showToast(context, 'Welcome back, ${student['firstName']}.');
      return;
    }

    if (result.status == 403 && (result.data?['message']?['code'] == 'PENDING')) {
      await saveSession({
        'status': 'pending',
        'request': {'email': em},
      });
      if (!mounted) return;
      showToast(context, result.message);
      return;
    }
    showToast(context, result.message);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: C.bg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(22, 34, 22, 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('MINDLINK.AI · STUDENT PORTAL', style: T.eyebrow.copyWith(fontSize: 9.5)),
                  const Spacer(),
                  const Icon(Icons.verified_outlined, size: 15, color: C.goldDeep),
                  const SizedBox(width: 5),
                  Text('SECURE ACCESS', style: T.tiny.copyWith(fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 1.1)),
                ],
              ),
              const SizedBox(height: 26),
              Text('Welcome back.', style: T.display),
              const SizedBox(height: 8),
              Text('Sign in with the account the school approved for you.', style: T.body),
              const SizedBox(height: 26),
              Card(
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Field(controller: email, label: 'Email', icon: Icons.mail_outline_rounded, keyboard: TextInputType.emailAddress),
                    const SizedBox(height: 14),
                    Field(controller: password, label: 'Password', obscure: true, icon: Icons.lock_outline_rounded),
                    const SizedBox(height: 18),
                    GoldButton(
                      label: loading ? 'Signing in...' : 'Sign in',
                      onPress: loading ? null : submit,
                      icon: Icons.arrow_forward_rounded,
                    ),
                    const SizedBox(height: 10),
                    GhostButton(
                      label: 'New here? Create a request',
                      onPress: widget.onGoSignUp,
                      icon: Icons.person_add_alt_rounded,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              Center(child: Text('Approved accounts only. Waiting students are kept posted.', style: T.tiny, textAlign: TextAlign.center)),
            ],
          ),
        ),
      ),
    );
  }
}
