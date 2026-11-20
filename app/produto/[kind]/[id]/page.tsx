import ProductPage from '@/components/commerce/ProductPage';
export default async function Page({ params }: { params: Promise<{kind: string; id: string}> }) {
  const { kind, id } = await params;
  return <ProductPage kind={kind} id={id} />;
}
