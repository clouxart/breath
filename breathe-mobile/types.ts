export type BreathingPattern = {
  name: string
  inhale: number
  hold1: number
  exhale: number
  hold2: number
  description: string
}

export type SoundType = 'bell' | 'chime' | 'gong' | 'none'
export type AmbientType = 'ocean' | 'forest' | 'rain' | 'none'

export type SoundConfig = {
  phaseIndicator: SoundType
  ambient: AmbientType
  ambientVolume: number
  indicatorVolume: number
  enabled: boolean
}

export type Phase = 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'idle'