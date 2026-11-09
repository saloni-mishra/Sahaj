// Hindi pages reuse the existing Sahaj artwork from /logo/sahaj-icon.png.
// Keeping one small wrapper makes sizing consistent without adding a new
// character or another image asset.
export default function HindiMascot({
  variant = "inline",
  alt = "सहज",
  className = "",
}) {
  return (
    <img
      src="/logo/sahaj-icon.png"
      alt={alt}
      className={`hindi-mascot hindi-mascot--${variant} ${className}`.trim()}
    />
  );
}
