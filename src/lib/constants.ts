export const NAV_LINKS = [
  {
    label: 'TRENDING',
    href: '/trending',
    isDropdown: false
  },
  {
    label: 'BABY',
    href: '/collections/baby',
    isDropdown: true,
    subCategories: [
      { label: 'Shampoo + Wash', href: '/collections/baby/shampoo-wash' },
      { label: 'Lotion', href: '/collections/baby/lotion' },
      { label: 'Cleaning Products', href: '/collections/baby/cleaning' },
    ]
  },
  {
    label: 'KIDS',
    href: '/collections/kids',
    isDropdown: true,
    subCategories: [
      { label: 'Shampoo + Wash', href: '/collections/kids/shampoo-wash' },
      { label: 'Conditioner', href: '/collections/kids/conditioner' },
    ]
  },
  {
    label: 'HOME',
    href: '/',
    isDropdown: false
  }
];