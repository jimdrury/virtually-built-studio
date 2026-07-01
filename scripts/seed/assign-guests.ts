const GUEST_ASSIGNMENT_STEP = 5

export const assignGuestsToEpisodes = (
  episodeCount: number,
  guestIds: string[],
  guestRatio = 0.25,
): Map<number, string[]> => {
  const assignments = new Map<number, string[]>()
  const targetCount = Math.round(episodeCount * guestRatio)
  const selected = new Set<number>()
  let seed = 3

  while (selected.size < targetCount) {
    const episodeNumber = ((seed * GUEST_ASSIGNMENT_STEP) % episodeCount) + 1
    selected.add(episodeNumber)
    seed += 1
  }

  const sortedEpisodeNumbers = [...selected].sort((left, right) => left - right)

  sortedEpisodeNumbers.forEach((episodeNumber, index) => {
    const primaryGuest = guestIds[index % guestIds.length]
    const guestRefs = [primaryGuest]

    if (index % 4 === 1 && guestIds.length > 1) {
      const secondGuest = guestIds[(index + 2) % guestIds.length]

      if (secondGuest !== primaryGuest) {
        guestRefs.push(secondGuest)
      }
    }

    assignments.set(episodeNumber, guestRefs)
  })

  return assignments
}
