const SEGMENTS = {
  'vip-customer': {
    id: 'seg_vip_2024',
    name: 'VIP Customer',
    description: 'Repeat purchasers with 3+ orders and AOV > £200',
    audience_size: 12400,
    match_rate: 0.23,
  },
  'new-visitor': {
    id: 'seg_new_visitor',
    name: 'New Visitor',
    description: 'First-time site visitors with no purchase history',
    audience_size: 84200,
    match_rate: 0.61,
  },
  'gift-buyer': {
    id: 'seg_gift_q4',
    name: 'Gift Buyer',
    description: 'Users who browsed gift guides or purchased with gift wrap',
    audience_size: 28900,
    match_rate: 0.18,
  },
  'high-intent': {
    id: 'seg_high_intent',
    name: 'High Intent',
    description: 'Users with 5+ page views and cart activity in last 7 days',
    audience_size: 6700,
    match_rate: 0.08,
  },
  'lapsed': {
    id: 'seg_lapsed',
    name: 'Lapsed Customer',
    description: 'Previous buyers with no activity in 90+ days',
    audience_size: 31500,
    match_rate: 0.14,
  },
};

export function getBloomreachSegments() {
  return Object.entries(SEGMENTS).map(([key, seg]) => ({
    key,
    ...seg,
  }));
}

export function resolveBloomreachSegment(segmentKey) {
  const segment = SEGMENTS[segmentKey];
  if (!segment) return null;

  return {
    segment,
    resolved_at: new Date().toISOString(),
    resolution_layer: 'edge',
    sdk_version: '14.2.0',
    request_id: `br-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };
}
