import "./ImageEditor.css";

import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import EXIF from "exif-js";
import moment from "moment";

import {
  ArrowUpTrayIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  Bars3BottomRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

import { ImageInfo, LabelInfo, Tags } from "../../utils/Types";
import { GetTags } from "../../utils/TagData";

const ImageEditor = () => {
  const fancyImageRef = useRef<HTMLDivElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo>({} as ImageInfo);

  const [labelSettingsCollapsed, setLabelSettingsCollapsed] = useState<{
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  }>({
    top: false,
    right: true,
    bottom: true,
    left: true,
  });
  const [labelDetails, setLabelDetails] = useState<{
    top: LabelInfo;
    right: LabelInfo;
    bottom: LabelInfo;
    left: LabelInfo;
  }>({
    top: { type: "Camera", alignment: "start" },
    right: { type: "Date", alignment: "start" },
    bottom: { type: "Title", alignment: "start" },
    left: { type: "Coordinates", alignment: "start" },
  });

  useEffect(() => {
    console.log(imageInfo);
  }, [imageInfo]);

  useEffect(() => {
    if (fancyImageRef.current) {
      console.log(fancyImageRef.current.style);
      fancyImageRef.current.style.setProperty(
        "--fancy-image-height",
        fancyImageRef.current?.clientHeight + "px"
      );
      fancyImageRef.current.style.setProperty(
        "--fancy-image-width",
        fancyImageRef.current?.clientWidth + "px"
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
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(URL.createObjectURL(file));

      EXIF.getData(
        event.target.files[0] as unknown as string,
        function (this: any) {
          var exifData = EXIF.getAllTags(this);
          if (exifData) {
            console.log(Date.parse(exifData["DateTime"]));

            // shutterSpeed
            const exposureTime = exifData["ExposureTime"];
            var shutterSpeed = "";
            if (exposureTime) {
              shutterSpeed = `${exposureTime.numerator}/${exposureTime.denominator}`;
            }

            // latitude
            const latitudeCoords = exifData["GPSLatitude"];
            var latitude = "";
            if (latitudeCoords) {
              latitude = `${latitudeCoords[0]}° ${latitudeCoords[1]}' ${latitudeCoords[2]}" ${exifData["GPSLatitudeRef"]}`;
            }

            // longitude
            const longitudeCoords = exifData["GPSLongitude"];
            var longitude = "";
            if (longitudeCoords) {
              longitude = `${longitudeCoords[0]}° ${longitudeCoords[1]}' ${longitudeCoords[2]}" ${exifData["GPSLatitudeRef"]}`;
            }

            setImageInfo({
              label: "",
              cameraMake: exifData["Make"],
              cameraModel: exifData["Model"],
              aperture: exifData["FNumber"]?.numerator,
              shutterSpeed: shutterSpeed,
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
    }
  }

  return (
    <div className="image-editor">
      {/* SETTINGS */}
      <div className="settings-container">
        <div className="settings">
          <h1 className="text-3xl">Fancy Frames</h1>

          {/* LABEL SETTINGS */}
          {Object.keys(labelDetails).map((position) => (
            <div key={position} className="label-settings">
              <h2
                onClick={() => {
                  var newLabelSettingsCollapsed = { ...labelSettingsCollapsed };
                  newLabelSettingsCollapsed[
                    position as keyof typeof labelSettingsCollapsed
                  ] =
                    !newLabelSettingsCollapsed[
                      position as keyof typeof labelSettingsCollapsed
                    ];
                  setLabelSettingsCollapsed(newLabelSettingsCollapsed);
                }}
              >
                <span>{position} label</span>
                <div className="flex-filler"></div>
                <div
                  className={
                    labelSettingsCollapsed[
                      position as keyof typeof labelSettingsCollapsed
                    ]
                      ? "rotate-180"
                      : ""
                  }
                >
                  <ChevronDownIcon />
                </div>
              </h2>

              <div
                className={
                  "label-settings-body " +
                  (labelSettingsCollapsed[
                    position as keyof typeof labelSettingsCollapsed
                  ]
                    ? "collapsed"
                    : "")
                }
              >
                <label>Tag type</label>
                <select
                  value={
                    labelDetails[position as keyof typeof labelDetails].type
                  }
                  onChange={(e) => {
                    var newDetails = { ...labelDetails };
                    newDetails[position as keyof typeof labelDetails].type = e
                      .target.value as keyof Tags;
                    setLabelDetails(newDetails);
                  }}
                >
                  {Object.keys(GetTags(imageInfo)).map((tagType) => (
                    <option value={tagType}>{tagType}</option>
                  ))}
                </select>

                <label>Tag alignment</label>
                <div className="alignments">
                  {["start", "center", "end"].map((alignment) => (
                    <div
                      key={alignment}
                      className={
                        "alignment" +
                        (labelDetails[position as keyof typeof labelDetails]
                          .alignment == alignment
                          ? " selected"
                          : "")
                      }
                      onClick={() => {
                        var newDetails = { ...labelDetails };
                        newDetails[
                          position as keyof typeof labelDetails
                        ].alignment = alignment as "start" | "center" | "end";
                        console.log(newDetails);
                        setLabelDetails(newDetails);
                      }}
                    >
                      {alignment == "start" && <Bars3BottomLeftIcon />}
                      {alignment == "center" && <Bars3Icon />}
                      {alignment == "end" && <Bars3BottomRightIcon />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button onClick={() => setSelectedImage(null)}>Remove</button>
          <button onClick={() => htmlToImageConvert()}>Download</button>
        </div>
      </div>

      {/* FANCY IMAGE */}
      <div className="fancy-image-container">
        {!selectedImage && (
          <div className="image-upload">
            <div className="upload-prompt">
              <ArrowUpTrayIcon />
              <div>Upload image</div>
            </div>
            <input
              type="file"
              accept=".jpg, .png, .heif, .heic"
              onChange={handleChange}
            />
          </div>
        )}

        {selectedImage && (
          <div ref={fancyImageRef} className="fancy-image">
            <img src={selectedImage} />

            {Object.keys(labelDetails).map((position) => (
              <div
                key={position}
                className={"label " + position}
                style={{
                  justifyContent:
                    labelDetails[position as keyof typeof labelDetails]
                      .alignment,
                }}
              >
                <div className="icon ">
                  {
                    GetTags(imageInfo)[
                      labelDetails[position as keyof typeof labelDetails].type
                    ].icon
                  }
                </div>
                {GetTags(imageInfo)[
                  labelDetails[position as keyof typeof labelDetails].type
                ].content.map((element) => element)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageEditor;
