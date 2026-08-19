import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 16,
          background:
            "linear-gradient(135deg, #151332 0%, #4c1d95 56%, #e95855 100%)",
          overflow: "hidden",
        }}
      >
        <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
          <rect x="9" y="10" width="30" height="28" rx="7" fill="white" />
          <path d="M16 19h12M16 25h8" stroke="#5B21B6" strokeWidth="3.4" strokeLinecap="round" />
          <path d="m30 27 3 3 6-7" stroke="#F05B58" strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="36.5" cy="12.5" r="3.5" fill="#FFB14A" />
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}
