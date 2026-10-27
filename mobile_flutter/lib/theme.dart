import 'package:flutter/material.dart';

/// Palette ported 1:1 from the original design (mobile/src/theme.js).
class C {
  static const bg = Color(0xFF090807);
  static const bgDeep = Color(0xFF050403);
  static const surface = Color(0xFF131110);
  static const surfaceAlt = Color(0xFF181512);
  static const surfaceRaised = Color(0xFF1E1A16);
  static const border = Color(0xFF29231D);
  static const borderStrong = Color(0xFF3B3228);
  static const gold = Color(0xFFD4AF37);
  static const goldBright = Color(0xFFF3CE62);
  static const goldDeep = Color(0xFFA77D1C);
  static const goldSoft = Color(0x1FD4AF37); // rgba(212,175,55,0.12)
  static const goldFaint = Color(0x0FD4AF37); // rgba(212,175,55,0.06)
  static const text = Color(0xFFF8F5EF);
  static const textMuted = Color(0xFFA79E92);
  static const textDim = Color(0xFF786F65);
  static const green = Color(0xFF4ADE80);
  static const greenSoft = Color(0x1F4ADE80);
  static const blue = Color(0xFF7DD3FC);
  static const blueSoft = Color(0x1F7DD3FC);
  static const purple = Color(0xFFC4B5FD);
  static const purpleSoft = Color(0x1FC4B5FD);
  static const red = Color(0xFFF87171);
  static const redSoft = Color(0x1FF87171);
  static const orange = Color(0xFFFDBA74);
  static const orangeSoft = Color(0x1FFDBA74);
  static const white = Color(0xFFFFFFFF);
  static const transparent0 = Color(0x00000000);
  static const overlay = Color(0xB8030202);

  static const accentMap = {
    'gold': (fg: gold, bg: goldSoft),
    'green': (fg: green, bg: greenSoft),
    'blue': (fg: blue, bg: blueSoft),
    'purple': (fg: purple, bg: purpleSoft),
    'red': (fg: red, bg: redSoft),
    'orange': (fg: orange, bg: orangeSoft),
  };
}

/// Shared typography + radii.
class T {
  static const rSm = 10.0;
  static const rMd = 14.0;
  static const rLg = 18.0;
  static const rXl = 24.0;

  static const display = TextStyle(fontSize: 30, height: 1.2, fontWeight: FontWeight.w800, color: C.text, letterSpacing: -0.8);
  static const h1 = TextStyle(fontSize: 26, height: 1.23, fontWeight: FontWeight.w800, color: C.text, letterSpacing: -0.6);
  static const h2 = TextStyle(fontSize: 20, height: 1.3, fontWeight: FontWeight.w700, color: C.text, letterSpacing: -0.3);
  static const h3 = TextStyle(fontSize: 16, height: 1.35, fontWeight: FontWeight.w700, color: C.text);
  static const body = TextStyle(fontSize: 14, height: 1.5, color: C.textMuted);
  static const bodyText = TextStyle(fontSize: 14, height: 1.5, color: C.text);
  static const small = TextStyle(fontSize: 12, height: 1.42, color: C.textMuted);
  static const tiny = TextStyle(fontSize: 10, height: 1.4, color: C.textDim);
  static const eyebrow = TextStyle(fontSize: 10, height: 1.4, fontWeight: FontWeight.w800, letterSpacing: 1.3, color: C.gold);
}
