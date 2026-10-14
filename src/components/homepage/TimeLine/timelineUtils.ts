// Converts array into alternating left/right timeline nodes
export function buildTimelineNodes<T>(arr: T[]) {
  return arr.map((item, i) => ({
    item,
    side: i % 2 === 0 ? "left" : ("right" as "left" | "right"),
  }));
}