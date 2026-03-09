// app/terms/page.tsx
'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll direction="up">
            <h1 className="text-3xl md:text-5xl font-black text-[#2C2C2C] mb-12">이용 및 운영약관</h1>
            
            <div className="space-y-12 text-gray-600 leading-relaxed">
              <div>
                <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">제 1 조 (목적)</h2>
                <p>본 약관은 송도 버스킹 마켓 플랫폼(이하 "플랫폼")이 제공하는 모든 서비스의 이용 조건 및 절차, 이용자와 플랫폼의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">제 2 조 (참가 신청 및 승인)</h2>
                <p>1. 버스커 및 셀러 참가를 희망하는 자는 플랫폼이 제공하는 양식에 따라 정확한 정보를 입력하여 신청해야 합니다.<br />
                2. 플랫폼 운영진은 신청 내용을 검토하여 승인 여부를 결정하며, 필요 시 추가 자료를 요청할 수 있습니다.<br />
                3. 승인된 참가자는 배정된 시간과 장소를 준수해야 하며, 무단 불참 시 향후 활동에 제한을 받을 수 있습니다.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">제 3 조 (운영 규정)</h2>
                <p>1. 모든 공연 및 판매 활동은 지정된 구역 내에서만 가능합니다.<br />
                2. 과도한 소음 발생, 정치적/종교적 포교 활동, 기타 방문객의 눈살을 찌푸리게 하는 행위는 금지됩니다.<br />
                3. 현장에서 발생하는 쓰레기는 참가자가 직접 수거하여 처리하는 것을 원칙으로 합니다.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">제 4 조 (안전 및 사고 관리)</h2>
                <p>1. 참가자는 안전사고 예방을 위해 운영진의 지시에 적극 협조해야 합니다.<br />
                2. 본인의 부주의로 발생한 사고 및 물품 도난 등에 대해서는 참가자 본인에게 책임이 있습니다.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">제 5 조 (개인정보 보호)</h2>
                <p>플랫폼은 이용자의 개인정보를 소중히 다루며, 관련 법령에 따라 보호합니다. 수집된 정보는 행사 운영 및 안내 목적으로만 사용됩니다.</p>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100">
              <p className="text-sm text-gray-400">최종 수정일: 2026년 3월 7일</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <Footer />
    </main>
  );
}
