export const ONBOARDING_TOTAL_STEPS = 2

export const ONBOARDING_STEP = {
  createProperty: 1,
  shareProperty: 2,
} as const

export type OnboardingState = {
  step: number
  welcomeModalSeen: boolean
  dashboardTourCompleted: boolean
  propertyTourCompleted: boolean
  settingsTourCompleted: boolean
}

export const DEFAULT_ONBOARDING: OnboardingState = {
  step: ONBOARDING_STEP.createProperty,
  welcomeModalSeen: false,
  dashboardTourCompleted: false,
  propertyTourCompleted: false,
  settingsTourCompleted: false,
}

export function parseOnboarding(value: unknown): OnboardingState {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const v = value as Record<string, unknown>
    return {
      step: typeof v.step === "number" ? v.step : DEFAULT_ONBOARDING.step,
      welcomeModalSeen:
        typeof v.welcomeModalSeen === "boolean"
          ? v.welcomeModalSeen
          : DEFAULT_ONBOARDING.welcomeModalSeen,
      dashboardTourCompleted:
        typeof v.dashboardTourCompleted === "boolean"
          ? v.dashboardTourCompleted
          : DEFAULT_ONBOARDING.dashboardTourCompleted,
      propertyTourCompleted:
        typeof v.propertyTourCompleted === "boolean"
          ? v.propertyTourCompleted
          : DEFAULT_ONBOARDING.propertyTourCompleted,
      settingsTourCompleted:
        typeof v.settingsTourCompleted === "boolean"
          ? v.settingsTourCompleted
          : DEFAULT_ONBOARDING.settingsTourCompleted,
    }
  }
  return { ...DEFAULT_ONBOARDING }
}

export function isOnboardingComplete(onboarding: OnboardingState): boolean {
  return onboarding.step > ONBOARDING_TOTAL_STEPS
}
