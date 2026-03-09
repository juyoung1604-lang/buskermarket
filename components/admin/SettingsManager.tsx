'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/admin/Toast';
import { DB } from '@/lib/supabase';
import { DETAIL_CARDS, GALLERY_ITEMS, IMAGES, SELLER_IMAGES } from '@/lib/constants';
import { useAdmin } from '@/app/admin/layout';

type SettingsViewMode = 'all' | 'system' | 'images';

const GALLERY_LAYOUT_PATTERNS = [
  [
    { col: 'col-span-1 md:col-span-2', row: 'row-span-1' }, { col: 'col-span-1', row: 'md:row-span-2' },
    { col: 'col-span-1', row: 'row-span-1' }, { col: 'col-span-1 md:col-span-2', row: 'row-span-1' },
    { col: 'col-span-1', row: 'md:row-span-2' }, { col: 'col-span-1 md:col-span-2', row: 'row-span-1' }
  ],
  [
    { col: 'col-span-1 md:col-span-2', row: 'md:row-span-2' }, { col: 'col-span-1', row: 'row-span-1' },
    { col: 'col-span-1', row: 'row-span-1' }, { col: 'col-span-1', row: 'row-span-1' },
    { col: 'col-span-1', row: 'row-span-1' }, { col: 'col-span-1', row: 'row-span-1' }
  ],
  [
    { col: 'col-span-1', row: 'row-span-1' }, { col: 'col-span-1 md:col-span-2', row: 'row-span-1' },
    { col: 'col-span-1 md:col-span-2', row: 'row-span-1' }, { col: 'col-span-1', row: 'row-span-1' },
    { col: 'col-span-1', row: 'row-span-1' }, { col: 'col-span-1 md:col-span-2', row: 'row-span-1' }
  ],
  [
    { col: 'col-span-1', row: 'md:row-span-2' }, { col: 'col-span-1', row: 'md:row-span-2' },
    { col: 'col-span-1', row: 'row-span-1' }, { col: 'col-span-1', row: 'row-span-1' },
    { col: 'col-span-1 md:col-span-2', row: 'row-span-1' }, { col: 'col-span-1', row: 'row-span-1' }
  ]
];

export default function SettingsManager({ mode = 'all' }: { mode?: SettingsViewMode }) {
  const { toast } = useToast();
  const { can } = useAdmin();
  const imagePanelRef = useRef<HTMLDivElement | null>(null);
  
  const [sysSettings, setSysSettings] = useState({
    busker_deposit: 50000,
    seller_booth_fee: 30000,
    deposit_bank: '',
    deposit_account: '',
    admin_page_name: ''
  });
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    DB.getSystemSettings().then(setSysSettings);
    loadImages();
  }, []);

  const persistSystemSettings = async () => {
    const { error } = await DB.saveSystemSettings(sysSettings);
    if (error) {
      toast('설정 저장 실패: ' + error.message, 'rose');
      return;
    }
    toast('저장되었습니다.', 'jade');
  };

  const loadImages = async () => {
    const data = await DB.getImages();
    setImages(data || []);
  };

  const handleUpdateImage = async (id: string, url: string, section: string, alt: string) => {
    const current = images.find((img) => img.id === id) || {};
    const { error } = await DB.updateImage(id, { ...current, url, section, alt, active: true });
    if (!error) {
      toast('이미지가 업데이트되었습니다.', 'jade');
      loadImages();
    } else {
      toast('업데이트 실패: ' + error.message, 'rose');
    }
  };

  const handleUpdateLayout = async (id: string, layout: any, section: string, alt: string) => {
    const current = images.find((img) => img.id === id) || {};
    const { error } = await DB.updateImage(id, { ...current, ...layout, section, alt });
    if (!error) {
      toast('레이아웃이 업데이트되었습니다.', 'jade');
      loadImages();
    } else {
      toast('업데이트 실패: ' + error.message, 'rose');
    }
  };

  const handleResetImage = async (id: string, defaultUrl: string, section: string, alt: string, defaultCaption?: string, defaultLayout?: any) => {
    const payload: any = { url: defaultUrl, section, alt, active: true };
    if (defaultCaption !== undefined) payload.caption = defaultCaption;
    if (defaultLayout !== undefined) {
      payload.colSpan = defaultLayout.colSpan;
      payload.rowSpan = defaultLayout.rowSpan;
      payload.minHeight = defaultLayout.minHeight;
    }
    const { error } = await DB.updateImage(id, payload);
    if (!error) {
      toast('기본값으로 복원되었습니다.', 'jade');
      loadImages();
    } else {
      toast('복원 실패: ' + error.message, 'rose');
    }
  };

  const handleAutoGalleryLayout = async () => {
    if (!confirm('갤러리 6장의 레이아웃을 자동으로 변경하시겠습니까?')) return;

    const pattern = GALLERY_LAYOUT_PATTERNS[Math.floor(Math.random() * GALLERY_LAYOUT_PATTERNS.length)];
    const promises = [];

    for (let i = 0; i < 6; i++) {
      const id = `img-gallery-${i + 1}`;
      const layout = pattern[i];
      const current = images.find((img) => img.id === id) || {};

      promises.push(
        DB.updateImage(id, {
          ...current,
          colSpan: layout.col,
          rowSpan: layout.row,
          minHeight: '220px'
        })
      );
    }

    await Promise.all(promises);
    toast('새로운 레이아웃이 적용되었습니다!', 'jade');
    loadImages();
  };

  const downloadCSV = async (type: string) => {
    let data = [];
    let label = type;
    
    if (type === 'busker') {
      data = await DB.getBuskers();
      label = '버스커 신청';
    } else if (type === 'seller') {
      data = await DB.getSellers();
      label = '셀러 신청';
    } else if (type === 'busker_pool') {
      data = await DB.getPool('busker_pool');
      label = '통합 버스커 인력풀';
    } else if (type === 'seller_pool') {
      data = await DB.getPool('seller_pool');
      label = '통합 셀러 인력풀';
    }

    if (!data || data.length === 0) {
      toast('내보낼 데이터가 없습니다.', 'sky');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
      + [headers.join(','), ...data.map((r: any) => headers.map((h) => {
        const val = r[h];
        if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
        return val;
      }).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${type}_list.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(`${label} 목록을 다운로드합니다.`, 'jade');
  };

  const IMAGE_GROUPS = [
    {
      title: '브랜드 로고',
      desc: '홈페이지 상단 네비게이션과 하단 푸터에 표시되는 로고 이미지입니다.',
      items: [
        { id: 'img-logo', label: '메인 로고', section: 'brand', default: IMAGES.logo },
      ],
    },
    {
      title: '배경 이미지',
      desc: '메인 비주얼과 섹션 배경처럼 화면 분위기를 만드는 이미지입니다.',
      items: [
        { id: 'img-hero', label: '메인 히어로 배경', section: 'hero', default: IMAGES.heroBg },
        { id: 'img-busker-bg', label: '버스커 섹션 배경', section: 'busker', default: IMAGES.buskerBg },
      ],
    },
    {
      title: '페이지 이미지',
      desc: '각 섹션 본문 카드나 썸네일에 직접 노출되는 이미지입니다.',
      items: [
        { id: 'img-about-1', label: '정보 섹션 1 (버스킹)', section: 'about', default: IMAGES.aboutImg1 },
        { id: 'img-about-2', label: '정보 섹션 2 (마켓)', section: 'about', default: IMAGES.aboutImg2 },
        { id: 'img-detail-1', label: '행사 안내 카드 1', section: 'details', default: DETAIL_CARDS[0].url },
        { id: 'img-detail-2', label: '행사 안내 카드 2', section: 'details', default: DETAIL_CARDS[1].url },
        { id: 'img-detail-3', label: '행사 안내 카드 3', section: 'details', default: DETAIL_CARDS[2].url },
        { id: 'img-seller-1', label: '셀러 갤러리 1', section: 'seller', default: SELLER_IMAGES[0].url },
        { id: 'img-seller-2', label: '셀러 갤러리 2', section: 'seller', default: SELLER_IMAGES[1].url },
        { id: 'img-seller-3', label: '셀러 갤러리 3', section: 'seller', default: SELLER_IMAGES[2].url },
        { id: 'img-seller-4', label: '셀러 갤러리 4', section: 'seller', default: SELLER_IMAGES[3].url },
      ],
    },
    {
      title: '갤러리 (Vibes)',
      desc: '홈페이지 하단 Weekend Vibes 섹션의 6장 이미지와 레이아웃을 관리합니다.',
      items: [
        { id: 'img-gallery-1', label: 'Weekend Vibes 1', section: 'gallery', default: GALLERY_ITEMS[0].url, defaultCaption: GALLERY_ITEMS[0].caption, defaultLayout: { colSpan: GALLERY_ITEMS[0].colSpan, rowSpan: GALLERY_ITEMS[0].rowSpan, minHeight: GALLERY_ITEMS[0].minHeight } },
        { id: 'img-gallery-2', label: 'Weekend Vibes 2', section: 'gallery', default: GALLERY_ITEMS[1].url, defaultCaption: GALLERY_ITEMS[1].caption, defaultLayout: { colSpan: GALLERY_ITEMS[1].colSpan, rowSpan: GALLERY_ITEMS[1].rowSpan, minHeight: GALLERY_ITEMS[1].minHeight } },
        { id: 'img-gallery-3', label: 'Weekend Vibes 3', section: 'gallery', default: GALLERY_ITEMS[2].url, defaultCaption: GALLERY_ITEMS[2].caption, defaultLayout: { colSpan: GALLERY_ITEMS[2].colSpan, rowSpan: GALLERY_ITEMS[2].rowSpan, minHeight: GALLERY_ITEMS[2].minHeight } },
        { id: 'img-gallery-4', label: 'Weekend Vibes 4', section: 'gallery', default: GALLERY_ITEMS[3].url, defaultCaption: GALLERY_ITEMS[3].caption, defaultLayout: { colSpan: GALLERY_ITEMS[3].colSpan, rowSpan: GALLERY_ITEMS[3].rowSpan, minHeight: GALLERY_ITEMS[3].minHeight } },
        { id: 'img-gallery-5', label: 'Weekend Vibes 5', section: 'gallery', default: GALLERY_ITEMS[4].url, defaultCaption: GALLERY_ITEMS[4].caption, defaultLayout: { colSpan: GALLERY_ITEMS[4].colSpan, rowSpan: GALLERY_ITEMS[4].rowSpan, minHeight: GALLERY_ITEMS[4].minHeight } },
        { id: 'img-gallery-6', label: 'Weekend Vibes 6', section: 'gallery', default: GALLERY_ITEMS[5].url, defaultCaption: GALLERY_ITEMS[5].caption, defaultLayout: { colSpan: GALLERY_ITEMS[5].colSpan, rowSpan: GALLERY_ITEMS[5].rowSpan, minHeight: GALLERY_ITEMS[5].minHeight } },
      ],
    },
    {
      title: '팝업 이미지',
      desc: '이미지 클릭 시 팝업에서 크게 노출되는 전용 이미지입니다.',
      items: [
        { id: 'img-detail-popup-1', label: '행사 안내 팝업 1', section: 'details-popup', default: DETAIL_CARDS[0].url },
        { id: 'img-detail-popup-2', label: '행사 안내 팝업 2', section: 'details-popup', default: DETAIL_CARDS[1].url },
        { id: 'img-detail-popup-3', label: '행사 안내 팝업 3', section: 'details-popup', default: DETAIL_CARDS[2].url },
      ],
    },
  ];

  const showImages = mode === 'all' || mode === 'images';
  const showSystem = mode === 'all' || mode === 'system';
  const showDataManagement = showSystem && can('data_management');

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--head)' }}>설정 및 관리</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showImages && showSystem ? 'repeat(auto-fit, minmax(400px, 1fr))' : '1fr', gap: '24px' }}>
        {showImages && (
          <div className="card">
            <div className="card-h"><span className="card-title">홈페이지 이미지 관리</span></div>
            <div className="card-body" style={{ padding: 0 }}>
              <div
                ref={imagePanelRef}
                className="space-y-6"
                style={{ maxHeight: mode === 'images' ? 'none' : '620px', overflowY: 'auto', padding: '20px' }}
              >
                {IMAGE_GROUPS.map((group) => (
                  <div
                    key={group.title}
                    data-image-group={group.title}
                    style={{ border: '1px solid var(--line)', borderRadius: '16px', padding: '16px', background: 'var(--ink2)', marginBottom: '20px' }}
                  >
                    <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--head)', marginBottom: '4px' }}>{group.title}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{group.desc}</div>
                      </div>
                      {group.title === '갤러리 (Vibes)' && (
                        <button
                          onClick={handleAutoGalleryLayout}
                          className="btn btn-jade"
                          style={{ fontSize: '.7rem', padding: '6px 10px', height: 'auto', borderRadius: '8px' }}
                        >
                          <i className="fa-solid fa-wand-magic-sparkles"></i> 갤러리 자동 배치
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {group.items.map((item) => {
                        const current = images.find((img) => img.id === item.id);
                        const isGallery = 'defaultCaption' in item;
                        const defaultCaption = isGallery ? item.defaultCaption : undefined;
                        const defaultLayout = isGallery ? item.defaultLayout : undefined;
                        return (
                          <div key={item.id} style={{ borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
                            <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px' }}>{item.label}</label>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                              <div style={{ width: '80px', height: isGallery ? '80px' : '60px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--ink3)', flexShrink: 0 }}>
                                <img src={current?.url || item.default} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <input
                                  className="fi"
                                  placeholder="이미지 URL을 입력하세요"
                                  defaultValue={current?.url || ''}
                                  onBlur={(e) => {
                                    if (e.target.value && e.target.value !== current?.url) {
                                      handleUpdateImage(item.id, e.target.value, item.section, item.label);
                                    }
                                  }}
                                />
                                {isGallery && (
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginTop: '4px' }}>
                                    <div className="fg">
                                      <label style={{ fontSize: '10px' }}>너비 (칸)</label>
                                      <select
                                        className="fs"
                                        style={{ padding: '4px 8px', fontSize: '11px' }}
                                        value={current?.colSpan || item.defaultLayout?.colSpan}
                                        onChange={(e) => handleUpdateLayout(item.id, { colSpan: e.target.value }, item.section, item.label)}
                                      >
                                        <option value="col-span-1">1칸</option>
                                        <option value="col-span-1 md:col-span-2">2칸 (권장)</option>
                                        <option value="col-span-1 md:col-span-3">3칸 (전체)</option>
                                      </select>
                                    </div>
                                    <div className="fg">
                                      <label style={{ fontSize: '10px' }}>높이 (줄)</label>
                                      <select
                                        className="fs"
                                        style={{ padding: '4px 8px', fontSize: '11px' }}
                                        value={current?.rowSpan || item.defaultLayout?.rowSpan}
                                        onChange={(e) => handleUpdateLayout(item.id, { rowSpan: e.target.value }, item.section, item.label)}
                                      >
                                        <option value="row-span-1">1줄</option>
                                        <option value="md:row-span-2">2줄 (세로형)</option>
                                      </select>
                                    </div>
                                    <div className="fg">
                                      <label style={{ fontSize: '10px' }}>최소 높이</label>
                                      <input
                                        className="fi"
                                        style={{ padding: '4px 8px', fontSize: '11px' }}
                                        placeholder="220px"
                                        defaultValue={current?.minHeight || item.defaultLayout?.minHeight}
                                        onBlur={(e) => handleUpdateLayout(item.id, { minHeight: e.target.value }, item.section, item.label)}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <button className="btn" onClick={() => handleResetImage(item.id, item.default, item.section, item.label, defaultCaption, defaultLayout)} title="기본값으로 복원" style={{ flexShrink: 0 }}>
                                <i className="ri-restart-line"></i>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {showSystem && (
          <div className="space-y-6">
            <div className="card">
              <div className="card-h"><span className="card-title">기본 설정</span></div>
              <div className="card-body space-y-6">
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '5px' }}>관리자 페이지 이름</label>
                    <input
                      className="fi"
                      type="text"
                      value={sysSettings.admin_page_name || ''}
                      onChange={(e) => setSysSettings({ ...sysSettings, admin_page_name: e.target.value })}
                      placeholder="예: SONGDO ADMIN"
                    />
                  </div>
                  <button className="btn btn-jade" onClick={persistSystemSettings}><i className="fa-solid fa-save"></i> 저장</button>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '5px' }}>버스킹 보증금 (원)</label>
                    <input className="fi" type="number" value={sysSettings.busker_deposit} onChange={(e) => setSysSettings({ ...sysSettings, busker_deposit: parseInt(e.target.value) || 0 })} />
                  </div>
                  <button className="btn btn-jade" onClick={persistSystemSettings}><i className="fa-solid fa-save"></i> 저장</button>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '5px' }}>기본 셀러 부스비 (원)</label>
                    <input className="fi" type="number" value={sysSettings.seller_booth_fee} onChange={(e) => setSysSettings({ ...sysSettings, seller_booth_fee: parseInt(e.target.value) || 0 })} />
                  </div>
                  <button className="btn btn-jade" onClick={persistSystemSettings}><i className="fa-solid fa-save"></i> 저장</button>
                </div>
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '5px' }}>입금 은행</label>
                      <input className="fi" type="text" value={sysSettings.deposit_bank || ''} onChange={(e) => setSysSettings({ ...sysSettings, deposit_bank: e.target.value })} placeholder="신한은행" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '5px' }}>계좌번호</label>
                      <input className="fi" type="text" value={sysSettings.deposit_account || ''} onChange={(e) => setSysSettings({ ...sysSettings, deposit_account: e.target.value })} placeholder="110-..." />
                    </div>
                  </div>
                  <button className="btn btn-jade" style={{ width: '100%' }} onClick={persistSystemSettings}><i className="fa-solid fa-save"></i> 계좌 정보 저장</button>
                </div>
              </div>
            </div>

            {showDataManagement && (
              <div className="card">
                <div className="card-h"><span className="card-title">데이터 관리</span></div>
                <div className="card-body space-y-2">
                  <button className="btn" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => downloadCSV('busker')}><i className="ri-file-download-line"></i> 버스커 신청 목록 (CSV)</button>
                  <button className="btn" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => downloadCSV('seller')}><i className="ri-file-download-line"></i> 셀러 신청 목록 (CSV)</button>
                  <button className="btn" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => downloadCSV('busker_pool')}><i className="ri-file-user-line"></i> 통합 버스커 인력풀 (CSV)</button>
                  <button className="btn" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => downloadCSV('seller_pool')}><i className="ri-file-user-line"></i> 통합 셀러 인력풀 (CSV)</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
