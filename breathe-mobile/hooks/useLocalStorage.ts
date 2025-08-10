import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    const loadValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key)
        if (item !== null) {
          setStoredValue(JSON.parse(item))
        }
      } catch (error) {
        console.error(`Error loading ${key} from AsyncStorage:`, error)
      }
    }
    loadValue()
  }, [key])

  const setValue = async (value: T) => {
    try {
      setStoredValue(value)
      await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error saving ${key} to AsyncStorage:`, error)
    }
  }

  return [storedValue, setValue]
}