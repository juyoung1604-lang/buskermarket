"use client";

import { IMAGES } from "@/lib/constants";
import { useState, useEffect } from "react";
import { DB } from "@/lib/supabase";
import { useToast } from "@/components/admin/Toast";

export default function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(IMAGES.logo);

  useEffect(() => {
    const loadLogo = async () => {
      const imgs = await DB.getImages();
      const logo = imgs?.find((i: any) => i.id === 'img-logo' && i.active);
      if (logo?.url) setLogoUrl(logo.url);
    };
    loadLogo();
  }, []);

  const infoLinks = [
    { label: "플랫폼 소개", href: "/intro" },
    { label: "이용 및 운영약관", href: "/terms" },
    { label: "개인정보 처리방침", href: "/privacy" },
  ];

  const statusLinks = [
    { label: "버스커 신청 확인", href: "/status?type=busker" },
    { label: "셀러 신청 확인", href: "/status?type=seller" },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast("올바른 이메일 주소를 입력해주세요.", "rose");
      return;
    }

    setLoading(true);
    try {
      // Pass client-side Supabase config as fallback for server API
      const supabaseUrl =
        (typeof window !== "undefined" && localStorage.getItem("supabase_url")) ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        "";
      const supabaseKey =
        (typeof window !== "undefined" && localStorage.getItem("supabase_key")) ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        "";

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, supabaseUrl, supabaseKey }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast(data.error || "구독에 실패했습니다.", "rose");
      } else {
        toast("구독해주셔서 감사합니다! 최신 소식을 보내드릴게요.", "jade");
        setEmail("");
      }
    } catch {
      toast("오류가 발생했습니다. 잠시 후 다시 시도해주세요.", "rose");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: "#F0F4EF" }}>
      <div className="relative z-10 py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="col-span-2 md:col-span-1">
              <img
                alt="송도 버스킹 마켓"
                className="h-10 md:h-12 w-auto mb-3 md:mb-4"
                src={logoUrl}
              />
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: "#6B6B6B",
                  fontFamily: '"Noto Sans KR", sans-serif',
                }}
              >
                매주 주말 송도 캠핑장에서
                <br />
                열리는 버스킹 공연과
                <br />
                플리마켓
              </p>
            </div>

            <div>
              <h4
                className="text-xs font-bold mb-4 tracking-wider"
                style={{ color: "#2C2C2C" }}
              >
                NEWSLETTER
              </h4>
              <form
                onSubmit={handleSubscribe}
                className="flex items-center border-b pb-2"
                style={{ borderColor: "#2C2C2C" }}
              >
                <input
                  placeholder="이메일 주소"
                  className="flex-1 bg-transparent text-[#2C2C2C] text-sm outline-none placeholder-gray-400"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="text-[#2C2C2C] hover:opacity-80 transition-opacity cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-[#2C2C2C]/30 border-t-[#2C2C2C] rounded-full animate-spin"></div>
                  ) : (
                    <i className="ri-arrow-right-line text-xl"></i>
                  )}
                </button>
              </form>
              <p
                className="text-xs mt-3"
                style={{ color: "#6B6B6B" }}
              >
                최신 소식을 받아보세요
              </p>
            </div>

            <div>
              <h4
                className="text-xs font-bold mb-4 tracking-wider"
                style={{ color: "#2C2C2C" }}
              >
                안내
              </h4>
              <div className="space-y-3">
                {infoLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block text-[#6B6B6B] hover:text-[#FF8B5A] transition-colors cursor-pointer"
                    style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4
                className="text-xs font-bold mb-4 tracking-wider"
                style={{ color: "#2C2C2C" }}
              >
                신청 확인
              </h4>
              <div className="space-y-3">
                {statusLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block text-[#6B6B6B] hover:text-[#FF8B5A] transition-colors cursor-pointer"
                    style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4
                className="text-xs font-bold mb-4 tracking-wider"
                style={{ color: "#2C2C2C" }}
              >
                FOLLOW US
              </h4>
              <div className="space-y-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#FF8B5A] transition-colors"
                >
                  <i className="ri-instagram-line text-xl"></i>
                  <span style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
                    Instagram
                  </span>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#FF8B5A] transition-colors"
                >
                  <i className="ri-youtube-line text-xl"></i>
                  <span style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
                    YouTube
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="border-t py-6"
        style={{ borderColor: "#E0E0E0" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div
            className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm"
            style={{ color: "#6B6B6B" }}
          >
            <p style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
              © 2026 송도 버스킹 마켓. All rights reserved.
            </p>
            <span style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
              Powered by 넥스트스테이즈
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
