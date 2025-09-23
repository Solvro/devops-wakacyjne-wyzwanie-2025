import { useState, useEffect } from 'react'

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  tripUpdates: boolean
  expenseAlerts: boolean
  activityReminders: boolean
}

export interface PreferenceSettings {
  language: string
  timezone: string
  currency: string
  theme: string
}

export interface UserSettings {
  notifications: NotificationSettings
  preferences: PreferenceSettings
}

const defaultSettings: UserSettings = {
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    tripUpdates: true,
    expenseAlerts: true,
    activityReminders: false,
  },
  preferences: {
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    currency: 'PLN',
    theme: 'light',
  },
}

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedSettings = localStorage.getItem('user_settings')
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsedSettings })
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }
  }, [])

  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    setIsLoading(true)
    try {
      const updatedSettings = { ...settings, ...newSettings }
      localStorage.setItem('user_settings', JSON.stringify(updatedSettings))
      await new Promise((resolve) => setTimeout(resolve, 500))
      setSettings(updatedSettings)
      if (newSettings.preferences?.theme) {
        applyTheme(newSettings.preferences.theme)
      }
      return updatedSettings
    } catch (error) {
      console.error('Failed to save settings:', error)
      throw new Error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const applyTheme = (theme: string) => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }

  const updateNotification = async (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    const newNotifications = { ...settings.notifications, [key]: value }
    await saveSettings({ notifications: newNotifications })
  }

  const updatePreference = async (
    key: keyof PreferenceSettings,
    value: string
  ) => {
    const newPreferences = { ...settings.preferences, [key]: value }
    await saveSettings({ preferences: newPreferences })
  }

  const resetSettings = async () => {
    localStorage.removeItem('user_settings')
    await saveSettings(defaultSettings)
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `settings-${
      new Date().toISOString().split('T')[0]
    }.json`
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importSettings = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const result = e.target?.result as string
          const importedSettings = JSON.parse(result)
          if (importedSettings.notifications && importedSettings.preferences) {
            await saveSettings(importedSettings)
            resolve()
          } else {
            throw new Error('Invalid settings file format')
          }
        } catch {
          reject(new Error('Failed to import settings: Invalid file format'))
        }
      }
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      reader.readAsText(file)
    })
  }
  return {
    settings,
    isLoading,
    saveSettings,
    updateNotification,
    updatePreference,
    resetSettings,
    exportSettings,
    importSettings,
  }
}
