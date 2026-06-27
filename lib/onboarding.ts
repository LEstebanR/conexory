export type OnboardingState = {
  welcomeModalSeen: boolean
  dashboardTourCompleted: boolean
  propertyTourCompleted: boolean
  settingsTourCompleted: boolean
}

export type OnboardingFlag = keyof OnboardingState

export const DEFAULT_ONBOARDING: OnboardingState = {
  welcomeModalSeen: false,
  dashboardTourCompleted: false,
  propertyTourCompleted: false,
  settingsTourCompleted: false,
}

export function parseOnboarding(value: unknown): OnboardingState {
  const result = { ...DEFAULT_ONBOARDING }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const v = value as Record<string, unknown>
    for (const key of Object.keys(result) as OnboardingFlag[]) {
      if (typeof v[key] === "boolean") result[key] = v[key] as boolean
    }
  }
  return result
}
