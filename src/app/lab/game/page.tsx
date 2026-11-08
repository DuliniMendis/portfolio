import { notFound } from "next/navigation";
import { Lab } from "./Lab";

// Temporary lab route for building the hero career game. Deleted before the final commit.
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Lab />;
}
