import { User } from '@/lib/api'

/**
 * Get redirect path after successful authentication
 * @param user - User object with onboarding status
 * @param isNewUser - Whether this is a new registration (always show welcome)
 */
export function getPostAuthRedirect(user: User | null, isNewUser: boolean = false): string {
  // If no user data, go to app (fallback)
  if (!user) {
    return '/app'
  }

  // New users always go to onboarding welcome
  if (isNewUser) {
    return '/onboarding/welcome'
  }

  // Check if onboarding is completed
  if (!user.onboardingCompleted) {
    return '/onboarding/welcome'
  }

  // Onboarding complete, go to app
  return '/app'
}
