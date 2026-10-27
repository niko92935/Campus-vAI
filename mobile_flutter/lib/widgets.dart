import 'package:flutter/material.dart';
import 'theme.dart';

/// Dark rounded card used everywhere (matches the RN Card component).
class Card extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry margin;
  final Color color;
  final BorderRadius? radius;
  const Card({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.margin = EdgeInsets.zero,
    this.color = C.surface,
    this.radius,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      padding: padding,
      decoration: BoxDecoration(
        color: color,
        borderRadius: radius ?? BorderRadius.circular(T.rLg),
        border: Border.all(color: C.border, width: 1),
        boxShadow: const [
          BoxShadow(color: Color(0x3D000000), blurRadius: 24, offset: Offset(0, 12)),
        ],
      ),
      child: child,
    );
  }
}

/// Small gold-on-dark pill label (matching the RN Badge).
class Badge extends StatelessWidget {
  final String label;
  final Color fg;
  final Color bg;
  const Badge({super.key, required this.label, this.fg = C.gold, this.bg = C.goldSoft});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: fg.withValues(alpha: 0.26), width: 1),
      ),
      child: Text(label, style: TextStyle(fontSize: 9.5, height: 1.3, fontWeight: FontWeight.w700, letterSpacing: 0.3, color: fg)),
    );
  }
}

/// Primary gold button.
class GoldButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPress;
  final EdgeInsetsGeometry padding;
  final IconData? icon;
  const GoldButton({super.key, required this.label, required this.onPress, this.padding = const EdgeInsets.symmetric(vertical: 13), this.icon});

  @override
  Widget build(BuildContext context) {
    final disabled = onPress == null;
    return Material(
      color: disabled ? C.goldDeep.withValues(alpha: 0.35) : C.gold,
      borderRadius: BorderRadius.circular(T.rMd),
      child: InkWell(
        borderRadius: BorderRadius.circular(T.rMd),
        onTap: onPress,
        child: Container(
          width: double.infinity,
          padding: padding,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 15, color: disabled ? C.textMuted : C.bgDeep),
                const SizedBox(width: 7),
              ],
              Text(
                label,
                style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, letterSpacing: 0.4,
                    color: disabled ? C.textMuted : C.bgDeep),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Ghost/outline button.
class GhostButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPress;
  final EdgeInsetsGeometry padding;
  final IconData? icon;
  const GhostButton({super.key, required this.label, required this.onPress, this.padding = const EdgeInsets.symmetric(vertical: 13), this.icon});

  @override
  Widget build(BuildContext context) {
    final disabled = onPress == null;
    return Material(
      color: C.surfaceAlt,
      borderRadius: BorderRadius.circular(T.rMd),
      child: InkWell(
        borderRadius: BorderRadius.circular(T.rMd),
        onTap: onPress,
        child: Container(
          width: double.infinity,
          padding: padding,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(T.rMd),
            border: Border.all(color: disabled ? C.border : C.borderStrong, width: 1),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 15, color: disabled ? C.textDim : C.gold),
                const SizedBox(width: 7),
              ],
              Text(label,
                  style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, letterSpacing: 0.2,
                      color: disabled ? C.textDim : C.text)),
            ],
          ),
        ),
      ),
    );
  }
}

/// Circular initials avatar with the gold ring.
class Avatar extends StatelessWidget {
  final String initials;
  final double size;
  const Avatar({super.key, required this.initials, this.size = 56});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: C.goldSoft,
        border: Border.all(color: C.gold.withValues(alpha: 0.38), width: 1),
      ),
      alignment: Alignment.center,
      child: Text(initials, style: TextStyle(fontSize: size * 0.36, fontWeight: FontWeight.w800, color: C.gold, letterSpacing: -0.5)),
    );
  }
}

/// Dark input field.
class Field extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final bool obscure;
  final IconData? icon;
  final TextInputType? keyboard;
  final String? hint;
  final ValueChanged<String>? onChanged;
  const Field({super.key, required this.controller, required this.label, this.obscure = false, this.icon, this.keyboard, this.hint, this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: T.eyebrow.copyWith(fontSize: 9)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          obscureText: obscure,
          keyboardType: keyboard,
          onChanged: onChanged,
          style: T.bodyText.copyWith(fontSize: 13.5),
          cursorColor: C.gold,
          decoration: InputDecoration(
            filled: true,
            fillColor: C.surfaceAlt,
            hintStyle: T.tiny.copyWith(fontSize: 12),
            hintText: hint,
            prefixIcon: icon != null
                ? Icon(icon, size: 16, color: C.textDim)
                : null,
            contentPadding: const EdgeInsets.symmetric(horizontal: 13, vertical: 13),
            enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(T.rMd),
                borderSide: const BorderSide(color: C.border, width: 1)),
            focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(T.rMd),
                borderSide: const BorderSide(color: C.gold, width: 1)),
          ),
        ),
      ],
    );
  }
}

/// Inline toast strip shown briefly at the bottom of the screen.
void showToast(BuildContext context, String message) {
  final overlay = ScaffoldMessenger.of(context);
  overlay.hideCurrentSnackBar();
  overlay.showSnackBar(
    SnackBar(
      content: Row(children: [
        Container(width: 6, height: 6, decoration: const BoxDecoration(shape: BoxShape.circle, color: C.gold)),
        const SizedBox(width: 8),
        Expanded(child: Text(message, style: T.small.copyWith(color: C.text))),
      ]),
      backgroundColor: C.surfaceRaised,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(T.rMd),
        side: const BorderSide(color: Color(0x57D4AF37), width: 1),
      ),
      duration: const Duration(seconds: 3),
    ),
  );
}

/// Accent color pair resolved from a string key.
({Color fg, Color bg}) accentOf(String? key) {
  return C.accentMap[key] ?? C.accentMap['gold']!;
}
