import CategoryPage from "@/src/components/CategoryPage";
import { categoryFromSlug } from "@/src/lib/categories-api";
import { fetchProductsByCategory, type ApiProduct } from "@/src/lib/products-api";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categoryTitle = categoryFromSlug(slug);

  let products: ApiProduct[] = [];
  let error: string | undefined;

  try {
    products = await fetchProductsByCategory(categoryTitle);
  } catch {
    error =
      "Couldn't load products. Make sure the API at api.mumzo.in is running.";
  }

  return (
    <CategoryPage categoryTitle={categoryTitle} products={products} error={error} />
  );
}
