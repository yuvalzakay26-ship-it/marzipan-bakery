import React from 'react';
import { Crown, Heart, Star, Leaf, Calendar, Gift, Users } from 'lucide-react';

// Maps a tag key from productsData to its display label + style.
// Only ship tags here that are honestly defensible — never invent stock or scarcity.
const TAG_DEFS = {
    bestseller: {
        label: 'הכי נמכר',
        icon: Crown,
        bg: 'bg-[#B91C1C]',
        text: 'text-white'
    },
    iconic: {
        label: 'הקלאסיקה של מרציפן',
        icon: Star,
        bg: 'bg-[#380909]',
        text: 'text-[#D4AF37]'
    },
    'family-favorite': {
        label: 'אהוב על המשפחה',
        icon: Heart,
        bg: 'bg-white/95',
        text: 'text-[#B91C1C]'
    },
    'crowd-favorite': {
        label: 'בחירת הקהל',
        icon: Users,
        bg: 'bg-white/95',
        text: 'text-[#380909]'
    },
    'shabbat-staple': {
        label: 'קלאסיקה לשבת',
        icon: Calendar,
        bg: 'bg-[#FFF8E1]',
        text: 'text-[#380909]'
    },
    'gift-ready': {
        label: 'ארוז למתנה',
        icon: Gift,
        bg: 'bg-[#D4AF37]',
        text: 'text-[#1A0F0A]'
    },
    'no-sugar': {
        label: 'ללא סוכר',
        icon: Leaf,
        bg: 'bg-[#15803D]',
        text: 'text-white'
    }
};

const ProductBadges = ({ tags = [], size = 'sm', className = '' }) => {
    if (!tags || tags.length === 0) return null;

    const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
    const iconSize = size === 'sm' ? 11 : 13;

    return (
        <div className={`flex flex-wrap gap-1.5 ${className}`}>
            {tags.map((tag) => {
                const def = TAG_DEFS[tag];
                if (!def) return null;
                const Icon = def.icon;
                return (
                    <span
                        key={tag}
                        className={`inline-flex items-center gap-1 rounded-full font-bold shadow-sm border border-white/20 ${def.bg} ${def.text} ${padding}`}
                    >
                        <Icon size={iconSize} aria-hidden="true" />
                        {def.label}
                    </span>
                );
            })}
        </div>
    );
};

export default ProductBadges;
