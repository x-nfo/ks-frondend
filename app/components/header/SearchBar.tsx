import { Form, useSearchParams } from "react-router";

export function SearchBar({ onSelect }: { onSelect?: () => void }) {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  return (
    <Form
      method="get"
      action="/search"
      key={initialQuery}
      onSubmit={() => onSelect?.()}
    >
      <input
        type="search"
        name="q"
        defaultValue={initialQuery}
        placeholder="Search"
        className="shadow-sm focus:ring-karima-brand focus:border-karima-brand block w-full sm:text-sm border-gray-300 rounded-sm bg-transparent border-b border-karima-brand/20 px-0 py-4 text-center text-karima-ink text-lg font-serif placeholder:font-sans placeholder:text-sm placeholder:text-karima-ink/30 focus:outline-none focus:ring-0"
      />
    </Form>
  );
}
