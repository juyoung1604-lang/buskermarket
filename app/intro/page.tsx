// app/intro/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export default function IntroPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6 bg-[#FAFAF9]">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll direction="up">
            <div className="inline-block px-4 py-1 bg-[#FF8B5A]/10 text-[#FF8B5A] rounded-full text-sm font-bold mb-6">PLATFORM INTRO</div>
            <h1 className="text-4xl md:text-6xl font-black text-[#2C2C2C] mb-8 leading-tight">
              음악과 마켓이 만나는<br />
              <span className="text-[#FF8B5A]">도시의 새로운 낭만</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-12">
              송도 버스킹 마켓은 도심 속 자연 공간인 송도국제캠핑장에서 열리는 복합 문화 플랫폼입니다. 
              재능 있는 아티스트들에게 무대를 제공하고, 개성 있는 셀러들에게는 성장의 발판을 마련하며, 
              방문객들에게는 일상 속 특별한 쉼표를 선물합니다.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          <AnimateOnScroll direction="left">
            <div className="bg-[#F0F4EF] p-8 rounded-[32px] h-full">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm">🎸</div>
              <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4">아티스트를 위한 무대</h3>
              <p className="text-gray-600 leading-relaxed">
                장르에 상관없이 누구나 자신의 목소리를 낼 수 있는 열린 공간을 지향합니다. 
                기본 음향 시스템 지원과 홍보를 통해 아티스트가 오직 공연에만 집중할 수 있는 환경을 만듭니다.
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll direction="right">
            <div className="bg-[#FFF7ED] p-8 rounded-[32px] h-full">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm">🛍️</div>
              <h3 className="text-2xl font-bold text-[#2C2C2C] mb-4">셀러를 위한 기회</h3>
              <p className="text-gray-600 leading-relaxed">
                핸드메이드 작가, 빈티지 수집가, 로컬 푸드 창업자 등 자신만의 가치를 파는 모든 분들을 환영합니다. 
                단순한 판매를 넘어 고객과 직접 소통하며 브랜드를 알리는 소중한 기회를 제공합니다.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#2C2C2C] text-white rounded-[40px] mx-4 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <AnimateOnScroll direction="up">
            <h2 className="text-3xl md:text-5xl font-black mb-8">우리와 함께하시겠어요?</h2>
            <p className="text-white/70 mb-12 text-lg">당신의 재능과 열정이 송도의 주말을 더욱 아름답게 만듭니다.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/#contact" className="px-10 py-4 bg-[#FF8B5A] text-white rounded-full font-bold text-lg hover:shadow-xl transition-all">지금 바로 신청하기</Link>
              <Link href="/" className="px-10 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full font-bold text-lg hover:bg-white/20 transition-all">메인으로 돌아가기</Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <Footer />
    </main>
  );
}
