export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          slug: string;
          title: string;
          tagline: string | null;
          url: string | null;
          accent: string;
          image_path: string | null;
          image_source: 'local' | 'supabase';
          tech: string[];
          sort_order: number;
          published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          tagline?: string | null;
          url?: string | null;
          accent?: string;
          image_path?: string | null;
          image_source?: 'local' | 'supabase';
          tech?: string[];
          sort_order?: number;
          published?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          title: string;
          description: string;
          tags: string[];
          sort_order: number;
          published: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          description: string;
          tags?: string[];
          sort_order?: number;
          published?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['services']['Insert']>;
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          role: string | null;
          message: string;
          sort_order: number;
          published: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          role?: string | null;
          message: string;
          sort_order?: number;
          published?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['testimonials']['Insert']>;
        Relationships: [];
      };
      site_stats: {
        Row: {
          id: string;
          label: string;
          value: number;
          suffix: string;
          sort_order: number;
          published: boolean;
        };
        Insert: {
          id: string;
          label: string;
          value: number;
          suffix?: string;
          sort_order?: number;
          published?: boolean;
        };
        Update: Partial<Database['public']['Tables']['site_stats']['Insert']>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['site_settings']['Insert']>;
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          name: string;
          whatsapp: string;
          country_code: string;
          country: string | null;
          project_type: string | null;
          budget: string | null;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          whatsapp: string;
          country_code?: string;
          country?: string | null;
          project_type?: string | null;
          budget?: string | null;
          message?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['inquiries']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
