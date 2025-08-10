import { useState, useCallback, useRef, useEffect } from 'react'
import { Audio } from 'expo-av'
import * as Haptics from 'expo-haptics'
import { SoundType, AmbientType, SoundConfig, Phase } from '../types'

// Sound file mappings
 
const PHASE_SOUNDS = {
  bell: require('../assets/sounds/singing-bowl.mp3'),
  chime: require('../assets/sounds/singing-bowl.mp3'), // Using same sound for now
  gong: require('../assets/sounds/singing-bowl.mp3'),  // Using same sound for now
  none: null
}

 
const AMBIENT_SOUNDS = {
  ocean: require('../assets/sounds/ocean.mp3'),
  forest: require('../assets/sounds/forest.mp3'),
  rain: require('../assets/sounds/rain.mp3'),
  none: null
}

export const useSound = () => {
  const [soundConfig, setSoundConfig] = useState<SoundConfig>({
    phaseIndicator: 'bell',
    ambient: 'none',
    ambientVolume: 0.3,
    indicatorVolume: 0.5,
    enabled: false
  })

  const ambientSoundRef = useRef<Audio.Sound | null>(null)
  const phaseSoundRef = useRef<Audio.Sound | null>(null)
  const previewSoundRef = useRef<Audio.Sound | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ambientSoundRef.current) {
        ambientSoundRef.current.unloadAsync()
      }
      if (phaseSoundRef.current) {
        phaseSoundRef.current.unloadAsync()
      }
      if (previewSoundRef.current) {
        previewSoundRef.current.unloadAsync()
      }
    }
  }, [])

  const initializeAudio = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      })
      console.log('Audio initialized successfully')
    } catch (error) {
      console.error('Failed to initialize audio:', error)
    }
  }, [])

  const playPhaseSound = useCallback(async () => {
    if (!soundConfig.enabled || soundConfig.phaseIndicator === 'none') return

    try {
      // Haptic feedback for phase changes
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      // Stop any existing phase sound
      if (phaseSoundRef.current) {
        await phaseSoundRef.current.stopAsync()
        await phaseSoundRef.current.unloadAsync()
        phaseSoundRef.current = null
      }

      // Load and play the phase sound
      const soundFile = PHASE_SOUNDS[soundConfig.phaseIndicator]
      if (soundFile) {
        const { sound } = await Audio.Sound.createAsync(
          soundFile,
          { 
            volume: soundConfig.indicatorVolume,
            shouldPlay: true
          }
        )
        phaseSoundRef.current = sound
        
        // Set up callback to unload sound when finished
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync()
            if (phaseSoundRef.current === sound) {
              phaseSoundRef.current = null
            }
          }
        })
      }
    } catch (error) {
      console.error('Failed to play phase sound:', error)
    }
  }, [soundConfig])

  const startAmbientSound = useCallback(async () => {
    if (!soundConfig.enabled || soundConfig.ambient === 'none') return

    try {
      // Stop any existing ambient sound
      if (ambientSoundRef.current) {
        await ambientSoundRef.current.stopAsync()
        await ambientSoundRef.current.unloadAsync()
        ambientSoundRef.current = null
      }

      // Load and play the ambient sound
      const soundFile = AMBIENT_SOUNDS[soundConfig.ambient]
      if (soundFile) {
        const { sound } = await Audio.Sound.createAsync(
          soundFile,
          { 
            isLooping: true, 
            volume: soundConfig.ambientVolume,
            shouldPlay: true
          }
        )
        ambientSoundRef.current = sound
        console.log('Ambient sound started:', soundConfig.ambient)
      }
    } catch (error) {
      console.error('Failed to start ambient sound:', error)
    }
  }, [soundConfig])

  const stopAmbientSound = useCallback(async () => {
    if (ambientSoundRef.current) {
      try {
        await ambientSoundRef.current.stopAsync()
        await ambientSoundRef.current.unloadAsync()
        ambientSoundRef.current = null
        console.log('Ambient sound stopped')
      } catch (error) {
        console.error('Failed to stop ambient sound:', error)
      }
    }
  }, [])

  const pauseAmbientSound = useCallback(async () => {
    if (ambientSoundRef.current) {
      try {
        await ambientSoundRef.current.pauseAsync()
        console.log('Ambient sound paused')
      } catch (error) {
        console.error('Failed to pause ambient sound:', error)
      }
    }
  }, [])

  const resumeAmbientSound = useCallback(async () => {
    if (ambientSoundRef.current) {
      try {
        await ambientSoundRef.current.playAsync()
        console.log('Ambient sound resumed')
      } catch (error) {
        console.error('Failed to resume ambient sound:', error)
      }
    }
  }, [])

  const updateAmbientVolume = useCallback(async (volume: number) => {
    if (ambientSoundRef.current) {
      try {
        await ambientSoundRef.current.setVolumeAsync(volume)
        console.log('Ambient volume updated:', volume)
      } catch (error) {
        console.error('Failed to update ambient volume:', error)
      }
    }
  }, [])

  const previewSound = useCallback(async (type: 'phase' | 'ambient', sound: SoundType | AmbientType) => {
    try {
      // Stop any existing preview
      await stopPreviewSounds()

      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

      let soundFile = null
      if (type === 'phase' && sound !== 'none') {
        soundFile = PHASE_SOUNDS[sound as SoundType]
      } else if (type === 'ambient' && sound !== 'none') {
        soundFile = AMBIENT_SOUNDS[sound as AmbientType]
      }

      if (soundFile) {
        const { sound: audioSound } = await Audio.Sound.createAsync(
          soundFile,
          { 
            volume: type === 'phase' ? soundConfig.indicatorVolume : soundConfig.ambientVolume,
            shouldPlay: true
          }
        )
        previewSoundRef.current = audioSound

        // Auto-stop after 3 seconds for ambient preview
        if (type === 'ambient') {
          setTimeout(async () => {
            if (previewSoundRef.current === audioSound) {
              await audioSound.stopAsync()
              await audioSound.unloadAsync()
              previewSoundRef.current = null
            }
          }, 3000)
        } else {
          // Set up callback to unload sound when finished
          audioSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              audioSound.unloadAsync()
              if (previewSoundRef.current === audioSound) {
                previewSoundRef.current = null
              }
            }
          })
        }
      }
    } catch (error) {
      console.error('Failed to preview sound:', error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundConfig.indicatorVolume, soundConfig.ambientVolume])

  const stopPreviewSounds = useCallback(async () => {
    if (previewSoundRef.current) {
      try {
        await previewSoundRef.current.stopAsync()
        await previewSoundRef.current.unloadAsync()
        previewSoundRef.current = null
      } catch (error) {
        console.error('Failed to stop preview sound:', error)
      }
    }
  }, [])

  const stopPhaseSounds = useCallback(async () => {
    if (phaseSoundRef.current) {
      try {
        await phaseSoundRef.current.stopAsync()
        await phaseSoundRef.current.unloadAsync()
        phaseSoundRef.current = null
      } catch (error) {
        console.error('Failed to stop phase sound:', error)
      }
    }
  }, [])

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
    stopPreviewSounds,
    stopPhaseSounds
  }
}