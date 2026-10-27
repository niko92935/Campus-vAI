import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { colors, fonts, radii, softShadow } from '../theme';
import { isValidEmail } from '../utils';
import { registerUser } from '../api';

import * as ImagePicker from 'expo-image-picker';

const ROLE_LABELS = { student: '🎓 Student', teacher: '👩‍🏫 Teacher' };

async function pickImage(side, setPicked) {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsEditing: true,
      base64: false,
    });
    if (!result.canceled && Array.isArray(result.assets) && result.assets[0]?.uri) {
      setPicked(result.assets[0]);
    }
  } catch {
    // permission denied or picker unavailable — keep old selection
  }
}

export default function SignUpScreen({ onBack, onSubmitted }) {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [idCardFront, setFront] = useState(null);
  const [idCardBack, setBack] = useState(null);
  const [focused, setFocused] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const fieldError = () => {
    if (!name.trim() || name.trim().length < 3) return 'Enter your full name.';
    if (!isValidEmail(email)) return 'Enter a valid email address.';
    if (phone.trim().length < 6) return 'Enter a valid phone number.';
    if (!rollNumber.trim()) return role === 'student' ? 'Enter your student / roll ID.' : 'Enter your teacher ID.';
    if (password.trim().length < 6) return 'Password must be at least 6 characters.';
    if (!idCardFront) return 'Upload the FRONT side of your ID card.';
    if (!idCardBack) return 'Upload the BACK side of your ID card.';
    return '';
  };

  const handleSubmit = async () => {
    setError('');
    setNotice('');

    const problem = fieldError();
    if (problem) {
      setError(problem);
      return;
    }

    setLoading(true);
    const result = await registerUser(
      {
        role,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        rollNumber: rollNumber.trim(),
        password,
      },
      idCardFront,
      idCardBack
    );
    setLoading(false);

    if (result.ok) {
      onSubmitted({ role, name: name.trim(), email: email.trim() });
      return;
    }
    setError(result.message);
  };

  const idLabel = role === 'teacher' ? 'TEACHER ID' : 'STUDENT / ROLL ID';

  return (
    <View style={styles.screen}>
      <View style={styles.glowLarge} />
      <View style={styles.glowSmall} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>M</Text>
          </View>
          <Text style={styles.brandName}>
            MindLink<Text style={styles.brandDot}>.AI</Text>
          </Text>
          <Text style={styles.brandTag}>REQUEST AN ACCOUNT</Text>
        </View>

        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Join MindLink.</Text>
          <Text style={styles.subheading}>
            Pick your role, fill in your details and upload both sides of your ID card. Your school admin will approve your request.
          </Text>
        </View>

        {/* Role picker */}
        <View style={styles.roleRow}>
          {['student', 'teacher'].map((value) => (
            <TouchableOpacity
              key={value}
              accessibilityRole="button"
              activeOpacity={0.8}
              onPress={() => setRole(value)}
              style={[styles.roleButton, role === value && styles.roleButtonActive]}
            >
              <Text style={[styles.roleLabel, role === value && styles.roleLabelActive]}>
                {ROLE_LABELS[value]}
              </Text>
              {role === value ? <Text style={styles.roleCheck}>✓</Text> : null}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.label}>FULL NAME</Text>
            <View style={[styles.inputWrap, focused === 'name' && styles.inputWrapFocused]}>
              <Text style={styles.inputIcon}>✎</Text>
              <TextInput
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  if (error) setError('');
                }}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                placeholder="Your full name"
                placeholderTextColor={colors.textDim}
                autoCorrect={false}
                style={styles.input}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>EMAIL</Text>
            <View style={[styles.inputWrap, focused === 'email' && styles.inputWrapFocused]}>
              <Text style={styles.inputIcon}>@</Text>
              <TextInput
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (error) setError('');
                }}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="you@school.edu"
                placeholderTextColor={colors.textDim}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                style={styles.input}
              />
            </View>
          </View>

          {/* Phone */}
          <View style={styles.field}>
            <Text style={styles.label}>PHONE</Text>
            <View style={[styles.inputWrap, focused === 'phone' && styles.inputWrapFocused]}>
              <Text style={styles.inputIcon}>☎</Text>
              <TextInput
                value={phone}
                onChangeText={(value) => {
                  setPhone(value);
                  if (error) setError('');
                }}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused(null)}
                placeholder="+880 1X XX XXX XXX"
                placeholderTextColor={colors.textDim}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
          </View>

          {/* Roll / Teacher ID */}
          <View style={styles.field}>
            <Text style={styles.label}>{idLabel}</Text>
            <View style={[styles.inputWrap, focused === 'rollNumber' && styles.inputWrapFocused]}>
              <Text style={styles.inputIcon}>#</Text>
              <TextInput
                value={rollNumber}
                onChangeText={(value) => {
                  setRollNumber(value);
                  if (error) setError('');
                }}
                onFocus={() => setFocused('rollNumber')}
                onBlur={() => setFocused(null)}
                placeholder={role === 'teacher' ? 'TCH-XXXX' : 'STU-XXXX or roll number'}
                placeholderTextColor={colors.textDim}
                autoCapitalize="characters"
                style={styles.input}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={[styles.inputWrap, focused === 'password' && styles.inputWrapFocused]}>
              <Text style={styles.inputIcon}>•</Text>
              <TextInput
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  if (error) setError('');
                }}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="Create a password (6+ characters)"
                placeholderTextColor={colors.textDim}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password-new"
                style={styles.input}
              />
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.7}
                onPress={() => setShowPassword((value) => !value)}
                style={styles.showButton}
              >
                <Text style={styles.showText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ID card uploads */}
          <View style={styles.idBlock}>
            <Text style={styles.idHeading}>ID CARD VERIFICATION (REQUIRED)</Text>
            <Text style={styles.idHint}>Upload both sides — your admin inspects these before approval.</Text>
            <View style={styles.idRow}>
              {[
                { side: 'front', label: 'Front', picked: idCardFront, setPicked: setFront },
                { side: 'back', label: 'Back', picked: idCardBack, setPicked: setBack },
              ].map((item) => (
                <TouchableOpacity
                  key={item.side}
                  accessibilityRole="button"
                  activeOpacity={0.8}
                  style={[styles.idCard, item.picked && styles.idCardFilled]}
                  onPress={() => pickImage(item.side, item.setPicked)}
                >
                  {item.picked ? (
                    <>
                      <Image source={{ uri: item.picked.uri }} style={styles.idImage} />
                      <Text style={styles.idPickAgain}>Tap to change</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.idIcon}>🪪</Text>
                      <Text style={styles.idName}>{item.label} side</Text>
                      <Text style={styles.idAction}>Tap to upload</Text>
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorDot}>!</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          {notice ? <Text style={styles.helperText}>{notice}</Text> : null}

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.85}
            disabled={loading}
            onPress={handleSubmit}
            style={[styles.submitButton, loading && styles.signInButtonLoading]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.bgDeep} />
            ) : (
              <>
                <Text style={styles.submitText}>Submit request</Text>
                <Text style={styles.submitArrow}>→</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={() => onBack && onBack()}>
            <Text style={styles.backLink}>Already have an account? → Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  glowLarge: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(212,175,55,0.05)',
    top: -150,
    right: -140,
  },
  glowSmall: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(212,175,55,0.035)',
    bottom: -80,
    left: -100,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 30,
  },
  brand: {
    alignItems: 'center',
    gap: 5,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 19,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    ...softShadow,
  },
  logoText: {
    color: colors.gold,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1,
  },
  brandName: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  brandDot: {
    color: colors.gold,
  },
  brandTag: {
    color: colors.textDim,
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headingBlock: {
    marginTop: 26,
    marginBottom: 18,
  },
  heading: {
    ...fonts.h1,
    fontSize: 27,
    lineHeight: 33,
  },
  subheading: {
    ...fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    height: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  roleButtonActive: {
    borderColor: 'rgba(212,175,55,0.55)',
    backgroundColor: colors.goldSoft,
  },
  roleLabel: {
    color: colors.textMuted,
    fontSize: 12.5,
    fontWeight: '700',
  },
  roleLabelActive: {
    color: colors.gold,
  },
  roleCheck: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  form: {
    gap: 13,
  },
  field: {
    gap: 6,
  },
  label: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 13,
    height: 48,
  },
  inputWrapFocused: {
    borderColor: 'rgba(212,175,55,0.5)',
    backgroundColor: '#15120F',
  },
  inputIcon: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: '700',
    width: 14,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    height: '100%',
    paddingVertical: 0,
  },
  showButton: {
    paddingVertical: 4,
    paddingLeft: 6,
  },
  showText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  idBlock: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 14,
    gap: 9,
  },
  idHeading: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  idHint: {
    color: colors.textMuted,
    fontSize: 9.5,
    lineHeight: 14,
  },
  idRow: {
    flexDirection: 'row',
    gap: 10,
  },
  idCard: {
    flex: 1,
    height: 104,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: '#15120F',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  idCardFilled: {
    borderStyle: 'solid',
    borderColor: 'rgba(212,175,55,0.55)',
  },
  idIcon: {
    fontSize: 20,
  },
  idName: {
    color: colors.text,
    fontSize: 10.5,
    fontWeight: '700',
  },
  idAction: {
    color: colors.textDim,
    fontSize: 8.5,
    fontWeight: '600',
  },
  idImage: {
    width: '100%',
    height: 72,
    resizeMode: 'cover',
  },
  idPickAgain: {
    color: colors.gold,
    fontSize: 8,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.redSoft,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.24)',
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  errorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.red,
    color: colors.bgDeep,
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 14,
  },
  errorText: {
    flex: 1,
    color: colors.red,
    fontSize: 10,
    fontWeight: '600',
  },
  helperText: {
    color: colors.gold,
    fontSize: 9.5,
    lineHeight: 14,
  },
  submitButton: {
    height: 50,
    borderRadius: radii.md,
    backgroundColor: colors.gold,
    borderWidth: 1,
    borderColor: colors.goldBright,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2,
    ...softShadow,
  },
  signInButtonLoading: {
    opacity: 0.8,
  },
  submitText: {
    color: colors.bgDeep,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  submitArrow: {
    color: colors.bgDeep,
    fontSize: 15,
    fontWeight: '800',
  },
  backLink: {
    color: colors.gold,
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 4,
  },
});
