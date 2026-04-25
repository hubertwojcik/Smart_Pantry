import { Category } from "../types";

export interface FoodFactsResult {
  name: string;
  weight: number | null;
  weightUnit: "g" | "ml" | "szt";
  category: Category;
  imageUrl: string | null;
  barcode: string;
}

interface OpenFoodFactsResponse {
  status: number;
  product?: {
    product_name?: string;
    product_name_pl?: string;
    quantity?: string;
    serving_size?: string;
    categories_tags?: string[];
    image_front_url?: string;
    image_url?: string;
  };
}

const categoryMapping: Record<string, Category> = {
  "en:dairies": "Nabiał",
  "en:dairy": "Nabiał",
  "en:milks": "Nabiał",
  "en:cheeses": "Nabiał",
  "en:yogurts": "Nabiał",
  "en:breads": "Pieczywo",
  "en:bakery": "Pieczywo",
  "en:meats": "Mięso",
  "en:meat": "Mięso",
  "en:poultry": "Mięso",
  "en:vegetables": "Warzywa",
  "en:fruits": "Warzywa",
  "en:beverages": "Napoje",
  "en:drinks": "Napoje",
  "en:waters": "Napoje",
  "en:juices": "Napoje",
  "en:cereals": "Suche",
  "en:pasta": "Suche",
  "en:rice": "Suche",
  "en:snacks": "Suche",
};

const parseWeight = (
  quantityString?: string
): { weight: number | null; unit: "g" | "ml" | "szt" } => {
  if (!quantityString) {
    return { weight: null, unit: "szt" };
  }

  const mlMatch = quantityString.match(/(\d+(?:[.,]\d+)?)\s*ml/i);
  if (mlMatch) {
    return { weight: parseFloat(mlMatch[1].replace(",", ".")), unit: "ml" };
  }

  const lMatch = quantityString.match(/(\d+(?:[.,]\d+)?)\s*l(?:itr)?/i);
  if (lMatch) {
    return { weight: parseFloat(lMatch[1].replace(",", ".")) * 1000, unit: "ml" };
  }

  const gMatch = quantityString.match(/(\d+(?:[.,]\d+)?)\s*g/i);
  if (gMatch) {
    return { weight: parseFloat(gMatch[1].replace(",", ".")), unit: "g" };
  }

  const kgMatch = quantityString.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
  if (kgMatch) {
    return { weight: parseFloat(kgMatch[1].replace(",", ".")) * 1000, unit: "g" };
  }

  return { weight: null, unit: "szt" };
};

const mapCategory = (categoryTags?: string[]): Category => {
  if (!categoryTags || categoryTags.length === 0) {
    return "Inne";
  }

  for (const tag of categoryTags) {
    const lowerTag = tag.toLowerCase();
    for (const [key, value] of Object.entries(categoryMapping)) {
      if (lowerTag.includes(key) || key.includes(lowerTag)) {
        return value;
      }
    }
  }

  return "Inne";
};

export const fetchProductByBarcode = async (
  barcode: string
): Promise<FoodFactsResult | null> => {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      {
        headers: {
          "User-Agent": "InteligentnaSpizarnia/1.0",
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data: OpenFoodFactsResponse = await response.json();

    if (data.status !== 1 || !data.product) {
      return null;
    }

    const product = data.product;
    const name =
      product.product_name_pl || product.product_name || "Nieznany produkt";
    const { weight, unit } = parseWeight(product.quantity || product.serving_size);
    const category = mapCategory(product.categories_tags);
    const imageUrl = product.image_front_url || product.image_url || null;

    return {
      name,
      weight,
      weightUnit: unit,
      category,
      imageUrl,
      barcode,
    };
  } catch (error) {
    console.error("Error fetching product from Open Food Facts:", error);
    return null;
  }
};
