import React, { useState } from 'react'
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Dimensions,
  Platform
} from 'react-native'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import Slider from '@react-native-community/slider'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { BreathingPattern, SoundConfig, SoundType, AmbientType } from '../types'
import { useSound } from '../hooks/useSound'


interface SettingsPanelProps {
  visible: boolean
  onClose: () => void
  patterns: BreathingPattern[]
  selectedPattern: number
  onPatternChange: (index: number) => void
  customDurations: BreathingPattern
  onCustomDurationChange: (durations: BreathingPattern) => void
  soundConfig: SoundConfig
  onSoundConfigChange: (config: SoundConfig) => void
}

type TabType = 'patterns' | 'sounds'

const PHASE_SOUNDS: { value: SoundType | 'none'; label: string }[] = [
  { value: 'bell', label: 'Bell' },
  { value: 'chime', label: 'Chime' },
  { value: 'gong', label: 'Gong' },
  { value: 'none', label: 'None' }
]

const AMBIENT_SOUNDS: { value: AmbientType | 'none'; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'rain', label: 'Rain' },
  { value: 'forest', label: 'Forest' }
]

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  visible,
  onClose,
  patterns,
  selectedPattern,
  onPatternChange,
  customDurations,
  onCustomDurationChange,
  soundConfig,
  onSoundConfigChange
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('patterns')
  const { previewSound, stopPreviewSounds, initializeAudio } = useSound()

  const updateCustomDuration = (key: keyof BreathingPattern, value: number) => {
    if (key === 'name' || key === 'description') return
    onCustomDurationChange({
      ...customDurations,
      [key]: value
    })
  }

  const handlePreviewSound = async (type: 'phase' | 'ambient', sound: SoundType | AmbientType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (sound !== 'none') {
      await previewSound(type, sound)
    }
  }

  const handleClose = () => {
    stopPreviewSounds()
    onClose()
  }

  const renderPatternCard = (pattern: BreathingPattern, index: number) => {
    const isSelected = selectedPattern === index
    const total = pattern.inhale + pattern.hold1 + pattern.exhale + pattern.hold2

    return (
      <TouchableOpacity
        key={index}
        style={[styles.patternCard, isSelected && styles.patternCardActive]}
        onPress={() => {
          onPatternChange(index)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }}
        activeOpacity={0.8}
      >
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
          </View>
        )}
        
        {/* Pattern timing visual */}
        <View style={styles.timingBar}>
          <View 
            style={[styles.timingSegment, styles.inhaleSegment, { flex: pattern.inhale }]} 
          />
          {pattern.hold1 > 0 && (
            <View 
              style={[styles.timingSegment, styles.hold1Segment, { flex: pattern.hold1 }]} 
            />
          )}
          <View 
            style={[styles.timingSegment, styles.exhaleSegment, { flex: pattern.exhale }]} 
          />
          {pattern.hold2 > 0 && (
            <View 
              style={[styles.timingSegment, styles.hold2Segment, { flex: pattern.hold2 }]} 
            />
          )}
        </View>

        <Text style={[styles.patternName, isSelected && styles.patternNameActive]}>
          {pattern.name}
        </Text>
        <Text style={styles.patternDescription}>{pattern.description}</Text>
        <View style={styles.patternFooter}>
          <Text style={styles.patternDuration}>
            {pattern.inhale}-{pattern.hold1}-{pattern.exhale}-{pattern.hold2}
          </Text>
          <Text style={styles.patternTotal}>{total}s total</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={StyleSheet.absoluteFillObject}>
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFillObject}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
          />
        </BlurView>
        
        <SafeAreaView style={styles.modalContainer} pointerEvents="box-none">
          <View style={styles.panel}>
            <BlurView intensity={60} style={styles.panelBlur}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.02)']}
                locations={[0, 0.5, 1]}
                style={styles.panelGradient}
              >
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>Settings</Text>
                  <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <BlurView intensity={20} style={styles.closeButtonBlur}>
                      <Text style={styles.closeButtonText}>✕</Text>
                    </BlurView>
                  </TouchableOpacity>
                </View>

                {/* Tab Navigation */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'patterns' && styles.tabActive]}
                    onPress={() => setActiveTab('patterns')}
                  >
                    <Text style={[styles.tabText, activeTab === 'patterns' && styles.tabTextActive]}>
                      Patterns
                    </Text>
                    {activeTab === 'patterns' && (
                      <LinearGradient
                        colors={['transparent', 'rgba(59, 130, 246, 0.8)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.tabIndicator}
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'sounds' && styles.tabActive]}
                    onPress={() => setActiveTab('sounds')}
                  >
                    <Text style={[styles.tabText, activeTab === 'sounds' && styles.tabTextActive]}>
                      Sounds
                    </Text>
                    {activeTab === 'sounds' && (
                      <LinearGradient
                        colors={['transparent', 'rgba(59, 130, 246, 0.8)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.tabIndicator}
                      />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Tab Content */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                  {activeTab === 'patterns' ? (
                    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
                      <View style={styles.patternGrid}>
                        {patterns.map((pattern, index) => renderPatternCard(pattern, index))}
                      </View>

                      {/* Custom Pattern Controls */}
                      {selectedPattern === patterns.length - 1 && (
                        <Animated.View 
                          entering={FadeIn.duration(300)}
                          style={styles.customSection}
                        >
                          <Text style={styles.customTitle}>Customize Your Pattern</Text>
                          
                          {[
                            { key: 'inhale', label: 'Inhale', color: '#3B82F6' },
                            { key: 'hold1', label: 'Hold', color: '#9333EA' },
                            { key: 'exhale', label: 'Exhale', color: 'rgba(59, 130, 246, 0.6)' },
                            { key: 'hold2', label: 'Hold Empty', color: 'rgba(147, 51, 234, 0.6)' }
                          ].map((phase) => (
                            <View key={phase.key} style={styles.sliderRow}>
                              <View style={styles.sliderHeader}>
                                <Text style={styles.sliderLabel}>{phase.label}</Text>
                                <Text style={styles.sliderValue}>
                                  {customDurations[phase.key as keyof typeof customDurations]}s
                                </Text>
                              </View>
                              <View style={styles.sliderWrapper}>
                                <Slider
                                  style={styles.slider}
                                  minimumValue={0}
                                  maximumValue={10}
                                  step={1}
                                  value={customDurations[phase.key as keyof typeof customDurations] as number}
                                  onValueChange={(value: number) => updateCustomDuration(phase.key as keyof BreathingPattern, value)}
                                  minimumTrackTintColor={phase.color}
                                  maximumTrackTintColor="rgba(255, 255, 255, 0.1)"
                                  thumbTintColor="#FFFFFF"
                                />
                              </View>
                            </View>
                          ))}
                        </Animated.View>
                      )}
                    </Animated.View>
                  ) : (
                    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
                      {/* Master Toggle */}
                      <View style={styles.soundCard}>
                        <View style={styles.soundCardHeader}>
                          <View>
                            <Text style={styles.soundCardTitle}>Enable Sounds</Text>
                            <Text style={styles.soundCardSubtitle}>Play audio cues during breathing</Text>
                          </View>
                          <Switch
                            value={soundConfig.enabled}
                            onValueChange={(value: boolean) => {
                              onSoundConfigChange({ ...soundConfig, enabled: value })
                              if (value) {
                                initializeAudio()
                              } else {
                                stopPreviewSounds()
                              }
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                            }}
                            trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#3B82F6' }}
                            thumbColor="#FFFFFF"
                          />
                        </View>
                      </View>

                      {soundConfig.enabled && (
                        <Animated.View entering={FadeIn.duration(300)}>
                          {/* Phase Indicator Sound */}
                          <View style={styles.soundCard}>
                            <Text style={styles.soundSectionTitle}>Phase Indicator</Text>
                            
                            <View style={styles.soundSelectContainer}>
                              {PHASE_SOUNDS.map((sound) => (
                                <TouchableOpacity
                                  key={sound.value}
                                  style={[
                                    styles.soundOption,
                                    soundConfig.phaseIndicator === sound.value && styles.soundOptionActive
                                  ]}
                                  onPress={() => {
                                    onSoundConfigChange({ ...soundConfig, phaseIndicator: sound.value as SoundType })
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                  }}
                                >
                                  <Text style={[
                                    styles.soundOptionText,
                                    soundConfig.phaseIndicator === sound.value && styles.soundOptionTextActive
                                  ]}>
                                    {sound.label}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                            
                            {soundConfig.phaseIndicator !== 'none' && soundConfig.phaseIndicator && (
                              <>
                                <TouchableOpacity
                                  style={styles.previewButton}
                                  onPress={() => handlePreviewSound('phase', soundConfig.phaseIndicator)}
                                >
                                  <LinearGradient
                                    colors={['rgba(59, 130, 246, 0.2)', 'rgba(147, 51, 234, 0.2)']}
                                    style={styles.previewButtonGradient}
                                  >
                                    <Text style={styles.previewButtonText}>Preview</Text>
                                  </LinearGradient>
                                </TouchableOpacity>
                                
                                <View style={styles.sliderRow}>
                              <View style={styles.sliderHeader}>
                                <Text style={styles.sliderLabel}>Volume</Text>
                                <Text style={styles.sliderValue}>
                                  {Math.round(soundConfig.indicatorVolume * 100)}%
                                </Text>
                              </View>
                              <View style={styles.sliderWrapper}>
                                <Slider
                                  style={styles.slider}
                                  minimumValue={0}
                                  maximumValue={1}
                                  step={0.05}
                                  value={soundConfig.indicatorVolume}
                                  onValueChange={(value: number) => 
                                    onSoundConfigChange({ ...soundConfig, indicatorVolume: value })
                                  }
                                  minimumTrackTintColor="#3B82F6"
                                  maximumTrackTintColor="rgba(255, 255, 255, 0.1)"
                                  thumbTintColor="#FFFFFF"
                                />
                              </View>
                            </View>
                              </>
                            )}
                          </View>

                          {/* Ambient Sound */}
                          <View style={styles.soundCard}>
                            <Text style={styles.soundSectionTitle}>Ambient Sound</Text>
                            
                            <View style={styles.soundSelectContainer}>
                              {AMBIENT_SOUNDS.map((sound) => (
                                <TouchableOpacity
                                  key={sound.value}
                                  style={[
                                    styles.soundOption,
                                    soundConfig.ambient === sound.value && styles.soundOptionActive
                                  ]}
                                  onPress={() => {
                                    onSoundConfigChange({ ...soundConfig, ambient: sound.value as AmbientType })
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                  }}
                                >
                                  <Text style={[
                                    styles.soundOptionText,
                                    soundConfig.ambient === sound.value && styles.soundOptionTextActive
                                  ]}>
                                    {sound.label}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                            
                            {soundConfig.ambient !== 'none' && soundConfig.ambient && (
                              <>
                                <TouchableOpacity
                                  style={styles.previewButton}
                                  onPress={() => handlePreviewSound('ambient', soundConfig.ambient)}
                                >
                                  <LinearGradient
                                    colors={['rgba(59, 130, 246, 0.2)', 'rgba(147, 51, 234, 0.2)']}
                                    style={styles.previewButtonGradient}
                                  >
                                    <Text style={styles.previewButtonText}>Preview</Text>
                                  </LinearGradient>
                                </TouchableOpacity>
                                
                                <View style={styles.sliderRow}>
                                <View style={styles.sliderHeader}>
                                  <Text style={styles.sliderLabel}>Volume</Text>
                                  <Text style={styles.sliderValue}>
                                    {Math.round(soundConfig.ambientVolume * 100)}%
                                  </Text>
                                </View>
                                <View style={styles.sliderWrapper}>
                                  <Slider
                                    style={styles.slider}
                                    minimumValue={0}
                                    maximumValue={1}
                                    step={0.05}
                                    value={soundConfig.ambientVolume}
                                    onValueChange={(value: number) => 
                                      onSoundConfigChange({ ...soundConfig, ambientVolume: value })
                                    }
                                    minimumTrackTintColor="#3B82F6"
                                    maximumTrackTintColor="rgba(255, 255, 255, 0.1)"
                                    thumbTintColor="#FFFFFF"
                                  />
                                </View>
                              </View>
                              </>
                            )}
                          </View>
                        </Animated.View>
                      )}
                    </Animated.View>
                  )}
                </ScrollView>
              </LinearGradient>
            </BlurView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40
  },
  panel: {
    width: '100%',
    maxWidth: 480,
    flex: 1,
    maxHeight: 700,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 15
  },
  panelBlur: {
    flex: 1
  },
  panelGradient: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)'
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.5
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden'
  },
  closeButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
  },
  closeButtonText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)'
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)'
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative'
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)'
  },
  tabText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '400'
  },
  tabTextActive: {
    color: '#FFFFFF'
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  patternGrid: {
    marginBottom: 20
  },
  patternCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)'
  },
  patternCardActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.25)'
  },
  selectedIndicator: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 1
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  timingBar: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12
  },
  timingSegment: {
    height: '100%'
  },
  inhaleSegment: {
    backgroundColor: '#3B82F6'
  },
  hold1Segment: {
    backgroundColor: '#9333EA'
  },
  exhaleSegment: {
    backgroundColor: 'rgba(59, 130, 246, 0.6)'
  },
  hold2Segment: {
    backgroundColor: 'rgba(147, 51, 234, 0.6)'
  },
  patternName: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4
  },
  patternNameActive: {
    color: '#FFFFFF'
  },
  patternDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8
  },
  patternFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  patternDuration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'
  },
  patternTotal: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)'
  },
  customSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)'
  },
  customTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16
  },
  sliderRow: {
    marginTop: 12,
    marginBottom: 8
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  sliderLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)'
  },
  sliderValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'
  },
  sliderWrapper: {
    paddingHorizontal: Platform.OS === 'ios' ? 8 : 0
  },
  slider: {
    width: '100%',
    height: 40,
    marginLeft: Platform.OS === 'ios' ? -8 : 0,
    marginRight: Platform.OS === 'ios' ? -8 : 0
  },
  soundCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  soundCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  soundCardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4
  },
  soundCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)'
  },
  soundSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12
  },
  soundSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
  soundOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  soundOptionActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(59, 130, 246, 0.4)'
  },
  soundOptionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)'
  },
  soundOptionTextActive: {
    color: '#FFFFFF'
  },
  previewButton: {
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 8
  },
  previewButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)'
  },
  previewButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500'
  }
})