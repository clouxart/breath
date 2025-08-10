'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export type SoundType = 'bell' | 'chime' | 'bowl' | 'gong' | 'singing-bowl' | 'none'
export type AmbientType = 'ocean' | 'rain' | 'forest' | 'birds' | 'thunder' | 'wind' | 'whitenoise' | 'none'

interface SoundConfig {
  phaseIndicator: SoundType
  ambient: AmbientType
  ambientVolume: number
  indicatorVolume: number
  enabled: boolean
}

const createOscillatorSound = (
  context: AudioContext,
  frequency: number,
  type: OscillatorType = 'sine',
  duration: number = 0.5,
  volume: number = 0.3
) => {
  const oscillator = context.createOscillator()
  const gainNode = context.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(context.destination)
  
  oscillator.frequency.value = frequency
  oscillator.type = type
  
  gainNode.gain.setValueAtTime(0, context.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 0.01)
  gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration)
  
  oscillator.start(context.currentTime)
  oscillator.stop(context.currentTime + duration)
}

const createBellSound = (context: AudioContext, volume: number) => {
  // Bell sound with harmonics
  createOscillatorSound(context, 523.25, 'sine', 1.5, volume * 0.5) // C5
  createOscillatorSound(context, 1046.5, 'sine', 1.0, volume * 0.3) // C6
  createOscillatorSound(context, 1567.98, 'sine', 0.8, volume * 0.2) // G6
}

const createChimeSound = (context: AudioContext, volume: number) => {
  // Wind chime effect
  setTimeout(() => createOscillatorSound(context, 659.25, 'sine', 0.8, volume * 0.4), 0) // E5
  setTimeout(() => createOscillatorSound(context, 783.99, 'sine', 0.8, volume * 0.4), 100) // G5
  setTimeout(() => createOscillatorSound(context, 987.77, 'sine', 0.8, volume * 0.4), 200) // B5
}

const createBowlSound = (context: AudioContext, volume: number) => {
  // Tibetan bowl sound
  createOscillatorSound(context, 136.1, 'sine', 3, volume * 0.4) // C#3
  createOscillatorSound(context, 272.2, 'sine', 2.5, volume * 0.3) // C#4
  createOscillatorSound(context, 544.4, 'sine', 2, volume * 0.2) // C#5
  createOscillatorSound(context, 816.6, 'sine', 1.5, volume * 0.1) // G#5
}

const createGongSound = (context: AudioContext, volume: number) => {
  // Deep gong
  createOscillatorSound(context, 55, 'sine', 4, volume * 0.5) // A1
  createOscillatorSound(context, 110, 'sine', 3.5, volume * 0.4) // A2
  createOscillatorSound(context, 220, 'sine', 3, volume * 0.3) // A3
  createOscillatorSound(context, 440, 'triangle', 2.5, volume * 0.2) // A4
}

const createSingingBowlSound = (context: AudioContext, volume: number) => {
  // Singing bowl from Moodist - similar to bowl but with longer sustain
  createOscillatorSound(context, 440, 'sine', 3, volume * 0.4) // A4
  createOscillatorSound(context, 880, 'sine', 2.5, volume * 0.3) // A5
  createOscillatorSound(context, 1320, 'sine', 2, volume * 0.2) // E6
  createOscillatorSound(context, 1760, 'sine', 1.5, volume * 0.1) // A6
}

// Local ambient sound files from Moodist (MIT licensed)
const AMBIENT_SOUND_URLS: Record<Exclude<AmbientType, 'none' | 'whitenoise'>, string> = {
  ocean: '/sounds/ocean.mp3',
  rain: '/sounds/rain.mp3',
  forest: '/sounds/forest.mp3',
  birds: '/sounds/birds.mp3',
  thunder: '/sounds/thunder.mp3',
  wind: '/sounds/wind.mp3'
}

// We'll use the actual white noise file from Moodist instead of generating it
const WHITE_NOISE_URL = '/sounds/white-noise.wav'

export const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null)
  const ambientSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const ambientGainRef = useRef<GainNode | null>(null)
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null)
  const previewTimeoutsRef = useRef<NodeJS.Timeout[]>([])
  
  const [soundConfig, setSoundConfig] = useState<SoundConfig>({
    phaseIndicator: 'bell',
    ambient: 'none',
    ambientVolume: 0.3,
    indicatorVolume: 0.5,
    enabled: false
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioContextRef.current = new AudioContextClass()
    }
    
    return () => {
      if (ambientSourceRef.current) {
        ambientSourceRef.current.stop()
        ambientSourceRef.current = null
      }
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause()
        ambientAudioRef.current = null
      }
    }
  }, [])

  const playPhaseSound = useCallback((phase: 'inhale' | 'exhale' | 'hold1' | 'hold2') => {
    if (!soundConfig.enabled || soundConfig.phaseIndicator === 'none' || !audioContextRef.current) return
    
    const context = audioContextRef.current
    
    // Resume context if suspended (needed for some browsers)
    if (context.state === 'suspended') {
      context.resume()
    }
    
    switch (soundConfig.phaseIndicator) {
      case 'bell':
        if (phase === 'inhale' || phase === 'exhale') {
          createBellSound(context, soundConfig.indicatorVolume)
        }
        break
      case 'chime':
        if (phase === 'inhale') {
          createChimeSound(context, soundConfig.indicatorVolume)
        } else if (phase === 'exhale') {
          // Reverse chime for exhale
          setTimeout(() => createOscillatorSound(context, 987.77, 'sine', 0.8, soundConfig.indicatorVolume * 0.4), 0)
          setTimeout(() => createOscillatorSound(context, 783.99, 'sine', 0.8, soundConfig.indicatorVolume * 0.4), 100)
          setTimeout(() => createOscillatorSound(context, 659.25, 'sine', 0.8, soundConfig.indicatorVolume * 0.4), 200)
        }
        break
      case 'bowl':
        if (phase === 'inhale' || phase === 'exhale') {
          createBowlSound(context, soundConfig.indicatorVolume)
        }
        break
      case 'gong':
        if (phase === 'inhale') {
          createGongSound(context, soundConfig.indicatorVolume)
        }
        break
      case 'singing-bowl':
        if (phase === 'inhale' || phase === 'exhale') {
          // Use the actual singing bowl sound file
          const audio = new Audio('/sounds/singing-bowl.mp3')
          audio.volume = soundConfig.indicatorVolume
          audio.play().catch(err => console.warn('Failed to play singing bowl:', err))
        }
        break
    }
  }, [soundConfig])

  const startAmbientSound = useCallback(() => {
    if (!soundConfig.enabled || soundConfig.ambient === 'none') return
    
    // Stop existing sounds
    if (ambientSourceRef.current) {
      ambientSourceRef.current.stop()
      ambientSourceRef.current = null
    }
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause()
      ambientAudioRef.current = null
    }
    
    // All sounds now use HTML audio elements
    const soundUrl = soundConfig.ambient === 'whitenoise' 
      ? WHITE_NOISE_URL 
      : AMBIENT_SOUND_URLS[soundConfig.ambient]
    
    const audio = new Audio(soundUrl)
    audio.loop = true
    audio.volume = soundConfig.ambientVolume
    
    audio.play().catch(err => {
      console.warn('Failed to play ambient sound:', err)
      // User might need to interact with the page first
    })
    
    ambientAudioRef.current = audio
  }, [soundConfig])

  const stopAmbientSound = useCallback(() => {
    if (ambientSourceRef.current) {
      ambientSourceRef.current.stop()
      ambientSourceRef.current = null
      ambientGainRef.current = null
    }
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause()
      ambientAudioRef.current = null
    }
  }, [])

  const pauseAmbientSound = useCallback(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause()
    }
  }, [])

  const resumeAmbientSound = useCallback(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.play().catch(err => {
        console.warn('Failed to resume ambient sound:', err)
      })
    }
  }, [])

  const updateAmbientVolume = useCallback((volume: number) => {
    if (ambientGainRef.current) {
      ambientGainRef.current.gain.value = volume
    }
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = volume
    }
  }, [])

  const initializeAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioContextRef.current = new AudioContextClass()
    }
    
    // Play a silent sound to unlock audio on mobile
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
    
    const context = audioContextRef.current
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    
    gainNode.gain.value = 0
    oscillator.start()
    oscillator.stop(context.currentTime + 0.001)
  }, [])

  const stopPreviewSounds = useCallback(() => {
    // Clear all preview timeouts
    previewTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    previewTimeoutsRef.current = []
  }, [])

  const previewSound = useCallback((type: SoundType) => {
    if (!soundConfig.enabled || type === 'none') return
    
    // Clear any existing preview sounds
    stopPreviewSounds()
    
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioContextRef.current = new AudioContextClass()
    }
    
    const context = audioContextRef.current
    
    switch (type) {
      case 'bell':
        createBellSound(context, soundConfig.indicatorVolume)
        break
      case 'chime':
        // Store timeouts for chime sounds so they can be cancelled
        const timeout1 = setTimeout(() => createOscillatorSound(context, 659.25, 'sine', 0.8, soundConfig.indicatorVolume * 0.4), 0)
        const timeout2 = setTimeout(() => createOscillatorSound(context, 783.99, 'sine', 0.8, soundConfig.indicatorVolume * 0.4), 100)
        const timeout3 = setTimeout(() => createOscillatorSound(context, 987.77, 'sine', 0.8, soundConfig.indicatorVolume * 0.4), 200)
        previewTimeoutsRef.current = [timeout1, timeout2, timeout3]
        break
      case 'bowl':
        createBowlSound(context, soundConfig.indicatorVolume)
        break
      case 'gong':
        createGongSound(context, soundConfig.indicatorVolume)
        break
      case 'singing-bowl':
        createSingingBowlSound(context, soundConfig.indicatorVolume)
        break
    }
  }, [soundConfig.enabled, soundConfig.indicatorVolume, stopPreviewSounds])

  return {
    soundConfig,
    setSoundConfig,
    playPhaseSound,
    startAmbientSound,
    stopAmbientSound,
    pauseAmbientSound,
    resumeAmbientSound,
    updateAmbientVolume,
    initializeAudio,
    previewSound,
    stopPreviewSounds
  }
}