import React from 'react';
import {
  Sparkles,
  ShoppingBag,
  Shirt,
  UtensilsCrossed,
  Coffee,
  GraduationCap,
  BookOpen,
  Smartphone,
  Bus,
  Train,
  Car,
  Gift,
  PartyPopper,
  PiggyBank,
  Wallet,
  Receipt,
  TrendingUp,
  Coins,
  MoreHorizontal,
  FolderPlus,
  LucideIcon,
} from 'lucide-react';

export interface CategoryIconMatch {
  icon: LucideIcon;
  defaultColor: string;
}

export const getCategoryIconInfo = (
  categoryName?: string,
  iconName?: string
): CategoryIconMatch => {
  const norm = (categoryName || '').toLowerCase().trim();

  // 1. Beauty & Self-Care
  if (
    norm.includes('beauty') ||
    norm.includes('self-care') ||
    norm.includes('skincare') ||
    norm.includes('personal care') ||
    iconName === 'Sparkles'
  ) {
    return { icon: Sparkles, defaultColor: '#EC4899' };
  }

  // 2. Fashion & Style
  if (
    norm.includes('fashion') ||
    norm.includes('style') ||
    norm.includes('cloth') ||
    norm.includes('shopping') ||
    iconName === 'ShoppingBag' ||
    iconName === 'Shirt'
  ) {
    return { icon: Shirt, defaultColor: '#8B5CF6' };
  }

  // 3. Food, Snacks & Cafes
  if (
    norm.includes('food') ||
    norm.includes('snack') ||
    norm.includes('cafe') ||
    norm.includes('dining') ||
    norm.includes('restaurant') ||
    norm.includes('hanout') ||
    iconName === 'UtensilsCrossed' ||
    iconName === 'Coffee'
  ) {
    return { icon: UtensilsCrossed, defaultColor: '#F59E0B' };
  }

  // 4. Studies & Stationery
  if (
    norm.includes('stud') ||
    norm.includes('school') ||
    norm.includes('stationery') ||
    norm.includes('education') ||
    norm.includes('growth') ||
    iconName === 'GraduationCap'
  ) {
    return { icon: GraduationCap, defaultColor: '#10B981' };
  }

  // 5. Phone & Digital
  if (
    norm.includes('phone') ||
    norm.includes('digital') ||
    norm.includes('internet') ||
    norm.includes('telecom') ||
    iconName === 'Smartphone'
  ) {
    return { icon: Smartphone, defaultColor: '#3B82F6' };
  }

  // 6. Daily Transit & Mobility
  if (
    norm.includes('transit') ||
    norm.includes('mobility') ||
    norm.includes('transport') ||
    norm.includes('taxi') ||
    norm.includes('tram') ||
    iconName === 'Train' ||
    iconName === 'Bus'
  ) {
    return { icon: Bus, defaultColor: '#06B6D4' };
  }

  // 7. Social, Hobbies & Gifts
  if (
    norm.includes('gift') ||
    norm.includes('social') ||
    norm.includes('hobb') ||
    norm.includes('friend') ||
    iconName === 'Gift'
  ) {
    return { icon: Gift, defaultColor: '#F43F5E' };
  }

  // 8. Secret Savings & Emergency
  if (
    norm.includes('saving') ||
    norm.includes('emergency') ||
    norm.includes('stash') ||
    norm.includes('tirroir') ||
    norm.includes('chaye9') ||
    iconName === 'Wallet' ||
    iconName === 'PiggyBank'
  ) {
    return { icon: PiggyBank, defaultColor: '#A855F7' };
  }

  // 9. Income & Pocket Money
  if (
    norm.includes('income') ||
    norm.includes('masrouf') ||
    norm.includes('allowance') ||
    norm.includes('pocket') ||
    iconName === 'TrendingUp'
  ) {
    return { icon: TrendingUp, defaultColor: '#10B981' };
  }

  // 10. Fallback / Custom
  if (iconName === 'FolderPlus') {
    return { icon: FolderPlus, defaultColor: '#EC4899' };
  }

  return { icon: Receipt, defaultColor: '#64748B' };
};

export const CategoryIcon: React.FC<{
  category?: string;
  iconName?: string;
  className?: string;
  color?: string;
}> = ({ category, iconName, className = 'w-5 h-5', color }) => {
  const info = getCategoryIconInfo(category, iconName);
  const IconComponent = info.icon;
  return <IconComponent className={className} style={color ? { color } : undefined} />;
};
