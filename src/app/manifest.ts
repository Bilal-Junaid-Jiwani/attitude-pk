import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Attitude PK | Premium Baby & Kids Care',
        short_name: 'Attitude PK',
        description: 'Natural, hypoallergenic, and refined care products for your little ones.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1c524f',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}
