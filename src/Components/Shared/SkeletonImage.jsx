import React, { useState } from 'react';

const SkeletonImage = ({ src, alt, className = "" }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Skeleton Background */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse z-10 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border-2 border-white/30 border-t-white/80 animate-spin"></div>
                </div>
            )}

            {/* Actual Image */}
            <img
                src={src}
                alt={alt}
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
            />
        </div>
    );
};

export default SkeletonImage;
