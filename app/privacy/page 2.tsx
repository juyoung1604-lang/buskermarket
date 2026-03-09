// app/privacy/page.tsx
'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimateOnScroll from '@/components/AnimateOnScroll';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll direction="up">
            <h1 className="text-3xl md:text-5xl font-black text-[#2C2C2C] mb-12">개인정보 처리방침</h1>
            
            <div className="space-y-12 text-gray-600 leading-relaxed">
              <div>
                <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">1. 수집하는 개인정보 항목</h2>
                <p>플랫폼은 참가 신청 및 서비스 제공을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>필수항목: 성명, 생년월일, 연락처, 이메일, 소속(팀명)</li>
                  <li>선택항목: SNS 주소, 포트폴리오 링크</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">2. 개인정보의 수집 및 이용 목적</h2>
                <p>수집된 개인정보는 다음의 목적을 위해 활용됩니다.</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>행사 참가 신청 확인 및 본인 식별</li>
                  <li>공연 및 플리마켓 운영 전반에 관한 관리</li>
                  <li>공지사항 전달 및 불만 처리 등 원활한 의사소통 경로 확보</li>
                  <li>향후 행사 관련 뉴스레터 및 정보 제공(동의 시)</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">3. 개인정보의 보유 및 이용기간</h2>
                <p>원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 아래와 같이 보존합니다.</p>
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>보존 항목: 신청 정보 및 서비스 이용 기록</li>
                  <li>보존 기간: 1년</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">4. 개인정보의 파기절차 및 방법</h2>
                <p>전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.</p>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">5. 이용자의 권리와 그 행사방법</h2>
                <p>이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 가입해지(동의철회)를 요청할 수도 있습니다. 개인정보 보호책임자에게 서면, 전화 또는 이메일로 연락하시면 지체 없이 조치하겠습니다.</p>
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
