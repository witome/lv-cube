export const CHINA_MOBILE_PATTERN = /^1[3-9]\d{9}$/;

export function isChinaMobile(phone: string): boolean {
  return CHINA_MOBILE_PATTERN.test(phone);
}
