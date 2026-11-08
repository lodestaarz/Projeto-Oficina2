export function Logo() {
  return (
    <span className="logo">
      <svg viewBox="0 0 64 64" width="32" height="32" aria-hidden="true" focusable="false">
        <rect x="4" y="4" width="56" height="56" rx="14" fill="var(--cor-primaria)" />
        <rect x="16" y="20" width="32" height="26" rx="8" fill="var(--cor-personagem)" />
        <circle cx="26" cy="32" r="4" fill="#fff" />
        <circle cx="38" cy="32" r="4" fill="#fff" />
        <rect x="30" y="10" width="4" height="10" rx="2" fill="#fff" />
      </svg>
      <span className="logo-texto">ArrowBot</span>
    </span>
  );
}
