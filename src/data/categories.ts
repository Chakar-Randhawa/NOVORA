import { CategoryDefinition } from '../types';

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'handmade-crafts',
    name: 'Handmade & Artisan Crafts',
    slug: 'handmade-crafts',
    description: 'Unique handcrafted ceramics, woodwork, textiles, leathercraft, and original creations.',
    listingTypes: ['handmade', 'customized', 'physical_new'],
    icon: 'Hammer',
    customFields: [
      { key: 'materials', label: 'Primary Materials', type: 'text', placeholder: 'e.g. Stoneware clay, walnut wood, raw linen', required: true },
      { key: 'dimensions', label: 'Dimensions (L × W × H)', type: 'text', placeholder: 'e.g. 24cm × 15cm × 10cm' },
      { key: 'weight', label: 'Item Weight', type: 'text', placeholder: 'e.g. 650g' },
      { key: 'craftTime', label: 'Creation / Crafting Time', type: 'text', placeholder: 'e.g. 5 business days if made to order' },
      { key: 'careInstructions', label: 'Care Instructions', type: 'textarea', placeholder: 'e.g. Hand wash only, condition leather yearly' }
    ]
  },
  {
    id: 'vintage-collectibles',
    name: 'Vintage & Collectibles',
    slug: 'vintage-collectibles',
    description: 'Authentic historical items, antique timepieces, rare ephemera, and heritage decor.',
    listingTypes: ['vintage', 'physical_used'],
    icon: 'Clock',
    customFields: [
      { key: 'eraDecade', label: 'Era / Decade', type: 'select', options: ['Pre-1920s', '1920s-1940s', '1950s', '1960s', '1970s', '1980s', '1990s', 'Early 2000s'], required: true },
      { key: 'originCountry', label: 'Country of Origin / Manufacture', type: 'text', placeholder: 'e.g. Switzerland, Japan, Italy' },
      { key: 'provenance', label: 'History & Provenance', type: 'textarea', placeholder: 'Notable history, original markings, serial numbers' },
      { key: 'originalPackaging', label: 'Original Box / Papers Included', type: 'select', options: ['Yes - Complete Box & Papers', 'Box Only', 'Papers Only', 'Item Only'] }
    ]
  },
  {
    id: 'physical-goods',
    name: 'New & Second-Hand Goods',
    slug: 'physical-goods',
    description: 'Apparel, personal tech, musical gear, sporting equipment, and home goods.',
    listingTypes: ['physical_new', 'physical_used'],
    icon: 'Package',
    customFields: [
      { key: 'brand', label: 'Brand / Manufacturer', type: 'text', placeholder: 'e.g. Sony, Patagonia, Apple' },
      { key: 'modelNumber', label: 'Model / Serial Code', type: 'text', placeholder: 'e.g. WH-1000XM5' },
      { key: 'includedAccessories', label: 'Included Accessories', type: 'text', placeholder: 'e.g. Charging cable, carrying case' },
      { key: 'functionalStatus', label: 'Operational Status', type: 'select', options: ['100% Fully Functional', 'Tested Working with minor cosmetic wear', 'Requires Service / As-Is'], required: true }
    ]
  },
  {
    id: 'digital-downloads',
    name: 'Digital Downloads & Assets',
    slug: 'digital-downloads',
    description: 'Software templates, 3D models, presets, sound packs, and digital publications.',
    listingTypes: ['digital_download', 'templates_assets', 'ebook_educational'],
    icon: 'Download',
    customFields: [
      { key: 'fileFormats', label: 'Delivered File Formats', type: 'text', placeholder: 'e.g. PDF, Figma (.fig), Blender (.blend), WAV 24-bit', required: true },
      { key: 'fileSize', label: 'Total File Size', type: 'text', placeholder: 'e.g. 145 MB' },
      { key: 'licenseType', label: 'Usage License', type: 'select', options: ['Personal Use Only', 'Commercial Single Project', 'Commercial Unlimited / Extended', 'Open Source Permissive'], required: true },
      { key: 'deliveryMethod', label: 'Fulfillment Method', type: 'select', options: ['Instant Direct Link on Inquiring', 'Shared Private Repository / Cloud Folder', 'Sent via Secure Message'] }
    ]
  },
  {
    id: 'professional-services',
    name: 'Professional & Creative Services',
    slug: 'professional-services',
    description: 'Independent consulting, translation, architectural drafting, copywriting, and design.',
    listingTypes: ['professional_service', 'creative_service'],
    icon: 'Briefcase',
    customFields: [
      { key: 'deliverables', label: 'Core Deliverables', type: 'textarea', placeholder: 'Specify exactly what the client receives upon completion', required: true },
      { key: 'turnaroundTime', label: 'Estimated Turnaround', type: 'text', placeholder: 'e.g. 3-5 business days', required: true },
      { key: 'revisionsIncluded', label: 'Number of Revisions', type: 'number', placeholder: 'e.g. 2' },
      { key: 'serviceDeliveryFormat', label: 'Delivery Format', type: 'select', options: ['Remote / Digital Transfer', 'Video Conference / Consultation', 'In-Person (Specify City)'] }
    ]
  },
  {
    id: 'wholesale-manufacturing',
    name: 'Wholesale & Custom Manufacturing',
    slug: 'wholesale-manufacturing',
    description: 'Bulk supply, custom fabrication, private label sourcing, and contract production.',
    listingTypes: ['wholesale_b2b', 'supplier_manufacturing', 'custom_manufacturing'],
    icon: 'Factory',
    customFields: [
      { key: 'moq', label: 'Minimum Order Quantity (MOQ)', type: 'number', placeholder: 'e.g. 50 units', required: true },
      { key: 'leadTime', label: 'Production Lead Time', type: 'text', placeholder: 'e.g. 2-3 weeks from proof approval', required: true },
      { key: 'sampleAvailable', label: 'Sample Availability', type: 'select', options: ['Paid Sample Available', 'Free Sample upon qualification', 'Digital Proof Only', 'No Samples'] },
      { key: 'customPackaging', label: 'Custom Branding / Packaging', type: 'select', options: ['Full Custom OEM / ODM', 'Custom Label Only', 'Standard Packaging Only'] }
    ]
  },
  {
    id: 'rentals-gear',
    name: 'Equipment & Space Rentals',
    slug: 'rentals-gear',
    description: 'Cinema cameras, audio equipment, studio space, drone kits, and precision tools.',
    listingTypes: ['equipment_rental'],
    icon: 'Video',
    customFields: [
      { key: 'rentalPeriodUnit', label: 'Rental Unit Rate', type: 'select', options: ['Per Day', 'Per Weekend (Fri-Mon)', 'Per Week', 'Per Month'], required: true },
      { key: 'securityDeposit', label: 'Deposit Requirement', type: 'text', placeholder: 'e.g. $200 refundable deposit or ID hold' },
      { key: 'insuranceRequirement', label: 'Insurance / ID Hold', type: 'select', options: ['Photo ID + Deposit required', 'Certificate of Insurance Required', 'Standard Agreement only'] },
      { key: 'pickupLocation', label: 'Pickup / Return Location', type: 'text', placeholder: 'City, neighborhood or delivery terms' }
    ]
  },
  {
    id: 'local-classifieds',
    name: 'Local Classifieds & Community',
    slug: 'local-classifieds',
    description: 'In-person neighborhood trade, local community exchanges, and direct handoffs.',
    listingTypes: ['local_classified', 'business_collaboration', 'other'],
    icon: 'MapPin',
    customFields: [
      { key: 'neighborhood', label: 'Neighborhood / Sub-region', type: 'text', placeholder: 'e.g. Kreuzberg, Berlin or Shinjuku, Tokyo', required: true },
      { key: 'handoffType', label: 'Handoff Preference', type: 'select', options: ['Public Meetup in Neutral Location', 'Porch / Doorstep Pickup', 'Seller Can Drop Off Locally'] },
      { key: 'inspectionWelcome', label: 'Pre-Trade Inspection', type: 'select', options: ['Buyer may inspect before completing handoff', 'Visual confirmation only'] }
    ]
  }
];

export const LISTING_TYPE_LABELS: Record<string, string> = {
  physical_new: 'Brand New Physical Item',
  physical_used: 'Pre-Owned Physical Item',
  handmade: 'Handcrafted / Artisan',
  vintage: 'Vintage / Collectible',
  customized: 'Made to Order / Customized',
  digital_download: 'Digital Download',
  ebook_educational: 'Educational & Ebook',
  templates_assets: 'Design Template / Asset',
  professional_service: 'Professional Service',
  creative_service: 'Creative Service',
  local_classified: 'Local Classified',
  wholesale_b2b: 'Wholesale / Bulk Offer',
  supplier_manufacturing: 'Manufacturer / Supplier',
  equipment_rental: 'Equipment Rental',
  custom_manufacturing: 'Custom Fabrication',
  business_collaboration: 'Collaboration Opportunity',
  other: 'General Listing'
};

export const CONDITION_LABELS: Record<string, string> = {
  new: 'Brand New / Pristine',
  like_new: 'Like New (Open Box)',
  excellent: 'Excellent Condition',
  good: 'Good (Minor Signs of Use)',
  fair: 'Fair (Functional with Wear)',
  not_applicable: 'Not Applicable (Service / Digital)'
};
