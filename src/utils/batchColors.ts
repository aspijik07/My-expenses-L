export interface BatchColorDefinition {
  id: string;
  name: string;
  hex: string;
  bgLight: string;
  borderLight: string;
}

export const RECEIPT_BATCH_PALETTE: BatchColorDefinition[] = [
  {
    id: 'lavender',
    name: 'Lavender Violet',
    hex: '#A78BFA',
    bgLight: 'rgba(167, 139, 250, 0.15)',
    borderLight: 'rgba(167, 139, 250, 0.4)',
  },
  {
    id: 'emerald',
    name: 'Mint Emerald',
    hex: '#34D399',
    bgLight: 'rgba(52, 211, 153, 0.15)',
    borderLight: 'rgba(52, 211, 153, 0.4)',
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    hex: '#FBBF24',
    bgLight: 'rgba(251, 191, 36, 0.15)',
    borderLight: 'rgba(251, 191, 36, 0.4)',
  },
  {
    id: 'sky',
    name: 'Sky Blue',
    hex: '#38BDF8',
    bgLight: 'rgba(56, 189, 248, 0.15)',
    borderLight: 'rgba(56, 189, 248, 0.4)',
  },
  {
    id: 'coral',
    name: 'Coral Rose',
    hex: '#FB7185',
    bgLight: 'rgba(251, 113, 133, 0.15)',
    borderLight: 'rgba(251, 113, 133, 0.4)',
  },
  {
    id: 'magenta',
    name: 'Blossom Magenta',
    hex: '#E879F9',
    bgLight: 'rgba(232, 121, 249, 0.15)',
    borderLight: 'rgba(232, 121, 249, 0.4)',
  },
  {
    id: 'orange',
    name: 'Sunset Orange',
    hex: '#FB923C',
    bgLight: 'rgba(251, 146, 60, 0.15)',
    borderLight: 'rgba(251, 146, 60, 0.4)',
  },
  {
    id: 'teal',
    name: 'Teal Turquoise',
    hex: '#2DD4BF',
    bgLight: 'rgba(45, 212, 191, 0.15)',
    borderLight: 'rgba(45, 212, 191, 0.4)',
  },
  {
    id: 'indigo',
    name: 'Electric Indigo',
    hex: '#818CF8',
    bgLight: 'rgba(129, 140, 248, 0.15)',
    borderLight: 'rgba(129, 140, 248, 0.4)',
  },
];

/**
 * Returns the next unique batch color based on the number of distinct receipt batches.
 */
export function getNextReceiptBatchColor(existingBatchCount: number): BatchColorDefinition {
  const index = Math.abs(existingBatchCount) % RECEIPT_BATCH_PALETTE.length;
  return RECEIPT_BATCH_PALETTE[index];
}
