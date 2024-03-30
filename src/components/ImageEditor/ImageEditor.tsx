import "./ImageEditor.css";

import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import EXIF from "exif-js";
import moment from "moment";

import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  Bars3BottomRightIcon,
  ChevronDownIcon,
  XMarkIcon,
  TagIcon,
  AdjustmentsVerticalIcon,
} from "@heroicons/react/24/outline";

import {
  ImageInfo,
  LabelInfo,
  Tags,
  ImageSettings,
  FrameSettings,
} from "../../utils/Types";
import { GetTags } from "../../utils/TagData";

const ImageEditor = () => {
  const fancyImageRef = useRef<HTMLDivElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo>({} as ImageInfo);

  const [imageSettings, setImageSettings] = useState<ImageSettings>({
    borderRadius: 0,
  });

  const [frameSettings, setFrameSettings] = useState<FrameSettings>({
    size: 50,
    backgroundColor: "#ffffff",
    textColor: "#A7A7A8",
  });

  const [isDownloading, setIsDownloading] = useState<boolean>(false)

  const [labelSettings, setLabelSettings] = useState<{
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
  const [labelSettingsCollapsed, setLabelSettingsCollapsed] = useState<{
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  }>({
    top: true,
    right: true,
    bottom: true,
    left: true,
  });

  useEffect(() => {
    console.log(imageInfo);
  }, [imageInfo]);
  
  useEffect(() => {
    fancyImageRef.current?.style.setProperty("--padding", frameSettings.size + "px")
  }, [frameSettings.size, fancyImageRef.current])

  function handleFileInput(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(URL.createObjectURL(file));

      EXIF.getData(
        event.target.files[0] as unknown as string,
        function (this: any) {
          var exifData = EXIF.getAllTags(this);
          if (exifData) {
            console.log(exifData);

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
              label: exifData["ImageDescription"],
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

  async function downloadFancyImage() {
    if (fancyImageRef.current) {
      console.log(EXIF.getAllTags(selectedImage));

      // get old padding and label height
      const computedStyles = getComputedStyle(fancyImageRef.current)
      console.log(computedStyles.getPropertyValue("--label-height"))
      const smallPadding = parseInt(computedStyles.getPropertyValue("--padding"))
      const smallLabelHeight = parseInt(computedStyles.getPropertyValue("--label-height"))

      const smallHypot = Math.hypot(fancyImageRef.current?.clientWidth ?? 0, fancyImageRef.current?.clientHeight ?? 0)
      setIsDownloading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      const bigHypot = Math.hypot(fancyImageRef.current?.clientWidth ?? 0, fancyImageRef.current?.clientHeight ?? 0)
      console.log(bigHypot)

      console.log((smallPadding as number * bigHypot/smallHypot))
      console.log((smallLabelHeight as number * bigHypot/smallHypot))

      // update size of padding and label height
      fancyImageRef.current.style.setProperty(
        "--padding",
        (smallPadding as number * bigHypot/smallHypot) + "px"
      );
      fancyImageRef.current.style.setProperty(
        "--label-height",
        (smallLabelHeight as number * bigHypot/smallHypot) + "px"
      );
      
      await new Promise(resolve => setTimeout(resolve, 500));
      // convert to image
      toPng(fancyImageRef.current as HTMLElement, { cacheBust: false })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "my-image-name.png";
          link.href = dataUrl;
          link.click();
          setIsDownloading(false);

          // reset size of padding and label height
          if (fancyImageRef.current) {
            fancyImageRef.current.style.setProperty("--padding", smallPadding + "px");
            fancyImageRef.current.style.setProperty("--label-height", smallLabelHeight + "px");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  return (
    <div className="image-editor bg-neutral-900 font-sans">
      {/* SETTINGS */}
      <div className="settings-container">
        <div className="settings">
          <h1 className="flex items-center gap-3 text-2xl font-bold mb-10">
            <div className="w-9 text-red-400">
              <PhotoIcon />
            </div>
            Fancy Frames
          </h1>

          <h2 className="setting-section-name">
            <div className="w-6">
              <ArrowsPointingInIcon />
            </div>
            Image settings
          </h2>

          <div className="setting-section-body">
            <div className="setting-label">Image border radius</div>
            <input
              className="w-full"
              type="range"
              min="0"
              max="50"
              value={imageSettings.borderRadius}
              onChange={(e) => {
                setImageSettings({
                  ...imageSettings,
                  borderRadius: parseInt(e.target.value),
                });
              }}
            />
          </div>

          <h2 className="setting-section-name">
            <div className="w-6">
              <ArrowsPointingOutIcon />
            </div>
            Frame settings
          </h2>
          <div className="setting-section-body">
            <div className="setting-label">Image frame size</div>
            <input
              className="w-full"
              type="range"
              min="30"
              max="100"
              value={frameSettings.size}
              onChange={(e) => {
                setFrameSettings({
                  ...frameSettings,
                  size: parseInt(e.target.value),
                });
              }}
            />

            <div className="setting-label">Frame background color</div>
            <input
              className="w-full bg-transparent"
              type="color"
              value={frameSettings.backgroundColor}
              onChange={(e) => {
                setFrameSettings({
                  ...frameSettings,
                  backgroundColor: e.target.value,
                });
              }}
            />

            <div className="setting-label mt-4">Frame text color</div>
            <input
              className="w-full bg-transparent"
              type="color"
              value={frameSettings.textColor}
              onChange={(e) => {
                setFrameSettings({
                  ...frameSettings,
                  textColor: e.target.value,
                });
              }}
            />
          </div>

          {/* LABEL SETTINGS */}
          <h2 className="setting-section-name">
            <div className="w-6">
              <TagIcon />
            </div>
            Label settings
          </h2>
          <div className="setting-section-body">
            {Object.keys(labelSettings).map((position) => (
              <div key={position} className="label-settings mb-5">
                <h3
                  className="setting-label flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    var newLabelSettingsCollapsed = {
                      ...labelSettingsCollapsed,
                    };
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
                      "w-4 transition-all duration-300" +
                      (labelSettingsCollapsed[
                        position as keyof typeof labelSettingsCollapsed
                      ]
                        ? ""
                        : " rotate-180")
                    }
                  >
                    <ChevronDownIcon />
                  </div>
                </h3>

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
                  <div className="mt-2 setting-label">Tag type</div>
                  <div className="bg-neutral-700 p-1 ps-3 pe-3 rounded-lg">
                    <select
                      className="w-full bg-transparent focus:border-none outline-none"
                      value={
                        labelSettings[position as keyof typeof labelSettings]
                          .type
                      }
                      onChange={(e) => {
                        var newDetails = { ...labelSettings };
                        newDetails[
                          position as keyof typeof labelSettings
                        ].type = e.target.value as keyof Tags;
                        setLabelSettings(newDetails);
                      }}
                    >
                      {Object.keys(GetTags(imageInfo)).map((tagType) => (
                        <option value={tagType}>{tagType}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4 setting-label">Tag alignment</div>
                  <div className="alignments">
                    {["start", "center", "end"].map((alignment) => (
                      <div
                        key={alignment}
                        className={
                          "alignment" +
                          (labelSettings[position as keyof typeof labelSettings]
                            .alignment == alignment
                            ? " selected"
                            : "")
                        }
                        onClick={() => {
                          var newDetails = { ...labelSettings };
                          newDetails[
                            position as keyof typeof labelSettings
                          ].alignment = alignment as "start" | "center" | "end";
                          console.log(newDetails);
                          setLabelSettings(newDetails);
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
          </div>

          <h2 className="setting-section-name">
            <div className="w-6">
              <AdjustmentsVerticalIcon />
            </div>
            Tag values
          </h2>
          <div className="setting-section-body">
            {/* Allow user to overide what the value of a tag is */}
          </div>
        </div>
      </div>

      {/* FANCY IMAGE */}
      <div className="fancy-image-container">
        {!selectedImage && (
          <div className="image-upload hover:bg-neutral-800">
            <div className="upload-prompt">
              <ArrowUpTrayIcon className="text-red-400" />
              <div>Upload image</div>
            </div>
            <input
              type="file"
              accept=".jpg, .png, .heif, .heic"
              onChange={handleFileInput}
            />
          </div>
        )}

        {selectedImage && (
          <>
            <div
              className="absolute top-8 right-8 bg-gray-700 p-3 box-content w-7 h-7 rounded-full cursor-pointer hover:scale-125 transition-all"
              onClick={() => {
                setSelectedImage(null);
              }}
            >
              <XMarkIcon className="stroke-2 text-red-400" />
            </div>

            <div
              className="absolute bottom-8 right-8 bg-gray-700 p-3 box-content w-7 h-7 rounded-full cursor-pointer hover:scale-125 transition-all"
              onClick={downloadFancyImage}
            >
              <ArrowDownTrayIcon className="stroke-2 text-emerald-500" />
            </div>

            <div
              ref={fancyImageRef}
              className={"fancy-image" + (isDownloading ? " downloading" : "")}
              style={{
                backgroundColor: frameSettings.backgroundColor,
                color: frameSettings.textColor,
              }}
            >
              <img
                style={{ borderRadius: `${imageSettings.borderRadius}%` }}
                src={selectedImage}
              />

              {Object.keys(labelSettings).map((position) => (
                <div
                  key={position}
                  className={"label " + position}
                  style={{
                    justifyContent:
                      labelSettings[position as keyof typeof labelSettings]
                        .alignment,
                  }}
                >
                  <div className="icon ">
                    {
                      GetTags(imageInfo)[
                        labelSettings[position as keyof typeof labelSettings]
                          .type
                      ].icon
                    }
                  </div>
                  {GetTags(imageInfo)[
                    labelSettings[position as keyof typeof labelSettings].type
                  ].content.map((element) => element)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageEditor;
