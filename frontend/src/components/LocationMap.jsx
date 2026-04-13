import { useEffect, useMemo, useState } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultCenter = [21.028, 105.854];
const defaultZoom = 13;

const marker = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const formatNumber = (value, digits = 6) =>
  value === null || value === undefined ? "-" : Number(value).toFixed(digits);

const mapError = (error) => {
  if (!error) return "Không thể định vị.";
  switch (error.code) {
    case 1:
      return "Bạn đã từ chối quyền định vị.";
    case 2:
      return "Không thể lấy vị trí hiện tại.";
    case 3:
      return "Quá thời gian chờ định vị.";
    default:
      return "Không thể định vị.";
  }
};

export default function LocationMap({ autoLocate = true }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [position, setPosition] = useState(null);

  const center = position ? [position.lat, position.lng] : defaultCenter;
  const zoom = position ? 16 : defaultZoom;

  const accuracy = position?.accuracy ?? null;

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ định vị.");
      setStatus("error");
      return;
    }
    setStatus("locating");
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setStatus("ready");
      },
      (err) => {
        setError(mapError(err));
        setStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  useEffect(() => {
    if (autoLocate) {
      handleLocate();
    }
  }, [autoLocate]);

  const statusLabel = useMemo(() => {
    if (status === "locating") return "Đang định vị...";
    if (status === "ready") return "Đã xác định vị trí.";
    if (status === "error") return error || "Không thể định vị.";
    return "Nhấn nút để định vị.";
  }, [status, error]);

  return (
    <div className="checkout-map-card">
      <div className="checkout-map-head">
        <div>
          <p className="ml-label">Vị trí</p>
          <h4 className="mt-2 font-display text-lg">Bạn đang ở đâu?</h4>
        </div>
        <button className="ml-button-outline checkout-locate" type="button" onClick={handleLocate}>
          Định vị ngay
        </button>
      </div>
      <div className="checkout-map">
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && (
            <>
              <Marker position={[position.lat, position.lng]} icon={marker}>
                <Popup>Vị trí hiện tại của bạn.</Popup>
              </Marker>
              <Circle
                center={[position.lat, position.lng]}
                radius={Math.max(accuracy || 0, 25)}
                pathOptions={{ color: "#c56b2c", fillColor: "#c56b2c", fillOpacity: 0.2 }}
              />
            </>
          )}
        </MapContainer>
      </div>
      <div className="checkout-map-meta">
        <span>{statusLabel}</span>
        {position && (
          <span>
            {formatNumber(position.lat)} , {formatNumber(position.lng)}
            {accuracy ? ` (±${Math.round(accuracy)}m)` : ""}
          </span>
        )}
      </div>
      <p className="checkout-map-note">
        Nếu vị trí chưa chính xác, hãy bật GPS hoặc thử lại.
      </p>
    </div>
  );
}

