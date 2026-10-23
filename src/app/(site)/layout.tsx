import Navbar from "../../components/common/Navbar";
import CustomCursor from "../../components/common/CustomCursor";
import LoaderWrapper from "../../components/common/LoaderWrapper";
import FallingNumbers from "../../components/common/FallingNumbers";
import LenisProvider from "../../components/common/LenisProvider";
import ScrollProgress from "../../components/common/ScrollProgress";

/**
 * The public site chrome (navbar, cursor, loader, smooth scroll, background
 * effects). Lives in the (site) route group so the /admin panel gets a clean,
 * distraction-free shell without any of this.
 */
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Background Falling Numbers */}
      <FallingNumbers />

      {/* Global sticky glows (lighter on mobile, identical on desktop) */}
      <div className="fixed top-0 left-0 w-[500px] h-[400px] bg-emerald-500/40 blur-[90px] md:blur-[200px] rounded-full pointer-events-none z-0 -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[400px] bg-emerald-500/40 blur-[90px] md:blur-[200px] rounded-full pointer-events-none z-0 translate-x-1/2 translate-y-1/2" />

      <LenisProvider>
        <ScrollProgress />
        <CustomCursor />
        <LoaderWrapper>
          <Navbar />
          {children}
        </LoaderWrapper>
      </LenisProvider>
    </>
  );
}
