import React, { ReactNode } from 'react';
import LazyImage from './LazyImage';
import LazyBackgroundImage from './LazyBackgroundImage';

interface ResponsiveBreakpoint {
    minWidth?: number;
    maxWidth?: number;
    width?: number;
    height?: number;
    aspectRatio?: number;
}

// Unión de las props de ambos componentes con funcionalidad responsiva
interface SmartLazyImageProps {
    src: string;
    alt?: string;
    blurDataURL?: string | null;
    className?: string;
    width?: number;
    height?: number;
    aspectRatio?: number;
    children?: ReactNode;
    // Props específicas de LazyBackgroundImage
    backgroundSize?: 'cover' | 'contain' | 'auto';
    backgroundPosition?: string;
    backgroundRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
    style?: React.CSSProperties;
    // Props responsivas
    responsive?: boolean;
    maxWidth?: string | number;
    breakpoints?: ResponsiveBreakpoint[];
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    // Props adicionales de img para LazyImage
    [key: string]: any;
}

const SmartLazyImage: React.FC<SmartLazyImageProps> = ({
    children,
    backgroundSize,
    backgroundPosition,
    backgroundRepeat,
    style,
    responsive = true,
    maxWidth = '100%',
    breakpoints = [],
    objectFit = 'cover',
    ...props
}) => {
    // Si tiene children, usar LazyBackgroundImage
    if (children) {
        return (
            <LazyBackgroundImage
                {...props}
                backgroundSize={backgroundSize}
                backgroundPosition={backgroundPosition}
                backgroundRepeat={backgroundRepeat}
                style={style}
                responsive={responsive}
                maxWidth={maxWidth}
                breakpoints={breakpoints}
            >
                {children}
            </LazyBackgroundImage>
        );
    }

    // Si no tiene children, usar LazyImage
    // Filtrar props que no son compatibles con LazyImage
    const {
        backgroundSize: _bs,
        backgroundPosition: _bp,
        backgroundRepeat: _br,
        style: _style,
        ...lazyImageProps
    } = props;

    return (
        <LazyImage 
            {...lazyImageProps} 
            responsive={responsive}
            maxWidth={maxWidth}
            breakpoints={breakpoints}
            objectFit={objectFit}
        />
    );
};

// Exportar el componente inteligente como default
export default SmartLazyImage;

// También exportar los componentes individuales por si se necesitan específicamente
export { default as LazyImage } from './LazyImage';
export { default as LazyBackgroundImage } from './LazyBackgroundImage';

// Exportar tipos
export type { SmartLazyImageProps, ResponsiveBreakpoint };