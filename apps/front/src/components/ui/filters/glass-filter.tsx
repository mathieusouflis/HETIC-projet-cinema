import type { ReactNode } from "react";

export const GlassFilter = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <span className="data-variant:!glass:hidden">
        <span className="pointer-events-none absolute inset-0 z-[1] opacity-[0.03] [background-image:url('data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;100%&quot; height=&quot;100%&quot;><filter id=&quot;noise&quot;><feTurbulence type=&quot;fractalNoise&quot; baseFrequency=&quot;0.8&quot; numOctaves=&quot;4&quot; stitchTiles=&quot;stitch&quot;/></filter><rect width=&quot;100%&quot; height=&quot;100%&quot; filter=&quot;url(%23noise)&quot;/></svg>')]" />
      </span>
      {children}
      <span className="data-variant:!glass:hidden">
        <svg className="absolute w-0 h-0">
          <title>glass</title>
          <filter id="glass">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.02"
              numOctaves="3"
              seed="2"
              result="turb"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turb"
              scale="20"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
      </span>
    </>
  );
};
