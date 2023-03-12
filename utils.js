export function getTempoRange(difficulty) {
  switch (difficulty) {
    case "easy":
      return [0, 20];
    case "medium":
      return [21, 40];
    case "hard":
      return [41, 60];
    default:
      return [0, 60];
  }
}
