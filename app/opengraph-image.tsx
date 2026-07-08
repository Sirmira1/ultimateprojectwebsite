import { ImageResponse } from "next/og";
import { SIG_PATHS, SIG_VIEWBOX } from "@/lib/signature";

export const alt = "Nikola Anastasijević — Software Developer. I finish the thing.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#08070b",
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(255,92,40,0.08), rgba(8,7,11,0) 70%)",
          position: "relative",
        }}
      >
        {/* corner marks */}
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 44,
            display: "flex",
            color: "#8a857c",
            fontSize: 17,
            letterSpacing: "0.3em",
          }}
        >
          N.A — PORTFOLIO ©2026
        </div>
        <div
          style={{
            position: "absolute",
            top: 36,
            right: 44,
            display: "flex",
            color: "#8a857c",
            fontSize: 17,
            letterSpacing: "0.3em",
          }}
        >
          HAMILTON, ON — CANADA
        </div>

        <svg
          width={760}
          height={334}
          viewBox={SIG_VIEWBOX}
          style={{ marginTop: -10 }}
        >
          {SIG_PATHS.map((p, i) => (
            <path
              key={i}
              d={p.d}
              fill="none"
              stroke={p.ember ? "#ff5c28" : "#ece7df"}
              strokeWidth={p.ember ? 5 : 7}
              strokeLinecap="round"
            />
          ))}
        </svg>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#ece7df",
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "0.22em",
            }}
          >
            NIKOLA ANASTASIJEVIĆ
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 14,
              color: "#8a857c",
              fontSize: 19,
              letterSpacing: "0.3em",
            }}
          >
            SOFTWARE DEVELOPER —{" "}
            <span style={{ color: "#ff5c28", marginLeft: 10 }}>
              I FINISH THE THING
            </span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
