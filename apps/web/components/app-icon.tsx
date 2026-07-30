import type { SVGProps } from "react";

export type AppIconName =
  | "arrow-right"
  | "bell"
  | "bolt"
  | "box"
  | "briefcase"
  | "chart"
  | "check"
  | "chevron-down"
  | "customers"
  | "globe"
  | "inbox"
  | "instagram"
  | "layout"
  | "message"
  | "more"
  | "orders"
  | "plus"
  | "search"
  | "settings"
  | "shopping-bag"
  | "sparkles"
  | "stock"
  | "truck"
  | "wallet"
  | "whatsapp";

type AppIconProps = SVGProps<SVGSVGElement> & {
  name: AppIconName;
  size?: number;
  strokeWidth?: number;
};

/** Lightweight, locally rendered product icons. They stay sharp on every screen. */
export default function AppIcon({
  name,
  size = 20,
  strokeWidth = 1.9,
  ...props
}: AppIconProps) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth,
  };

  const content = (() => {
    switch (name) {
      case "layout":
        return <><rect {...common} x="3" y="3" width="7" height="7" rx="1.5" /><rect {...common} x="14" y="3" width="7" height="7" rx="1.5" /><rect {...common} x="3" y="14" width="7" height="7" rx="1.5" /><rect {...common} x="14" y="14" width="7" height="7" rx="1.5" /></>;
      case "inbox":
        return <><path {...common} d="M4 5.5h16v11H15l-3 3-3-3H4z" /><path {...common} d="M4 13h4l1.4 2h5.2l1.4-2h4" /></>;
      case "orders":
        return <><path {...common} d="M5 7h14l-1 13H6z" /><path {...common} d="M8 7V5a4 4 0 0 1 8 0v2" /><path {...common} d="M9.5 11.5h5" /></>;
      case "box":
        return <><path {...common} d="m4 7 8-4 8 4-8 4z" /><path {...common} d="M4 7v10l8 4 8-4V7" /><path {...common} d="M12 11v10" /></>;
      case "customers":
        return <><circle {...common} cx="9" cy="8" r="3" /><path {...common} d="M3.5 20c.5-3.3 2.4-5 5.5-5s5 1.7 5.5 5" /><path {...common} d="M16 6a3 3 0 0 1 0 5.8" /><path {...common} d="M16.5 15.2c2.3.4 3.7 1.9 4 4.8" /></>;
      case "stock":
        return <><path {...common} d="M4 5h16" /><path {...common} d="M4 12h16" /><path {...common} d="M4 19h16" /><path {...common} d="M7 3v4M16 10v4M11 17v4" /></>;
      case "truck":
        return <><path {...common} d="M3 6h11v10H3z" /><path {...common} d="M14 10h4l3 3v3h-7z" /><circle {...common} cx="7" cy="18" r="2" /><circle {...common} cx="18" cy="18" r="2" /></>;
      case "settings":
        return <><circle {...common} cx="12" cy="12" r="3" /><path {...common} d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-3v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H5v-3h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V4h3v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v3h-.2a1.7 1.7 0 0 0-1.6 1Z" /></>;
      case "bolt":
        return <path {...common} d="m13 2-9 12h7l-1 8 9-12h-7z" />;
      case "bell":
        return <><path {...common} d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path {...common} d="M10 22h4" /></>;
      case "plus":
        return <path {...common} d="M12 5v14M5 12h14" />;
      case "more":
        return <><circle fill="currentColor" cx="5" cy="12" r="1.4" /><circle fill="currentColor" cx="12" cy="12" r="1.4" /><circle fill="currentColor" cx="19" cy="12" r="1.4" /></>;
      case "shopping-bag":
        return <><path {...common} d="M5 8h14l-1 12H6z" /><path {...common} d="M9 8V6a3 3 0 0 1 6 0v2" /></>;
      case "wallet":
        return <><path {...common} d="M4 7.5A2.5 2.5 0 0 1 6.5 5H19v14H6.5A2.5 2.5 0 0 1 4 16.5z" /><path {...common} d="M4 8h13" /><path {...common} d="M15 13h2" /></>;
      case "chart":
        return <><path {...common} d="M4 19V5" /><path {...common} d="M4 19h16" /><path {...common} d="m7 15 4-4 3 2 5-6" /><path {...common} d="M16 7h3v3" /></>;
      case "whatsapp":
        return <><path {...common} d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.5-4.2A8 8 0 1 1 20 11.6Z" /><path {...common} d="M9 8.4c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.7 1.5c.1.2.1.4 0 .5l-.5.6c-.1.1-.1.3 0 .5.5.9 1.2 1.6 2.1 2.1.2.1.4.1.5 0l.6-.5c.1-.1.3-.1.5 0l1.5.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.5.7-.5.2-1.6.4-3.3-.4-1-.4-2-1.1-2.8-1.9-.8-.8-1.4-1.8-1.9-2.8-.8-1.7-.6-2.8-.4-3.3Z" /></>;
      case "instagram":
        return <><rect {...common} x="3.5" y="3.5" width="17" height="17" rx="5" /><circle {...common} cx="12" cy="12" r="3.5" /><circle fill="currentColor" cx="17.2" cy="6.9" r="1" /></>;
      case "globe":
        return <><circle {...common} cx="12" cy="12" r="9" /><path {...common} d="M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" /></>;
      case "search":
        return <><circle {...common} cx="10.5" cy="10.5" r="5.5" /><path {...common} d="m15 15 4.5 4.5" /></>;
      case "arrow-right":
        return <path {...common} d="M5 12h14m-6-6 6 6-6 6" />;
      case "chevron-down":
        return <path {...common} d="m7 10 5 5 5-5" />;
      case "message":
        return <><path {...common} d="M4 5.5h16v11H9l-5 3z" /><path {...common} d="M8 10h8M8 13h5" /></>;
      case "briefcase":
        return <><rect {...common} x="3" y="7" width="18" height="12" rx="2" /><path {...common} d="M8 7V5h8v2M3 12h18M10 12v2h4v-2" /></>;
      case "sparkles":
        return <><path {...common} d="m12 3 1.2 4.1L17 8.3l-3.8 1.2L12 14l-1.2-4.5L7 8.3l3.8-1.2z" /><path {...common} d="m19 15 .5 1.5L21 17l-1.5.5L19 19l-.5-1.5L17 17l1.5-.5zM5 15l.6 2.4L8 18l-2.4.6L5 21l-.6-2.4L2 18l2.4-.6z" /></>;
      case "check":
        return <path {...common} d="m5 12 4 4L19 6" />;
      default:
        return null;
    }
  })();

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      focusable="false"
      {...props}
    >
      {content}
    </svg>
  );
}
