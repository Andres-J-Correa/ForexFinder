export function getFormattedAge(days: number): string {
  if (days < 1) {
    const hours = Math.trunc(days * 24);
    return `${hours} hour${getSIfPlural(hours)} old`;
  } else if (days < 7) {
    const d = Math.trunc(days);
    return `${Math.trunc(d)} day${getSIfPlural(d)} old`;
  } else if (days < 30) {
    const weeks = Math.trunc(days / 4);
    return `${weeks} week${getSIfPlural(weeks)} old`;
  } else if (days < 365) {
    const months = Math.trunc(days / 30);
    return `${months} month${getSIfPlural(months)} old`;
  } else {
    const years = Math.trunc(days / 365);
    return `${years} year${getSIfPlural(years)} old`;
  }
}

function getSIfPlural(number: number): string {
  return number > 1 ? "s" : "";
}
