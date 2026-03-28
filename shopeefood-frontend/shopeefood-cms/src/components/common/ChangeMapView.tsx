import { useMap } from "react-leaflet";
import { useEffect } from "react";
import { LatLngExpression } from "leaflet";

function ChangeMapView({ center }: { center: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 16);
  }, [center, map]);

  return null;
}
export default ChangeMapView;