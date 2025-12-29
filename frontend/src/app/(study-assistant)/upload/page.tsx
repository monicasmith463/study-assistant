import { Metadata } from "next"
import UploadClient from "./UploadClient"

export const metadata: Metadata = {
  title: "Upload Page",
  description: "Upload your documents page",
}

export default function Upload() {
  return <UploadClient />
}
