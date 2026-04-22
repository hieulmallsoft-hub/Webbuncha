import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { formatPriceVND } from "../utils/price.js";

const STORAGE_KEY = "vnpay_pending_payment";

export default function VnpayPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const payment = useMemo(() => {
    const fromState = location.state && typeof location.state === "object" ? location.state : null;
    if (fromState?.paymentUrl) {
      return fromState;
    }

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return null;
      }
      const parsed = JSON.parse(stored);
      return parsed?.paymentUrl ? parsed : null;
    } catch {
      return null;
    }
  }, [location.state]);

  useEffect(() => {
    if (!payment) {
      navigate("/checkout", { replace: true });
    }
  }, [payment, navigate]);

  const handlePayNow = () => {
    if (!payment?.paymentUrl) {
      return;
    }
    window.location.assign(payment.paymentUrl);
  };

  const handleCopy = async () => {
    if (!payment?.paymentUrl || !navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(payment.paymentUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  if (!payment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-16 w-96 h-96 rounded-full bg-[#D4AF37]/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] rounded-full bg-[#B8860B]/10 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <section className="lg:col-span-7 rounded-[32px] bg-white/90 backdrop-blur border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-6 md:px-10 py-8 md:py-10 border-b border-black/5 bg-gradient-to-r from-[#1A1A1A] via-[#2A1E16] to-[#5A3A22] text-white">
              <p className="text-[10px] uppercase tracking-[0.45em] text-[#D4AF37] font-black mb-4">
                Thanh toan VNPay
              </p>
              <h1 className="font-display text-4xl md:text-6xl leading-tight">
                San sang chuyen sang cong thanh toan
              </h1>
              <p className="mt-4 text-sm md:text-base text-white/75 max-w-2xl leading-7">
                Kiem tra lai thong tin don hang truoc khi mo VNPay. Sau khi thanh toan, he thong se tu dong cap nhat trang thai
                don hang qua IPN va trang ket qua.
              </p>
            </div>

            <div className="px-6 md:px-10 py-8 md:py-10">
              <div className="grid sm:grid-cols-2 gap-4">
                <InfoCard label="Ma don hang" value={`#${payment.orderId || "Chua co"}`} />
                <InfoCard label="Ma tham chieu" value={payment.txnRef || "Chua co"} />
                <InfoCard label="So tien" value={formatPriceVND(payment.amount || 0)} />
                <InfoCard label="Cong thanh toan" value={payment.paymentMethod || "VNPay"} />
              </div>

              <div className="mt-8 rounded-[24px] border border-[#F0EBE1] bg-[#FAF7F0] p-5 md:p-6">
                <p className="text-[10px] uppercase tracking-[0.4em] font-black text-[#8B7355] mb-3">
                  Cach thanh toan
                </p>
                <ol className="space-y-3 text-sm md:text-base text-[#1A1A1A]/80 leading-7">
                  <li>1. Bấm "Thanh toan ngay" để mo trang VNPay.</li>
                  <li>2. Dang nhap tai khoan sandbox hoac nhap thong tin the test.</li>
                  <li>3. Hoan tat giao dich va cho he thong quay ve trang ket qua.</li>
                </ol>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handlePayNow}
                  className="px-6 py-4 rounded-xl bg-[#1A1A1A] text-white font-bold uppercase tracking-[0.3em] text-[10px] shadow-lg shadow-black/10 hover:bg-[#B8860B] transition-colors"
                >
                  Thanh toan ngay
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-6 py-4 rounded-xl border border-black/10 bg-white text-[#1A1A1A] font-bold uppercase tracking-[0.3em] text-[10px] hover:border-[#B8860B] hover:text-[#B8860B] transition-colors"
                >
                  {copied ? "Da sao chep" : "Sao chep lien ket"}
                </button>
                <Link
                  to="/checkout"
                  className="px-6 py-4 rounded-xl border border-black/10 bg-white text-[#1A1A1A] font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-black/5 transition-colors text-center"
                >
                  Quay lai
                </Link>
              </div>

              <p className="mt-6 text-xs md:text-sm text-[#1A1A1A]/55 leading-6">
                Ghi chu: neu ban dang test local, URL IPN phai la dia chi public de VNPay sandbox co the goi ve.
              </p>
            </div>
          </section>

          <aside className="lg:col-span-5 space-y-6">
            <div className="rounded-[28px] bg-gradient-to-br from-[#1A1A1A] to-[#3A2518] text-white p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
              <p className="text-[10px] uppercase tracking-[0.45em] text-[#D4AF37] font-black mb-3">
                Trang thai giao dich
              </p>
              <h2 className="font-display text-3xl md:text-4xl leading-tight">
                Dang cho ban xac nhan thanh toan
              </h2>
              <p className="mt-4 text-sm md:text-base text-white/75 leading-7">
                Khi ban hoan tat VNPay, trang /payment-result se hien thi ket qua va don hang se duoc cap nhat neu IPN
                ve thanh cong.
              </p>
            </div>

            <div className="rounded-[28px] border border-black/5 bg-white/90 backdrop-blur p-6 md:p-8 shadow-[0_18px_50px_rgba(0,0,0,0.05)]">
              <p className="text-[10px] uppercase tracking-[0.4em] font-black text-[#8B7355] mb-4">
                Man hinh trung gian
              </p>
              <div className="space-y-4 text-sm md:text-base text-[#1A1A1A]/80 leading-7">
                <p>Day la giao dien truoc khi mo VNPay, giup nguoi dung kiem tra lai so tien va ma don hang.</p>
                <p>Neu muon, ban co the them QR, huong dan the test, hoac nut mo VNPay o tab moi.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white px-5 py-4 shadow-sm">
      <p className="text-[9px] uppercase tracking-[0.35em] font-black text-[#1A1A1A]/40 mb-2">{label}</p>
      <p className="text-sm md:text-base font-semibold text-[#1A1A1A] break-words">{value}</p>
    </div>
  );
}
