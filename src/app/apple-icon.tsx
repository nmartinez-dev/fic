import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #ea580c 0%, #c2410c 100%)',
          borderRadius: 36,
        }}
      >
        <svg
          width="112"
          height="112"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path fill="#FFFFFF" d="M3 24 9 12 13 18 17 9 21 15 25 7 29 24Z" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
