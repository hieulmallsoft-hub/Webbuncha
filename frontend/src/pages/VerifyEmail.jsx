import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { verifyEmail } from "../lib/api.js";

export default function VerifyEmail() {
  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const token = query.get("token") || "";

  const [status, setStatus] = useState("Đang xác thực email...");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!token) {
        setStatus("Thiếu token xác thực.");
        setDone(true);
        return;
      }
      const res = await verifyEmail(token);
      if (cancelled) return;
      if (res.status >= 200 && res.status < 300) {
        setStatus(res.data?.message || "Xác thực email thành công.");
      } else {
        setStatus(res.data?.message || "Xác thực email thất bại. Token không hợp lệ hoặc đã hết hạn.");
      }
      setDone(true);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const isError = done && status.toLowerCase().includes("thất bại");

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 font-sans text-[#1A1A1A]">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#F0EBE1] shadow-xl p-8 text-center">
        <h1 className="font-display text-3xl font-bold">Xác thực email</h1>
        <p className="mt-4 text-sm text-[#1A1A1A]/60">Vui lòng chờ trong giây lát.</p>

        <div
          className={`mt-8 p-4 rounded-xl border ${
            isError
              ? "bg-red-50 border-red-100 text-red-600"
              : "bg-[#6A7B53]/5 border-[#6A7B53]/10 text-[#6A7B53]"
          } text-[10px] font-bold uppercase tracking-widest`}
        >
          {status}
        </div>

        <div className="mt-10">
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full py-4 bg-[#1A1A1A] text-white text-[10px] uppercase tracking-[0.4em] font-extrabold hover:bg-[#6A7B53] transition-all duration-500 shadow-xl rounded-xl"
          >
            Đến trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

