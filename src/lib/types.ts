export interface Package {
  id: string;
  recipient_name: string;
  recipient_room: string | null;
  sender_name: string;
  sender_relation: string | null;
  contents: string;
  received_at: string;
  received_by: string | null;
  notes: string | null;
  picked_up_by: string | null;
  pickup_method: 'pemilik' | 'orang_lain' | null;
  picker_name: string | null;
  picker_relation: string | null;
  picked_up_at: string | null;
  status: 'masuk' | 'diambil' | 'done';
  image_data?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
}
