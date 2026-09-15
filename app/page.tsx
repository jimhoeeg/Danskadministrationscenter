import { redirect } from "next/navigation";
import { STANDARD_EJER } from "@/lib/data";

export default function Forside() {
  redirect(`/${STANDARD_EJER}`);
}
