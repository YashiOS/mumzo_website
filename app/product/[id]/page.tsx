import ProductDetailPage from "@/src/components/ProductDetailPage";
import {
  fetchProductById,
  fetchProductsByCategory,
  type ApiProduct,
} from "@/src/lib/products-api";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product: ApiProduct | null = null;
  let related: ApiProduct[] = [];
  let error: string | undefined;

  try {
    product = await fetchProductById(id);

    if (product) {
      const currentId = product.productId;
      const categoryProducts = await fetchProductsByCategory(product.category);
      related = categoryProducts
        .filter((p) => p.productId !== currentId)
        .slice(0, 4);
    }
  } catch {
    error =
      "Couldn't load this product. Make sure the API at api.mumzo.in is running.";
  }

  return <ProductDetailPage product={product} related={related} error={error} />;
}
