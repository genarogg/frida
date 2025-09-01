import React, { useState, useRef, useEffect } from 'react';

interface ResponsiveBreakpoint {
    minWidth?: number;
    maxWidth?: number;
    width?: number;
    height?: number;
    aspectRatio?: number;
}

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt?: string;
    blurDataURL?: string | null;
    className?: string;
    width?: number;
    height?: number;
    aspectRatio?: number;
    // Nuevas props para responsividad
    responsive?: boolean;
    maxWidth?: string | number;
    breakpoints?: ResponsiveBreakpoint[];
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt = '',
    blurDataURL = null,
    className = '',
    width = 300,
    height,
    aspectRatio,
    responsive = true,
    maxWidth = '100%',
    breakpoints = [],
    objectFit = 'cover',
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [isInView, setIsInView] = useState<boolean>(false);
    const [imgSrc, setImgSrc] = useState<string | any>(blurDataURL || null);
    const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
        width,
        height: height || width * (aspectRatio ? 1 / aspectRatio : 2 / 3)
    });

    const imgRef = useRef<HTMLDivElement>(null);

    // Función para obtener el breakpoint actual
    const getCurrentBreakpoint = (): ResponsiveBreakpoint | null => {
        if (breakpoints.length === 0) return null;

        const windowWidth = window.innerWidth;
        return breakpoints.find(bp => {
            const minMatch = !bp.minWidth || windowWidth >= bp.minWidth;
            const maxMatch = !bp.maxWidth || windowWidth <= bp.maxWidth;
            return minMatch && maxMatch;
        }) || null;
    };

    // Función para calcular dimensiones manteniendo proporción
    const calculateDimensions = (imgWidth: number, imgHeight: number, maxWidth: number, maxHeight?: number) => {
        const imgAspectRatio = imgWidth / imgHeight;

        if (maxHeight) {
            const widthBasedHeight = maxWidth / imgAspectRatio;
            const heightBasedWidth = maxHeight * imgAspectRatio;

            if (widthBasedHeight <= maxHeight) {
                return { width: maxWidth, height: widthBasedHeight };
            } else {
                return { width: heightBasedWidth, height: maxHeight };
            }
        } else {
            return { width: maxWidth, height: maxWidth / imgAspectRatio };
        }
    };

    // Función para actualizar dimensiones según breakpoint
    const updateDimensionsForBreakpoint = () => {
        const breakpoint = getCurrentBreakpoint();

        if (breakpoint) {
            const newWidth = breakpoint.width || width;
            const newHeight = breakpoint.height || (newWidth * (breakpoint.aspectRatio ? 1 / breakpoint.aspectRatio : (aspectRatio ? 1 / aspectRatio : 2 / 3)));
            setDimensions({ width: newWidth, height: newHeight });
        } else if (!isLoaded) {
            const initialHeight = height || width * (aspectRatio ? 1 / aspectRatio : 2 / 3);
            setDimensions({ width, height: initialHeight });
        }
    };

    // Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Cargar imagen cuando está en vista
    useEffect(() => {
        if (isInView && src) {
            const img = new Image();
            img.onload = () => {
                const currentBp = getCurrentBreakpoint();
                const targetWidth = currentBp?.width || width;
                const targetHeight = currentBp?.height || height;

                const newDimensions = calculateDimensions(img.naturalWidth, img.naturalHeight, targetWidth, targetHeight);
                setDimensions(newDimensions);
                setImgSrc(src);
                setIsLoaded(true);
            };
            img.onerror = () => {
                console.error('Error loading image:', src);
            };
            img.src = src;
        }
    }, [isInView, src, width, height]);

    // Listener para cambios de tamaño de ventana
    useEffect(() => {
        if (breakpoints.length > 0) {
            const handleResize = () => {
                updateDimensionsForBreakpoint();
            };

            window.addEventListener('resize', handleResize);
            updateDimensionsForBreakpoint(); // Llamar inmediatamente

            return () => window.removeEventListener('resize', handleResize);
        }
    }, [breakpoints, width, height, aspectRatio]);

    // Actualizar dimensiones iniciales
    useEffect(() => {
        if (!isLoaded && breakpoints.length === 0) {
            const initialHeight = height || width * (aspectRatio ? 1 / aspectRatio : 2 / 3);
            setDimensions({ width, height: initialHeight });
        }
    }, [width, height, aspectRatio, isLoaded]);

    const Skeleton: React.FC = () => (
        <div
            className="lazy-image__skeleton"
            style={{
                width: responsive ? '100%' : dimensions.width,
                height: responsive ? '100%' : dimensions.height
            }}
        >
            <div className="lazy-image__skeleton-content">
                <svg
                    className="lazy-image__skeleton-icon"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>
        </div>
    );

    // Estilos del contenedor
    const containerStyle: React.CSSProperties = responsive ? {
        width: maxWidth,
        maxWidth: '100%',
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
        height: aspectRatio ? 'auto' : dimensions.height,
    } : {
        width: dimensions.width,
        height: dimensions.height,
    };

    return (
        <>
            <style>{`
        .lazy-image {
          position: relative;
          overflow: hidden;
          display: inline-block;
        }

        .lazy-image--responsive {
          display: block;
          width: 100%;
        }

        .lazy-image__skeleton {
          background-color: #d1d5db;
          border-radius: 8px;
          animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          transition: opacity 3s ease-in-out;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .lazy-image__skeleton-content {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .lazy-image__skeleton-icon {
          width: 32px;
          height: 32px;
          color: #9ca3af;
        }

        .lazy-image__img {
          width: 100%;
          height: 100%;
          object-fit: ${objectFit};
          transition: opacity 3s ease-in-out, filter 3s ease-in-out, transform 3s ease-in-out;
          display: block;
        }

        .lazy-image__img--loaded {
          opacity: 1;
          filter: none;
          transform: scale(1);
        }

        .lazy-image__img--blur {
          opacity: 1;
          filter: blur(4px);
          transform: scale(1.1);
        }

        .lazy-image__img--hidden {
          opacity: 0;
        }

        .lazy-image__skeleton--fade-out {
          opacity: 0;
        }

        .lazy-image__overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.1);
          transition: opacity 3s ease-in-out;
        }

        .lazy-image__overlay--fade-out {
          opacity: 0;
        }

        @keyframes skeleton-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Responsive breakpoints */
        @media (max-width: 768px) {
          .lazy-image__skeleton-icon {
            width: 24px;
            height: 24px;
          }
        }

        @media (max-width: 480px) {
          .lazy-image__skeleton-icon {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>

            <div
                ref={imgRef}
                className={`lazy-image ${responsive ? 'lazy-image--responsive' : ''} ${className}`}
                style={containerStyle}
            >
                {/* Skeleton */}
                {!isInView && !blurDataURL && <Skeleton />}
                {isInView && !blurDataURL && !isLoaded && <Skeleton />}

                {/* Imagen */}
                {(imgSrc || blurDataURL) && (
                    <img
                        src={imgSrc}
                        alt={alt}
                        className={`lazy-image__img ${isLoaded
                            ? 'lazy-image__img--loaded'
                            : blurDataURL
                                ? 'lazy-image__img--blur'
                                : 'lazy-image__img--hidden'
                            }`}
                        {...props}
                    />
                )}

                {/* Overlay para transición de blur */}
                {blurDataURL && !isLoaded && (
                    <div className={`lazy-image__overlay ${isLoaded ? 'lazy-image__overlay--fade-out' : ''}`} />
                )}
            </div>
        </>
    );
};

export default LazyImage;