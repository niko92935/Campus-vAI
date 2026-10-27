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

export default function LoginScreen({ onSignIn }) {
  const [email, setEmail] = useState('ayesha.rahman@mindlink.ai');
  const [password, setPassword] = useState('mindlink');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [focused, setFocused] = useState(null);
  const [error, setError] = useState('');
  const [helper, setHelper] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    setError('');
    setHelper('');

    if (!isValidEmail(email)) {
      setError('Enter a valid school email address.');
      return;
    }
    if (password.trim().length < 6) {
      setError('Your password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSignIn();
    }, 420);
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
          <View style={styles.demoRow}>
            <Text style={styles.heading}>Welcome back.</Text>
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>Demo</Text>
            </View>
          </View>
          <Text style={styles.subheading}>
            Sign in to continue your courses, live classes and everything waiting for you today.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>SCHOOL EMAIL</Text>
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
                onPress={() => setHelper('Password resets are handled by your school office.')}
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
          {helper ? <Text style={styles.helperText}>{helper}</Text> : null}

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
            <Text style={styles.dividerText}>demo access</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.78}
            onPress={() => {
              setEmail('ayesha.rahman@mindlink.ai');
              setPassword('mindlink');
              setError('');
              setTimeout(handleSignIn, 60);
            }}
            style={styles.demoButton}
          >
            <Text style={styles.demoButtonIcon}>👩‍🎓</Text>
            <Text style={styles.demoButtonText}>Continue as demo student</Text>
          </TouchableOpacity>

          <Text style={styles.prefillNote}>
            Demo credentials are pre-filled. Any valid email and a 6+ character password will work
            in this preview.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            New to MindLink? Registration is managed by your school office.
          </Text>
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
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  heading: {
    ...fonts.h1,
    fontSize: 27,
    lineHeight: 33,
  },
  demoBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.full,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.24)',
  },
  demoBadgeText: {
    color: colors.gold,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
  helperText: {
    color: colors.gold,
    fontSize: 9.5,
    lineHeight: 14,
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
  demoButton: {
    height: 46,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  demoButtonIcon: {
    fontSize: 14,
  },
  demoButtonText: {
    color: colors.text,
    fontSize: 11.5,
    fontWeight: '700',
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
  footerText: {
    color: colors.textDim,
    fontSize: 9.5,
    textAlign: 'center',
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
