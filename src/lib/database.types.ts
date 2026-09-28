/**
 * Database schema types.
 *
 * Generated shape of the `public` schema — mirrors `supabase/migrations/0001_init.sql`.
 * Regenerate with:
 *   npx supabase gen types typescript --project-id <ref> --schema public > src/lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: { email: string; created_at: string };
        Insert: { email: string; created_at?: string };
        Update: { email?: string; created_at?: string };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          subtitle: string | null;
          short_description: string | null;
          category: string | null;
          project_date: string | null;
          status: "draft" | "published" | "archived";
          featured: boolean;
          tools: string[];
          skills: string[];
          question: string | null;
          objective: string | null;
          context: string | null;
          dataset: string | null;
          data_sources: string | null;
          methodology: string | null;
          analysis_process: string | null;
          challenges: string | null;
          recommendations: string | null;
          conclusion: string | null;
          seo_title: string | null;
          seo_description: string | null;
          social_image: string | null;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          subtitle?: string | null;
          short_description?: string | null;
          category?: string | null;
          project_date?: string | null;
          status?: "draft" | "published" | "archived";
          featured?: boolean;
          tools?: string[];
          skills?: string[];
          question?: string | null;
          objective?: string | null;
          context?: string | null;
          dataset?: string | null;
          data_sources?: string | null;
          methodology?: string | null;
          analysis_process?: string | null;
          challenges?: string | null;
          recommendations?: string | null;
          conclusion?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          social_image?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: [];
      };
      project_findings: {
        Row: {
          id: string;
          project_id: string;
          headline: string;
          title: string;
          explanation: string | null;
          supporting_text: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          headline: string;
          title: string;
          explanation?: string | null;
          supporting_text?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["project_findings"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "project_findings_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          type:
            | "ebook"
            | "template"
            | "guide"
            | "resource"
            | "course"
            | "other";
          title: string;
          slug: string;
          subtitle: string | null;
          short_description: string | null;
          long_description: string | null;
          cover_asset_id: string | null;
          price_amount: number | null;
          currency: string;
          price_display: string | null;
          badge: string | null;
          product_url: string | null;
          checkout_url: string | null;
          button_text: string;
          secondary_button_text: string | null;
          secondary_url: string | null;
          author: string | null;
          page_count: number | null;
          format: string | null;
          audience: string | null;
          outcomes: Json;
          preview_note: string | null;
          featured: boolean;
          sort_order: number;
          enabled: boolean;
          published: boolean;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          type?:
            | "ebook"
            | "template"
            | "guide"
            | "resource"
            | "course"
            | "other";
          title: string;
          slug: string;
          subtitle?: string | null;
          short_description?: string | null;
          long_description?: string | null;
          cover_asset_id?: string | null;
          price_amount?: number | null;
          currency?: string;
          price_display?: string | null;
          badge?: string | null;
          product_url?: string | null;
          checkout_url?: string | null;
          button_text?: string;
          secondary_button_text?: string | null;
          secondary_url?: string | null;
          author?: string | null;
          page_count?: number | null;
          format?: string | null;
          audience?: string | null;
          outcomes?: Json;
          preview_note?: string | null;
          featured?: boolean;
          sort_order?: number;
          enabled?: boolean;
          published?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "products_cover_asset_id_fkey";
            columns: ["cover_asset_id"];
            isOneToOne: false;
            referencedRelation: "project_assets";
            referencedColumns: ["id"];
          },
        ];
      };
      project_assets: {
        Row: {
          id: string;
          project_id: string | null;
          asset_type:
            | "thumbnail"
            | "hero"
            | "dashboard"
            | "report_page"
            | "profile"
            | "document"
            | "dataset"
            | "other"
            | "cv"
            | "cover";
          storage_path: string;
          file_name: string;
          mime_type: string | null;
          alt_text: string | null;
          caption: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          asset_type:
            | "thumbnail"
            | "hero"
            | "dashboard"
            | "report_page"
            | "profile"
            | "document"
            | "dataset"
            | "other"
            | "cv"
            | "cover";
          storage_path: string;
          file_name: string;
          mime_type?: string | null;
          alt_text?: string | null;
          caption?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["project_assets"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "project_assets_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_links: {
        Row: {
          id: string;
          project_id: string;
          link_type:
            | "powerbi"
            | "looker"
            | "github"
            | "dataset"
            | "demo"
            | "other"
            | "cv";
          label: string;
          url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          link_type?:
            | "powerbi"
            | "looker"
            | "github"
            | "dataset"
            | "demo"
            | "other"
            | "cv";
          label: string;
          url: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["project_links"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "project_links_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          id: number;
          intro: string | null;
          statistics_background: string | null;
          experience: Json;
          interests: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          contact_email: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          intro?: string | null;
          statistics_background?: string | null;
          experience?: Json;
          interests?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          contact_email?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          intro?: string | null;
          statistics_background?: string | null;
          experience?: Json;
          interests?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          contact_email?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      asset_type:
        | "thumbnail"
        | "hero"
        | "dashboard"
        | "report_page"
        | "profile"
        | "document"
        | "dataset"
        | "other"
        | "cv"
        | "cover";
      product_type:
        | "ebook"
        | "template"
        | "guide"
        | "resource"
        | "course"
        | "other";
      link_type:
        | "powerbi"
        | "looker"
        | "github"
        | "dataset"
        | "demo"
        | "other";
      project_status: "draft" | "published" | "archived";
    };
    CompositeTypes: Record<string, never>;
  };
}
