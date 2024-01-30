// @refresh reload
import { createEffect, createResource, createSignal, onMount } from "solid-js";
import { Feature, Map, View } from "ol";
import "./app.css";
import "ol/ol.css";
import { XYZ } from "ol/source";
import { Projection } from "ol/proj";
import TileGrid from "ol/tilegrid/TileGrid";
import TileLayer from "ol/layer/Tile";
import WKT from "ol/format/WKT";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

const getRailings = async () => {
  const result = await fetch(
    "https://nvdbapiles-v3.atlas.vegvesen.no/vegobjekter/5?kartutsnitt=202904.867,6875662.022,205444.872,6876933.348&segmentering=true&inkluder=metadata,lokasjon,geometri"
  );

  return await result.json();
};

export const EPSG25833 = new Projection({
  code: "EPSG:25833",
  extent: [-25e5, 35e5, 3045984, 9045984],
  units: "m",
});

export const geodataResolutions = [
  21674.7100160867, 10837.35500804335, 5418.677504021675, 2709.3387520108377,
  1354.6693760054188, 677.3346880027094, 338.6673440013547, 169.33367200067735,
  84.66683600033868, 42.33341800016934, 21.16670900008467, 10.583354500042335,
  5.291677250021167, 2.6458386250105836, 1.3229193125052918, 0.6614596562526459,
  0.33072982812632296, 0.16536491406316148, 0.08268245703158074,
];

export default function App() {
  const [railings] = createResource(getRailings);
  const [olMap, setOlMap] = createSignal<Map>();
  let container: HTMLDivElement | undefined;

  onMount(() => {
    if (!container) return;

    const mountedMap = new Map({
      target: container,
      layers: [
        new TileLayer({
          preload: 8,
          source: new XYZ({
            crossOrigin: "Anonymous",
            projection: EPSG25833,
            tileGrid: new TileGrid({
              extent: EPSG25833.getExtent(),
              origin: [-2500000, 9045984],
              resolutions: geodataResolutions,
            }),
            url: "https://services.geodataonline.no/arcgis/rest/services/Trafikkportalen/GeocacheTrafikkJPG/MapServer/tile/{z}/{y}/{x}",
          }),
        }),
      ],
      view: new View({
        center: [203174.5, 6876298.5],
        zoom: 15,
        projection: EPSG25833,
      }),
    });

    setOlMap(mountedMap);
  });

  createEffect(() => {
    const map = olMap();
    const data = railings();

    if (!data || !map) return;

    const features = data.objekter.map((obj: any) => {
      const { wkt } = obj.geometri;
      const fmt = new WKT();
      const geom = fmt.readGeometry(wkt);
      const feature = new Feature(geom);
      feature.setStyle(
        new Style({
          stroke: new Stroke({
            color: "blue",
            width: 5,
          }),
        })
      );

      return feature;
    });

    map.addLayer(new VectorLayer({ source: new VectorSource({ features }) }));

    console.log(data);
  });

  return <main ref={container}></main>;
}
