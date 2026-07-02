// 가벼운 className 결합 헬퍼 (외부 의존성 없이). falsy 값은 버린다.
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
