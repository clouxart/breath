import React, { useState, useEffect, useCallback } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar
} from 'react-native'
import { BlurView } from 'expo-blur'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated'
import { BreathingOrb } from './components/BreathingOrb'
import { SettingsPanel } from './components/SettingsPanel'
import { useSound } from './hooks/useSound'
import { useLocalStorage } from './hooks/useLocalStorage'
import { BreathingPattern, Phase, SoundConfig } from './types'

const breathingPatterns: BreathingPattern[] = [
  { name: 'Box Breathing', inhale: 4, hold1: 4, exhale: 4, hold2: 4, description: 'Navy SEALs technique for focus' },
  { name: '4-7-8 Breathing', inhale: 4, hold1: 7, exhale: 8, hold2: 0, description: 'Dr. Weil\'s technique for sleep' },
  { name: 'Wim Hof', inhale: 2, hold1: 0, exhale: 2, hold2: 0, description: 'Quick energizing breaths' },
  { name: 'Calm', inhale: 5, hold1: 0, exhale: 5, hold2: 0, description: 'Simple relaxation pattern' },
  { name: 'Custom', inhale: 4, hold1: 4, exhale: 4, hold2: 4, description: 'Create your own pattern' }
]


export default function App() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [isBreathing, setIsBreathing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [cycles, setCycles] = useState(0)
  const [countdown, setCountdown] = useState(4)
  const [showSettings, setShowSettings] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)

  const [selectedPattern, setSelectedPattern] = useLocalStorage('breathingPattern', 0)
  const [customDurations, setCustomDurations] = useLocalStorage('customDurations', 
    { name: 'Custom', inhale: 4, hold1: 4, exhale: 4, hold2: 4, description: 'Create your own pattern' }
  )
  const [totalBreaths, setTotalBreaths] = useLocalStorage('totalBreaths', 0)
  const [storedSoundConfig, setStoredSoundConfig] = useLocalStorage<SoundConfig>('soundConfig', {
    phaseIndicator: 'bell',
    ambient: 'none',
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
    initializeAudio,
    stopPhaseSounds
  } = useSound()

  useEffect(() => {
    setSoundConfig(storedSoundConfig)
    initializeAudio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setStoredSoundConfig(soundConfig)
  }, [soundConfig, setStoredSoundConfig])

  const currentPattern = selectedPattern === 4 ? customDurations : breathingPatterns[selectedPattern]

  const getActivePhases = useCallback(() => {
    const phases = []
    if (currentPattern.inhale > 0) phases.push('inhale')
    if (currentPattern.hold1 > 0) phases.push('hold1')
    if (currentPattern.exhale > 0) phases.push('exhale')
    if (currentPattern.hold2 > 0) phases.push('hold2')
    return phases
  }, [currentPattern])

  const startBreathing = useCallback(() => {
    setIsBreathing(true)
    setPhase('inhale')
    setCycles(0)
    setSessionTime(0)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (soundConfig.enabled && soundConfig.ambient !== 'none') {
      startAmbientSound()
    }
  }, [soundConfig, startAmbientSound])

  const stopBreathing = useCallback(() => {
    setIsBreathing(false)
    setIsPaused(false)
    setPhase('idle')
    setTotalBreaths(totalBreaths + cycles)
    stopAmbientSound()
    stopPhaseSounds()
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }, [cycles, stopAmbientSound, stopPhaseSounds, setTotalBreaths, totalBreaths])

  const togglePause = useCallback(() => {
    if (isBreathing && phase !== 'idle') {
      setIsPaused(prev => {
        const newPaused = !prev
        if (newPaused) {
          pauseAmbientSound()
          stopPhaseSounds()
        } else {
          resumeAmbientSound()
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        return newPaused
      })
    }
  }, [isBreathing, phase, pauseAmbientSound, resumeAmbientSound, stopPhaseSounds])

  // Session timer
  useEffect(() => {
    if (!isBreathing || isPaused) return
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isBreathing, isPaused])

  // Breathing cycle logic
  useEffect(() => {
    if (!isBreathing || phase === 'idle' || isPaused) return

    const phaseDuration =
      phase === 'inhale' ? currentPattern.inhale :
      phase === 'hold1' ? currentPattern.hold1 :
      phase === 'exhale' ? currentPattern.exhale :
      currentPattern.hold2

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

    setCountdown(phaseDuration)
    playPhaseSound()

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
  }, [phase, isBreathing, isPaused, currentPattern, playPhaseSound])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const activePhases = getActivePhases()
  const currentPhaseIndex = activePhases.indexOf(phase) + 1
  const totalPhases = activePhases.length

  // Animated values for gradient blobs
  const blob1X = useSharedValue(0)
  const blob1Y = useSharedValue(0)
  const blob2X = useSharedValue(0)
  const blob2Y = useSharedValue(0)

  // Start blob animations
  useEffect(() => {
    blob1X.value = withRepeat(
      withSequence(
        withTiming(50, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-50, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    )
    blob1Y.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-30, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    )
    blob2X.value = withRepeat(
      withSequence(
        withTiming(-40, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        withTiming(40, { duration: 3500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    )
    blob2Y.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 4500, easing: Easing.inOut(Easing.ease) }),
        withTiming(30, { duration: 4500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const blob1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: blob1X.value },
      { translateY: blob1Y.value },
      { scale: 1.2 },
      { rotate: '45deg' }
    ]
  }))

  const blob2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: blob2X.value },
      { translateY: blob2Y.value },
      { scale: 1.2 },
      { rotate: '-45deg' }
    ]
  }))

  return (
    <View style={styles.container}>
      {/* Deep gradient background */}
      <LinearGradient
        colors={['#0a0a0f', '#0f0f23', '#1a1a3e', '#0f0f23', '#0a0a0f']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Animated gradient blobs with blur */}
      <View style={styles.gradientContainer} pointerEvents="none">
        <Animated.View style={[styles.gradientBlob, styles.gradientBlob1, blob1Style]}>
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0.2)', 'transparent']}
            style={styles.gradientInner}
          />
        </Animated.View>
        <Animated.View style={[styles.gradientBlob, styles.gradientBlob2, blob2Style]}>
          <LinearGradient
            colors={['rgba(147, 51, 234, 0.4)', 'rgba(147, 51, 234, 0.2)', 'transparent']}
            style={styles.gradientInner}
          />
        </Animated.View>
      </View>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          {/* Stats */}
          <View style={styles.statsContainer}>
            {isBreathing && (cycles > 0 || sessionTime > 0) && (
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Session</Text>
                <Text style={styles.statValue}>{formatTime(sessionTime)}</Text>
                <Text style={styles.statLabel}>Cycles: {cycles}</Text>
              </View>
            )}
            {totalBreaths > 0 && (
              <TouchableOpacity
                style={styles.statBox}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
                  setTotalBreaths(0)
                }}
              >
                <Text style={styles.statLabel}>Total</Text>
                <Text style={styles.statValue}>{totalBreaths}</Text>
                <Text style={styles.statLabel}>breaths</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Settings button */}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              setShowSettings(true)
              if (isBreathing) {
                setIsPaused(true)
                stopPhaseSounds()
              }
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }}
          >
            <BlurView intensity={30} style={styles.settingsBlur}>
              <View style={styles.settingsIcon}>
                <View style={[styles.dot, soundConfig.enabled && styles.dotActive]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Main content */}
        <View style={styles.content}>
          {/* Title and pattern selector */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Breathe</Text>
            <TouchableOpacity
              onPress={() => {
                const nextPattern = (selectedPattern + 1) % breathingPatterns.length
                setSelectedPattern(nextPattern)
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              }}
            >
              <View style={styles.patternSelector}>
                <Text style={styles.patternName}>{breathingPatterns[selectedPattern].name}</Text>
                <Text style={styles.patternDuration}>
                  ({currentPattern.inhale}-{currentPattern.hold1}-{currentPattern.exhale}-{currentPattern.hold2})
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Breathing Orb */}
          <BreathingOrb
            phase={phase}
            isPaused={isPaused}
            countdown={countdown}
            pattern={currentPattern}
            currentPhaseIndex={currentPhaseIndex}
            totalPhases={totalPhases}
            onPress={isBreathing && phase !== 'idle' ? togglePause : undefined}
          />

          {/* Control button */}
          <View style={styles.controls}>
            {!isBreathing ? (
              <TouchableOpacity
                style={styles.startButton}
                onPress={startBreathing}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(59, 130, 246, 0.6)', 'rgba(147, 51, 234, 0.6)']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <BlurView intensity={20} style={styles.buttonBlur}>
                    <Text style={styles.buttonText}>Start Session</Text>
                  </BlurView>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopBreathing}
              >
                <Text style={styles.buttonText}>End Session</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Settings Panel */}
        <SettingsPanel
          visible={showSettings}
          onClose={() => {
            setShowSettings(false)
            if (isBreathing && isPaused) {
              setIsPaused(false)
              resumeAmbientSound()
            }
          }}
          patterns={breathingPatterns}
          selectedPattern={selectedPattern}
          onPatternChange={setSelectedPattern}
          customDurations={customDurations}
          onCustomDurationChange={setCustomDurations}
          soundConfig={soundConfig}
          onSoundConfigChange={setSoundConfig}
        />
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Open source on{' '}
            <Text style={styles.footerLink}>GitHub</Text>
            {' '}• Made by{' '}
            <Text style={styles.footerLink}>Clouxart</Text>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  safeArea: {
    flex: 1,
    paddingTop: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 10,
    zIndex: 10,
    elevation: 10
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    minWidth: 80
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase'
  },
  statValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
    marginVertical: 2
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    zIndex: 11,
    elevation: 11
  },
  settingsBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  settingsIcon: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginVertical: 2
  },
  dotActive: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    paddingBottom: 60
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20
  },
  title: {
    fontSize: 52,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -1
  },
  patternSelector: {
    alignItems: 'center'
  },
  patternName: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '300',
    marginBottom: 2
  },
  patternDuration: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.35)',
    marginTop: 2,
    fontWeight: '200'
  },
  controls: {
    width: '100%',
    alignItems: 'center'
  },
  startButton: {
    borderRadius: 30,
    overflow: 'hidden'
  },
  stopButton: {
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  buttonGradient: {
    borderRadius: 30,
    overflow: 'hidden'
  },
  buttonBlur: {
    paddingHorizontal: 50,
    paddingVertical: 18,
    backgroundColor: 'transparent'
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 1
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden'
  },
  gradientBlob: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    overflow: 'hidden'
  },
  gradientBlob1: {
    top: -200,
    left: -150
  },
  gradientBlob2: {
    bottom: -200,
    right: -150
  },
  gradientInner: {
    width: '100%',
    height: '100%'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    textAlign: 'center'
  },
  footerLink: {
    color: 'rgba(255, 255, 255, 0.4)',
    textDecorationLine: 'underline'
  }
})