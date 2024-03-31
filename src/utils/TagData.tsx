import {
  TagIcon,
  CameraIcon,
  CalendarIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

import { ImageInfo, ImageInfoValue } from "./Types";
import moment from "moment";

export function GetInfoValue(imageInfoValue: ImageInfoValue<any>, valueType?: keyof ImageInfoValue<any>): string | number | undefined {
  if (!imageInfoValue) {
    return undefined
  }

  function processValue(valueType: keyof ImageInfoValue<any>) {
    if (moment.isMoment(imageInfoValue[valueType])) {
      return imageInfoValue[valueType].format("ddd, Do MMM YYYY")
    } else {
      return imageInfoValue[valueType]
    }
  }

  if (valueType) {
    return processValue(valueType)
  }

  if (imageInfoValue.overideValue) {
    return processValue("overideValue")
  } else {
    return processValue("originalValue")
  }
}

export function GetLabels(imageInfo: ImageInfo) {
  return {
    Nothing: {
      icon: <></>,
      content: [<></>],
    },
    Camera: {
      icon: <CameraIcon />,
      content: [
        <span>
          {GetInfoValue(imageInfo.cameraMake)} {GetInfoValue(imageInfo.cameraModel)}
        </span>,
        <div style={{ width: "10px" }} />,
        <span>
          <span className="setting">SS </span>
          {GetInfoValue(imageInfo.shutterSpeed)}
        </span>,
        <span>
          <span className="setting">A </span>
          {GetInfoValue(imageInfo.aperture)}
        </span>,
        <span>
          <span className="setting">ISO </span>
          {GetInfoValue(imageInfo.ISO)}
        </span>,
      ],
    },
    Date: {
      icon: <CalendarIcon />,
      content: [<span>{GetInfoValue(imageInfo.date)}</span>],
    },
    Title: {
      icon: <TagIcon />,
      content: [<span>{GetInfoValue(imageInfo.label) as string}</span>],
    },
    Coordinates: {
      icon: <GlobeAltIcon />,
      content: [
        <span>
          {GetInfoValue(imageInfo.latitude) as string} {GetInfoValue(imageInfo.longitude) as string}
        </span>,
      ],
    },
  };
}
