import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radii } from '../theme';

function HomeIcon({ color }) {
  return (
    <View style={styles.iconCanvas}>
      <View
        style={[
          styles.homeRoof,
          { borderTopColor: color, borderLeftColor: color },
        ]}
      />
      <View style={[styles.homeBody, { borderColor: color }]} />
    </View>
  );
}

function CoursesIcon({ color }) {
  return (
    <View style={styles.iconCanvas}>
      <View style={[styles.book, { borderColor: color }]}>
        <View style={[styles.bookSpine, { backgroundColor: color }]} />
      </View>
      <View style={[styles.bookPage, { borderColor: color }]} />
    </View>
  );
}

function NoticesIcon({ color }) {
  return (
    <View style={styles.iconCanvas}>
      <View style={[styles.bellDome, { borderColor: color }]} />
      <View style={[styles.bellRim, { backgroundColor: color }]} />
      <View style={[styles.bellClapper, { backgroundColor: color }]} />
      <View style={[styles.bellTop, { backgroundColor: color }]} />
    </View>
  );
}

function ProfileIcon({ color }) {
  return (
    <View style={styles.iconCanvas}>
      <View style={[styles.profileHead, { borderColor: color }]} />
      <View style={[styles.profileBody, { borderColor: color }]} />
    </View>
  );
}

const ICONS = {
  home: HomeIcon,
  courses: CoursesIcon,
  notices: NoticesIcon,
  profile: ProfileIcon,
};

const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'courses', label: 'Courses' },
  { id: 'notices', label: 'Notices' },
  { id: 'profile', label: 'Profile' },
];

export default function BottomNav({ active, onChange, unread = 0 }) {
  return (
    <View style={styles.navbar}>
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        const Icon = ICONS[tab.id];
        const tint = isActive ? colors.gold : colors.textDim;

        return (
          <TouchableOpacity
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            activeOpacity={0.75}
            onPress={() => onChange(tab.id)}
            style={[styles.navItem, isActive && styles.navItemActive]}
          >
            <View style={styles.iconWrap}>
              <Icon color={tint} />
              {tab.id === 'notices' && unread > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#0D0B09',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 10,
    gap: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 7,
    borderRadius: radii.md,
  },
  navItemActive: {
    backgroundColor: colors.goldFaint,
  },
  iconWrap: {
    position: 'relative',
  },
  label: {
    color: colors.textDim,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  labelActive: {
    color: colors.gold,
  },
  iconCanvas: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeRoof: {
    position: 'absolute',
    top: 3,
    width: 12,
    height: 12,
    borderTopWidth: 1.8,
    borderLeftWidth: 1.8,
    borderTopLeftRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  homeBody: {
    position: 'absolute',
    top: 10,
    width: 13,
    height: 8,
    borderWidth: 1.8,
    borderTopWidth: 0,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  book: {
    width: 13,
    height: 16,
    borderWidth: 1.8,
    borderRadius: 2,
  },
  bookSpine: {
    position: 'absolute',
    left: 3,
    top: 0,
    bottom: 0,
    width: 1.6,
  },
  bookPage: {
    position: 'absolute',
    right: 1,
    top: 5,
    width: 3,
    height: 6,
    borderWidth: 1.4,
    borderLeftWidth: 0,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  bellDome: {
    position: 'absolute',
    top: 3,
    width: 15,
    height: 12,
    borderWidth: 1.8,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  bellRim: {
    position: 'absolute',
    top: 15,
    width: 17,
    height: 1.8,
    borderRadius: 1,
  },
  bellClapper: {
    position: 'absolute',
    top: 17,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  bellTop: {
    position: 'absolute',
    top: 1,
    width: 3,
    height: 1.8,
    borderRadius: 1,
  },
  profileHead: {
    position: 'absolute',
    top: 3,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.8,
  },
  profileBody: {
    position: 'absolute',
    top: 11,
    width: 14,
    height: 8,
    borderWidth: 1.8,
    borderBottomWidth: 0,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  badge: {
    position: 'absolute',
    right: -9,
    top: -4,
    minWidth: 14,
    height: 14,
    paddingHorizontal: 3,
    borderRadius: 7,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0D0B09',
  },
  badgeText: {
    color: colors.bgDeep,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '800',
  },
});
