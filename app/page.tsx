'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useSound, SoundType, AmbientType } from './hooks/useSound'
import { useLocalStorage } from './hooks/useLocalStorage'

type BreathingPattern = {
  name: string
  inhale: number
  hold1: number
  exhale: number
  hold2: number
  description: string
}

const breathingPatterns: BreathingPattern[] = [
  { name: 'Box Breathing', inhale: 4, hold1: 4, exhale: 4, hold2: 4, description: 'Navy SEALs technique for focus' },
  { name: '4-7-8 Breathing', inhale: 4, hold1: 7, exhale: 8, hold2: 0, description: 'Dr. Weil\'s technique for sleep' },
  { name: 'Wim Hof', inhale: 2, hold1: 0, exhale: 2, hold2: 0, description: 'Quick energizing breaths' },
  { name: 'Calm', inhale: 5, hold1: 0, exhale: 5, hold2: 0, description: 'Simple relaxation pattern' },
  { name: 'Custom', inhale: 4, hold1: 4, exhale: 4, hold2: 4, description: 'Create your own pattern' }
]

export default function Home() {
  const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2' | 'idle'>('idle')
  const [isBreathing, setIsBreathing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [cycles, setCycles] = useState(0)
  const [countdown, setCountdown] = useState(4)
  const [showSettings, setShowSettings] = useState(false)

  // Use localStorage for persistent settings
  const [selectedPattern, setSelectedPattern] = useLocalStorage('breathingPattern', 0)
  const [customDurations, setCustomDurations] = useLocalStorage('customDurations', { inhale: 4, hold1: 4, exhale: 4, hold2: 4 })
  const [totalBreaths, setTotalBreaths] = useLocalStorage('totalBreaths', 0)
  // Store sound config in localStorage
  const [storedSoundConfig, setStoredSoundConfig] = useLocalStorage('soundConfig', {
    phaseIndicator: 'bell' as SoundType,
    ambient: 'none' as AmbientType,
    ambientVolume: 0.3,
    indicatorVolume: 0.5,
    enabled: false
  })

  const {
    soundConfig,
    setSoundConfig,
    playPhaseSound,
    startAmbientSound,
    stopAmbientSound,
    pauseAmbientSound,
    resumeAmbientSound,
    updateAmbientVolume,
    initializeAudio,
    previewSound
  } = useSound()

  // Sync sound config with localStorage on mount
  useEffect(() => {
    setSoundConfig(storedSoundConfig)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setStoredSoundConfig(soundConfig)
  }, [soundConfig, setStoredSoundConfig])
  const [sessionTime, setSessionTime] = useState(0)
  const [animationKey, setAnimationKey] = useState(0)
  const [totalCycleDuration, setTotalCycleDuration] = useState(0)

  const controls = useAnimation()
  const currentPattern = selectedPattern === 4 ? customDurations : breathingPatterns[selectedPattern]

  // Update total cycle duration when pattern changes
  useEffect(() => {
    const total = currentPattern.inhale + currentPattern.hold1 + currentPattern.exhale + currentPattern.hold2
    setTotalCycleDuration(total)
    // If we're currently breathing, restart from the beginning with new pattern
    if (isBreathing && phase !== 'idle') {
      setPhase('inhale')
      setAnimationKey(prev => prev + 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPattern, customDurations]) // Only trigger on actual pattern/duration changes, not derived values

  // Detect mobile device
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Smooth spring-based mouse tracking for liquid effect (disabled on mobile)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  // Subtle 3D tilt (disabled on mobile for performance)
  const rotateX = useTransform(smoothMouseY, [-300, 300], isMobile ? [0, 0] : [2, -2])
  const rotateY = useTransform(smoothMouseX, [-300, 300], isMobile ? [0, 0] : [-2, 2])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return // Skip mouse tracking on mobile
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    mouseX.set(x)
    mouseY.set(y)
  }

  const startBreathing = useCallback(() => {
    setIsBreathing(true)
    setPhase('inhale')
    setCycles(0)
    setSessionTime(0)
    setAnimationKey(prev => prev + 1) // Increment key to restart animation
    // Calculate total cycle duration
    const total = currentPattern.inhale + currentPattern.hold1 + currentPattern.exhale + currentPattern.hold2
    setTotalCycleDuration(total)
    if (soundConfig.enabled && soundConfig.ambient !== 'none') {
      startAmbientSound()
    }
  }, [soundConfig, startAmbientSound, currentPattern])

  const stopBreathing = useCallback(() => {
    setIsBreathing(false)
    setIsPaused(false)
    setPhase('idle')
    controls.start({ scale: 1 })
    setTotalBreaths(totalBreaths + cycles)
    stopAmbientSound()
  }, [controls, cycles, stopAmbientSound, setTotalBreaths, totalBreaths])

  const togglePause = useCallback(() => {
    if (isBreathing && phase !== 'idle') {
      setIsPaused(prev => {
        const newPaused = !prev
        if (newPaused) {
          pauseAmbientSound()
        } else {
          resumeAmbientSound()
        }
        return newPaused
      })
    }
  }, [isBreathing, phase, pauseAmbientSound, resumeAmbientSound])

  const getActivePhases = useCallback(() => {
    const phases = []
    if (currentPattern.inhale > 0) phases.push('inhale')
    if (currentPattern.hold1 > 0) phases.push('hold1')
    if (currentPattern.exhale > 0) phases.push('exhale')
    if (currentPattern.hold2 > 0) phases.push('hold2')
    return phases
  }, [currentPattern])

  // Handle ambient sound changes during active session
  useEffect(() => {
    if (isBreathing && soundConfig.enabled) {
      stopAmbientSound()
      if (soundConfig.ambient !== 'none') {
        const timer = setTimeout(() => {
          startAmbientSound()
        }, 100)
        return () => clearTimeout(timer)
      }
    }
  }, [soundConfig.ambient, isBreathing, soundConfig.enabled, stopAmbientSound, startAmbientSound])

  // Session timer
  useEffect(() => {
    if (!isBreathing || isPaused) return
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isBreathing, isPaused])

  useEffect(() => {
    if (!isBreathing || phase === 'idle' || isPaused) return

    const phaseDuration =
      phase === 'inhale' ? currentPattern.inhale :
        phase === 'hold1' ? currentPattern.hold1 :
          phase === 'exhale' ? currentPattern.exhale :
            currentPattern.hold2

    // Skip phases with 0 duration
    if (phaseDuration === 0) {
      switch (phase) {
        case 'inhale':
          setPhase('hold1')
          break
        case 'hold1':
          setPhase('exhale')
          break
        case 'exhale':
          setPhase('hold2')
          break
        case 'hold2':
          setPhase('inhale')
          setCycles(prev => prev + 1)
          break
      }
      return
    }

    // Reset countdown when phase changes
    setCountdown(phaseDuration)

    // Play sound for phase transition
    playPhaseSound(phase)

    // CSS animations handle the breathing orb scaling now

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return phaseDuration
        }
        return prev - 1
      })
    }, 1000)

    const timer = setTimeout(() => {
      switch (phase) {
        case 'inhale':
          setPhase('hold1')
          break
        case 'hold1':
          setPhase('exhale')
          break
        case 'exhale':
          setPhase('hold2')
          break
        case 'hold2':
          setPhase('inhale')
          setCycles(prev => prev + 1)
          break
      }
    }, phaseDuration * 1000)

    return () => {
      clearTimeout(timer)
      clearInterval(countdownInterval)
    }
  }, [phase, isBreathing, isPaused, currentPattern, controls, playPhaseSound, cycles])

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe in'
      case 'hold1':
        return 'Hold breath'
      case 'exhale':
        return 'Breathe out'
      case 'hold2':
        return 'Hold empty'
      case 'idle':
        return isPaused ? 'Paused' : 'Begin'
      default:
        return ''
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Spacebar to start/stop
      if (e.code === 'Space' && !showSettings) {
        e.preventDefault()
        if (isBreathing) {
          stopBreathing()
        } else {
          startBreathing()
        }
      }
      // Escape to close settings
      if (e.code === 'Escape' && showSettings) {
        setShowSettings(false)
        // Resume if was paused by settings
        if (isBreathing && isPaused) {
          setIsPaused(false)
        }
      }
      // 'S' to toggle settings
      if (e.code === 'KeyS' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setShowSettings(!showSettings)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isBreathing, showSettings, startBreathing, stopBreathing, isPaused])

  const activePhases = getActivePhases()
  const currentPhaseIndex = activePhases.indexOf(phase) + 1
  const totalPhases = activePhases.length

  return (
    <motion.div
      className={`min-h-screen bg-black flex flex-col items-center justify-center ${isMobile ? 'p-4' : 'p-8'} overflow-hidden relative`}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Gradient mesh background - Apple style */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] floating-gradient gpu-accelerated"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] floating-gradient gpu-accelerated"
          style={{ animationDelay: '5s' }}
        />
      </div>

      {/* Settings button */}
      <motion.button
        className="absolute top-8 right-8 z-20 p-3 rounded-full backdrop-blur-optimized"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: isMobile ? 'blur(8px)' : 'blur(20px)',
          WebkitBackdropFilter: isMobile ? 'blur(8px)' : 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onClick={() => {
          setShowSettings(!showSettings)
          // Auto-pause if breathing
          if (isBreathing && !showSettings) {
            setIsPaused(true)
          }
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/70">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
          {soundConfig.enabled && (
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
          )}
        </div>
      </motion.button>

      {/* Unified Stats Display */}
      <motion.div
        className={`absolute top-8 left-8 z-20`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="space-y-2">
          {/* Session stats - shown during breathing */}
          {isBreathing && (cycles > 0 || sessionTime > 0) && (
            <div className="bg-white/5 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
              <div className="text-xs text-white/50">Session {isPaused ? '(Paused)' : ''}</div>
              <div className="text-sm text-white/90 font-light">{formatTime(sessionTime)}</div>
              <div className="text-xs text-white/50 mt-1">Cycles: {cycles}</div>
            </div>
          )}

          {/* Total lifetime breaths - always shown */}
          {totalBreaths > 0 && (
            <div
              className="bg-white/5 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10 group cursor-pointer"
              onClick={() => {
                if (window.confirm('Reset total breath count?')) {
                  setTotalBreaths(0)
                }
              }}
              title="Click to reset"
            >
              <div className="text-xs text-white/50">Total lifetime</div>
              <div className="text-sm text-white/90 font-light">{totalBreaths} breaths</div>
              {!isBreathing && (
                <div className="text-xs text-white/30 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Click to reset</div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowSettings(false)
              // Resume if was paused by settings
              if (isBreathing && isPaused) {
                setIsPaused(false)
              }
            }}
          >
            <motion.div
              className={`bg-gray-900/90 backdrop-blur-xl rounded-3xl ${isMobile ? 'p-4 pb-20' : 'p-6 sm:p-8'} max-w-lg w-full my-auto border border-white/10 max-h-[90vh] ${isMobile ? 'flex flex-col' : ''}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`${isMobile ? 'flex-1 overflow-y-auto' : 'overflow-y-auto custom-scrollbar max-h-[calc(90vh-100px)]'}`} style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}>
                <h2 className="text-2xl font-light text-white mb-6">Breathing Patterns</h2>

                <div className="space-y-3 mb-6">
                  {breathingPatterns.map((pattern, index) => (
                    <motion.button
                      key={pattern.name}
                      className={`w-full text-left p-4 rounded-2xl transition-all ${selectedPattern === index
                        ? 'bg-blue-600/20 border border-blue-500/50'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      onClick={() => setSelectedPattern(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-white font-medium">{pattern.name}</div>
                          <div className="text-xs text-white/50 mt-1">{pattern.description}</div>
                        </div>
                        <div className="text-xs text-white/70">
                          {pattern.inhale}-{pattern.hold1}-{pattern.exhale}-{pattern.hold2}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Custom duration controls */}
                {selectedPattern === 4 && (
                  <motion.div
                    className="space-y-4 mb-6 p-4 bg-white/5 rounded-2xl"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <div>
                      <label className="text-xs text-white/50 block mb-2">Inhale ({customDurations.inhale}s)</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={customDurations.inhale}
                        onChange={(e) => setCustomDurations({ ...customDurations, inhale: Number(e.target.value) })}
                        className="w-full accent-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 block mb-2">Hold ({customDurations.hold1}s)</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={customDurations.hold1}
                        onChange={(e) => setCustomDurations({ ...customDurations, hold1: Number(e.target.value) })}
                        className="w-full accent-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 block mb-2">Exhale ({customDurations.exhale}s)</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={customDurations.exhale}
                        onChange={(e) => setCustomDurations({ ...customDurations, exhale: Number(e.target.value) })}
                        className="w-full accent-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 block mb-2">Hold Empty ({customDurations.hold2}s)</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={customDurations.hold2}
                        onChange={(e) => setCustomDurations({ ...customDurations, hold2: Number(e.target.value) })}
                        className="w-full accent-blue-500"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Sound Settings */}
                <div className="space-y-4 p-4 bg-white/5 rounded-2xl mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Enable Sounds</span>
                    <button
                      onClick={() => {
                        const newEnabled = !soundConfig.enabled
                        setSoundConfig({ ...soundConfig, enabled: newEnabled })
                        if (newEnabled) {
                          initializeAudio()
                        }
                      }}
                      className={`relative w-12 h-6 rounded-full transition-colors ${soundConfig.enabled ? 'bg-blue-500' : 'bg-gray-600'
                        }`}
                    >
                      <motion.div
                        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                        animate={{ x: soundConfig.enabled ? 24 : 0 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      />
                    </button>
                  </div>

                  {soundConfig.enabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-xs text-white/50 block mb-2">Phase Indicator Sound</label>
                        <div className="flex gap-2">
                          <select
                            value={soundConfig.phaseIndicator}
                            onChange={(e) => setSoundConfig({ ...soundConfig, phaseIndicator: e.target.value as SoundType })}
                            className="flex-1 bg-white/10 text-white rounded-lg px-3 py-2 text-sm border border-white/10"
                          >
                            <option value="bell">Bell</option>
                            <option value="chime">Wind Chime</option>
                            <option value="bowl">Tibetan Bowl</option>
                            <option value="gong">Deep Gong</option>
                            <option value="singing-bowl">Singing Bowl</option>
                            <option value="none">None</option>
                          </select>
                          {soundConfig.phaseIndicator !== 'none' && (
                            <button
                              onClick={() => previewSound(soundConfig.phaseIndicator)}
                              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                            >
                              Preview
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-white/50 block mb-2">Indicator Volume ({Math.round(soundConfig.indicatorVolume * 100)}%)</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={soundConfig.indicatorVolume * 100}
                          onChange={(e) => setSoundConfig({ ...soundConfig, indicatorVolume: Number(e.target.value) / 100 })}
                          className="w-full accent-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-white/50 block mb-2">Ambient Sound</label>
                        <select
                          value={soundConfig.ambient}
                          onChange={(e) => {
                            const newAmbient = e.target.value as AmbientType
                            setSoundConfig({ ...soundConfig, ambient: newAmbient })
                          }}
                          className="w-full bg-white/10 text-white rounded-lg px-3 py-2 text-sm border border-white/10"
                        >
                          <option value="none">None</option>
                          <option value="ocean">Ocean Waves</option>
                          <option value="rain">Light Rain</option>
                          <option value="forest">River Stream</option>
                          <option value="birds">Birds Chirping</option>
                          <option value="thunder">Thunder Storm</option>
                          <option value="wind">Wind</option>
                          <option value="whitenoise">White Noise</option>
                        </select>
                      </div>

                      {soundConfig.ambient !== 'none' && (
                        <div>
                          <label className="text-xs text-white/50 block mb-2">Ambient Volume ({Math.round(soundConfig.ambientVolume * 100)}%)</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={soundConfig.ambientVolume * 100}
                            onChange={(e) => {
                              const newVolume = Number(e.target.value) / 100
                              setSoundConfig({ ...soundConfig, ambientVolume: newVolume })
                              updateAmbientVolume(newVolume)
                            }}
                            className="w-full accent-blue-500"
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Keyboard shortcuts guide */}
                <div className="p-4 bg-white/5 rounded-2xl mb-6">
                  <h3 className="text-sm font-medium text-white/70 mb-2">Keyboard Shortcuts</h3>
                  <div className="space-y-1 text-xs text-white/50">
                    <div className="flex justify-between">
                      <span>Start/Stop</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded">Space</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Settings</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded">S</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Close Settings</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded">Esc</kbd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Done button - fixed on mobile */}
              <button
                onClick={() => {
                  setShowSettings(false)
                  // Resume if was paused by settings
                  if (isBreathing && isPaused) {
                    setIsPaused(false)
                  }
                }}
                className={`${isMobile ? 'fixed bottom-4 left-4 right-4 z-40' : 'w-full mt-4'} py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors backdrop-blur-md`}
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`max-w-2xl w-full ${isMobile ? 'space-y-6' : 'space-y-12'} text-center relative z-10`}>
        {/* Apple-style typography */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
        >
          <h1 className={`${isMobile ? 'text-5xl' : 'text-7xl'} font-semibold text-white tracking-tight mb-4`}
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
            Breathe
          </h1>
          <p className="text-xl text-gray-400 font-light">
            {breathingPatterns[selectedPattern].name}
          </p>
        </motion.div>

        {/* Main breathing visualization */}
        <motion.div
          className={`relative ${isMobile ? 'w-80 h-80' : 'w-96 h-96'} mx-auto`}
          style={{
            perspective: 1200,
            transformStyle: 'preserve-3d'
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Multiple glass layers for depth */}
          <motion.div
            className="absolute inset-8"
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
              cursor: isBreathing && phase !== 'idle' ? 'pointer' : 'default'
            }}
            onClick={isBreathing && phase !== 'idle' ? togglePause : undefined}
            whileHover={isBreathing && phase !== 'idle' && !isMobile ? { scale: 1.01 } : {}}
            whileTap={isBreathing && phase !== 'idle' ? { scale: 0.99 } : {}}
          >
            {/* Outer glass ring */}
            <div
              className={`absolute inset-0 rounded-full backdrop-blur-optimized ${isMobile ? 'mobile-simple-shadow' : ''}`}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                backdropFilter: isMobile ? 'blur(8px)' : 'blur(20px)',
                WebkitBackdropFilter: isMobile ? 'blur(8px)' : 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: isMobile
                  ? undefined
                  : 'inset 0 0 40px rgba(255,255,255,0.05), 0 20px 40px -20px rgba(0,0,0,0.5)',
                transform: isBreathing ? 'scale(1.02)' : 'scale(1)',
                transition: 'transform 2s cubic-bezier(0.32, 0.72, 0, 1)'
              }}
            />

            {/* Inner breathing orb */}
            <div className="absolute inset-8 flex items-center justify-center">
              <div
                className={`${isMobile ? 'w-40 h-40' : 'w-48 h-48'} rounded-full relative breathing-orb backdrop-blur-optimized ${!isPaused && (
                    phase === 'inhale' ? 'breathing-inhale' :
                      phase === 'hold1' ? 'breathing-hold1' :
                        phase === 'exhale' ? 'breathing-exhale' :
                          phase === 'hold2' ? 'breathing-hold2' : ''
                  )
                  } ${isMobile ? 'mobile-simple-shadow' : ''}`}
                style={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ['--inhale-duration' as any]: `${currentPattern.inhale}s`,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ['--hold1-duration' as any]: `${currentPattern.hold1}s`,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ['--exhale-duration' as any]: `${currentPattern.exhale}s`,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ['--hold2-duration' as any]: `${currentPattern.hold2}s`,
                  background: phase === 'idle'
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)'
                    : phase === 'inhale' || phase === 'hold1'
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(147, 51, 234, 0.5) 100%)'
                      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
                  backdropFilter: isMobile ? 'blur(12px)' : 'blur(40px)',
                  WebkitBackdropFilter: isMobile ? 'blur(12px)' : 'blur(40px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: isMobile
                    ? undefined
                    : `
                      inset 0 0 30px rgba(255,255,255,0.1),
                      0 0 60px rgba(59, 130, 246, ${isBreathing ? 0.3 : 0.1}),
                      0 0 100px rgba(147, 51, 234, ${isBreathing ? 0.2 : 0.05})
                    `,
                  transition: 'background 0.6s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.6s cubic-bezier(0.32, 0.72, 0, 1)'
                }}
              >
                {/* Liquid highlight - disable rotation on mobile */}
                {!isMobile && (
                  <motion.div
                    className="absolute inset-2 rounded-full gpu-accelerated"
                    style={{
                      background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 60%)',
                    }}
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 30,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                )}

                {/* Phase indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={phase}
                      initial={{ opacity: 0, scale: 0.8, filter: isMobile ? 'none' : 'blur(10px)' }}
                      animate={{ opacity: 1, scale: 1, filter: isMobile ? 'none' : 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 0.8, filter: isMobile ? 'none' : 'blur(10px)' }}
                      transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                      className="text-center"
                    >
                      <div className={`${isMobile ? 'text-5xl' : 'text-7xl'} font-ultralight text-white mb-1`}
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
                        {phase !== 'idle' ? (isPaused ? '||' : countdown) : '–'}
                      </div>
                      <div className="text-sm font-medium text-white/80 tracking-wide uppercase">
                        {isPaused && phase !== 'idle' ? 'Paused' : getPhaseText()}
                      </div>
                      {phase !== 'idle' && totalPhases > 0 && (
                        <div className="text-xs font-light text-white/40 mt-1">
                          {isPaused ? 'Tap to resume' : `Phase ${currentPhaseIndex} of ${totalPhases}`}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 320 320">
              <circle
                cx="160"
                cy="160"
                r="156"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
              {isBreathing && phase !== 'idle' && totalCycleDuration > 0 && (
                <circle
                  key={animationKey} // Only restart when session starts
                  cx="160"
                  cy="160"
                  r="156"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={980}
                  className="progress-ring-cycle"
                  style={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ['--cycle-duration' as any]: `${totalCycleDuration}s`,
                    strokeDashoffset: 980,
                    animationPlayState: isPaused ? 'paused' : 'running'
                  }}
                />
              )}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
                  <stop offset="100%" stopColor="rgba(147, 51, 234, 0.8)" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </motion.div>


        {/* Control button - Apple style */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.32, 0.72, 0, 1] }}
        >
          <AnimatePresence mode="wait">
            {!isBreathing ? (
              <motion.button
                key="start"
                onClick={startBreathing}
                className="relative group px-10 py-5 rounded-full overflow-hidden backdrop-blur-optimized"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
                  backdropFilter: isMobile ? 'blur(8px)' : 'blur(20px)',
                  WebkitBackdropFilter: isMobile ? 'blur(8px)' : 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 10px 40px -10px rgba(59, 130, 246, 0.4)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)',
                  }}
                />
                <span className="relative z-10 text-white font-light text-lg tracking-wide pointer-events-none">
                  Start Session
                </span>
              </motion.button>
            ) : (
              <motion.button
                key="stop"
                onClick={stopBreathing}
                className="relative group px-10 py-5 rounded-full overflow-hidden backdrop-blur-optimized"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: isMobile ? 'blur(8px)' : 'blur(20px)',
                  WebkitBackdropFilter: isMobile ? 'blur(8px)' : 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                  }}
                />
                <span className="relative z-10 text-white/70 font-light text-lg tracking-wide pointer-events-none">
                  End Session
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer attribution */}
      <motion.div
        className={`${isMobile ? 'fixed' : 'absolute'} bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-white/30 text-center`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <div>
          Open source on{' '}
          <a
            href="https://github.com/clouxart/breathe"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/50 transition-colors underline"
          >
            GitHub
          </a>
          {' '}•{' '}
          Made by{' '}
          <a
            href="https://clouxart.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/50 transition-colors underline"
          >
            Clouxart
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}