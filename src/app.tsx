// @refresh reload
import Leaflet, { TileLayer } from "leaflet";
import { onMount } from "solid-js";
import "./app.css";
import "leaflet/dist/leaflet.css";

export default function App() {
  let container: HTMLDivElement | undefined;

  onMount(() => {
    if (!container) return;
    const map = Leaflet.map(container, {
      center: [-2500000, 9045984],
      zoom: 13,
    });
    const no = new TileLayer(
      "https://services.geodataonline.no/arcgis/rest/services/Trafikkportalen/GeocacheTrafikkJPG/MapServer/tile/{z}/{y}/{x}",
      {}
    );

    map.addLayer(no);
  });

  return <main ref={container}></main>;
}
