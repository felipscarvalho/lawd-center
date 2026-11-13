import type { Metadata } from "next";
import { SidebarDemo } from "./_components/sidebar_demo";

export const metadata: Metadata = {
  title: "Sidebar",
  description: "Demonstração da sidebar de navegação",
};

export default function SidebarPage() {
  return <SidebarDemo />;
}
