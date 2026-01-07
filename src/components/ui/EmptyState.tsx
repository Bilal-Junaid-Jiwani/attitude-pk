import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel: string;
    actionLink: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionLabel, actionLink }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[400px]">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Icon size={40} className="text-gray-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-heading tracking-tight">{title}</h3>
            <p className="text-gray-500 max-w-xs mb-8 text-sm leading-relaxed">{description}</p>
            <Link
                href={actionLink}
                className="inline-flex items-center justify-center px-8 py-3 text-sm font-bold text-white transition-all bg-[#1c524f] border border-transparent rounded-full hover:bg-[#153e3c] hover:shadow-lg hover:-translate-y-0.5"
            >
                {actionLabel}
            </Link>
        </div>
    );
};

export default EmptyState;
