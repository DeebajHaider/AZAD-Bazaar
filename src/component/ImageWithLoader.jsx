import React, { useState } from 'react';

const ImageWithLoader = ({ src, alt, imageClassName, containerClassName }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative ${containerClassName}`}>
      {!loaded && <div className="absolute inset-0 w-full h-full image-skeleton" />}
      <img
        src={src}
        alt={alt}
        className={`${imageClassName} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

export default ImageWithLoader;
