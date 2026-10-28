import 'dart:io';

import 'package:flutter/material.dart' hide Card, Badge;
import 'package:image_picker/image_picker.dart';

import '../api.dart';
import '../image_utils.dart';
import '../theme.dart';
import '../widgets.dart';

class SignUpScreen extends StatefulWidget {
  final void Function(Map<String, dynamic> request) onSubmitted;
  final VoidCallback onBack;
  final String dialogTitle;
  final String dialogBody;
  const SignUpScreen({
    super.key,
    required this.onSubmitted,
    required this.onBack,
    this.dialogTitle = 'Request submitted',
    this.dialogBody = 'Thank you for signing up! We will confirm you via email once your account is approved.',
  });

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  String role = 'student';
  bool loading = false;
  int step = 0;

  final name = TextEditingController();
  final email = TextEditingController();
  final phone = TextEditingController();
  final roll = TextEditingController();
  final password = TextEditingController();

  File? idFront;
  File? idBack;

  static const accent = {
    'student': 'gold',
    'teacher': 'purple',
  };

  String get roleRollLabel => role == 'student' ? 'Student / roll ID' : 'Teacher ID';
  IconData get roleIcon => role == 'student' ? Icons.school_rounded : Icons.co_present_rounded;

  @override
  void dispose() {
    name.dispose();
    email.dispose();
    phone.dispose();
    roll.dispose();
    password.dispose();
    super.dispose();
  }

  Future<void> pickIdCard(bool front) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.gallery, imageQuality: 85, maxWidth: 1600);
    if (picked == null) {
      if (!mounted) return;
      showToast(context, front ? 'No image selected for the front side.' : 'No image selected for the back side.');
      return;
    }

    // Large photos (especially PNGs) are quietly re-encoded so the user never
    // has to resize anything before sending the request.
    final file = File(picked.path);
    final prepared = await prepareIdCardImage(file);
    if (!mounted) return;

    setState(() {
      if (front) {
        idFront = prepared;
      } else {
        idBack = prepared;
      }
    });
    final optimised = prepared.path != file.path;
    showToast(
      context,
      '${front ? 'Front' : 'Back'} side attached${optimised ? ' and optimised automatically' : ''}.',
    );
  }

  bool detailsValid() {
    if (name.text.trim().length < 3) {
      showToast(context, 'Full name is required (at least 3 characters).');
      return false;
    }
    final em = email.text.trim();
    if (!RegExp(r'^\S+@\S+\.\S+$').hasMatch(em)) {
      showToast(context, 'A valid email is required - confirmation will be sent there.');
      return false;
    }
    if (!RegExp(r'^[\d+\-\s()]{6,20}$').hasMatch(phone.text.trim())) {
      showToast(context, 'A valid phone number is required.');
      return false;
    }
    if (roll.text.trim().isEmpty) {
      showToast(context, '$roleRollLabel is required.');
      return false;
    }
    if (password.text.length < 6) {
      showToast(context, 'Password must be at least 6 characters.');
      return false;
    }
    return true;
  }

  void showSubmittedDialog(Map<String, dynamic> request) {
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: C.surfaceRaised,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(T.rLg),
          side: const BorderSide(color: Color(0x57D4AF37), width: 1),
        ),
        icon: const Icon(Icons.mark_email_read_rounded, color: C.gold, size: 30),
        title: Text(widget.dialogTitle, style: T.h3, textAlign: TextAlign.center),
        content: Text(widget.dialogBody, style: T.small, textAlign: TextAlign.center),
        actionsAlignment: MainAxisAlignment.center,
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('OK', style: TextStyle(color: C.gold, fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    ).then((_) {
      // lifecycle: dialog closed -> land on the pending screen
      if (mounted) widget.onSubmitted(request);
    });
  }

  Future<void> submit() async {
    if (idFront == null) {
      showToast(context, 'Attach a clear photo of the FRONT side of your ID card.');
      return;
    }
    if (idBack == null) {
      showToast(context, 'Attach a clear photo of the BACK side of your ID card.');
      return;
    }
    setState(() => loading = true);
    final result = await register(
      role: role,
      name: name.text.trim(),
      email: email.text.trim(),
      phone: phone.text.trim(),
      rollNumber: roll.text.trim(),
      password: password.text,
      idCardFront: idFront,
      idCardBack: idBack,
    );
    if (!mounted) return;
    setState(() => loading = false);
    if (!result.ok) {
      showToast(context, result.message);
      if (result.status == 409) Navigator.of(context).maybePop();
      return;
    }
    showSubmittedDialog({
      'role': role,
      'name': name.text.trim(),
      'email': email.text.trim(),
      'rollNumber': roll.text.trim(),
    });
  }

  @override
  Widget build(BuildContext context) {
    final (:fg, :bg) = accentOf(accent[role]);
    return Scaffold(
      backgroundColor: C.bg,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(22, 18, 22, 0),
              child: Row(
                children: [
                  TextButton.icon(
                    onPressed: () {
                      if (step > 0) {
                        setState(() => step -= 1);
                      } else {
                        widget.onBack();
                      }
                    },
                    icon: const Icon(Icons.arrow_back_rounded, size: 16, color: C.textMuted),
                    label: Text('Back', style: T.small),
                    style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero),
                  ),
                  const Spacer(),
                  Text('REQUEST ACCESS', style: T.tiny.copyWith(fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 1.1)),
                ],
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(22, 16, 22, 34),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(step == 0 ? 'Who are you?' : step == 1 ? 'Your details.' : step == 2 ? 'Verify yourself.' : 'All set to send.',
                        style: T.display.copyWith(fontSize: 27)),
                    const SizedBox(height: 8),
                    Text(
                      step == 3
                          ? 'Double-check the card photos are readable before sending the request.'
                          : 'The admin reviews every request before the account opens.',
                      style: T.body,
                    ),
                    const SizedBox(height: 22),
                    if (step == 0) buildRoleStep(fg, bg),
                    if (step == 1) buildDetailsStep(),
                    if (step == 2) buildIdStep(),
                    if (step == 3) buildReviewStep(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget buildRoleStep(Color fg, Color bg) {
    Widget roleCard(String key, String title, String desc, IconData icon) {
      final selected = role == key;
      final c = accentOf(accent[key]);
      return Card(
        margin: const EdgeInsets.only(bottom: 12),
        padding: EdgeInsets.all(16),
        color: selected ? C.surfaceRaised : C.surface,
        child: InkWell(
          borderRadius: BorderRadius.circular(T.rLg),
          onTap: () => setState(() => role = key),
          child: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(T.rMd),
                    color: c.bg,
                    border: Border.all(color: c.fg.withValues(alpha: 0.26), width: 1)),
                child: Icon(icon, color: c.fg, size: 20),
              ),
              const SizedBox(width: 13),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: T.h3),
                    const SizedBox(height: 3),
                    Text(desc, style: T.small),
                  ],
                ),
              ),
              Icon(selected ? Icons.radio_button_checked_rounded : Icons.radio_button_off_rounded,
                  color: selected ? c.fg : C.textDim, size: 20),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        roleCard('student', 'Student', 'Join courses, lessons and notices with a school roll ID.', Icons.school_rounded),
        roleCard('teacher', 'Teacher', 'Faculty account verified with the school teacher ID.', Icons.co_present_rounded),
        const SizedBox(height: 8),
        GoldButton(label: 'Continue', onPress: () => setState(() => step = 1), icon: Icons.arrow_forward_rounded),
      ],
    );
  }

  Widget buildDetailsStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [Icon(roleIcon, size: 14, color: C.gold), const SizedBox(width: 6), Text(role == 'student' ? 'STUDENT' : 'TEACHER', style: T.eyebrow.copyWith(fontSize: 9))]),
        const SizedBox(height: 14),
        Field(controller: name, label: 'Full name', icon: Icons.badge_outlined, hint: 'e.g. Rahim Ahmed'),
        const SizedBox(height: 13),
        Field(controller: email, label: 'Email', icon: Icons.mail_outline_rounded, keyboard: TextInputType.emailAddress, hint: 'Confirmation is sent here'),
        const SizedBox(height: 13),
        Field(controller: phone, label: 'Phone', icon: Icons.phone_outlined, keyboard: TextInputType.phone),
        const SizedBox(height: 13),
        Field(controller: roll, label: roleRollLabel, icon: Icons.numbers_rounded),
        const SizedBox(height: 13),
        Field(controller: password, label: 'Password', obscure: true, icon: Icons.lock_outline_rounded, hint: 'At least 6 characters'),
        const SizedBox(height: 18),
        GhostButton(label: 'Back', padding: const EdgeInsets.symmetric(vertical: 11), onPress: () => setState(() => step = 0)),
        const SizedBox(height: 8),
        GoldButton(label: 'Continue', onPress: detailsValid() ? () => setState(() => step = 2) : null, icon: Icons.arrow_forward_rounded),
      ],
    );
  }

  Widget buildIdStep() {
    Widget slot(bool front) {
      final (label, file, icon) = front
          ? ('FRONT SIDE', idFront, Icons.credit_card_rounded)
          : ('BACK SIDE', idBack, Icons.credit_card);
      final attached = file != null;
      return Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Icon(icon, size: 14, color: C.gold),
              const SizedBox(width: 6),
              Text(label, style: T.eyebrow.copyWith(fontSize: 9)),
              const Spacer(),
              if (attached) const Icon(Icons.check_circle_rounded, size: 15, color: C.green),
            ]),
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(T.rMd),
              child: attached
                  ? ConstrainedBox(
                      constraints: const BoxConstraints(maxHeight: 170),
                      child: Image.file(file, fit: BoxFit.fitHeight, width: double.infinity),
                    )
                  : Container(
                      height: 96,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: C.goldFaint,
                        borderRadius: BorderRadius.circular(T.rMd),
                        border: Border.all(color: C.border, width: 1),
                      ),
                      alignment: Alignment.center,
                      child: Text('No photo attached yet', style: T.tiny),
                    ),
            ),
            const SizedBox(height: 12),
            GhostButton(label: attached ? 'Replace photo' : 'Attach photo', padding: const EdgeInsets.symmetric(vertical: 11), onPress: () => pickIdCard(front), icon: Icons.photo_camera_outlined),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        slot(true),
        slot(false),
        const SizedBox(height: 4),
        Text('Both sides are required for verification. Photos are optimised automatically.', style: T.tiny, textAlign: TextAlign.center),
        const SizedBox(height: 16),
        GhostButton(label: 'Back', padding: const EdgeInsets.symmetric(vertical: 11), onPress: () => setState(() => step = 1)),
        const SizedBox(height: 8),
        GoldButton(label: 'Review my request', onPress: () => setState(() => step = 3), icon: Icons.arrow_forward_rounded),
      ],
    );
  }

  Widget buildReviewStep() {
    String pick(File? f) => f == null ? 'Missing' : 'Attached';
    Widget row(String k, String v, {bool gold = false}) => Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(width: 92, child: Text(k, style: T.tiny)),
            Expanded(child: Text(v, style: T.small.copyWith(color: gold ? C.gold : null, fontWeight: gold ? FontWeight.w700 : null))),
          ],
        );
    return Column(
      children: [
        Card(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('REVIEW', style: T.eyebrow.copyWith(fontSize: 9)),
              const SizedBox(height: 12),
              row('Role', role == 'student' ? 'Student' : 'Teacher', gold: true),
              const SizedBox(height: 8),
              row('Name', name.text.trim()),
              const SizedBox(height: 8),
              row('Email', email.text.trim()),
              const SizedBox(height: 8),
              row('Phone', phone.text.trim()),
              const SizedBox(height: 8),
              row(roleRollLabel, roll.text.trim()),
              const SizedBox(height: 8),
              row('ID front', pick(idFront)),
              const SizedBox(height: 8),
              row('ID back', pick(idBack)),
            ],
          ),
        ),
        const SizedBox(height: 16),
        GhostButton(label: 'Back', padding: const EdgeInsets.symmetric(vertical: 11), onPress: () => setState(() => step = 2)),
        const SizedBox(height: 8),
        GoldButton(
          label: loading ? 'Sending request...' : 'Submit for approval',
          onPress: loading ? null : submit,
          icon: Icons.mark_email_read_outlined,
        ),
      ],
    );
  }
}
