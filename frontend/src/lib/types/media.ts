export type MediaItem = {
  id: number;
  type:
    | "press_release"
    | "video"
    | "interview"
    | "download"
    | "gallery_image"
    | "livestream_link";
  title: string;
  slug: string | null;
  category: string | null;
  description: string | null;
  file_path: string | null;
  external_url: string | null;
  thumbnail: string | null;
  is_published: boolean;
  created_at: string;
};

export type Paginated<T> = { data: T[] };
