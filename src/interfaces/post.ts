// 記事の型定義
export type Post = {
    title: string;
    date: Date;
    description: string;
    categories: string[];
    tags: string[];
    slug: string;
    content: string;
    thumbnail: string;
    hero: string;
    draft: boolean;
};

export type ZennArticle = {
    title: string;
    slug: string;
    body_updated_at: string;
    path: string;
    emoji: string;
    article_type: string;
    liked_count: number;
};

export interface SpeakerDeckSlide {
    id: string;
    title: string;
    slug: string;
    url: string;
    thumbnail_url: string;
    published_at: string;
    view_count?: number;
    star_count?: number;
    description?: string;
    category?: string;
}

export type SearchParams = {
    [key: string]: string;
};

export type AllowedSearchKeys = {
    [key: string]: string;
};

// アーカイブの型定義(年月ごとの記事数を保持)
export type Archives = {
    [ArchiveYear: string]: {
        [ArchiveDate: string]: number;
    };
};

export type ArchiveDates = {
    [ArchiveDate: string]: number;
};

// カテゴリの型定義(カテゴリごとの記事数を保持)
export type Categories = {
    [key: string]: number;
};
