import "./ImageEditor.css";

import {
  TagIcon,
  CameraIcon,
  CalendarIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import EXIF, { getTag } from "exif-js";
import moment from "moment";

import { ImageInfo, LabelInfo } from "../../utils/Types";
import { GetTags } from "../../utils/TagData";

const ImageEditor = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [ImageInfo, setImageInfo] = useState<ImageInfo>({} as ImageInfo);
  const [labelDetails, setLabelDetails] = useState<{
    top: LabelInfo;
    right: LabelInfo;
    bottom: LabelInfo;
    left: LabelInfo;
  }>({
    top: { type: "Camera", alignment: "start" },
    right: { type: "Date", alignment: "start" },
    bottom: { type: "Label", alignment: "start" },
    left: { type: "Coordinates", alignment: "start" },
  });
  const fancyImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(ImageInfo);
  }, [ImageInfo]);

  useEffect(() => {
    if (fancyImageRef.current) {
      console.log(fancyImageRef.current.style);
      fancyImageRef.current.style.setProperty(
        "--fancy-image-height",
        fancyImageRef.current?.clientHeight + "px"
      );
    }
  }, [fancyImageRef.current?.clientHeight]);

  function htmlToImageConvert() {
    if (fancyImageRef != null) {
      console.log(EXIF.getAllTags(selectedImage));

      toPng(fancyImageRef.current as HTMLElement, { cacheBust: false })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "my-image-name.png";
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const file = event.target.files[0];

      EXIF.getData(
        event.target.files[0] as unknown as string,
        function (this: any) {
          var exifData = EXIF.getAllTags(this);
          if (exifData) {
            console.log(exifData);
            console.log(Date.parse(exifData["DateTime"]));

            const latitudeCoords = exifData["GPSLatitude"];
            var latitude = "";
            if (latitudeCoords) {
              latitude = `${latitudeCoords[0]}° ${latitudeCoords[1]}' ${latitudeCoords[2]}" ${exifData["GPSLatitudeRef"]}`;
            }

            const longitudeCoords = exifData["GPSLongitude"];
            var longitude = "";
            if (longitudeCoords) {
              longitude = `${longitudeCoords[0]}° ${longitudeCoords[1]}' ${longitudeCoords[2]}" ${exifData["GPSLatitudeRef"]}`;
            }

            setImageInfo({
              label: "",
              cameraMake: exifData["Make"],
              cameraModel: exifData["Model"],
              aperture: exifData["FNumber"].numerator,
              shutterSpeed: `${exifData["ExposureTime"].numerator}/${exifData["ExposureTime"].denominator}`,
              ISO: exifData["ISOSpeedRatings"],
              date: moment(exifData["DateTime"], "YYYY:MM:DD hh:mm:ss"),
              latitude: latitude,
              longitude: longitude,
            });
          } else {
            console.log("No EXIF data found in image '" + file.name + "'.");
          }
        }
      );

      setSelectedImage(event.target.files[0]);
    }
  }

  return (
    <div className="image-editor">
      {selectedImage && (
        <div className="fancy-image-container">
          <div ref={fancyImageRef} className="fancy-image">
            <img src={URL.createObjectURL(selectedImage)} />

            {Object.keys(labelDetails).map((position) => (
              <div
                className={"tag " + position}
                style={{
                  justifyContent:
                    labelDetails[position as keyof typeof labelDetails]
                      .alignment,
                }}
              >
                <div className="icon ">
                  {
                    GetTags(ImageInfo)[
                      labelDetails[position as keyof typeof labelDetails].type
                    ].icon
                  }
                </div>
                {GetTags(ImageInfo)[
                  labelDetails[position as keyof typeof labelDetails].type
                ].content.map((element) => element)}
              </div>
            ))}

            {/* <div
              className="tag top"
              style={{ justifyContent: labelDetails.top.alignment }}
            >
              <div className="icon ">
                {GetTags(ImageInfo)[labelDetails.top.type].icon}
              </div>
              <span>
                {ImageInfo.cameraMake} {ImageInfo.cameraModel}
              </span>
              <div style={{ width: "10px" }} />
              <span>
                <span className="setting">SS </span>
                {ImageInfo.shutterSpeed}
              </span>
              <span>
                <span className="setting">A </span>
                {ImageInfo.aperture}
              </span>
              <span>
                <span className="setting">ISO </span>
                {ImageInfo.ISO}
              </span>
            </div>

            <div
              className="tag right"
              style={{ justifyContent: labelDetails.right.alignment }}
            >
              <div className="icon">
                <CalendarIcon />
              </div>
              <span>{ImageInfo.date?.format("D - M - YYYY")}</span>
            </div>

            <div
              className="tag bottom"
              style={{ justifyContent: labelDetails.bottom.alignment }}
            >
              <div className="icon">
                <TagIcon />
              </div>
              <span>Green sand beach</span>
            </div>

            <div
              className="tag left"
              style={{ justifyContent: labelDetails.left.alignment }}
            >
              <div className="icon">
                <GlobeAltIcon />
              </div>
              <span>
                {ImageInfo.latitude} {ImageInfo.longitude}
              </span>
            </div> */}
          </div>
        </div>
      )}

      <br />
      <br />

      <button onClick={() => setSelectedImage(null)}>Remove</button>
      <button onClick={() => htmlToImageConvert()}>Download</button>

      <input
        type="file"
        accept=".jpg, .png, .heif, .heic"
        onChange={handleChange}
      />
    </div>
  );
};

export default ImageEditor;
