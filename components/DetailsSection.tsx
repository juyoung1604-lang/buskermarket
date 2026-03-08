"use client";

import { useEffect, useState } from "react";
import AnimateOnScroll from "./AnimateOnScroll";
import { DETAIL_CARDS } from "@/lib/constants";
import { DB } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

type DBEvent = {
  id: string;
  title: string;
  event_date: string;
  busker_count: number;
  seller_count: number;
  note?: string;
};

type BuskerRecord = {
  id: string;
  name: string;
  team?: string;
  event_date: string;
  status: string;
};

type SellerRecord = {
  id: string;
  name: string;
  category?: string;
  event_date: string;
  status: string;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const TODAY = new Date().toISOString().split("T")[0];
const VISIBLE_SELLER_STATUSES = new Set(["paid"]);

export default function DetailsSection() {
  const [cardUrls, setCardUrls] = useState<string[]>(DETAIL_CARDS.map((card) => card.url));
  const [popupUrls, setPopupUrls] = useState<string[]>(DETAIL_CARDS.map((card) => card.url));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Calendar States
  const [events, setEvents] = useState<DBEvent[]>([]);
  const [buskers, setBuskers] = useState<BuskerRecord[]>([]);
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string>(TODAY);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [imgs, eventData, buskerData, sellerData] = await Promise.all([
        DB.getImages(),
        DB.getEvents(),
        DB.getBuskers(),
        DB.getSellers()
      ]);

      setCardUrls(
        DETAIL_CARDS.map((card, idx) => imgs?.find((item: any) => item.id === `img-detail-${idx + 1}` && item.active)?.url || card.url)
      );
      setPopupUrls(
        DETAIL_CARDS.map((card, idx) => imgs?.find((item: any) => item.id === `img-detail-popup-${idx + 1}` && item.active)?.url || card.url)
      );

      setEvents((eventData as DBEvent[]) || []);
      setBuskers((buskerData as BuskerRecord[]) || []);
      setSellers((sellerData as SellerRecord[]) || []);
      setLoading(false);
    };
    loadData();
  }, []);

  const getApprovedBuskersByDate = (date: string) =>
    buskers.filter((item) => item.event_date === date && item.status === "approved");

  const getApprovedSellersByDate = (date: string) =>
    sellers.filter((item) => item.event_date === date && VISIBLE_SELLER_STATUSES.has(item.status));

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const eventMap: Record<string, DBEvent[]> = {};
  events.forEach((e) => {
    if (!eventMap[e.event_date]) eventMap[e.event_date] = [];
    eventMap[e.event_date].push(e);
  });

  const selectedBuskers = getApprovedBuskersByDate(selectedDate);
  const selectedSellers = getApprovedSellersByDate(selectedDate);
  const selectedEvents = eventMap[selectedDate] || [];

  const toDateStr = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const formatDateLabel = (dateStr: string) => {
    const [, m, d] = dateStr.split("-");
    return `${parseInt(m)}월 ${parseInt(d)}일`;
  };

  return (
    <section id="details" className="py-14 md:py-24 bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16">
          <div>
            <p
              className="text-xs sm:text-lg md:text-2xl font-bold mb-2 uppercase tracking-widest opacity-30"
              style={{ color: "#2C2C2C", fontFamily: '"Noto Sans KR", sans-serif' }}
            >
              Program Guide
            </p>
            <h3
              className="text-3xl sm:text-5xl md:text-6xl font-black"
              style={{
                color: "#2C2C2C",
                fontFamily: '"Noto Sans KR", sans-serif',
              }}
            >
              행사 안내
            </h3>
          </div>
          <p
            className="text-sm md:text-base lg:text-lg mt-3 md:mt-0 md:w-1/2 font-medium"
            style={{ color: "#6B6B6B", fontFamily: '"Noto Sans KR", sans-serif' }}
          >
            송도 캠핑장에서 매주 주말마다 진행되는 버스킹 공연과 플리마켓의
            상세 정보를 확인하세요.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {DETAIL_CARDS.map((card, index) => (
            <AnimateOnScroll key={card.badge} direction="up" delay={index * 0.1}>
              <button
                type="button"
                onClick={() => setSelectedIndex(index)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer h-full text-left w-full"
              >
                <div className="w-full h-64 overflow-hidden">
                  <img
                    alt={card.title}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    src={cardUrls[index]}
                    loading="lazy"
                  />
                </div>
                <div className="p-8">
                  <div
                    className="inline-block px-3 py-1 rounded-full mb-4"
                    style={{ backgroundColor: "#A8D5BA" }}
                  >
                    <span className="text-xs font-bold tracking-wider text-white">
                      {card.badge}
                    </span>
                  </div>
                  <h4
                    className="text-2xl font-bold mb-3 leading-tight"
                    style={{
                      color: "#2C2C2C",
                      fontFamily: '"Noto Sans KR", sans-serif',
                    }}
                  >
                    {card.title}
                  </h4>
                  <p
                    className="text-sm"
                    style={{
                      color: "#6B6B6B",
                      fontFamily: '"Noto Sans KR", sans-serif',
                    }}
                  >
                    {card.desc}
                  </p>
                </div>
              </button>
            </AnimateOnScroll>
          ))}
        </div>

        {/* ─── Schedule Section ─── */}
        <AnimateOnScroll direction="up" className="mt-20 md:mt-32">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-[#FF8B5A] flex items-center justify-center shadow-lg shadow-orange-200">
              <i className="ri-calendar-todo-line text-white text-xl" />
            </div>
            <h3
              className="text-3xl md:text-4xl font-black text-[#2C2C2C]"
              style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
            >
              행사 일정
            </h3>
          </div>

          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            {/* Calendar Left */}
            <div className="flex-1 p-6 sm:p-10 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <h4 className="text-2xl font-black text-[#2C2C2C]">{year}년 {month + 1}월</h4>
                  <button
                    onClick={() => {
                      setCurrentMonth(new Date());
                      setSelectedDate(TODAY);
                    }}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-bold text-gray-600 transition-all"
                  >
                    오늘
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all">
                    <i className="ri-arrow-left-s-line text-xl" />
                  </button>
                  <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all">
                    <i className="ri-arrow-right-s-line text-xl" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((d, i) => (
                  <div key={d} className={`text-center text-xs font-bold py-2 uppercase tracking-widest ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}>
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-2xl overflow-hidden shadow-inner">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`blank-${i}`} className="bg-white/50 min-h-[80px] sm:min-h-[100px]" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = toDateStr(year, month, day);
                  const dayEvents = eventMap[dateStr] ?? [];
                  const isSelected = selectedDate === dateStr;
                  const isToday = dateStr === TODAY;
                  const dow = (firstDay + i) % 7;

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`bg-white cursor-pointer transition-all min-h-[80px] sm:min-h-[100px] p-2 flex flex-col relative group ${isSelected ? "ring-2 ring-inset ring-[#FF8B5A] bg-orange-50/30 z-10" : "hover:bg-gray-50"}`}
                    >
                      <span className={`text-xs font-bold mb-1 self-end ${isSelected ? "text-[#FF8B5A]" : isToday ? "text-[#4A5D3F] underline decoration-2 underline-offset-4" : dow === 0 ? "text-red-400" : dow === 6 ? "text-blue-400" : "text-[#2C2C2C]"}`}>
                        {day}
                      </span>
                      <div className="flex flex-col gap-1 mt-1">
                        {dayEvents.map(ev => (
                          <div key={ev.id} className="text-[10px] font-bold px-1.5 py-0.5 rounded truncate bg-sky-50 text-sky-700 border border-sky-100">
                            {ev.title}
                          </div>
                        ))}
                        {(getApprovedBuskersByDate(dateStr).length > 0 || getApprovedSellersByDate(dateStr).length > 0) && (
                          <div className="flex gap-1 flex-wrap">
                            {getApprovedBuskersByDate(dateStr).length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="버스커 예정" />}
                            {getApprovedSellersByDate(dateStr).length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="셀러 예정" />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {(() => {
                  const rem = (7 - ((firstDay + daysInMonth) % 7)) % 7;
                  return Array.from({ length: rem }).map((_, i) => (
                    <div key={`tail-${i}`} className="bg-white/50 min-h-[80px] sm:min-h-[100px]" />
                  ));
                })()}
              </div>
            </div>

            {/* Detail Right */}
            <div className="md:w-[320px] bg-[#FAFAF9] p-6 sm:p-10 flex flex-col">
              <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">SELECTED DATE</h5>
              <div className="mb-8">
                <h6 className="text-3xl font-black text-[#2C2C2C] mb-1">{formatDateLabel(selectedDate)}</h6>
                <p className="text-sm text-gray-500 font-medium">행사 참여 라인업</p>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {selectedEvents.length === 0 && selectedBuskers.length === 0 && selectedSellers.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-200">
                      <i className="ri-calendar-2-line text-2xl" />
                    </div>
                    <p className="text-sm text-gray-400">예정된 일정이 없습니다.</p>
                  </div>
                ) : (
                  <>
                    {selectedEvents.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-1 h-4 bg-sky-400 rounded-full" />
                          <span className="text-sm font-bold text-[#2C2C2C]">주요 행사</span>
                        </div>
                        <div className="space-y-2">
                          {selectedEvents.map(ev => (
                            <div key={ev.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                              <p className="font-bold text-[#2C2C2C] leading-snug">{ev.title}</p>
                              {ev.note && <p className="text-xs text-gray-400 mt-1">{ev.note}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedBuskers.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-1 h-4 bg-emerald-400 rounded-full" />
                          <span className="text-sm font-bold text-[#2C2C2C]">버스커</span>
                        </div>
                        <div className="grid gap-2">
                          {selectedBuskers.map(b => (
                            <div key={b.id} className="bg-white px-4 py-3 rounded-xl border border-gray-100 flex items-center justify-between">
                              <span className="text-sm font-bold text-gray-700">{b.name}</span>
                              {b.team && <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold">{b.team}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedSellers.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-1 h-4 bg-amber-400 rounded-full" />
                          <span className="text-sm font-bold text-[#2C2C2C]">플리마켓 셀러</span>
                        </div>
                        <div className="grid gap-2">
                          {selectedSellers.map(s => (
                            <div key={s.id} className="bg-white px-4 py-3 rounded-xl border border-gray-100 flex items-center justify-between">
                              <span className="text-sm font-bold text-gray-700">{s.name}</span>
                              {s.category && <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-bold">{s.category}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-6"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
              aria-label="팝업 닫기"
            >
              <i className="ri-close-line text-xl" />
            </button>
            <img
              src={popupUrls[selectedIndex]}
              alt={DETAIL_CARDS[selectedIndex].title}
              className="max-h-[80vh] w-full object-contain bg-[#111]"
            />
            <div className="border-t border-gray-100 bg-white px-6 py-5">
              <h4
                className="text-2xl font-bold"
                style={{ color: "#2C2C2C", fontFamily: '"Noto Sans KR", sans-serif' }}
              >
                {DETAIL_CARDS[selectedIndex].title}
              </h4>
              <p
                className="mt-2 text-sm"
                style={{ color: "#6B6B6B", fontFamily: '"Noto Sans KR", sans-serif' }}
              >
                {DETAIL_CARDS[selectedIndex].desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
