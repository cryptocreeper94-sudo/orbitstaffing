import saturnLogo from "@assets/generated_images/pure_aqua_saturn_planet_on_transparency.png";

interface HallmarkSealProps {
  verificationCode?: string;
  size?: 'small' | 'medium' | 'large';
  opacity?: number;
}

export function HallmarkSeal({ 
  verificationCode = 'ORBIT-VERIFIED', 
  size = 'medium',
  opacity = 0.15 
}: HallmarkSealProps) {
  const sizeMap = {
    small: 120,
    medium: 180,
    large: 240,
  };

  const dimension = sizeMap[size];

  return (
    <div className="relative flex items-center justify-center" style={{ width: dimension, height: dimension }}>
      {/* Circular Border */}
      <div
        className="absolute inset-0 border-2 border-cyan-400 rounded-full"
        style={{ opacity }}
      />

      {/* Saturn Logo */}
      <div className="absolute flex items-center justify-center" style={{ opacity }}>
        <img
          src={saturnLogo}
          alt="ORBIT Verification Seal"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Text Arc - Verification Code */}
      <svg
        className="absolute"
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        style={{ opacity }}
      >
        <defs>
          <path
            id="circlePath"
            d={`M ${dimension / 2}, ${dimension / 2} m -${dimension / 2 - 20}, 0 a ${dimension / 2 - 20},${dimension / 2 - 20} 0 1,1 ${(dimension / 2 - 20) * 2},0`}
            fill="none"
          />
        </defs>
        <text
          fontSize="10"
          fill="currentColor"
          className="text-cyan-400 font-bold"
          letterSpacing="2"
        >
          <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
            {verificationCode}
          </textPath>
        </text>
      </svg>

      {/* Center Badge */}
      <div
        className="absolute text-center text-xs font-bold text-cyan-400"
        style={{ opacity }}
      >
        <div>ORBIT</div>
        <div className="text-[8px]">VERIFIED</div>
      </div>
    </div>
  );
}

/**
 * Watermark version for embedding in documents
 */
export function HallmarkWatermark({ verificationCode = 'ORBIT-VERIFIED' }) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 z-0">
      <HallmarkSeal verificationCode={verificationCode} size="large" opacity={1} />
    </div>
  );
}
