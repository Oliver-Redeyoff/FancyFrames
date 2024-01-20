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
  Nothing: TagInfo;
  Camera: TagInfo;
  Date: TagInfo;
  Coordinates: TagInfo;
  Title: TagInfo;
}

export interface LabelInfo {
  type: keyof Tags;
  alignment: "start" | "center" | "end";
}

export interface ImageSettings {
  borderRadius: number;
}

export interface FrameSettings {
  backgroundColor: string;
  textColor: string;
}
