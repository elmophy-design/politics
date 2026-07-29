import Image from "next/image";

/**
 * Shared shell for the About section (Biography, Political Profile tabs).
 * Renders the official seal as a large, faint watermark behind the page
 * content — visible but subtle enough not to compete with the text.
 */
export default function AboutLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Image
          src="/images/seal.png"
          alt=""
          aria-hidden="true"
          width={900}
          height={900}
          className="w-[600px] max-w-none opacity-[0.04] sm:w-[750px] lg:w-[900px]"
          priority={false}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}