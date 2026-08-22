export type ComplaintCategory =
  | "street_light"
  | "road_damage"
  | "water_supply"
  | "sewage"
  | "garbage";

export type ComplaintStatus = "pending" | "in_progress" | "resolved";

export type AdminRole = "staff" | "supervisor";

export type Session = {
  phone: string;
  current_step: string;
  category: string | null;
  area: string | null;
  description: string | null;
  photo_url: string | null;
  updated_at: string;
}

export type Complaint = {
  id: string;
  ref_number: string;
  phone: string;
  category: ComplaintCategory;
  area: string;
  description: string | null;
  photo_url: string | null;
  status: ComplaintStatus;
  created_at: string;
  updated_at: string;
}

export type StatusHistory = {
  id: string;
  complaint_id: string;
  old_status: ComplaintStatus | null;
  new_status: ComplaintStatus;
  changed_at: string;
}

export type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
}

export type Setting = {
  key: string;
  value: string;
};

export const COMPLAINT_CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: "street_light", label: "Street Light" },
  { value: "road_damage", label: "Road Damage" },
  { value: "water_supply", label: "Water Supply" },
  { value: "sewage", label: "Sewage" },
  { value: "garbage", label: "Garbage" },
];

export const COMPLAINT_STATUSES: { value: ComplaintStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: Session;
        Insert: Partial<Session> & { phone: string };
        Update: Partial<Session>;
        Relationships: [];
      };
      complaints: {
        Row: Complaint;
        Insert: Partial<Complaint> & {
          ref_number: string;
          phone: string;
          category: ComplaintCategory;
          area: string;
        };
        Update: Partial<Complaint>;
        Relationships: [];
      };
      status_history: {
        Row: StatusHistory;
        Insert: Partial<StatusHistory> & {
          complaint_id: string;
          new_status: ComplaintStatus;
        };
        Update: Partial<StatusHistory>;
        Relationships: [];
      };
      admin_users: {
        Row: AdminUser;
        Insert: Partial<AdminUser> & { email: string };
        Update: Partial<AdminUser>;
        Relationships: [];
      };
      settings: {
        Row: Setting;
        Insert: Setting;
        Update: Partial<Setting>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
