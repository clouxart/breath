import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Background gradient effect */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        
        {/* Main circle */}
        <div
          style={{
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6 0%, #9333EA 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            boxShadow: '0 20px 60px rgba(59, 130, 246, 0.3)',
          }}
        >
          <div
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: '#1a1a2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                border: '3px solid rgba(255, 255, 255, 0.2)',
              }}
            />
          </div>
        </div>
        
        {/* Title */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '20px',
          }}
        >
          Breathe
        </div>
        
        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '40px',
          }}
        >
          Box Breathing & Meditation App
        </div>
        
        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <span>Box Breathing</span>
          <span>•</span>
          <span>4-7-8 Technique</span>
          <span>•</span>
          <span>Ambient Sounds</span>
        </div>
        
        {/* Attribution */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          Free & Open Source by Clouxart
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}