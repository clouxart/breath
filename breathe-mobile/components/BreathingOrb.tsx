import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  cancelAnimation
} from 'react-native-reanimated'
import { Phase, BreathingPattern } from '../types'

const { width } = Dimensions.get('window')
const ORB_SIZE = width * 0.6

interface BreathingOrbProps {
  phase: Phase
  isPaused: boolean
  countdown: number
  pattern: BreathingPattern
  currentPhaseIndex: number
  totalPhases: number
  onPress?: () => void
}

export const BreathingOrb: React.FC<BreathingOrbProps> = ({
  phase,
  isPaused,
  countdown,
  pattern,
  currentPhaseIndex,
  totalPhases,
  onPress
}) => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(0.25)

  useEffect(() => {
    if (phase === 'idle' || isPaused) {
      cancelAnimation(scale)
      cancelAnimation(opacity)
      scale.value = withTiming(1, { duration: 500 })
      opacity.value = withTiming(0.25, { duration: 500 })
      return
    }

    const animate = () => {
      switch (phase) {
        case 'inhale':
          scale.value = withTiming(1.3, {
            duration: pattern.inhale * 1000,
            easing: Easing.bezier(0.32, 0.72, 0, 1)
          })
          opacity.value = withTiming(0.45, {
            duration: pattern.inhale * 1000
          })
          break
        case 'hold1':
          // Hold at expanded state
          break
        case 'exhale':
          scale.value = withTiming(1, {
            duration: pattern.exhale * 1000,
            easing: Easing.bezier(0.32, 0.72, 0, 1)
          })
          opacity.value = withTiming(0.25, {
            duration: pattern.exhale * 1000
          })
          break
        case 'hold2':
          // Hold at contracted state
          break
      }
    }

    animate()
  }, [phase, isPaused, pattern, scale, opacity])

  const animatedOrbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    }
  })

  const animatedInnerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value
    }
  })

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

  return (
    <TouchableOpacity 
      style={styles.container}
      activeOpacity={phase !== 'idle' ? 0.9 : 1}
      onPress={onPress}
      disabled={phase === 'idle'}
    >
      <Animated.View style={[styles.orbContainer, animatedOrbStyle]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
          style={styles.outerRing}
        >
          <BlurView intensity={10} style={styles.blurContainer}>
            <Animated.View style={[styles.innerOrbContainer, animatedInnerStyle]}>
              <LinearGradient
                colors={['rgba(59, 130, 246, 0.3)', 'rgba(147, 51, 234, 0.3)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.innerOrb}
              >
                <View style={styles.textContainer}>
              <Text style={styles.countdownText}>
                {phase !== 'idle' ? (isPaused ? '||' : countdown) : '–'}
              </Text>
              <Text style={styles.phaseText}>
                {isPaused && phase !== 'idle' ? 'Paused' : getPhaseText()}
              </Text>
              {phase !== 'idle' && totalPhases > 0 && (
                <Text style={styles.phaseIndicator}>
                  {isPaused ? 'Tap to resume' : `Phase ${currentPhaseIndex} of ${totalPhases}`}
                </Text>
              )}
                </View>
              </LinearGradient>
            </Animated.View>
          </BlurView>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: ORB_SIZE + 80,
    marginVertical: 20
  },
  orbContainer: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    alignItems: 'center',
    justifyContent: 'center'
  },
  outerRing: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  blurContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  innerOrbContainer: {
    width: ORB_SIZE * 0.7,
    height: ORB_SIZE * 0.7,
    borderRadius: (ORB_SIZE * 0.7) / 2,
    overflow: 'hidden'
  },
  innerOrb: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: (ORB_SIZE * 0.7) / 2
  },
  textContainer: {
    alignItems: 'center'
  },
  countdownText: {
    fontSize: 56,
    fontWeight: '200',
    color: '#FFFFFF',
    marginBottom: 4
  },
  phaseText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  phaseIndicator: {
    fontSize: 12,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 4
  }
})