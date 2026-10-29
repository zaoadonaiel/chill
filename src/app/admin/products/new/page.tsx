import type { Metadata } from "next";
import { PageHeader } from "../../ui";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="New product" />
      <ProductForm />
    </>
  );
}
