import HomePage from "@/src/components/HomePage";
import {
  fetchCategories,
  groupCategories,
  type CategoryGroup,
} from "@/src/lib/categories-api";

export default async function Page() {
  let categories: CategoryGroup[] = [];

  try {
    categories = groupCategories(await fetchCategories());
  } catch {
    categories = [];
  }

  return <HomePage categories={categories} />;
}
