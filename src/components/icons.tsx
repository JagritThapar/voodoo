import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (props: P) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const HomeIcon = (p: P) => (<svg {...base(p)}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></svg>);
export const SunIcon = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>);
export const ClipboardIcon = (p: P) => (<svg {...base(p)}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3" /></svg>);
export const UsersIcon = (p: P) => (<svg {...base(p)}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" /></svg>);
export const NewsIcon = (p: P) => (<svg {...base(p)}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h10M7 16h6" /></svg>);
export const WalletIcon = (p: P) => (<svg {...base(p)}><path d="M3 7a2 2 0 0 1 2-2h13v4" /><rect x="3" y="7" width="18" height="13" rx="2" /><circle cx="16.5" cy="13.5" r="1.2" /></svg>);
export const NetworkIcon = (p: P) => (<svg {...base(p)}><circle cx="12" cy="5" r="2.5" /><circle cx="5" cy="19" r="2.5" /><circle cx="19" cy="19" r="2.5" /><circle cx="12" cy="19" r="2.5" /><path d="M12 7.5v9M12 11l-6 5.5M12 11l6 5.5" /></svg>);
export const UserIcon = (p: P) => (<svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>);
export const PlusIcon = (p: P) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const CheckIcon = (p: P) => (<svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>);
export const ChevronRight = (p: P) => (<svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>);
export const ChevronLeft = (p: P) => (<svg {...base(p)}><path d="m15 6-6 6 6 6" /></svg>);
export const StarIcon = ({ filled, ...p }: P & { filled?: boolean }) => (<svg {...base(p)} fill={filled ? "currentColor" : "none"}><path d="m12 3 2.8 5.9 6.2.8-4.6 4.3 1.2 6.2L12 17.1l-5.6 3.1 1.2-6.2L3 9.7l6.2-.8z" /></svg>);
export const UploadIcon = (p: P) => (<svg {...base(p)}><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg>);
export const FileIcon = (p: P) => (<svg {...base(p)}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>);
export const CopyIcon = (p: P) => (<svg {...base(p)}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></svg>);
export const ShareIcon = (p: P) => (<svg {...base(p)}><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" /></svg>);
export const BoltIcon = (p: P) => (<svg {...base(p)}><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg>);
export const BatteryIcon = (p: P) => (<svg {...base(p)}><rect x="2" y="7" width="17" height="10" rx="2" /><path d="M22 11v2M6 10v4M10 10v4" /></svg>);
export const CarIcon = (p: P) => (<svg {...base(p)}><path d="M5 17h14M3 17v-4l2-5h14l2 5v4" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" /></svg>);
export const DropIcon = (p: P) => (<svg {...base(p)}><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" /></svg>);
export const FanIcon = (p: P) => (<svg {...base(p)}><rect x="3" y="5" width="18" height="9" rx="2" /><path d="M7 10h10M8 18c0-1.5 1-2 1-3M12 19c0-1.5 1-2.5 1-4M16 18c0-1.5-1-2-1-3" /></svg>);
export const FilterIcon = (p: P) => (<svg {...base(p)}><path d="M12 3s5.5 6 5.5 10a5.5 5.5 0 0 1-11 0C6.5 9 12 3 12 3z" /><path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5" /><path d="M4 21h16" /></svg>);
export const TagIcon = (p: P) => (<svg {...base(p)}><path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" /><circle cx="7.5" cy="7.5" r="1.5" /></svg>);
export const LogoutIcon = (p: P) => (<svg {...base(p)}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" /></svg>);
export const ShieldIcon = (p: P) => (<svg {...base(p)}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /></svg>);

/** The AES wordmark. `reverse` is the white-text version for ink backgrounds. */
export function Logo({ reverse = false, className = "h-10" }: { reverse?: boolean; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny static brand asset
    <img
      src={reverse ? "/brand/aes-logo-reverse.png" : "/brand/aes-logo.png"}
      alt="Aussie Energy Savers"
      width={234}
      height={150}
      className={`w-auto ${className}`}
    />
  );
}
