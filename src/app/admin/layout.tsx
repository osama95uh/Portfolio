import CustomCursor from "../../components/common/CustomCursor";

/**
 * Admin shell: the native cursor is hidden globally on fine-pointer devices
 * (globals.css), so this layout renders the same custom cursor as the public
 * site. Keep this layout minimal — the panel itself is in page.tsx.
 */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <CustomCursor />
      {children}
    </>
  );
}
