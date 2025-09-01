import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface ResponsiveBreakpoint {
    minWidth?: number;
    maxWidth?: number;
    width?: number;
    height?: number;
    aspectRatio?: number;
}

interface LazyBackgroundImageProps {
    src: string;
    blurDataURL?: string | null;
    className?: string;
    width?: number;
    height?: number;
    aspectRatio?: number;
    children?: ReactNode;
    backgroundSize?: 'cover' | 'contain' | 'auto';
    backgroundPosition?: string;
    backgroundRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
    style?: React.CSSProperties;
    // Nuevas props para responsividad
    responsive?: boolean;
    maxWidth?: string | number;
    breakpoints?: ResponsiveBreakpoint[];
}

const LazyBackgroundImage: React.FC<LazyBackgroundImageProps> = ({
    src,
    blurDataURL = null,
    className = '',
    width = 300,
    height,
    aspectRatio,
    children,
    backgroundSize = 'cover',
    backgroundPosition = 'center',
    backgroundRepeat = 'no-repeat',
    style = {},
    responsive = true,
    maxWidth = '100%',
    breakpoints = [],
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [isInView, setIsInView] = useState<boolean>(false);
    const [bgImage, setBgImage] = useState<string | null>(blurDataURL || null);
    const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
        width,
        height: height || width * (aspectRatio ? 1 / aspectRatio : 2 / 3)
    });

    const containerRef = useRef<HTMLDivElement>(null);

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

        if (containerRef.current) {
            observer.observe(containerRef.current);
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
                setBgImage(src);
                setIsLoaded(true);
            };
            img.onerror = () => {
                console.error('Error loading background image:', src);
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
        <div className={`lazy-bg__skeleton ${isLoaded ? 'lazy-bg__skeleton--fade-out' : ''}`}>
            <div className="lazy-bg__skeleton-content">
                <svg
                    className="lazy-bg__skeleton-icon"
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
        ...style
    } : {
        width: dimensions.width,
        height: dimensions.height,
        ...style
    };

    return (
        <>
            <style>{`
        .lazy-bg {
          position: relative;
          overflow: hidden;
          display: inline-block;
        }

        .lazy-bg--responsive {
          display: block;
          width: 100%;
        }

        .lazy-bg__background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-size: ${backgroundSize};
          background-position: ${backgroundPosition};
          background-repeat: ${backgroundRepeat};
          transition: filter 3s ease-in-out, transform 3s ease-in-out, opacity 3s ease-in-out;
          z-index: 0;
        }

        .lazy-bg__background--loaded {
          filter: none;
          transform: scale(1);
          opacity: 1;
        }

        .lazy-bg__background--blur {
          filter: blur(40px);
          transform: scale(1.05);
          opacity: 1;
        }

        .lazy-bg__background--hidden {
          opacity: 0;
        }

        .lazy-bg__skeleton {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #d1d5db;
          border-radius: 8px;
          animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          transition: opacity 3s ease-in-out;
          z-index: 1;
        }

        .lazy-bg__skeleton--fade-out {
          opacity: 0;
        }

        .lazy-bg__skeleton-content {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .lazy-bg__skeleton-icon {
          width: 32px;
          height: 32px;
          color: #9ca3af;
        }

        .lazy-bg__content {
          position: relative;
          z-index: 3;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lazy-bg__overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.05);
          transition: opacity 3s ease-in-out;
          z-index: 2;
        }

        .lazy-bg__overlay--fade-out {
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

        /* Responsive */
        @media (max-width: 768px) {
          .lazy-bg__skeleton-icon {
            width: 24px;
            height: 24px;
          }
        }

        @media (max-width: 480px) {
          .lazy-bg__skeleton-icon {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>

            <div
                ref={containerRef}
                className={`lazy-bg ${responsive ? 'lazy-bg--responsive' : ''} ${className}`}
                style={containerStyle}
                {...props}
            >
                {/* Capa de fondo */}
                <div
                    className={`lazy-bg__background ${
                        bgImage 
                            ? (isLoaded 
                                ? 'lazy-bg__background--loaded' 
                                : (blurDataURL 
                                    ? 'lazy-bg__background--blur' 
                                    : 'lazy-bg__background--hidden'
                                )
                            ) 
                            : 'lazy-bg__background--hidden'
                    }`}
                    style={{
                        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
                    }}
                />

                {/* Skeleton */}
                {!isInView && !blurDataURL && <Skeleton />}
                {isInView && !blurDataURL && !isLoaded && <Skeleton />}

                {/* Overlay para transición de blur */}
                {blurDataURL && bgImage && !isLoaded && (
                    <div className={`lazy-bg__overlay ${isLoaded ? 'lazy-bg__overlay--fade-out' : ''}`} />
                )}

                {/* Contenido */}
                {children && (
                    <div className="lazy-bg__content">
                        {children}
                    </div>
                )}
            </div>
        </>
    );
};

export default LazyBackgroundImage;