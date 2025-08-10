import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function TwitterImage() {
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
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        
        {/* Main circle */}
        <div
          style={{
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6 0%, #9333EA 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '36px',
            boxShadow: '0 20px 60px rgba(147, 51, 234, 0.3)',
          }}
        >
          <div
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: '#1a1a2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                border: '3px solid rgba(255, 255, 255, 0.2)',
              }}
            />
          </div>
        </div>
        
        {/* Title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '16px',
          }}
        >
          Breathe
        </div>
        
        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '32px',
            textAlign: 'center',
          }}
        >
          Free Breathing & Meditation App
        </div>
        
        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <span>Box Breathing</span>
          <span>•</span>
          <span>4-7-8</span>
          <span>•</span>
          <span>Custom Patterns</span>
        </div>
        
        {/* CTA */}
        <div
          style={{
            marginTop: '32px',
            padding: '12px 24px',
            background: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '24px',
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          breathe.clouxart.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}