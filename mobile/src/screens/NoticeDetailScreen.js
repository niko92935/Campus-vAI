import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Platform } from 'react-native';
import { Badge, Card, PrimaryButton, ScreenHeader } from '../components/UI';
import { colors, fonts, radii } from '../theme';

const CATEGORY_COLORS = {
  Academic: { color: colors.gold, background: colors.goldSoft },
  System: { color: colors.blue, background: colors.blueSoft },
  Event: { color: colors.purple, background: colors.purpleSoft },
  Finance: { color: colors.orange, background: colors.orangeSoft },
  Wellbeing: { color: colors.green, background: colors.greenSoft },
};

export default function NoticeDetailScreen({ notice, onBack, notify }) {
  const categoryStyle = CATEGORY_COLORS[notice.category] || CATEGORY_COLORS.System;
  const paragraphs = notice.body.split('\n\n');

  const handleShare = async () => {
    const message = `MindLink notice: ${notice.title}\n\n${notice.preview}`;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        notify('Notice copied to your clipboard.');
      } else {
        await Share.share({ message });
      }
    } catch (error) {
      notify('Unable to share this notice right now.');
    }
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Announcement"
        onBack={onBack}
        right={
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.7}
            onPress={handleShare}
          >
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.metaRow}>
          <Badge
            label={notice.category}
            color={categoryStyle.color}
            background={categoryStyle.background}
          />
          <Text style={styles.date}>{notice.date}</Text>
        </View>

        <Text style={styles.title}>{notice.title}</Text>

        <View style={styles.authorRow}>
          <View style={styles.authorIcon}>
            <Text style={styles.authorIconText}>📢</Text>
          </View>
          <View style={styles.authorText}>
            <Text style={styles.authorName}>{notice.author}</Text>
            <Text style={styles.authorMeta}>MindLink Student Office</Text>
          </View>
          {notice.pinned ? (
            <View style={styles.pinnedTag}>
              <Text style={styles.pinnedText}>📌 Pinned</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        <View style={styles.body}>
          {paragraphs.map((paragraph, index) => (
            <Text key={`${notice.id}-p-${index}`} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>

        <Card style={styles.deliveryCard}>
          <View style={styles.deliveryIcon}>
            <Text style={styles.deliveryIconText}>✓</Text>
          </View>
          <View style={styles.deliveryText}>
            <Text style={styles.deliveryTitle}>Delivered to your cohort</Text>
            <Text style={styles.deliveryMeta}>
              Sent to all Senior Secondary · Science students and guardians.
            </Text>
          </View>
        </Card>

        <View style={styles.helpRow}>
          <Text style={styles.helpText}>Questions about this notice?</Text>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.7}
            onPress={() => notify('Opening a message to the student office…')}
          >
            <Text style={styles.helpAction}>Contact office →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Got it" onPress={onBack} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  shareText: {
    color: colors.gold,
    fontSize: 10.5,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    color: colors.textDim,
    fontSize: 9.5,
    fontWeight: '600',
  },
  title: {
    ...fonts.h1,
    fontSize: 25,
    lineHeight: 32,
    marginTop: 12,
    letterSpacing: -0.6,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 16,
  },
  authorIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorIconText: {
    fontSize: 14,
  },
  authorText: {
    flex: 1,
    gap: 1,
  },
  authorName: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  authorMeta: {
    color: colors.textDim,
    fontSize: 9,
  },
  pinnedTag: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: colors.goldSoft,
  },
  pinnedText: {
    color: colors.gold,
    fontSize: 8,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 18,
  },
  body: {
    gap: 14,
  },
  paragraph: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 22,
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 22,
    backgroundColor: colors.surfaceAlt,
    padding: 13,
  },
  deliveryIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.greenSoft,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryIconText: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '800',
  },
  deliveryText: {
    flex: 1,
    gap: 2,
  },
  deliveryTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  deliveryMeta: {
    color: colors.textDim,
    fontSize: 9.5,
    lineHeight: 14,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    gap: 8,
  },
  helpText: {
    color: colors.textDim,
    fontSize: 10,
  },
  helpAction: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '700',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#0D0B09',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
});
