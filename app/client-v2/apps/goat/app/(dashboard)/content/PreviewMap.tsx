import ContentPage from "@/app/(dashboard)/content/page";
import { makeStyles } from "@/lib/theme";
import "mapbox-gl/dist/mapbox-gl.css";
import React from "react";
import Map, { ScaleControl, NavigationControl } from "react-map-gl";

export type PreviewMapType = {
  MAP_ACCESS_TOKEN: string;
  initialViewState: {
    altitude: number;
    bearing: number;
    latitude: number;
    zoom: number;
    pitch: number;
    longitude: number;
  };
  mapStyle: string;
  scaleShow: boolean;
  navigationControl: boolean;
};

const useStyles = () =>
  makeStyles({ name: { ContentPage } })(() => ({
    root: {
      width: "100%",
      height: "100%",
    },
  }));

export default function PreviewMap(props: PreviewMapType) {
  const { initialViewState, MAP_ACCESS_TOKEN, mapStyle, scaleShow, navigationControl } = props;

  const { classes, cx } = useStyles()();

  return (
    <div className={cx(classes.root)}>
      <Map
        initialViewState={initialViewState}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        mapboxAccessToken={MAP_ACCESS_TOKEN}>
        {scaleShow && <ScaleControl />}
        {navigationControl && <NavigationControl />}
      </Map>
    </div>
  );
}
