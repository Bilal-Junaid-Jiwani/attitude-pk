export interface Variant {
    _id: string;
    fragrance?: { _id: string; name: string };
    format?: { _id: string; name: string };
    price: number;
    stock: number;
    sku: string;
    imageUrl: string;
    images: string[];
}

export interface Product {
    _id: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    description: string;
    imageUrl: string;
    images: string[];
    category?: { name: string };
    fragrance?: { _id: string; name: string };
    format?: { _id: string; name: string };
    benefits?: string[];
    ingredients?: string;
    howToUse?: string;
    stock: number;
    subCategory?: string;
    variants?: Variant[];
}
