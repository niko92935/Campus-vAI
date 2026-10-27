import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { colors, fonts, radii, softShadow } from '../theme';
import { isValidEmail } from '../utils';
import { loginUser } from '../api';

export default function LoginScreen({ onSignIn, onGoSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [focused, setFocused] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError('');
    setNotice('');

    if (!isValidEmail(email)) {
      setError('Enter the email you registered with.');
      return;
    }
    if (password.trim().length < 6) {
      setError('Your password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await loginUser(email.trim().toLowerCase(), password);
    setLoading(false);

    if (result.ok) {
      onSignIn({ token: result.token, user: result.user, remember: rememberMe });
      return;
    }

    if (result.code === 'PENDING') {
      setNotice('⏳ Your account is awaiting admin approval. You will be able to sign in once your school admin approves your request.');
      return;
    }
    if (result.code === 'SUSPENDED') {
      setError('This account has been suspended. Contact the school office.');
      return;
    }
    if (result.code === 'REJECTED') {
      setNotice('❌ Your signup request was rejected. You may sign up again with the correct details.');
      return;
    }
    setError(result.message);
  };

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
          <Text style={styles.brandTag}>LEARN WITHOUT LIMITS</Text>
        </View>

        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Welcome back.</Text>
          <Text style={styles.subheading}>
            Sign in with your MindLink account to continue your courses, live classes and everything waiting for you today.
          </Text>
        </View>

        <View style={styles.form}>
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

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>PASSWORD</Text>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.7}
                onPress={() => setNotice('Password resets are handled by your school office.')}
              >
                <Text style={styles.forgot}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
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
                onSubmitEditing={handleSignIn}
                placeholder="Enter your password"
                placeholderTextColor={colors.textDim}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                returnKeyType="go"
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

          <View style={styles.rememberRow}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: colors.surfaceRaised, true: 'rgba(212,175,55,0.45)' }}
              thumbColor={rememberMe ? colors.gold : '#8A8177'}
              ios_backgroundColor={colors.surfaceRaised}
              style={styles.rememberSwitch}
            />
            <Text style={styles.rememberText}>Keep me signed in on this device</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorDot}>!</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          {notice ? (
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.85}
            disabled={loading}
            onPress={handleSignIn}
            style={[styles.signInButton, loading && styles.signInButtonLoading]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.bgDeep} />
            ) : (
              <>
                <Text style={styles.signInText}>Sign in</Text>
                <Text style={styles.signInArrow}>→</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>new here?</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.78}
            onPress={() => onGoSignUp && onGoSignUp()}
            style={styles.signUpButton}
          >
            <Text style={styles.signUpButtonIcon}>🎓</Text>
            <Text style={styles.signUpButtonText}>Create a new account</Text>
            <Text style={styles.signUpArrow}>→</Text>
          </TouchableOpacity>

          <Text style={styles.prefillNote}>
            Sign up requests are reviewed by your school admin - student & teacher ID cards required.
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>Privacy</Text>
            <Text style={styles.footerDot}>·</Text>
            <Text style={styles.footerLink}>Terms</Text>
            <Text style={styles.footerDot}>·</Text>
            <Text style={styles.footerLink}>Help</Text>
          </View>
          <Text style={styles.footerFine}>Protected by MindLink Identity</Text>
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
    paddingBottom: 26,
    justifyContent: 'center',
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
    marginTop: 30,
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
    maxWidth: 320,
  },
  form: {
    gap: 13,
  },
  field: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  forgot: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: '700',
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
    fontSize: 15,
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
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -2,
  },
  rememberSwitch: {
    transform: [{ scale: 0.68 }],
    marginLeft: -8,
  },
  rememberText: {
    color: colors.textMuted,
    fontSize: 9.5,
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
  noticeBox: {
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noticeText: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 15,
  },
  signInButton: {
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
  signInText: {
    color: colors.bgDeep,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  signInArrow: {
    color: colors.bgDeep,
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textDim,
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  signUpButton: {
    height: 46,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
  },
  signUpButtonIcon: {
    fontSize: 14,
  },
  signUpButtonText: {
    color: colors.text,
    fontSize: 11.5,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  signUpArrow: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  prefillNote: {
    color: colors.textDim,
    fontSize: 8.5,
    lineHeight: 13,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  footer: {
    alignItems: 'center',
    gap: 5,
    marginTop: 26,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerLink: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  footerDot: {
    color: colors.textDim,
    fontSize: 9,
  },
  footerFine: {
    color: colors.textDim,
    fontSize: 8,
    marginTop: 2,
  },
});
