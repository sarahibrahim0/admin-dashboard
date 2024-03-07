import { Category } from './category';

export class Product {
    id?: string;
    name?: string;
    description?: string;
    richDescription?: string;
    image?: {url: string, publicId: string};
    images?: string[];
    brand?: string;
    color?: string;

    price?: number;
    category?: Category;
    countInStock?: number;
    rating?: number;
    numReviews?: number;
    isFeatured?: boolean;
    dateCreated?: string;
}


