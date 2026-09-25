export type GalleryStatus = 'selection' | 'delivered';
export type WatermarkType = 'grid' | 'center' | 'text';

export interface PhotographerProfile {
  id: string;
  full_name: string;
  studio_name: string | null;
  email: string;
  phone: string | null;
  watermark_url: string | null;
  watermark_type: WatermarkType;
  watermark_text: string | null;
  watermark_opacity: number;
  pix_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface Gallery {
  id: string;
  photographer_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_key: string | null;
  cover_image_url?: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  access_pin: string | null;
  status: GalleryStatus;
  photo_limit: number;
  extra_photo_price: number;
  google_drive_url: string | null;
  selection_locked_at: string | null;
  event_date: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  // Joins / agregados
  sections?: GallerySection[];
  photos?: Photo[];
  selections?: SelectionRecord[];
  total_photos?: number;
  selected_photos_count?: number;
}

export interface GallerySection {
  id: string;
  gallery_id: string;
  name: string;
  order_index: number;
  created_at?: string;
  photos_count?: number;
}

export interface Photo {
  id: string;
  gallery_id: string;
  section_id: string | null;
  r2_key: string;
  original_filename: string;
  width: number;
  height: number;
  blurhash?: string | null;
  aspect_ratio?: number;
  order_index: number;
  created_at?: string;
  // Campos derivados para exibição
  preview_url?: string;
  thumbnail_url?: string;
  download_url?: string;
  is_selected?: boolean;
}

export interface SelectionRecord {
  id?: string;
  gallery_id: string;
  photo_id: string;
  is_selected: boolean;
  updated_at?: string;
}

export interface ClientSelectionSummary {
  total_photos: number;
  selected_count: number;
  photo_limit: number;
  extra_photos_count: number;
  extra_photo_price: number;
  total_extra_amount: number;
  is_locked: boolean;
}
