import {
  TagIcon,
  CameraIcon,
  CalendarIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

import { ImageInfo, Tags } from "./Types";

export function GetTags(imageInfo: ImageInfo): Tags {
  return {
    Camera: {
      icon: <CameraIcon />,
      content: [
        <span>
          {imageInfo.cameraMake} {imageInfo.cameraModel}
        </span>,
        <div style={{ width: "10px" }} />,
        <span>
          <span className="setting">SS </span>
          {imageInfo.shutterSpeed}
        </span>,
        <span>
          <span className="setting">A </span>
          {imageInfo.aperture}
        </span>,
        <span>
          <span className="setting">ISO </span>
          {imageInfo.ISO}
        </span>,
      ],
    },
    Date: {
      icon: <CalendarIcon />,
      content: [<span>{imageInfo.date?.format("ddd, Do MMM YYYY")}</span>],
    },
    Title: {
      icon: <TagIcon />,
      content: [<span>{imageInfo.label}</span>],
    },
    Coordinates: {
      icon: <GlobeAltIcon />,
      content: [
        <span>
          {imageInfo.latitude} {imageInfo.longitude}
        </span>,
      ],
    },
  };
}
