import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../services/authService.js";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự")
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = async (values) => {
    setStatus("Đang đăng nhập...");
    const res = await loginAdmin(values);
    if (res.status >= 200 && res.status < 300) {
      setStatus("Đăng nhập thành công.");
      navigate("/admin/dashboard");
      return;
    }
    setStatus(res.data?.message || "Đăng nhập thất bại.");
  };

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">Admin</p>
          <h1 className="font-display text-3xl">Đăng nhập hệ thống</h1>
          <p className="mt-2 text-sm text-cream/70">Quản trị đơn hàng và vận hành nhà hàng.</p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="admin-label">Email</label>
            <input className="admin-input" type="email" {...register("email")} />
            {errors.email && <p className="admin-error">{errors.email.message}</p>}
          </div>
          <div>
            <label className="admin-label">Mật khẩu</label>
            <input className="admin-input" type="password" {...register("password")} />
            {errors.password && <p className="admin-error">{errors.password.message}</p>}
          </div>
          <button className="admin-button primary w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>
        {status && <p className="mt-4 text-sm text-cream/70">{status}</p>}
      </div>
    </div>
  );
}
