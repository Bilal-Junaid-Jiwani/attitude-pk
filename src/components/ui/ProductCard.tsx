import Link from 'next/link';
import { ShoppingBag, Star } from 'lucide-react';
import Image from 'next/image';

interface ProductCardProps {
    id: string;
    name: string;
    category: string;
    price: number;
    imageUrl: string;
}

const ProductCard = ({ id, name, category, price, imageUrl }: ProductCardProps) => {
    return (
        <div className="group relative flex flex-col items-center">
            {/* Image Container - Strict Arch Shape defined by mockup */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-white rounded-t-[50%] rounded-b-2xl shadow-sm hover:shadow-xl transition-all duration-500 ease-out border-4 border-white">
                <Image
                    src={imageUrl}
                    alt={name}
                    width={500}
                    height={600}
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                />

                {/* Badges - Floating Pill */}
                <div className="absolute top-4 left-4">
                    <span className="bg-[#FAF9F6]/90 backdrop-blur-md px-4 py-1.5 text-xs font-bold tracking-wider uppercase rounded-full text-gray-700 shadow-sm">
                        {category}
                    </span>
                </div>

                {/* Quick Add - Floating Circle Button */}
                <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                    <button className="bg-primary hover:bg-[#4A704E] text-white p-3 rounded-full shadow-lg transition-colors flex items-center justify-center">
                        <ShoppingBag size={20} />
                    </button>
                </div>
            </div>

            {/* Product Details - Minimal & Centered */}
            <div className="pt-5 text-center px-2">
                <h3 className="text-lg font-heading font-semibold text-gray-800 group-hover:text-primary transition-colors tracking-tight line-clamp-1 mb-1">
                    <Link href={`/product/${id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {name}
                    </Link>
                </h3>

                <p className="text-sm text-gray-500 mb-2 font-medium">Rs. {price.toLocaleString()}</p>

                <div className="flex items-center justify-center gap-1 text-yellow-500 text-xs">
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <span className="ml-1 text-gray-400 font-medium">(24)</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
