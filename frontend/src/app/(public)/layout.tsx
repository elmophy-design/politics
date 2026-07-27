import { Header } from "@/components/common/Layout/Header";
import { Footer } from "@/components/common/Layout/Footer";
import { NewsTicker } from "@/components/common/Layout/NewsTicker";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <NewsTicker />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
