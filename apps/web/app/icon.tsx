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
          color: "white",
          fontSize: 36,
          fontWeight: 900,
        }}
      >
        S
      </div>
    ),
    {
      ...size,
    },
  );
}