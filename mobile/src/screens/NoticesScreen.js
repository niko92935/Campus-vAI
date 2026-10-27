import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Badge, Card, EmptyState } from '../components/UI';
import { colors, fonts, radii } from '../theme';

const CATEGORY_COLORS = {
  Academic: { color: colors.gold, background: colors.goldSoft },
  System: { color: colors.blue, background: colors.blueSoft },
  Event: { color: colors.purple, background: colors.purpleSoft },
  Finance: { color: colors.orange, background: colors.orangeSoft },
  Wellbeing: { color: colors.green, background: colors.greenSoft },
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'Academic', label: 'Academic' },
  { id: 'System', label: 'System' },
  { id: 'Event', label: 'Events' },
];

export default function NoticesScreen({ notices, onOpenNotice, onMarkAllRead }) {
  const [filter, setFilter] = useState('all');
  const unread = notices.filter((notice) => !notice.read).length;

  const visibleNotices = useMemo(() => {
    if (filter === 'all') return notices;
    if (filter === 'unread') return notices.filter((notice) => !notice.read);
    return notices.filter((notice) => notice.category === filter);
  }, [filter, notices]);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>STAY INFORMED</Text>
            <Text style={styles.title}>Notice board</Text>
            <Text style={styles.subtitle}>
              {unread > 0 ? `${unread} unread announcement${unread === 1 ? '' : 's'}` : 'You’re all caught up'}
            </Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.7}
            disabled={unread === 0}
            onPress={onMarkAllRead}
            style={[styles.readAllButton, unread === 0 && styles.readAllDisabled]}
          >
            <Text style={styles.readAllText}>{unread === 0 ? 'Caught up' : 'Mark all read'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{notices.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.gold }]}>{unread}</Text>
            <Text style={styles.summaryLabel}>Unread</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.green }]}>
              {notices.filter((notice) => notice.pinned).length}
            </Text>
            <Text style={styles.summaryLabel}>Pinned</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((item) => {
            const isActive = filter === item.id;
            const count =
              item.id === 'all'
                ? notices.length
                : item.id === 'unread'
                  ? unread
                  : notices.filter((notice) => notice.category === item.id).length;
            return (
              <TouchableOpacity
                key={item.id}
                accessibilityRole="button"
                activeOpacity={0.78}
                onPress={() => setFilter(item.id)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {item.label}
                </Text>
                <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                  <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.listHeader}>
          <Text style={styles.listLabel}>
            {filter === 'all' ? 'Latest announcements' : `${visibleNotices.length} results`}
          </Text>
          <Text style={styles.listSort}>Newest first</Text>
        </View>

        {visibleNotices.length === 0 ? (
          <EmptyState
            icon="✓"
            title={filter === 'unread' ? 'No unread notices' : 'Nothing here yet'}
            message={
              filter === 'unread'
                ? 'You have read every announcement. New notices will appear here automatically.'
                : 'There are no announcements in this category right now.'
            }
            actionLabel={filter !== 'all' ? 'View all notices' : undefined}
            onAction={filter !== 'all' ? () => setFilter('all') : undefined}
          />
        ) : (
          visibleNotices.map((notice) => {
            const categoryStyle = CATEGORY_COLORS[notice.category] || CATEGORY_COLORS.System;
            return (
              <TouchableOpacity
                key={notice.id}
                accessibilityRole="button"
                activeOpacity={0.86}
                onPress={() => onOpenNotice(notice.id)}
              >
                <Card style={[styles.noticeCard, !notice.read && styles.noticeCardUnread]}>
                  <View style={styles.noticeTop}>
                    <Badge
                      label={notice.category}
                      color={categoryStyle.color}
                      background={categoryStyle.background}
                    />
                    <View style={styles.noticeTopRight}>
                      {notice.pinned ? <Text style={styles.pin}>📌</Text> : null}
                      <Text style={styles.noticeDate}>{notice.date}</Text>
                    </View>
                  </View>
                  <Text style={[styles.noticeTitle, notice.read && styles.noticeTitleRead]}>
                    {notice.title}
                  </Text>
                  <Text style={styles.noticePreview} numberOfLines={2}>
                    {notice.preview}
                  </Text>
                  <View style={styles.noticeFooter}>
                    <Text style={styles.noticeAuthor}>{notice.author}</Text>
                    {notice.read ? (
                      <Text style={styles.readLabel}>Read</Text>
                    ) : (
                      <View style={styles.unreadPill}>
                        <View style={styles.unreadDot} />
                        <Text style={styles.unreadText}>Unread</Text>
                      </View>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}

        <View style={styles.footerNote}>
          <Text style={styles.footerSparkle}>✦</Text>
          <Text style={styles.footerText}>Notices sync automatically with your school office.</Text>
        </View>
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    ...fonts.eyebrow,
    color: colors.textDim,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  title: {
    ...fonts.h1,
    marginTop: 4,
  },
  subtitle: {
    ...fonts.small,
    marginTop: 4,
    fontSize: 12.5,
  },
  readAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    backgroundColor: colors.goldSoft,
    marginTop: 2,
  },
  readAllDisabled: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  readAllText: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    marginTop: 16,
    paddingVertical: 11,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  summaryLabel: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterScroll: {
    marginHorizontal: -20,
    marginTop: 14,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.goldSoft,
    borderColor: 'rgba(212,175,55,0.36)',
  },
  filterText: {
    color: colors.textMuted,
    fontSize: 10.5,
    fontWeight: '700',
  },
  filterTextActive: {
    color: colors.gold,
  },
  filterCount: {
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountActive: {
    backgroundColor: colors.gold,
  },
  filterCountText: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: '800',
  },
  filterCountTextActive: {
    color: colors.bgDeep,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  listLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  listSort: {
    color: colors.textDim,
    fontSize: 9,
  },
  noticeCard: {
    gap: 7,
    marginBottom: 10,
    padding: 15,
  },
  noticeCardUnread: {
    borderColor: 'rgba(212,175,55,0.24)',
    backgroundColor: '#15120F',
  },
  noticeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  noticeTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pin: {
    fontSize: 9,
  },
  noticeDate: {
    color: colors.textDim,
    fontSize: 8.5,
    fontWeight: '600',
  },
  noticeTitle: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  noticeTitleRead: {
    color: colors.textMuted,
  },
  noticePreview: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  noticeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 2,
  },
  noticeAuthor: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '600',
  },
  readLabel: {
    color: colors.textDim,
    fontSize: 8.5,
    fontWeight: '700',
  },
  unreadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unreadDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.gold,
  },
  unreadText: {
    color: colors.gold,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
  },
  footerSparkle: {
    color: colors.gold,
    fontSize: 10,
  },
  footerText: {
    color: colors.textDim,
    fontSize: 9.5,
    fontWeight: '600',
  },
  bottomSpace: {
    height: 4,
  },
});
