export type OnboardingState = {
  welcomeModalSeen: boolean
  dashboardTourCompleted: boolean
  // "Primeros pasos" progress — persisted on the create/share events (not derived
  // from current data) so deleting properties never re-shows the stepper.
  firstPropertyCreated: boolean
  firstPropertyShared: boolean
}

export type OnboardingFlag = keyof OnboardingState

export const DEFAULT_ONBOARDING: OnboardingState = {
  welcomeModalSeen: false,
  dashboardTourCompleted: false,
  firstPropertyCreated: false,
  firstPropertyShared: false,
}

// Rows may still hold flags from removed tours; only known keys are kept.
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
