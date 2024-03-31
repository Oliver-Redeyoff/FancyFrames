export interface ImageInfoValue<T> {
  originalValue: T
  overrideValue?: string
}

export interface ImageInfo {
  label: ImageInfoValue<string>;
  cameraMake: ImageInfoValue<string>;
  cameraModel: ImageInfoValue<string>;
  shutterSpeed: ImageInfoValue<string>;
  aperture: ImageInfoValue<number>;
  ISO: ImageInfoValue<number>;
  date: ImageInfoValue<moment.Moment>;
  latitude: ImageInfoValue<string>;
  longitude: ImageInfoValue<string>;
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
  size: number;
  backgroundColor: string;
  textColor: string;
}
