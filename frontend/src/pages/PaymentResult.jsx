import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatPriceVND } from "../utils/price.js";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  const responseCode = searchParams.get("vnp_ResponseCode") || "";
  const transactionStatus = searchParams.get("vnp_TransactionStatus") || "";
  const orderId = searchParams.get("vnp_TxnRef") || "";
  const transactionNo = searchParams.get("vnp_TransactionNo") || "";
  const bankCode = searchParams.get("vnp_BankCode") || "";
  const payDate = searchParams.get("vnp_PayDate") || "";
  const amount = Number(searchParams.get("vnp_Amount") || 0) / 100;

  const isSuccess = responseCode === "00" && transactionStatus === "00";

  useEffect(() => {
    if (isSuccess) {
      clearCart();
    }
  }, [isSuccess, clearCart]);

  const tone = useMemo(() => {
    if (isSuccess) {
      return {
        badge: "Thanh toan thanh cong",
        accent: "from-emerald-100 to-lime-50",
        border: "border-emerald-200",
        text: "text-emerald-700"
      };
    }
    return {
      badge: "Thanh toan chua hoan tat",
      accent: "from-amber-100 to-orange-50",
      border: "border-amber-200",
      text: "text-amber-700"
    };
  }, [isSuccess]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] py-20">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className={`rounded-[28px] border ${tone.border} bg-gradient-to-br ${tone.accent} p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.06)]`}>
          <p className={`text-[10px] uppercase tracking-[0.5em] font-black ${tone.text} mb-4`}>
            {tone.badge}
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            {isSuccess ? "VNPay da ghi nhan giao dich" : "VNPay chua xac nhan thanh toan"}
          </h1>
          <p className="text-sm md:text-base text-[#1A1A1A]/75 max-w-2xl leading-7">
            {isSuccess
              ? "Giao dich da duoc gui ve he thong va se cap nhat trang thai don hang trong vai giay."
              : "Neu ban da thanh toan nhung trang thai chua cap nhat, vui long cho he thong dong bo IPN hoac xem lai ma giao dich."}
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <InfoRow label="Ma don hang" value={orderId || "Chua co"} />
            <InfoRow label="So giao dich" value={transactionNo || "Chua co"} />
            <InfoRow label="Ma ngan hang" value={bankCode || "Khong co"} />
            <InfoRow label="So tien" value={amount ? formatPriceVND(amount) : "Chua co"} />
            <InfoRow label="Ngay giao dich" value={payDate || "Chua co"} />
            <InfoRow label="Trang thai" value={responseCode || "Chua co"} />
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              to="/history"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[#1A1A1A] text-white font-bold uppercase tracking-[0.3em] text-[10px]"
            >
              Xem lich su don hang
            </Link>
            <Link
              to="/menu"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-[#1A1A1A]/10 bg-white/70 text-[#1A1A1A] font-bold uppercase tracking-[0.3em] text-[10px]"
            >
              Quay lai thuc don
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 px-5 py-4 shadow-sm">
      <p className="text-[9px] uppercase tracking-[0.35em] font-black text-[#1A1A1A]/40 mb-2">{label}</p>
      <p className="text-sm font-semibold text-[#1A1A1A] break-words">{value}</p>
    </div>
  );
}
