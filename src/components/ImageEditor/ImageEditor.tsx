import "./ImageEditor.css";

import { useState, useRef } from "react";
import { toPng } from "html-to-image";

const ImageEditor = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  function htmlToImageConvert() {
    if (elementRef != null) {
      toPng(elementRef.current as HTMLElement, { cacheBust: false })
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

  return (
    <div>
      <h1>Upload and Display Image usign React Hook's</h1>

      {selectedImage && (
        <>
          <div ref={elementRef} className="fancy-image">
            <img
              alt="not found"
              width={"250px"}
              src={URL.createObjectURL(selectedImage)}
            />
          </div>

          <button onClick={() => setSelectedImage(null)}>Remove</button>
          <button onClick={() => htmlToImageConvert()}>Download</button>
        </>
      )}

      <br />
      <br />

      <input
        type="file"
        name="myImage"
        onChange={(event) => {
          if (event.target.files) {
            console.log(event.target.files[0]);
            setSelectedImage(event.target.files[0]);
          }
        }}
      />
    </div>
  );
};

export default ImageEditor;
