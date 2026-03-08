import { createClient } from '@supabase/supabase-js';

// Configuration helper
const getConfig = () => {
  if (typeof window === 'undefined') return { url: '', key: '' };
  return {
    url: localStorage.getItem('supa_url') || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    key: localStorage.getItem('supa_anon_key') || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  };
};

// Create client with current config
const { url, key } = getConfig();
export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder');

// Helper for DB operations with local caching
const CACHE_PREFIX = 'songdo_cache_';
const OFFLINE_Q_KEY = 'songdo_offline_queue';
const LOCAL_DATA_KEY = 'songdo_local_data';
const SYSTEM_SETTINGS_KEY = 'songdo_system_settings';

const DEFAULT_SETTINGS = {
  admin_page_name: 'SONGDO ADMIN',
  busker_deposit: 50000,
  seller_booth_fee: 30000,
  deposit_bank: '신한은행',
  deposit_account: '110-123-456789'
};

const normalizeAdminProfiles = (profiles: any[] = []) => {
  // 마스터관리자 고정 계정 (항상 목록에 포함, 역할 고정)
  const masterAdminProfile = {
    id: 'master-admin',
    name: '마스터관리자',
    email: 'doll25@naver.com',
    password: '@1234',
    role: 'master_admin',
    status: 'active',
    last_login: new Date().toISOString(),
    created_at: '2024-01-01'
  };

  // profiles에 마스터관리자가 없으면 맨 앞에 추가
  const hasMasterAdmin = profiles.some(
    (p: any) => String(p.email || '').trim().toLowerCase() === 'doll25@naver.com' || p.id === 'master-admin'
  );
  const base = hasMasterAdmin ? profiles : [masterAdminProfile, ...profiles];

  return base.map((profile: any) => {
    const normalizedEmail = String(profile?.email || '').trim().toLowerCase();
    // 마스터관리자 계정은 항상 master_admin 역할 고정 (외부에서 변경 불가)
    if (normalizedEmail === 'doll25@naver.com' || profile.id === 'master-admin') {
      return {
        ...profile,
        id: 'master-admin',
        name: profile.name || '마스터관리자',
        password: '@1234',
        role: 'master_admin',
        status: 'active',
      };
    }
    return profile;
  });
};

const MOCK_DATA = {
  images: [
    { id: 'img-logo', section: 'brand', url: 'https://picsum.photos/seed/songdo-logo/200/200', alt: '홈페이지 로고', active: true },
    { id: 'img-hero', section: 'hero', url: 'https://picsum.photos/seed/songdo-hero/1920/1080', alt: '메인 히어로 일러스트', active: true },
    { id: 'img-about-1', section: 'about', url: 'https://picsum.photos/seed/busker-stage/800/800', alt: '버스킹 공연 실사', active: true },
    { id: 'img-about-2', section: 'about', url: 'https://picsum.photos/seed/flea-market/800/800', alt: '플리마켓 부스 실사', active: true },
    { id: 'img-detail-1', section: 'details', url: 'https://picsum.photos/seed/detail-schedule/600/400', alt: '행사 안내 카드 1', active: true },
    { id: 'img-detail-2', section: 'details', url: 'https://picsum.photos/seed/detail-location/600/400', alt: '행사 안내 카드 2', active: true },
    { id: 'img-detail-3', section: 'details', url: 'https://picsum.photos/seed/detail-support/600/400', alt: '행사 안내 카드 3', active: true },
    { id: 'img-detail-popup-1', section: 'details-popup', url: 'https://picsum.photos/seed/detail-schedule/1600/1200', alt: '행사 안내 팝업 1', active: true },
    { id: 'img-detail-popup-2', section: 'details-popup', url: 'https://picsum.photos/seed/detail-location/1600/1200', alt: '행사 안내 팝업 2', active: true },
    { id: 'img-detail-popup-3', section: 'details-popup', url: 'https://picsum.photos/seed/detail-support/1600/1200', alt: '행사 안내 팝업 3', active: true },
    { id: 'img-busker-bg', section: 'busker', url: 'https://picsum.photos/seed/outdoor-concert/1920/1080', alt: '버스커 섹션 배경', active: true },
    { id: 'img-seller-1', section: 'seller', url: 'https://picsum.photos/seed/seller-jewelry/500/500', alt: '셀러 이미지 1', active: true },
    { id: 'img-seller-2', section: 'seller', url: 'https://picsum.photos/seed/seller-goods/500/500', alt: '셀러 이미지 2', active: true },
    { id: 'img-seller-3', section: 'seller', url: 'https://picsum.photos/seed/seller-food/500/500', alt: '셀러 이미지 3', active: true },
    { id: 'img-seller-4', section: 'seller', url: 'https://picsum.photos/seed/seller-camping/500/500', alt: '셀러 이미지 4', active: true },
    { id: 'img-gallery-1', section: 'gallery', url: 'https://picsum.photos/seed/gallery-family/800/600', alt: '갤러리 1', caption: '가족과 함께하는 주말', colSpan: 'col-span-1 md:col-span-2', rowSpan: 'row-span-1', minHeight: '220px', active: true },
    { id: 'img-gallery-2', section: 'gallery', url: 'https://picsum.photos/seed/gallery-concert/600/800', alt: '갤러리 2', caption: '라이브 공연의 열기', colSpan: 'col-span-1', rowSpan: 'md:row-span-2', minHeight: '220px', active: true },
    { id: 'img-gallery-3', section: 'gallery', url: 'https://picsum.photos/seed/gallery-craft/600/600', alt: '갤러리 3', caption: '특별한 수제 제품들', colSpan: 'col-span-1', rowSpan: 'row-span-1', minHeight: '220px', active: true },
    { id: 'img-gallery-4', section: 'gallery', url: 'https://picsum.photos/seed/gallery-market/800/600', alt: '갤러리 4', caption: '마켓에서의 만남', colSpan: 'col-span-1 md:col-span-2', rowSpan: 'row-span-1', minHeight: '220px', active: true },
    { id: 'img-gallery-5', section: 'gallery', url: 'https://picsum.photos/seed/gallery-busking/600/800', alt: '갤러리 5', caption: '감성적인 버스킹', colSpan: 'col-span-1', rowSpan: 'md:row-span-2', minHeight: '220px', active: true },
    { id: 'img-gallery-6', section: 'gallery', url: 'https://picsum.photos/seed/gallery-camping/800/600', alt: '갤러리 6', caption: '송도 캠핑장 전경', colSpan: 'col-span-1 md:col-span-2', rowSpan: 'row-span-1', minHeight: '220px', active: true }
  ],
  buskers: [
    { id: 'b1', name: '이지은', team: '솔로', genre: '어쿠스틱', phone: '010-1234-5678', email: 'jieun@example.com', birth_date: '1995-05-10', organization: '프리랜서', event_date: '2026-03-07', status: 'approved', fee: 50000, applied_at: '2026-02-20T10:00:00Z', note: '[문의] 통기타 연주 및 보컬' },
    { id: 'b2', name: '김태양', team: '선셋밴드', genre: '인디 록', phone: '010-2345-6789', email: 'sun@example.com', birth_date: '1992-08-15', organization: '선셋엔터', event_date: '2026-03-07', status: 'approved', fee: 50000, applied_at: '2026-02-21T14:20:00Z', note: '[문의] 4인조 밴드, 앰프 필요' },
    { id: 'b3', name: '박소리', team: '솔로', genre: '재즈', phone: '010-3456-7890', email: 'sori@example.com', birth_date: '1998-12-05', organization: '개인', event_date: '2026-03-14', status: 'approved', fee: 50000, applied_at: '2026-02-25T09:15:00Z', note: '[문의] 전자피아노 지참' },
    { id: 'b4', name: '최준혁', team: '듀오 제이', genre: '팝', phone: '010-4567-8901', email: 'jun@example.com', birth_date: '1994-03-20', organization: '듀오제이', event_date: '2026-03-14', status: 'rejected', fee: 0, applied_at: '2026-02-24T11:00:00Z', note: '[문의] 보컬과 기타 2인 구성입니다.', rejection_reason: '장비 미비' },
    { id: 'b5', name: '윤아름', team: '아름밴드', genre: '포크', phone: '010-5678-9012', email: 'areum@example.com', birth_date: '1996-11-28', organization: '개인', event_date: '2026-03-21', status: 'approved', fee: 50000, applied_at: '2026-02-28T16:00:00Z', note: '[문의] 5인조 포크 밴드' },
    { id: 'b6', name: '정민수', team: '솔로', genre: '힙합', phone: '010-6789-0123', email: 'min@example.com', birth_date: '1999-07-12', organization: '힙합크루', event_date: '2026-03-21', status: 'pending', fee: 0, applied_at: '2026-03-01T12:00:00Z', note: '[문의] 랩 & 비트박스' }
  ],
  sellers: [
    { id: 's1', name: '이꽃', category: '핸드메이드 공예', booths: 1, phone: '010-1111-2222', email: 'flower@example.com', birth_date: '1988-01-20', organization: '이꽃공방', event_date: '2026-03-07', fee: 30000, status: 'paid', applied_at: '2026-02-19T09:30:00Z', note: '[문의] 직접 만든 도자기' },
    { id: 's2', name: '박나무', category: '빈티지 소품', booths: 2, phone: '010-2222-3333', email: 'tree@example.com', birth_date: '1985-02-10', organization: '나무빈티지', event_date: '2026-03-07', fee: 60000, status: 'approved', applied_at: '2026-02-20T16:45:00Z', note: '[문의] 유럽 빈티지 인테리어' },
    { id: 's3', name: '최바다', category: '먹거리', booths: 1, phone: '010-3333-4444', email: 'sea@example.com', birth_date: '1990-06-15', organization: '바다푸드', event_date: '2026-03-14', status: 'pending', fee: 30000, applied_at: '2026-02-26T13:10:00Z', note: '[문의] 수제 쿠키 및 타르트' },
    { id: 's4', name: '정여름', category: '패션/의류', booths: 1, phone: '010-4444-5555', email: 'summer@example.com', birth_date: '1993-07-30', organization: '여름의류', event_date: '2026-03-14', status: 'paid', fee: 30000, applied_at: '2026-02-27T10:00:00Z', note: '[문의] 천연 염색 의류' },
    { id: 's5', name: '한구름', category: '생활잡화', booths: 1, phone: '010-5555-6666', email: 'cloud@example.com', birth_date: '1987-10-12', organization: '구름상점', event_date: '2026-03-21', status: 'approved', fee: 30000, applied_at: '2026-03-01T14:00:00Z', note: '[문의] 친환경 세제 및 수세미' },
    { id: 's6', name: '김하늘', category: '액세서리', booths: 1, phone: '010-6666-7777', email: 'sky@example.com', birth_date: '1995-04-05', organization: '하늘공방', event_date: '2026-03-21', status: 'pending', fee: 30000, applied_at: '2026-03-02T15:30:00Z', note: '[문의] 써지컬 스틸 귀걸이' }
  ],
  revenue: [],
  events: [
    { id: 'e1',  title: '봄맞이 버스킹 페스티벌', event_date: '2026-03-07', busker_count: 3,  seller_count: 8,  note: '봄 특집' },
    { id: 'e2',  title: '인디밴드 라이브 공연',    event_date: '2026-03-08', busker_count: 2,  seller_count: 6,  note: '' },
    { id: 'e3',  title: '봄 플리마켓 데이',        event_date: '2026-03-14', busker_count: 1,  seller_count: 12, note: '' },
    { id: 'e4',  title: '어쿠스틱 버스킹 나이트',  event_date: '2026-03-15', busker_count: 4,  seller_count: 5,  note: '' },
    { id: 'e5',  title: '벚꽃 버스킹 마켓',        event_date: '2026-03-21', busker_count: 5,  seller_count: 14, note: '봄 테마' },
    { id: 'e6',  title: '봄 야외 음악회',           event_date: '2026-03-22', busker_count: 3,  seller_count: 10, note: '' },
    { id: 'e7',  title: '감성 버스킹 타임',         event_date: '2026-03-28', busker_count: 2,  seller_count: 8,  note: '' },
    { id: 'e8',  title: '주말 마켓 & 공연',         event_date: '2026-03-29', busker_count: 4,  seller_count: 13, note: '' },
    { id: 'e9',  title: '봄 라이브 콘서트',         event_date: '2026-04-04', busker_count: 3,  seller_count: 9,  note: '' },
    { id: 'e10', title: '꽃 플리마켓 페어',         event_date: '2026-04-05', busker_count: 2,  seller_count: 15, note: '봄 테마' },
    { id: 'e11', title: '인디음악 페스티벌',        event_date: '2026-04-11', busker_count: 5,  seller_count: 10, note: '' },
    { id: 'e12', title: '봄 마켓 & 핸드메이드',    event_date: '2026-04-12', busker_count: 2,  seller_count: 14, note: '' },
    { id: 'e13', title: '어쿠스틱 오후',            event_date: '2026-04-18', busker_count: 3,  seller_count: 7,  note: '' },
    { id: 'e14', title: '봄 감성 버스킹',           event_date: '2026-04-19', busker_count: 4,  seller_count: 9,  note: '' },
  ],
  homepage_popups: [],
  busker_pool: [
    { id: 'p_b1', name: '이지은', team: '솔로', genre: '어쿠스틱', phone: '010-1234-5678', email: 'jieun@example.com', app_count: 3, last_applied_at: '2026-03-07T10:00:00Z', created_at: '2025-01-10T00:00:00Z' },
    { id: 'p_b2', name: '김태양', team: '선셋밴드', genre: '인디 록', phone: '010-2345-6789', email: 'sun@example.com', app_count: 2, last_applied_at: '2026-03-07T14:20:00Z', created_at: '2025-02-15T00:00:00Z' },
    { id: 'p_b3', name: '박소리', team: '솔로', genre: '재즈', phone: '010-3456-7890', email: 'sori@example.com', app_count: 5, last_applied_at: '2026-03-14T09:15:00Z', created_at: '2024-12-05T00:00:00Z' }
  ],
  seller_pool: [
    { id: 'p_s1', name: '이꽃', category: '핸드메이드 공예', phone: '010-1111-2222', email: 'flower@example.com', app_count: 4, last_applied_at: '2026-03-07T09:30:00Z', created_at: '2025-01-20T00:00:00Z' },
    { id: 'p_s2', name: '박나무', category: '빈티지 소품', phone: '010-2222-3333', email: 'tree@example.com', app_count: 1, last_applied_at: '2026-03-07T16:45:00Z', created_at: '2026-02-10T00:00:00Z' }
  ],
  newsletter: [
    { id: 'n1', email: 'news1@example.com', created_at: '2026-03-01T10:00:00Z' },
    { id: 'n2', email: 'news2@example.com', created_at: '2026-03-02T11:00:00Z' }
  ],
  faqs: [
    { id: 'f1', question: '참가 비용이 있나요?', answer: '버스커와 플리마켓 셀러 모두 참가 비용이 없습니다. 무료로 공간을 제공하며, 기본 음향 장비도 지원됩니다. 다만 사전 신청 및 심사가 필요합니다.', order_seq: 1 },
    { id: 'f2', question: '음향 장비는 제공되나요?', answer: '네, 기본적인 PA 시스템(스피커, 마이크, 믹서)을 무료로 제공합니다. 개인 악기나 앰프가 필요한 경우 직접 가져오셔야 합니다.', order_seq: 2 },
    { id: 'f3', question: '날씨가 좋지 않으면 어떻게 되나요?', answer: '우천 시에는 행사가 취소되거나 일정이 변경될 수 있습니다. SNS 공식 채널을 통해 사전에 공지되므로 팔로우해 주세요. 일정 변경 시 개별 연락드립니다.', order_seq: 3 },
    { id: 'f4', question: '신청 후 취소가 가능한가요?', answer: '네, 행사 3일 전까지는 취소가 가능합니다. 인스타그램 DM 또는 이메일로 연락해 주시면 됩니다. 당일 취소는 이후 참가 신청에 제한이 있을 수 있습니다.', order_seq: 4 },
    { id: 'f5', question: '주차 공간이 있나요?', answer: '송도 국제캠핑장 내 주차장을 이용하실 수 있습니다. 주말에는 방문객이 많아 주차 공간이 부족할 수 있으므로, 대중교통 이용을 권장합니다.', order_seq: 5 },
    { id: 'f6', question: '어떻게 신청하나요?', answer: '이 페이지 하단의 참가 신청 양식을 작성하거나, 인스타그램 DM으로 문의하시면 됩니다. 신청 후 검토를 거쳐 1~3일 내에 결과를 알려드립니다.', order_seq: 6 }
  ],
  newsletter_templates: [
    { id: 't1', title: '기본 행사 안내', subject: '[송도 버스킹 마켓] 이번 주말 소식을 전해드립니다!', content: '안녕하세요! 이번 주말 송도 국제캠핑장에서 열리는 행사 안내입니다.\n\n다양한 버스킹 공연과 개성 넘치는 플리마켓 셀러분들이 여러분을 기다리고 있습니다.\n가족, 친구와 함께 즐거운 시간 보내세요!', created_at: '2026-03-01T00:00:00Z' },
    { id: 't2', title: '우천 취소 공지', subject: '[송도 버스킹 마켓] 기상 악화로 인한 행사 취소 안내', content: '안녕하세요. 송도 버스킹 마켓 운영팀입니다.\n\n금일 기상 악화(우천) 예보로 인해 관람객과 출연진의 안전을 위하여 행사가 취소되었음을 알려드립니다.\n기다려주신 분들께 양해 부탁드리며, 다음 주에 더 좋은 모습으로 찾아뵙겠습니다.', created_at: '2026-03-02T00:00:00Z' }
  ]
};

const mergeRecordsById = (primary: any[] = [], secondary: any[] = []) =>
  [...primary, ...secondary].reduce((acc: any[], item: any) => {
    if (!item?.id) return acc;
    const existingIndex = acc.findIndex((entry) => entry.id === item.id);
    if (existingIndex >= 0) acc[existingIndex] = { ...acc[existingIndex], ...item };
    else acc.push(item);
    return acc;
  }, []);

const sanitizePoolNote = (note: any, fallback = '') => {
  const normalized = typeof note === 'string' ? note.trim() : '';
  if (!normalized) return fallback;

  const message = normalized.split('[SNS/링크]')[0].replace('[문의]', '').trim();
  if (message.startsWith('거절 사유:')) return fallback;

  return normalized;
};

const normalizePoolRecord = (type: 'busker' | 'seller', source: any, existing: any = {}) => {
  const base = {
    id: source?.id || existing?.id,
    name: source?.name || existing?.name || '',
    phone: source?.phone || existing?.phone || '',
    email: source?.email || existing?.email || '',
    birth_date: source?.birth_date || existing?.birth_date || '',
    organization: source?.organization || existing?.organization || '',
    note: sanitizePoolNote(source?.note, existing?.note || ''),
    app_count: source?.app_count ?? existing?.app_count ?? 1,
    created_at: source?.created_at || existing?.created_at || new Date().toISOString(),
    last_applied_at: source?.last_applied_at || existing?.last_applied_at || new Date().toISOString(),
  };

  if (type === 'busker') {
    return {
      ...base,
      team: source?.team || existing?.team || '',
      genre: source?.genre || existing?.genre || '',
    };
  }

  return {
    ...base,
    category: source?.category || existing?.category || '',
  };
};

const isMissingColumnError = (error: any, column: string) => {
  if (!error?.message) return false;
  const msg = String(error.message).toLowerCase();
  return msg.includes(`column "${column.toLowerCase()}" does not exist`) || 
         msg.includes(`Could not find the ${column.toLowerCase()}' column`) ||
         msg.includes(`'${column.toLowerCase()}' column`) ||
         msg.includes(`column "${column.toLowerCase()}" of relation`);
};

const isMissingTableError = (error: any, table: string) => {
  if (!error?.message) return false;
  const msg = String(error.message).toLowerCase();
  const t = table.toLowerCase();
  return (msg.includes(`relation "${t}" does not exist`) || 
          msg.includes(`could not find the table "${t}"`) ||
          msg.includes(`'${t}'`) ||
          msg.includes(t)) && 
         (msg.includes('relation') || msg.includes('schema cache') || msg.includes('table'));
};

const omitColumn = (value: any, column: string) => {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (!item || typeof item !== 'object') return item;
      const { [column]: _removed, ...rest } = item;
      return rest;
    });
  }

  if (!value || typeof value !== 'object') return value;
  const { [column]: _removed, ...rest } = value;
  return rest;
};

const SAMPLE_RESET_TARGETS = [
  { table: 'buskers', lockId: '00000000-0000-0000-0000-000000000000', optional: false },
  { table: 'sellers', lockId: '00000000-0000-0000-0000-000000000000', optional: false },
  { table: 'revenue', lockId: '00000000-0000-0000-0000-000000000000', optional: true },
  { table: 'events', lockId: '00000000-0000-0000-0000-000000000000', optional: false },
  { table: 'images', lockId: 'seed-lock-id', optional: false },
  { table: 'busker_pool', lockId: 'pool-seed-lock', optional: false },
  { table: 'seller_pool', lockId: 'pool-seed-lock', optional: false },
  { table: 'newsletter', lockId: 'news-seed-lock', optional: true },
  { table: 'faqs', lockId: 'faq-seed-lock', optional: true },
  { table: 'newsletter_templates', lockId: 'news-temp-seed-lock', optional: true },
] as const;

export const DB = {
  // NEWSLETTER
  async getNewsletters() {
    const local = this.getLocalData('newsletter');
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from('newsletter').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          this.setLocalData('newsletter', data);
          return data;
        }
      } catch (e) { console.error(e); }
    }
    return local || MOCK_DATA.newsletter;
  },

  async subscribeNewsletter(email: string) {
    const list = await this.getNewsletters();
    if (list.some((n: any) => n.email === email)) return { error: { message: '이미 구독 중인 이메일입니다.' } };
    
    const newItem = { id: 'n_' + Date.now(), email, created_at: new Date().toISOString() };
    const newList = [newItem, ...(Array.isArray(list) ? list : [])];
    this.setLocalData('newsletter', newList);
    
    if (this.isConfigured()) {
      return await supabase.from('newsletter').insert([{ email }]);
    }
    return { data: newItem, error: null };
  },

  async deleteNewsletter(id: string) {
    const list = this.getLocalData('newsletter') || [];
    this.setLocalData('newsletter', list.filter((n: any) => n.id !== id));
    if (this.isConfigured()) {
      return await supabase.from('newsletter').delete().eq('id', id);
    }
    return { error: null };
  },

  // FAQ
  async getFaqs() {
    const local = this.getLocalData('faqs');
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from('faqs').select('*').order('order_seq', { ascending: true });
        if (!error && data) {
          this.setLocalData('faqs', data);
          return data;
        }
      } catch (e) { console.error(e); }
    }
    return local || MOCK_DATA.faqs;
  },

  async updateFaq(id: string, payload: any) {
    const list = await this.getFaqs();
    const updated = list.map((f: any) => f.id === id ? { ...f, ...payload } : f);
    this.setLocalData('faqs', updated);
    
    if (this.isConfigured()) {
      return await supabase.from('faqs').update(payload).eq('id', id);
    }
    return { error: null };
  },

  async createFaq(payload: any) {
    const list = await this.getFaqs();
    const newItem = { id: 'faq_' + Date.now(), ...payload, order_seq: list.length + 1 };
    this.setLocalData('faqs', [...list, newItem]);
    
    if (this.isConfigured()) {
      return await supabase.from('faqs').insert([payload]);
    }
    return { data: newItem, error: null };
  },

  async deleteFaq(id: string) {
    const list = this.getLocalData('faqs') || [];
    this.setLocalData('faqs', list.filter((f: any) => f.id !== id));
    if (this.isConfigured()) {
      return await supabase.from('faqs').delete().eq('id', id);
    }
    return { error: null };
  },

  async reorderFaqs(orderedIds: string[]) {
    const list = this.getLocalData('faqs') || [];
    const reordered = orderedIds.map((id, idx) => {
      const item = list.find((f: any) => f.id === id);
      return { ...item, order_seq: idx + 1 };
    });
    this.setLocalData('faqs', reordered);
    
    if (this.isConfigured()) {
      for (const item of reordered) {
        await supabase.from('faqs').update({ order_seq: item.order_seq }).eq('id', item.id);
      }
    }
    return { success: true };
  },

  // NEWSLETTER TEMPLATES
  async getNewsletterTemplates() {
    const local = this.getLocalData('newsletter_templates');
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from('newsletter_templates').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          this.setLocalData('newsletter_templates', data);
          return data;
        }
      } catch (e) { console.error(e); }
    }
    return local || MOCK_DATA.newsletter_templates;
  },

  async createNewsletterTemplate(payload: any) {
    const list = await this.getNewsletterTemplates();
    const newItem = { id: 'temp_' + Date.now(), ...payload, created_at: new Date().toISOString() };
    this.setLocalData('newsletter_templates', [newItem, ...list]);
    
    if (this.isConfigured()) {
      return await supabase.from('newsletter_templates').insert([payload]);
    }
    return { data: newItem, error: null };
  },

  async deleteNewsletterTemplate(id: string) {
    const list = this.getLocalData('newsletter_templates') || [];
    this.setLocalData('newsletter_templates', list.filter((t: any) => t.id !== id));
    if (this.isConfigured()) {
      return await supabase.from('newsletter_templates').delete().eq('id', id);
    }
    return { error: null };
  },

  // ... (existing methods)
  
  // POOL MANAGEMENT
  async getPool(table: 'busker_pool' | 'seller_pool') {
    const type = table === 'busker_pool' ? 'busker' : 'seller';
    const local = this.getStoredLocalData(table);
    const normalizedLocal = (local || []).map((item: any) => normalizePoolRecord(type, item, item));

    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
        if (!error && data) {
          const normalizedRemote = data.map((item: any) => normalizePoolRecord(type, item, item));
          this.setLocalData(table, normalizedRemote);
          return normalizedRemote;
        }
      } catch (e) { console.error(e); }
    }
    this.setLocalData(table, normalizedLocal);
    return normalizedLocal;
  },

  async addToPool(type: 'busker' | 'seller', applicantData: any) {
    const table = type === 'busker' ? 'busker_pool' : 'seller_pool';
    const pool = await this.getPool(table);
    
    // Check for existing by phone or email
    const exists = pool.find((p: any) => p.phone === applicantData.phone || p.email === applicantData.email);
    
    if (exists) {
      // Update existing record with latest info and increment application count
      const updatedData = normalizePoolRecord(type, {
        ...exists,
        ...applicantData,
        id: exists.id, // keep original id
        app_count: (exists.app_count || 1) + 1,
        last_applied_at: new Date().toISOString()
      }, exists);
      const updatedPool = pool.map((p: any) => p.id === exists.id ? updatedData : p);
      this.setLocalData(table, updatedPool);
      
      if (this.isConfigured()) {
        let res = await supabase.from(table).update(updatedData).eq('id', exists.id);
        if (res.error && (isMissingColumnError(res.error, 'birth_date') || isMissingColumnError(res.error, 'organization'))) {
          let cleanPayload = { ...updatedData };
          if (isMissingColumnError(res.error, 'birth_date')) cleanPayload = omitColumn(cleanPayload, 'birth_date');
          if (isMissingColumnError(res.error, 'organization')) cleanPayload = omitColumn(cleanPayload, 'organization');
          res = await supabase.from(table).update(cleanPayload).eq('id', exists.id);
        }
        return { success: !res.error, is_new: false, error: res.error };
      }
      return { success: true, is_new: false };
    } else {
      // Create new pool record
      const newData = normalizePoolRecord(type, {
        ...applicantData,
        id: 'pool_' + Date.now(),
        app_count: 1,
        created_at: new Date().toISOString(),
        last_applied_at: new Date().toISOString()
      });
      this.setLocalData(table, [newData, ...pool]);
      
      if (this.isConfigured()) {
        let res = await supabase.from(table).insert([newData]);
        if (res.error && (isMissingColumnError(res.error, 'birth_date') || isMissingColumnError(res.error, 'organization'))) {
          let cleanPayload = { ...newData };
          if (isMissingColumnError(res.error, 'birth_date')) cleanPayload = omitColumn(cleanPayload, 'birth_date');
          if (isMissingColumnError(res.error, 'organization')) cleanPayload = omitColumn(cleanPayload, 'organization');
          res = await supabase.from(table).insert([cleanPayload]);
        }
        return { success: !res.error, is_new: true, error: res.error };
      }
      return { success: true, is_new: true };
    }
  },

  async transferApplicantToPool(type: 'busker' | 'seller', applicantData: any) {
    const table = type === 'busker' ? 'busker_pool' : 'seller_pool';
    const pool = await this.getPool(table);
    const exists = pool.find((p: any) => p.phone === applicantData.phone || p.email === applicantData.email);

    if (exists) {
      const updatedData = normalizePoolRecord(type, {
        ...exists,
        ...applicantData,
        id: exists.id,
        app_count: (exists.app_count || 1) + 1,
        last_applied_at: new Date().toISOString(),
      }, exists);
      const updatedPool = pool.map((p: any) => p.id === exists.id ? updatedData : p);
      this.setLocalData(table, updatedPool);

      if (this.isConfigured()) {
        let res = await supabase.from(table).update(updatedData).eq('id', exists.id);
        if (res.error && (isMissingColumnError(res.error, 'birth_date') || isMissingColumnError(res.error, 'organization'))) {
          let cleanPayload = { ...updatedData };
          if (isMissingColumnError(res.error, 'birth_date')) cleanPayload = omitColumn(cleanPayload, 'birth_date');
          if (isMissingColumnError(res.error, 'organization')) cleanPayload = omitColumn(cleanPayload, 'organization');
          res = await supabase.from(table).update(cleanPayload).eq('id', exists.id);
        }
      }
      return { success: true, is_new: false };
    }

    const newData = normalizePoolRecord(type, {
      id: `pool_${Date.now()}`,
      ...applicantData,
      app_count: 1,
      created_at: new Date().toISOString(),
      last_applied_at: new Date().toISOString(),
    });
    this.setLocalData(table, [newData, ...pool]);

    if (this.isConfigured()) {
      let res = await supabase.from(table).insert([newData]);
      if (res.error && (isMissingColumnError(res.error, 'birth_date') || isMissingColumnError(res.error, 'organization'))) {
        let cleanPayload = { ...newData };
        if (isMissingColumnError(res.error, 'birth_date')) cleanPayload = omitColumn(cleanPayload, 'birth_date');
        if (isMissingColumnError(res.error, 'organization')) cleanPayload = omitColumn(cleanPayload, 'organization');
        res = await supabase.from(table).insert([cleanPayload]);
      }
    }
    return { success: true, is_new: true };
  },

  async checkDuplicate(type: 'busker' | 'seller', phone: string, email: string) {
    const table = type === 'busker' ? 'busker_pool' : 'seller_pool';
    const pool = await this.getPool(table);
    const found = pool.find((p: any) => p.phone === phone || p.email === email);
    return found ? { is_duplicate: true, app_count: found.app_count, last_date: found.last_applied_at } : { is_duplicate: false };
  },

  async updatePool(table: 'busker_pool' | 'seller_pool', id: string, payload: any) {
    const type = table === 'busker_pool' ? 'busker' : 'seller';
    const local = this.getStoredLocalData(table);
    const updated = local.map((item: any) =>
      item.id === id
        ? { ...normalizePoolRecord(type, { ...item, ...payload }, item), updated_at: new Date().toISOString() }
        : item
    );
    this.setLocalData(table, updated);
    
    if (this.isConfigured()) {
      const current = local.find((item: any) => item.id === id) || {};
      return await supabase
        .from(table)
        .update({ ...normalizePoolRecord(type, { ...current, ...payload }, current), updated_at: new Date().toISOString() })
        .eq('id', id);
    }
    return { error: null };
  },

  async deletePool(table: 'busker_pool' | 'seller_pool', id: string) {
    const local = this.getStoredLocalData(table);
    const filtered = local.filter((item: any) => item.id !== id);
    this.setLocalData(table, filtered);
    
    if (this.isConfigured()) {
      return await supabase.from(table).delete().eq('id', id);
    }
    return { error: null };
  },
  // SYSTEM SETTINGS
  getSystemSettings() {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const saved = localStorage.getItem(SYSTEM_SETTINGS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  },
  saveSystemSettings(settings: any) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SYSTEM_SETTINGS_KEY, JSON.stringify(settings));
    this.cacheClear();
  },

  // INTERNAL HELPERS
  isConfigured() {
    const c = getConfig();
    return c.url && c.url !== '' && !c.url.includes('placeholder');
  },

  cacheGet(key: string) {
    if (typeof window === 'undefined') return null;
    try {
      const v = JSON.parse(localStorage.getItem(CACHE_PREFIX + key) || '');
      if (v && Date.now() - v.ts < 30 * 60000) return v.data;
    } catch { /* ignore */ }
    return null;
  },
  cacheSet(key: string, data: any) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
    } catch { /* ignore */ }
  },
  cacheClear() {
    if (typeof window === 'undefined') return;
    Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX)).forEach(k => localStorage.removeItem(k));
  },

  getLocalData(table: string) {
    if (typeof window === 'undefined') return (MOCK_DATA as any)[table];
    try {
      const all = JSON.parse(localStorage.getItem(LOCAL_DATA_KEY) || '{}');
      return all[table] || (MOCK_DATA as any)[table];
    } catch { return (MOCK_DATA as any)[table]; }
  },
  getStoredLocalData(table: string) {
    if (typeof window === 'undefined') return [];
    try {
      const all = JSON.parse(localStorage.getItem(LOCAL_DATA_KEY) || '{}');
      return all[table] || [];
    } catch { return []; }
  },
  getUnsyncedLocalData(table: string) {
    const local = this.getStoredLocalData(table);
    return local.filter((item: any) => typeof item?.id === 'string' && item.id.startsWith('temp_'));
  },
  setLocalData(table: string, data: any) {
    if (typeof window === 'undefined') return;
    try {
      const all = JSON.parse(localStorage.getItem(LOCAL_DATA_KEY) || '{}');
      all[table] = data;
      localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(all));
    } catch { /* ignore */ }
  },

  // OFFLINE QUEUE
  getQueue() {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(OFFLINE_Q_KEY) || '[]'); } catch { return []; }
  },
  enqueue(op: any) {
    if (typeof window === 'undefined') return;
    const q = this.getQueue();
    q.push({ ...op, ts: Date.now(), qid: Date.now() + Math.random() });
    localStorage.setItem(OFFLINE_Q_KEY, JSON.stringify(q));
  },
  clearQueue() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(OFFLINE_Q_KEY);
  },

  // BUSKERS
  async getBuskers() {
    const local = this.cacheGet('buskers') || this.getStoredLocalData('buskers');
    const unsynced = this.getUnsyncedLocalData('buskers');
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from('buskers').select('*').order('applied_at', { ascending: false });
        if (!error && data) {
          const merged = mergeRecordsById(data, unsynced).sort((a: any, b: any) =>
            (b.applied_at || '').localeCompare(a.applied_at || '')
          );
          this.cacheSet('buskers', merged);
          this.setLocalData('buskers', merged);
          return merged;
        }
      } catch (e) { console.error(e); }
    }
    if (this.isConfigured()) return local || [];
    return (local && local.length > 0) ? local : MOCK_DATA.buskers;
  },

  // SELLERS
  async getSellers() {
    const local = this.cacheGet('sellers') || this.getStoredLocalData('sellers');
    const unsynced = this.getUnsyncedLocalData('sellers');
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from('sellers').select('*').order('applied_at', { ascending: false });
        if (!error && data) {
          const merged = mergeRecordsById(data, unsynced).sort((a: any, b: any) =>
            (b.applied_at || '').localeCompare(a.applied_at || '')
          );
          this.cacheSet('sellers', merged);
          this.setLocalData('sellers', merged);
          return merged;
        }
      } catch (e) { console.error(e); }
    }
    if (this.isConfigured()) return local || [];
    return (local && local.length > 0) ? local : MOCK_DATA.sellers;
  },

  // EVENTS
  async getEvents() {
    const local = this.cacheGet('events') || this.getStoredLocalData('events') || [];
    const unsynced = this.getUnsyncedLocalData('events');
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true });
        if (!error && data) {
          const merged = mergeRecordsById(data, unsynced).sort((a: any, b: any) => a.event_date.localeCompare(b.event_date));
          this.cacheSet('events', merged);
          this.setLocalData('events', merged);
          return merged;
        }
      } catch (e) { console.error(e); }
    }
    return local;
  },

  async getHomepagePopups() {
    const local = this.cacheGet('homepage_popups') || this.getStoredLocalData('homepage_popups') || [];
    const unsynced = this.getUnsyncedLocalData('homepage_popups');
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('homepage_popups')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          const merged = mergeRecordsById(data, unsynced).sort((a: any, b: any) =>
            (b.created_at || '').localeCompare(a.created_at || '')
          );
          this.cacheSet('homepage_popups', merged);
          this.setLocalData('homepage_popups', merged);
          return merged;
        }
      } catch (e) { console.error(e); }
    }
    return local;
  },

  // REVENUE
  async getRevenue() {
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from('revenue').select('*').order('date', { ascending: false });
        if (!error && data) {
          this.cacheSet('revenue', data);
          this.setLocalData('revenue', data);
          return data;
        }
      } catch (e) { console.error(e); }
    }
    const local = this.cacheGet('revenue') || this.getStoredLocalData('revenue');
    return (local && local.length > 0) ? local : this.getLocalData('revenue');
  },

  // MUTATIONS
  async updateBusker(id: string, payload: any) {
    const local = this.getStoredLocalData('buskers');
    const updated = local.map((item: any) => item.id === id ? { ...item, ...payload } : item);
    this.setLocalData('buskers', updated);
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('b') && !id.startsWith('temp_')) {
      let res = await supabase.from('buskers').update(payload).eq('id', id).select().single();
      if (res.error && (isMissingColumnError(res.error, 'rejection_reason') || isMissingColumnError(res.error, 'birth_date'))) {
        let cleanPayload = { ...payload };
        if (isMissingColumnError(res.error, 'rejection_reason')) cleanPayload = omitColumn(cleanPayload, 'rejection_reason');
        if (isMissingColumnError(res.error, 'birth_date')) cleanPayload = omitColumn(cleanPayload, 'birth_date');
        res = await supabase.from('buskers').update(cleanPayload).eq('id', id).select().single();
      }
      return res;
    }
    return { data: payload, error: null };
  },

  async updateSeller(id: string, payload: any) {
    const local = this.getStoredLocalData('sellers');
    const updated = local.map((item: any) => item.id === id ? { ...item, ...payload } : item);
    this.setLocalData('sellers', updated);
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('s') && !id.startsWith('temp_')) {
      let res = await supabase.from('sellers').update(payload).eq('id', id).select().single();
      if (res.error && (isMissingColumnError(res.error, 'rejection_reason') || isMissingColumnError(res.error, 'birth_date'))) {
        let cleanPayload = { ...payload };
        if (isMissingColumnError(res.error, 'rejection_reason')) cleanPayload = omitColumn(cleanPayload, 'rejection_reason');
        if (isMissingColumnError(res.error, 'birth_date')) cleanPayload = omitColumn(cleanPayload, 'birth_date');
        res = await supabase.from('sellers').update(cleanPayload).eq('id', id).select().single();
      }
      return res;
    }
    return { data: payload, error: null };
  },

  async updateStatus(table: 'buskers' | 'sellers', id: string, status: string, extraPayload: any = {}) {
    const local = this.getStoredLocalData(table);
    const payload = { status, updated_at: new Date().toISOString(), ...extraPayload };
    const updated = local.map((item: any) => item.id === id ? { ...item, ...payload } : item);
    this.setLocalData(table, updated);
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('b') && !id.startsWith('s') && !id.startsWith('temp_')) {
      let res = await supabase.from(table).update(payload).eq('id', id);
      if (res.error && (isMissingColumnError(res.error, 'rejection_reason') || isMissingColumnError(res.error, 'birth_date'))) {
        let cleanPayload = { ...payload };
        if (isMissingColumnError(res.error, 'rejection_reason')) cleanPayload = omitColumn(cleanPayload, 'rejection_reason');
        if (isMissingColumnError(res.error, 'birth_date')) cleanPayload = omitColumn(cleanPayload, 'birth_date');
        res = await supabase.from(table).update(cleanPayload).eq('id', id);
      }
      return res;
    }
    return { error: null };
  },

  async updateRevenueStatus(id: string, status: 'paid' | 'unpaid') {
    const local = this.getStoredLocalData('revenue');
    const updated = local.map((item: any) => item.id === id ? { ...item, status } : item);
    this.setLocalData('revenue', updated);
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('r')) {
      return await supabase.from('revenue').update({ status }).eq('id', id);
    }
    return { error: null };
  },

  async createBusker(payload: any) {
    const newItem = { id: 'temp_' + Date.now(), ...payload };
    const local = this.getStoredLocalData('buskers');
    this.setLocalData('buskers', [newItem, ...local]);
    this.cacheClear();

    if (this.isConfigured()) {
      try {
        let res = await supabase.from('buskers').insert([payload]).select().single();
        if (res.error && (isMissingColumnError(res.error, 'rejection_reason') || isMissingColumnError(res.error, 'birth_date'))) {
          let cleanPayload = { ...payload };
          if (isMissingColumnError(res.error, 'rejection_reason')) cleanPayload = omitColumn(cleanPayload, 'rejection_reason');
          if (isMissingColumnError(res.error, 'birth_date')) cleanPayload = omitColumn(cleanPayload, 'birth_date');
          res = await supabase.from('buskers').insert([cleanPayload]).select().single();
        }
        if (res.error) {
          this.enqueue({ type: 'create', table: 'buskers', payload: newItem });
          return { data: newItem, error: null, offline: true };
        }

        const merged = mergeRecordsById(
          this.getStoredLocalData('buskers').filter((item: any) => item.id !== newItem.id),
          [res.data]
        ).sort((a: any, b: any) => (b.applied_at || '').localeCompare(a.applied_at || ''));
        this.setLocalData('buskers', merged);
        this.cacheClear();
        return res;
      } catch (e) {
        this.enqueue({ type: 'create', table: 'buskers', payload: newItem });
        return { data: newItem, error: null, offline: true };
      }
    }
    return { data: newItem, error: null };
  },

  async createSeller(payload: any) {
    const newItem = { id: 'temp_' + Date.now(), ...payload };
    const local = this.getStoredLocalData('sellers');
    this.setLocalData('sellers', [newItem, ...local]);
    this.cacheClear();

    if (this.isConfigured()) {
      try {
        let res = await supabase.from('sellers').insert([payload]).select().single();
        if (res.error && (isMissingColumnError(res.error, 'rejection_reason') || isMissingColumnError(res.error, 'birth_date'))) {
          let cleanPayload = { ...payload };
          if (isMissingColumnError(res.error, 'rejection_reason')) cleanPayload = omitColumn(cleanPayload, 'rejection_reason');
          if (isMissingColumnError(res.error, 'birth_date')) cleanPayload = omitColumn(cleanPayload, 'birth_date');
          res = await supabase.from('sellers').insert([cleanPayload]).select().single();
        }
        if (res.error) {
          this.enqueue({ type: 'create', table: 'sellers', payload: newItem });
          return { data: newItem, error: null, offline: true };
        }

        const merged = mergeRecordsById(
          this.getStoredLocalData('sellers').filter((item: any) => item.id !== newItem.id),
          [res.data]
        ).sort((a: any, b: any) => (b.applied_at || '').localeCompare(a.applied_at || ''));
        this.setLocalData('sellers', merged);
        this.cacheClear();
        return res;
      } catch (e) {
        this.enqueue({ type: 'create', table: 'sellers', payload: newItem });
        return { data: newItem, error: null, offline: true };
      }
    }
    return { data: newItem, error: null };
  },

  async createEvent(payload: any) {
    const newItem = { id: 'temp_e_' + Date.now(), ...payload };
    const local = this.getStoredLocalData('events');
    this.setLocalData('events', [...local, newItem]);
    this.cacheClear();

    if (this.isConfigured()) {
      try {
        const res = await supabase.from('events').insert([payload]).select().single();
        if (res.error) {
          this.enqueue({ type: 'create', table: 'events', payload: newItem });
          return { data: newItem, error: null, offline: true };
        }

        const merged = mergeRecordsById(
          this.getStoredLocalData('events').filter((item: any) => item.id !== newItem.id),
          [res.data]
        ).sort((a: any, b: any) => a.event_date.localeCompare(b.event_date));
        this.setLocalData('events', merged);
        this.cacheClear();
        return res;
      } catch (e) {
        this.enqueue({ type: 'create', table: 'events', payload: newItem });
        return { data: newItem, error: null, offline: true };
      }
    }
    return { data: newItem, error: null };
  },

  async updateEvent(id: string, payload: any) {
    const local = this.getStoredLocalData('events');
    const updated = local.map((item: any) => item.id === id ? { ...item, ...payload } : item);
    this.setLocalData('events', updated);
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('e') && !id.startsWith('temp_')) {
      try {
        const res = await supabase.from('events').update(payload).eq('id', id).select().single();
        if (res.error) {
          this.enqueue({ type: 'update', table: 'events', id, payload });
          return { data: updated.find((item: any) => item.id === id), error: null, offline: true };
        }
        return res;
      } catch (e) {
        this.enqueue({ type: 'update', table: 'events', id, payload });
        return { data: updated.find((item: any) => item.id === id), error: null, offline: true };
      }
    }
    return { data: updated.find((item: any) => item.id === id), error: null };
  },

  async deleteEvent(id: string) {
    const local = this.getStoredLocalData('events');
    this.setLocalData('events', local.filter((item: any) => item.id !== id));
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('e') && !id.startsWith('temp_')) {
      try {
        const res = await supabase.from('events').delete().eq('id', id);
        if (res.error) {
          this.enqueue({ type: 'delete', table: 'events', id });
          return { error: null, offline: true };
        }
        return res;
      } catch (e) {
        this.enqueue({ type: 'delete', table: 'events', id });
        return { error: null, offline: true };
      }
    }
    return { error: null };
  },

  async createHomepagePopup(payload: any) {
    const newItem = {
      id: 'temp_hp_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...payload,
    };
    const local = this.getStoredLocalData('homepage_popups') || [];
    this.setLocalData('homepage_popups', [newItem, ...local]);
    this.cacheClear();

    if (this.isConfigured()) {
      try {
        const res = await supabase.from('homepage_popups').insert([payload]).select().single();
        if (res.error) {
          this.enqueue({ type: 'create', table: 'homepage_popups', payload: newItem });
          return { data: newItem, error: null, offline: true };
        }

        const merged = mergeRecordsById(
          this.getStoredLocalData('homepage_popups').filter((item: any) => item.id !== newItem.id),
          [res.data]
        ).sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
        this.setLocalData('homepage_popups', merged);
        this.cacheClear();
        return res;
      } catch (e) {
        this.enqueue({ type: 'create', table: 'homepage_popups', payload: newItem });
        return { data: newItem, error: null, offline: true };
      }
    }

    return { data: newItem, error: null };
  },

  async updateHomepagePopup(id: string, payload: any) {
    const local = this.getStoredLocalData('homepage_popups') || [];
    const updated = local.map((item: any) =>
      item.id === id ? { ...item, ...payload, updated_at: new Date().toISOString() } : item
    );
    this.setLocalData('homepage_popups', updated);
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('temp_')) {
      try {
        const res = await supabase
          .from('homepage_popups')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (res.error) {
          this.enqueue({ type: 'update', table: 'homepage_popups', id, payload });
          return { data: updated.find((item: any) => item.id === id), error: null, offline: true };
        }
        return res;
      } catch (e) {
        this.enqueue({ type: 'update', table: 'homepage_popups', id, payload });
        return { data: updated.find((item: any) => item.id === id), error: null, offline: true };
      }
    }

    return { data: updated.find((item: any) => item.id === id), error: null };
  },

  async deleteHomepagePopup(id: string) {
    const local = this.getStoredLocalData('homepage_popups') || [];
    this.setLocalData('homepage_popups', local.filter((item: any) => item.id !== id));
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('temp_')) {
      try {
        const res = await supabase.from('homepage_popups').delete().eq('id', id);
        if (res.error) {
          this.enqueue({ type: 'delete', table: 'homepage_popups', id });
          return { error: null, offline: true };
        }
        return res;
      } catch (e) {
        this.enqueue({ type: 'delete', table: 'homepage_popups', id });
        return { error: null, offline: true };
      }
    }

    return { error: null };
  },

  async deleteBusker(id: string) {
    const local = this.getStoredLocalData('buskers');
    this.setLocalData('buskers', local.filter((item: any) => item.id !== id));
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('b') && !id.startsWith('temp_')) {
      return await supabase.from('buskers').delete().eq('id', id);
    }
    return { error: null };
  },

  async deleteSeller(id: string) {
    const local = this.getStoredLocalData('sellers');
    this.setLocalData('sellers', local.filter((item: any) => item.id !== id));
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('s') && !id.startsWith('temp_')) {
      return await supabase.from('sellers').delete().eq('id', id);
    }
    return { error: null };
  },

  async deleteAdminProfile(id: string) {
    const local = this.getLocalData('admin_profiles') || [];
    const updated = local.filter((item: any) => item.id !== id);
    this.setLocalData('admin_profiles', updated);

    if (this.isConfigured() && !id.startsWith('u') && !id.startsWith('temp_')) {
      return await supabase.from('admin_profiles').delete().eq('id', id);
    }
    return { error: null };
  },

  async getAdminLogs() {
    const local = this.getLocalData('admin_logs');
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(10);
        if (!error && data) {
          this.setLocalData('admin_logs', data);
          return data;
        }
      } catch (e) { console.error(e); }
    }
    return local || [
      { id: 'l1', type: 'user-plus', color: 'var(--jade)', title: '시스템 초기화', desc: '시스템이 성공적으로 시작되었습니다.', created_at: new Date().toISOString() }
    ];
  },

  async createAdminLog(payload: any) {
    const newItem = { id: 'log_' + Date.now(), created_at: new Date().toISOString(), ...payload };
    const local = this.getLocalData('admin_logs') || [];
    this.setLocalData('admin_logs', [newItem, ...local].slice(0, 50)); // Keep last 50 logs

    if (this.isConfigured()) {
      await supabase.from('admin_logs').insert([payload]);
    }
    return { error: null };
  },

  async getAdminProfiles() {
    const local = this.getLocalData('admin_profiles');
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from('admin_profiles').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          const merged = normalizeAdminProfiles(mergeRecordsById(data, local || []));
          this.setLocalData('admin_profiles', merged);
          return merged;
        }
      } catch (e) { console.error(e); }
    }
    const normalized = normalizeAdminProfiles(local || []);
    this.setLocalData('admin_profiles', normalized);
    return normalized;
  },

  async updateAdminProfile(id: string, payload: any) {
    const local = this.getLocalData('admin_profiles') || [];
    const updated = local.map((item: any) => item.id === id ? { ...item, ...payload } : item);
    this.setLocalData('admin_profiles', updated);

    if (this.isConfigured() && !id.startsWith('u') && !id.startsWith('temp_')) {
      return await supabase.from('admin_profiles').update(payload).eq('id', id);
    }
    return { error: null };
  },

  async createAdminProfile(payload: any) {
    const local = this.getLocalData('admin_profiles') || [];
    const normalizedEmail = String(payload.email || '').trim().toLowerCase();
    const hasDuplicate = local.some((item: any) => String(item.email || '').trim().toLowerCase() === normalizedEmail);

    if (hasDuplicate) {
      return { error: { message: '이미 등록된 이메일입니다.' } };
    }

    const newItem = {
      id: payload.id || `temp_u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...payload,
      email: normalizedEmail || payload.email,
      status: payload.status || 'active',
      created_at: payload.created_at || new Date().toISOString()
    };
    this.setLocalData('admin_profiles', [newItem, ...local]);
    this.cacheClear();

    const hasRealAuthUserId =
      typeof newItem.id === 'string' &&
      !newItem.id.startsWith('temp_') &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(newItem.id);

    if (this.isConfigured() && hasRealAuthUserId) {
      return await supabase.from('admin_profiles').insert([newItem]);
    }
    return { error: null };
  },

  async signIn(email: string, password: string) {
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) return { data, error: null };
      } catch (e) { /* fallback */ }
    }

    const profiles = this.getLocalData('admin_profiles') || [];
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const localProfile = profiles.find((item: any) => String(item.email || '').trim().toLowerCase() === normalizedEmail);

    if (localProfile) {
      if (localProfile.status && localProfile.status !== 'active') {
        return { data: null, error: { message: '비활성화된 계정입니다.' } };
      }

      if (localProfile.password && localProfile.password === password) {
        return {
          data: {
            user: {
              id: localProfile.id,
              email: localProfile.email,
              user_metadata: {
                name: localProfile.name,
                role: localProfile.role || 'operator',
                source: 'local_admin_profile'
              }
            }
          },
          error: null
        };
      }
    }

    // 마스터관리자 고정 계정 (로컬 프로필에 아직 저장 안 된 경우 폴백)
    if (normalizedEmail === 'doll25@naver.com' && password === '@1234') {
      return { data: { user: { id: 'master-admin', email: 'doll25@naver.com', user_metadata: { name: '마스터관리자', role: 'master_admin' } } }, error: null };
    }

    // 데모 체험 계정
    if (normalizedEmail === 'demo@songdo.com' && password === 'demo1234') {
      return { data: { user: { id: 'demo-user', email: 'demo@songdo.com', user_metadata: { name: '데모계정', role: 'operator' } } }, error: null };
    }

    return { data: null, error: { message: '로그인 정보를 확인하세요.' } };
  },

  async signOut() { 
    if (this.isConfigured()) await supabase.auth.signOut();
  },

  // IMAGES
  async getImages() {
    const local = this.getStoredLocalData('images');
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from('images').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          this.setLocalData('images', data);
          return data;
        }
      } catch (e) { console.error(e); }
    }
    if (this.isConfigured()) return local || [];
    return (local && local.length > 0) ? local : this.getLocalData('images');
  },

  async updateImage(id: string, payload: any) {
    const local = this.getStoredLocalData('images');
    const existing = local.find((item: any) => item.id === id);
    
    // URL이 null이거나 undefined인 경우 기존 값 유지 (NOT NULL 제약 조건 보호)
    const finalPayload = { ...existing, ...payload, id, active: true };
    if (!finalPayload.url && existing?.url) {
      finalPayload.url = existing.url;
    }

    const updated = existing
      ? local.map((item: any) => item.id === id ? finalPayload : item)
      : [...local, finalPayload];
    
    this.setLocalData('images', updated);
    this.cacheClear();
    
    if (this.isConfigured()) {
      let res = await supabase.from('images').upsert([finalPayload]).select().single();
      
      // 여러 컬럼이 누락되었을 경우를 대비한 반복 시도 로직
      const possibleMissingColumns = ['colSpan', 'rowSpan', 'minHeight', 'caption'];
      let cleanPayload = { ...finalPayload };
      let attempt = 0;

      while (res.error && attempt < possibleMissingColumns.length) {
        let foundMissing = false;
        for (const col of possibleMissingColumns) {
          if (isMissingColumnError(res.error, col)) {
            const { [col]: _removed, ...rest } = cleanPayload;
            cleanPayload = rest;
            foundMissing = true;
          }
        }
        if (!foundMissing) break;
        res = await supabase.from('images').upsert([cleanPayload]).select().single();
        attempt++;
      }
      return res;
    }
    return { data: finalPayload, error: null };
  },
  
  async getUser() {
    if (this.isConfigured()) {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
    return null;
  },

  async clearSampleData() {
    if (!this.isConfigured()) throw new Error('Supabase가 연결되지 않았습니다.');

    const results = await Promise.all(
      SAMPLE_RESET_TARGETS.map(async ({ table, lockId, optional }) => {
        const res = await supabase.from(table).delete().neq('id', lockId);
        if (optional && res.error && isMissingTableError(res.error, table)) {
          return { data: null, error: null };
        }
        return res;
      })
    );

    const failed = results.find((result) => result.error);
    if (failed?.error) throw failed.error;

    this.cacheClear();
    if (typeof window !== 'undefined') {
      const local = JSON.parse(localStorage.getItem(LOCAL_DATA_KEY) || '{}');
      for (const { table } of SAMPLE_RESET_TARGETS) {
        delete local[table];
      }
      localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(local));
    }

    return { success: true };
  },

  async seedData() {
    if (!this.isConfigured()) throw new Error('Supabase가 연결되지 않았습니다.');

    await this.clearSampleData();

    const bData = MOCK_DATA.buskers.map(({ id, ...rest }) => ({ ...rest, updated_at: new Date().toISOString() }));
    const sData = MOCK_DATA.sellers.map(({ id, ...rest }) => ({ ...rest, updated_at: new Date().toISOString() }));
    const rData = MOCK_DATA.revenue.map((item: any) => {
      const { id, ...rest } = item;
      return rest;
    });
    const eData = MOCK_DATA.events.map(({ id, ...rest }) => rest);
    const iData = MOCK_DATA.images.map(({ id, ...rest }) => ({ ...rest, id }));
    const bpData = MOCK_DATA.busker_pool.map(({ id, ...rest }) => ({ id, ...rest }));
    const spData = MOCK_DATA.seller_pool.map(({ id, ...rest }) => ({ id, ...rest }));
    const nData = MOCK_DATA.newsletter.map(({ id, ...rest }) => ({ ...rest }));
    const fData = MOCK_DATA.faqs.map(({ id, ...rest }) => ({ ...rest }));
    const ntData = MOCK_DATA.newsletter_templates.map(({ id, ...rest }) => ({ ...rest }));

    const insertJobs = [
      { table: 'buskers', rows: bData, optional: false },
      { table: 'sellers', rows: sData, optional: false },
      { table: 'revenue', rows: rData, optional: true },
      { table: 'events', rows: eData, optional: false },
      { table: 'images', rows: iData, optional: false },
      { table: 'busker_pool', rows: bpData, optional: false },
      { table: 'seller_pool', rows: spData, optional: false },
      { table: 'newsletter', rows: nData, optional: true },
      { table: 'faqs', rows: fData, optional: true },
      { table: 'newsletter_templates', rows: ntData, optional: true },
    ];

    const results = await Promise.all(
      insertJobs.map(async ({ table, rows, optional }) => {
        if (rows.length === 0) return { data: [], error: null };

        let res = await supabase.from(table).insert(rows);
        
        // Handle missing columns (rejection_reason, birth_date, etc.)
        const possibleMissingColumns = ['rejection_reason', 'birth_date', 'organization', 'colSpan', 'rowSpan', 'minHeight', 'caption'];
        let cleanRows = [...rows];
        let attempt = 0;
        
        while (res.error && attempt < possibleMissingColumns.length) {
          let foundMissing = false;
          for (const col of possibleMissingColumns) {
            if (isMissingColumnError(res.error, col)) {
              cleanRows = omitColumn(cleanRows, col);
              foundMissing = true;
            }
          }
          if (!foundMissing) break;
          res = await supabase.from(table).insert(cleanRows);
          attempt++;
        }

        if (optional && res.error && isMissingTableError(res.error, table)) {
          return { data: null, error: null };
        }
        return res;
      })
    );

    const failed = results.find((result) => result.error);
    if (failed?.error) throw failed.error;

    this.cacheClear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_DATA_KEY);
    }
    return { success: true };
  }
};
