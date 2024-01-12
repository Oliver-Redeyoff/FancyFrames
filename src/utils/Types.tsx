export interface ImageInfo {
  label: string;
  cameraMake: string;
  cameraModel: string;
  shutterSpeed: string;
  aperture: number;
  ISO: number;
  date: moment.Moment;
  latitude: string;
  longitude: string;
}

export interface TagInfo {
  icon: JSX.Element;
  content: JSX.Element[];
}

export interface Tags {
  Camera: TagInfo;
  Date: TagInfo;
  Coordinates: TagInfo;
  Label: TagInfo;
}

export interface LabelInfo {
  type: keyof Tags;
  alignment: "start" | "center" | "end";
}
