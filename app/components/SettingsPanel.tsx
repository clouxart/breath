'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SoundType, AmbientType, SoundConfig } from '../hooks/useSound'

type BreathingPattern = {
  name: string
  inhale: number
  hold1: number
  exhale: number
  hold2: number
  description: string
}

interface SettingsPanelProps {
  showSettings: boolean
  setShowSettings: (show: boolean) => void
  breathingPatterns: BreathingPattern[]
  selectedPattern: number
  setSelectedPattern: (pattern: number) => void
  customDurations: { inhale: number; hold1: number; exhale: number; hold2: number }
  setCustomDurations: (durations: { inhale: number; hold1: number; exhale: number; hold2: number }) => void
  soundConfig: SoundConfig
  setSoundConfig: (config: SoundConfig) => void
  initializeAudio: () => void
  previewSound: (sound: SoundType) => void
  stopPreviewSounds: () => void
  stopAmbientSound: () => void
  updateAmbientVolume: (volume: number) => void
  isBreathing: boolean
  isPaused: boolean
  setIsPaused: (paused: boolean) => void
  isMobile: boolean
  stopPhaseSounds?: () => void
}

type TabType = 'patterns' | 'sounds' | 'shortcuts'

export default function SettingsPanel({
  showSettings,
  setShowSettings,
  breathingPatterns,
  selectedPattern,
  setSelectedPattern,
  customDurations,
  setCustomDurations,
  soundConfig,
  setSoundConfig,
  initializeAudio,
  previewSound,
  stopPreviewSounds,
  stopAmbientSound,
  updateAmbientVolume,
  isBreathing,
  isPaused,
  setIsPaused,
  isMobile,
  stopPhaseSounds
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('patterns')

  const handleClose = () => {
    setShowSettings(false)
    stopPreviewSounds() // Stop any preview sounds
    if (isBreathing && isPaused) {
      setIsPaused(false)
    }
  }

  const tabs: { id: TabType; label: string; icon: React.ReactElement }[] = [
    {
      id: 'patterns',
      label: 'Patterns',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      )
    },
    {
      id: 'sounds',
      label: 'Sounds',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )
    },
    {
      id: 'shortcuts',
      label: 'Shortcuts',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="10" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    }
  ]

  return (
    <AnimatePresence>
      {showSettings && (
        <motion.div
          className="fixed inset-0 z-30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-2xl" />
          
          {/* Floating glass panel */}
          <motion.div
            className={`relative ${
              isMobile ? 'w-full h-full' : 'max-w-2xl w-full max-h-[85vh]'
            } flex flex-col overflow-hidden`}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isMobile 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
              backdropFilter: isMobile ? 'blur(30px)' : 'blur(60px) saturate(150%)',
              WebkitBackdropFilter: isMobile ? 'blur(30px)' : 'blur(60px) saturate(150%)',
              borderRadius: isMobile ? 0 : 32,
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: isMobile ? 'none' : `
                0 8px 32px rgba(0,0,0,0.12),
                inset 0 0 0 1px rgba(255,255,255,0.05),
                0 20px 70px rgba(0,0,0,0.3)
              `
            }}
          >
            {/* Glass morphism inner glow - subtle */}
            <div className="absolute inset-0 rounded-[32px] pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 20% 20%, rgba(120,119,198,0.08) 0%, transparent 50%)',
                filter: 'blur(40px)'
              }}
            />
            
            {/* Header with glass separator */}
            <div className="relative flex items-center justify-between p-6" 
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.03) 0%, transparent 100%)'
              }}>
              <h2 className="text-2xl font-light text-white"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  letterSpacing: '-0.02em'
                }}
              >
                Settings
              </h2>
              <motion.button
                onClick={handleClose}
                className="p-2.5 rounded-full transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
                whileHover={{ 
                  scale: 1.05,
                  background: 'rgba(255,255,255,0.12)'
                }}
                whileTap={{ scale: 0.95 }}
                aria-label="Close settings"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/70">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>
            </div>

            {/* Tab Navigation with glass effect */}
            <div className="flex relative" 
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.01)'
              }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 transition-all relative ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                  style={{
                    background: activeTab === tab.id 
                      ? 'rgba(255,255,255,0.03)' 
                      : 'transparent'
                  }}
                >
                  {tab.icon}
                  <span className={isMobile ? 'text-sm' : ''}>{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.8), transparent)'
                      }}
                      layoutId="activeTab"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content with custom scrollbar */}
            <div className="flex-1 overflow-y-auto p-6 relative" 
              style={{ 
                scrollbarWidth: 'thin', 
                scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10px, black calc(100% - 10px), transparent 100%)'
              }}>
              <AnimatePresence mode="wait">
                {activeTab === 'patterns' && (
                  <motion.div
                    key="patterns"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Pattern Cards Grid - Responsive */}
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                      {breathingPatterns.map((pattern, index) => (
                        <motion.button
                          key={pattern.name}
                          className={`relative p-4 rounded-2xl transition-all overflow-hidden text-left`}
                          style={{
                            background: selectedPattern === index
                              ? 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(147,51,234,0.12) 100%)'
                              : 'rgba(255,255,255,0.03)',
                            backdropFilter: 'blur(10px)',
                            border: selectedPattern === index
                              ? '1px solid rgba(59,130,246,0.25)'
                              : '1px solid rgba(255,255,255,0.06)',
                            boxShadow: selectedPattern === index
                              ? 'inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(59,130,246,0.08)'
                              : 'inset 0 1px 0 rgba(255,255,255,0.03)'
                          }}
                          onClick={() => setSelectedPattern(index)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Selected indicator */}
                          {selectedPattern === index && (
                            <motion.div
                              className="absolute top-2 right-2"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 400 }}
                            >
                              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </div>
                            </motion.div>
                          )}
                          
                          <div className="space-y-2">
                            {/* Pattern timing visual */}
                            <div className="flex gap-0.5 mb-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              {(() => {
                                const total = pattern.inhale + pattern.hold1 + pattern.exhale + pattern.hold2
                                return (
                                  <>
                                    <div 
                                      className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
                                      style={{ width: `${(pattern.inhale / total) * 100}%` }}
                                      title={`Inhale: ${pattern.inhale}s`}
                                    />
                                    {pattern.hold1 > 0 && (
                                      <div 
                                        className="h-full bg-gradient-to-r from-purple-400 to-purple-500"
                                        style={{ width: `${(pattern.hold1 / total) * 100}%` }}
                                        title={`Hold: ${pattern.hold1}s`}
                                      />
                                    )}
                                    <div 
                                      className="h-full bg-gradient-to-r from-blue-400/60 to-blue-500/60"
                                      style={{ width: `${(pattern.exhale / total) * 100}%` }}
                                      title={`Exhale: ${pattern.exhale}s`}
                                    />
                                    {pattern.hold2 > 0 && (
                                      <div 
                                        className="h-full bg-gradient-to-r from-purple-400/60 to-purple-500/60"
                                        style={{ width: `${(pattern.hold2 / total) * 100}%` }}
                                        title={`Hold Empty: ${pattern.hold2}s`}
                                      />
                                    )}
                                  </>
                                )
                              })()}
                            </div>
                            
                            <div className="text-white font-medium text-sm">{pattern.name}</div>
                            <div className="text-xs text-white/50 line-clamp-2 min-h-[2rem]">{pattern.description}</div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-xs text-white/70 tabular-nums font-mono">
                                {pattern.inhale}-{pattern.hold1}-{pattern.exhale}-{pattern.hold2}
                              </div>
                              <div className="text-xs text-white/40">
                                {pattern.inhale + pattern.hold1 + pattern.exhale + pattern.hold2}s total
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {/* Custom Pattern Controls */}
                    {selectedPattern === 4 && (
                      <motion.div
                        className="space-y-4 p-4 rounded-2xl"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)'
                        }}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        <h3 className="text-sm font-medium text-white/70 mb-3">Customize Your Pattern</h3>
                        {[
                          { key: 'inhale', label: 'Inhale' },
                          { key: 'hold1', label: 'Hold' },
                          { key: 'exhale', label: 'Exhale' },
                          { key: 'hold2', label: 'Hold Empty' }
                        ].map((phase) => (
                          <div key={phase.key}>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-sm text-white/70">{phase.label}</label>
                              <span className="text-sm text-white/90 tabular-nums">
                                {customDurations[phase.key as keyof typeof customDurations]}s
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              value={customDurations[phase.key as keyof typeof customDurations]}
                              onChange={(e) => setCustomDurations({
                                ...customDurations,
                                [phase.key]: Number(e.target.value)
                              })}
                              className="w-full accent-blue-500"
                            />
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'sounds' && (
                  <motion.div
                    key="sounds"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Master Toggle with glass card */}
                    <div className="p-4 rounded-2xl"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)'
                      }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">Enable Sounds</div>
                          <div className="text-xs text-white/50 mt-1">Play audio cues during breathing</div>
                        </div>
                        <button
                          onClick={() => {
                            const newEnabled = !soundConfig.enabled
                            setSoundConfig({ ...soundConfig, enabled: newEnabled })
                            if (newEnabled) {
                              initializeAudio()
                            } else {
                              stopAmbientSound()
                              stopPreviewSounds()
                            }
                          }}
                          className={`relative w-12 h-6 rounded-full transition-all`}
                          style={{
                            background: soundConfig.enabled 
                              ? 'linear-gradient(135deg, rgba(59,130,246,0.8) 0%, rgba(147,51,234,0.8) 100%)'
                              : 'rgba(255,255,255,0.2)',
                            boxShadow: soundConfig.enabled
                              ? '0 2px 8px rgba(59,130,246,0.4)'
                              : 'inset 0 1px 2px rgba(0,0,0,0.2)'
                          }}
                        >
                          <motion.div
                            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                            animate={{ x: soundConfig.enabled ? 24 : 0 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                          />
                        </button>
                      </div>
                    </div>

                    {soundConfig.enabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-6"
                      >
                        {/* Phase Indicator with glass card */}
                        <div className="p-4 rounded-2xl space-y-4"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                          }}>
                          <h3 className="text-sm font-medium text-white/70">Phase Indicator</h3>
                          <div>
                            <label className="text-xs text-white/50 block mb-2">Sound Type</label>
                            <div className="flex gap-2">
                              <select
                                value={soundConfig.phaseIndicator}
                                onChange={(e) => setSoundConfig({
                                  ...soundConfig,
                                  phaseIndicator: e.target.value as SoundType
                                })}
                                className="flex-1 text-white rounded-lg px-3 py-2 text-sm"
                                style={{
                                  background: 'rgba(255,255,255,0.05)',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255,255,255,0.08)'
                                }}
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
                                  className="px-3 py-2 text-white rounded-lg transition-all text-sm hover:scale-105"
                                style={{
                                  background: 'rgba(255,255,255,0.05)',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255,255,255,0.08)'
                                }}
                                >
                                  Preview
                                </button>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-xs text-white/50">Volume</label>
                              <span className="text-xs text-white/70 tabular-nums">
                                {Math.round(soundConfig.indicatorVolume * 100)}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={soundConfig.indicatorVolume * 100}
                              onChange={(e) => setSoundConfig({
                                ...soundConfig,
                                indicatorVolume: Number(e.target.value) / 100
                              })}
                              className="w-full accent-blue-500"
                            />
                          </div>
                        </div>

                        {/* Ambient Sound with glass card */}
                        <div className="p-4 rounded-2xl space-y-4"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                          }}>
                          <h3 className="text-sm font-medium text-white/70">Ambient Sound</h3>
                          <div>
                            <label className="text-xs text-white/50 block mb-2">Background</label>
                            <select
                              value={soundConfig.ambient}
                              onChange={(e) => {
                                const newAmbient = e.target.value as AmbientType
                                setSoundConfig({ ...soundConfig, ambient: newAmbient })
                              }}
                              className="w-full text-white rounded-lg px-3 py-2 text-sm"
                              style={{
                                background: 'rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.12)'
                              }}
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
                              <div className="flex justify-between items-center mb-2">
                                <label className="text-xs text-white/50">Volume</label>
                                <span className="text-xs text-white/70 tabular-nums">
                                  {Math.round(soundConfig.ambientVolume * 100)}%
                                </span>
                              </div>
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
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'shortcuts' && (
                  <motion.div
                    key="shortcuts"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-2xl"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)'
                      }}>
                      <h3 className="text-sm font-medium text-white/70 mb-4">Keyboard Shortcuts</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'Space', action: 'Start/Stop Session' },
                          { key: 'S', action: 'Toggle Settings' },
                          { key: 'Esc', action: 'Close Settings' },
                          { key: 'P', action: 'Pause/Resume (during session)' }
                        ].map((shortcut) => (
                          <div key={shortcut.key} className="flex justify-between items-center">
                            <span className="text-sm text-white/70">{shortcut.action}</span>
                            <kbd className="px-3 py-1.5 rounded-lg text-xs text-white/90 font-mono"
                              style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.08)'
                              }}>
                              {shortcut.key}
                            </kbd>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)'
                      }}>
                      <h3 className="text-sm font-medium text-white/70 mb-4">Gestures</h3>
                      <div className="space-y-3">
                        {[
                          { gesture: 'Click Pattern Name', action: 'Quick cycle patterns' },
                          { gesture: 'Click Breathing Orb', action: 'Pause/Resume session' },
                          { gesture: 'Click Total Breaths', action: 'Reset counter' }
                        ].map((item) => (
                          <div key={item.gesture} className="flex justify-between items-center">
                            <span className="text-sm text-white/70">{item.action}</span>
                            <span className="text-xs text-white/50">{item.gesture}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(147,51,234,0.08) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(59,130,246,0.15)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)'
                      }}>
                      <div className="flex items-start gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400 mt-0.5">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4" />
                          <path d="M12 8h.01" />
                        </svg>
                        <div className="text-sm text-white/70">
                          Pro tip: Use keyboard shortcuts for a distraction-free breathing experience. 
                          Press Space to start and let the app guide you.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions with glass effect */}
            {!isMobile && (
              <div className="p-6 relative"
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  background: 'linear-gradient(to top, rgba(255,255,255,0.02) 0%, transparent 100%)'
                }}
              >
                <motion.button
                  onClick={handleClose}
                  className="w-full py-3 text-white rounded-2xl transition-all font-light tracking-wide"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                  }}
                  whileHover={{ 
                    scale: 1.01
                  }}
                  whileTap={{ scale: 0.99 }}
                >
                  Done
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}