import { redirect } from "next/navigation"; // ✅ use redirect
import DocumentDropzoneComponent from "@/components/form/form-elements/DocumentDropZone";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Upload Page",
  description: "This is Next.js Upload Page",
};

export default async function Upload() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/error-404");
  }
  return <DocumentDropzoneComponent />;
}
