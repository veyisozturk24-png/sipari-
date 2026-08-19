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
            "linear-gradient(135deg, #f97316 0%, #e11d48 45%, #6d28d9 100%)",
          overflow: "hidden",
        }}
      >
        <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
          <path d="M14 13.5h20a4 4 0 0 1 4 4v2.2a4 4 0 0 1-4 4H18a4 4 0 0 0-4 4v2.1a4 4 0 0 0 4 4h16" stroke="white" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M31.5 9.5v6M31.5 32.5v6" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="34" cy="36" r="2.6" fill="white" />
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}
