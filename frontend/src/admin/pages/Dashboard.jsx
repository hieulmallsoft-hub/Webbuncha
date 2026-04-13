import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import StatCard from "../components/StatCard.jsx";
import { formatCurrency, formatNumber } from "../utils/format.js";

const revenueData = [
  { name: "T2", value: 3200000 },
  { name: "T3", value: 4200000 },
  { name: "T4", value: 2800000 },
  { name: "T5", value: 5100000 },
  { name: "T6", value: 6400000 },
  { name: "T7", value: 7200000 },
  { name: "CN", value: 4500000 }
];

const orderStatus = [
  { name: "Chờ xác nhận", value: 24 },
  { name: "Đã xác nhận", value: 18 },
  { name: "Thanh toán", value: 10 },
  { name: "Hoàn tất", value: 40 }
];

const colors = ["#facc15", "#60a5fa", "#4ade80", "#22c55e"];

const latestOrders = [
  { id: 1021, customer: "Lê Minh Hiếu", total: 230000, status: "PENDING" },
  { id: 1020, customer: "Thanh Hằng", total: 180000, status: "PAID" },
  { id: 1019, customer: "Ngọc Anh", total: 150000, status: "CONFIRMED" }
];

export default function Dashboard() {
  const revenue = useMemo(
    () => revenueData.reduce((sum, item) => sum + item.value, 0),
    []
  );

  return (
    <div className="admin-page">
      <div className="admin-grid stats">
        <StatCard label="Tổng người dùng" value={formatNumber(1200)} change="+12%" />
        <StatCard label="Đơn hàng mới" value={formatNumber(96)} change="+8%" />
        <StatCard label="Doanh thu tuần" value={formatCurrency(revenue)} change="+15%" />
        <StatCard label="Món ăn" value={formatNumber(36)} change="+2 món" />
      </div>

      <div className="admin-grid charts">
        <div className="admin-card">
          <h4 className="font-display text-lg">Doanh thu tuần này</h4>
          <p className="text-sm text-ink/60">Biến động doanh thu theo ngày</p>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="value" stroke="#c56b2c" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="admin-card">
          <h4 className="font-display text-lg">Trạng thái đơn hàng</h4>
          <p className="text-sm text-ink/60">Tỷ lệ theo trạng thái</p>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {orderStatus.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h4 className="font-display text-lg">Đơn hàng mới nhất</h4>
        <p className="text-sm text-ink/60">Theo dõi các đơn gần đây</p>
        <div className="admin-table-scroll">
          <table className="admin-simple-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {latestOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{formatCurrency(order.total)}</td>
                  <td>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
