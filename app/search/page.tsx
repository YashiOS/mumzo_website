import { Suspense } from "react";
import SearchPage from "@/src/components/SearchPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SearchPage />
    </Suspense>
  );
}
