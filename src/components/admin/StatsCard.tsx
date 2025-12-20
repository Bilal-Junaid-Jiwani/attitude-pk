import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    description?: string; // e.g. "Total Revenue (This Month)"
    iconBg?: string; // e.g. "bg-green-100"
    iconColor?: string; // e.g. "text-green-600"
}

const StatsCard = ({
    title,
    value,
    icon: Icon,
    trend,
    iconBg = "bg-green-50",
    iconColor = "text-[#6B9E78]"
}: StatsCardProps) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-md">
            {/* Icon Box */}
            <div className={`p-4 rounded-xl ${iconBg} ${iconColor}`}>
                <Icon size={32} strokeWidth={1.5} />
            </div>

            {/* Text Content */}
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
                {trend && <p className="text-xs text-green-500 font-medium mt-1">{trend}</p>}
            </div>
        </div>
    );
};

export default StatsCard;
