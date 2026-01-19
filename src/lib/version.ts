/**
 * 版本生成和比较工具
 */

/**
 * 生成新的版本号（ISO 8601 时间戳）
 */
export function generateVersion(): string {
  return new Date().toISOString();
}

/**
 * 比较两个版本号
 * @param v1 版本1
 * @param v2 版本2
 * @returns -1 表示 v1 < v2，0 表示 v1 = v2，1 表示 v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  if (v1 < v2) return -1;
  if (v1 > v2) return 1;
  return 0;
}

/**
 * 计算数据的 SHA-256 校验和
 * @param data 要计算校验和的数据
 * @returns SHA-256 哈希值的十六进制字符串
 */
export async function getChecksum(data: unknown): Promise<string> {
  const str = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(str);

  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}
