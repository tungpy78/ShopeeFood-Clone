import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import { Input, Button, Space } from "antd";
import { EnvironmentOutlined, SearchOutlined } from "@ant-design/icons";
import L, { LatLngExpression, LeafletMouseEvent } from "leaflet";
import ChangeMapView from "./ChangeMapView";


const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});


function LocationMarker({ position, setPosition, onChange }: any) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      const { lat, lng } = e.latlng;

      setPosition([lat, lng]);
      reverseGeocode(lat, lng, onChange);
    },
  });

  return (
    <Marker
      position={position}
      icon={markerIcon}
      draggable
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const { lat, lng } = marker.getLatLng();

          setPosition([lat, lng]);
          reverseGeocode(lat, lng, onChange);
        },
      }}
    />
  );
}

async function reverseGeocode(lat: number, lng: number, onChange: any) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
  );

  const data = await res.json();

  onChange(lat, lng, data.display_name);
}

// Thêm initialPosition vào Props
interface Props {
  onChange: (lat: number, lng: number, address: string) => void;
  initialPosition?: [number, number]; // Tọa độ ban đầu (nếu có)
}

export default function MapPicker({ onChange, initialPosition }: Props) {
  // Dùng initialPosition nếu có, không thì mặc định là TP.HCM
  const [position, setPosition] = useState<LatLngExpression>(
    initialPosition || [10.762622, 106.660172]
  );

  // Thêm useEffect để map cập nhật khi initialPosition thay đổi (từ API trả về)
  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  const [search, setSearch] = useState("");

  const searchLocation = async () => {
    if (!search) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${search}`
    );

    const data = await res.json();

    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);

      setPosition([lat, lon]);

      onChange(lat, lon, data[0].display_name);
    }
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setPosition([lat, lng]);

      reverseGeocode(lat, lng, onChange);
    });
  };

  return (
    <div>
      <Space style={{ marginBottom: 10 }}>
        <Input
          placeholder="Tìm địa chỉ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button icon={<SearchOutlined />} onClick={searchLocation}>
          Tìm
        </Button>

        <Button icon={<EnvironmentOutlined />} onClick={getCurrentLocation}>
          GPS
        </Button>
      </Space>

      <MapContainer
        center={position}
        zoom={15}
        style={{ height: "400px", width: "100%", borderRadius: 10 }}
      >
        <ChangeMapView center={position} />
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationMarker
          position={position}
          setPosition={setPosition}
          onChange={onChange}
        />
      </MapContainer>
    </div>
  );
}