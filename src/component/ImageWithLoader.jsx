import React, { useState, useRef, useEffect } from "react";

const ImageWithLoader = React.memo(({ src, alt, imageClassName, containerClassName }) => {
  // const imgRef = useRef(null);
  // const [loaded, setLoaded] = useState(false);

  // useEffect(() => {
  //   if (imgRef.current?.complete) {
  //     setLoaded(true); // Avoid flicker for cached images
  //   }
  // }, [src]);

  return (
    <div className={`relative ${containerClassName}`}>
      {/* {!loaded && <div className="absolute inset-0 w-full h-full image-skeleton" />} */}
      <img
        // ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        className={`${imageClassName} transition-opacity duration-300`}
        // className={`${imageClassName} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        // onLoad={() => setLoaded(true)}
      />
    </div>
  );
});

export default ImageWithLoader;
