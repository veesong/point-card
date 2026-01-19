import type { BackupConfig, GistDataPackage, GistResponse } from '@/types';
import JSZip from 'jszip';
import { generateVersion, getChecksum } from './version';

const GIST_FILENAME = 'family-points-data.json';
const GIST_API_BASE = 'https://api.github.com';

/**
 * 从 localStorage 获取应用数据
 * @returns 返回应用数据和内嵌的版本信息
 */
export function getAppData(): Record<string, unknown> {
  const data = localStorage.getItem('family-points-storage');
  if (!data) {
    throw new Error('没有找到本地数据');
  }
  const parsed = JSON.parse(data);

  // 提取并移除内嵌的版本信息（不要上传到 Gist）
  const { _syncVersion, ...appData } = parsed;

  return appData;
}

/**
 * 获取本地数据的版本号
 * @returns 返回本地版本号，如果没有则返回 undefined
 */
export function getLocalVersion(): string | undefined {
  const data = localStorage.getItem('family-points-storage');
  if (!data) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(data);
    return parsed._syncVersion as string;
  } catch {
    return undefined;
  }
}

/**
 * 将数据保存到 localStorage
 */
export function saveAppData(data: Record<string, unknown>) {
  localStorage.setItem('family-points-storage', JSON.stringify(data));
  window.location.reload();
}

/**
 * 上传数据到 Gist（使用新格式）
 */
export async function uploadToGist(config: BackupConfig): Promise<void> {
  const { githubToken, deviceId } = config;

  if (!githubToken) {
    throw new Error('GitHub Token 未配置');
  }

  const appData = getAppData();
  const dataPackage = await createGistDataPackage(appData, deviceId || crypto.randomUUID());

  await uploadGistDataPackage(config, dataPackage);
}

/**
 * 从 Gist 下载数据（支持新旧格式）
 * @returns 返回下载的版本号（用于更新 syncStore）
 */
export async function downloadFromGist(config: BackupConfig): Promise<{ version: string } | null> {
  const { gistId, githubToken } = config;

  if (!githubToken) {
    throw new Error('GitHub Token 未配置');
  }

  try {
    const url = `${GIST_API_BASE}/gists/${gistId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`下载失败: ${errorData.message || response.statusText}`);
    }

    const gistData: GistResponse = await response.json();
    const file = gistData.files[GIST_FILENAME];

    if (!file || !file.content) {
      throw new Error('Gist 中没有找到数据文件');
    }

    // 解析数据（支持新旧格式）
    const dataPackage = parseGistDataFile(file.content);
    if (!dataPackage) {
      throw new Error('数据格式错误');
    }

    // 保存数据（无论是新旧格式，都提取 state 部分）
    // 同时保存版本信息到 state 中
    const stateWithVersion = {
      ...dataPackage.data.state,
      _syncVersion: dataPackage.version, // 将版本信息嵌入到应用数据中
    };
    saveAppData(stateWithVersion);

    // 返回版本号
    return { version: dataPackage.version };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('下载失败: 网络错误');
  }
}

/**
 * 创建新的 Gist
 */
export async function createGist(config: Pick<BackupConfig, 'githubToken'>): Promise<string> {
  const { githubToken } = config;

  if (!githubToken) {
    throw new Error('GitHub Token 未配置');
  }

  const appData = getAppData();
  const content = JSON.stringify(appData, null, 2);

  try {
    const url = `${GIST_API_BASE}/gists`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          [GIST_FILENAME]: {
            content,
          },
        },
        description: `家庭积分管理系统备份 - ${new Date().toLocaleString('zh-CN')}`,
        public: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`创建失败: ${errorData.message || response.statusText}`);
    }

    const gistData: GistResponse = await response.json();
    return gistData.id;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('创建失败: 网络错误');
  }
}

/**
 * 验证 Gist 配置是否有效
 */
export async function validateGistConfig(config: BackupConfig): Promise<boolean> {
  const { gistId, githubToken } = config;

  if (!githubToken || !gistId) {
    return false;
  }

  try {
    const url = `${GIST_API_BASE}/gists/${gistId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 导出数据为 ZIP 文件
 */
export async function exportToZip(): Promise<void> {
  const appData = getAppData();
  const content = JSON.stringify(appData, null, 2);

  const zip = new JSZip();
  zip.file(GIST_FILENAME, content);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `family-points-backup-${new Date().toISOString().split('T')[0]}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 从 ZIP 文件导入数据
 */
export async function importFromZip(file: File): Promise<void> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(file);

  const dataFile = zipContent.file(GIST_FILENAME);
  if (!dataFile) {
    throw new Error('ZIP 文件中没有找到数据文件');
  }

  const content = await dataFile.async('string');
  const appData = JSON.parse(content);
  saveAppData(appData);
}

/**
 * 重置系统到初始状态
 * 清除所有业务数据（成员、日志、模板、分类、公告）并恢复到初始状态
 * 保留备份配置（GitHub Token 和 Gist ID）
 */
export async function resetSystem(): Promise<void> {
  // 清除业务数据 localStorage
  localStorage.removeItem('family-points-storage');

  // 注意：不删除 'backup-config'，保留用户的备份配置
  // localStorage.removeItem('backup-config');

  // 刷新页面，Zustand 会自动使用默认值初始化
  window.location.reload();
}

/**
 * 创建 Gist 数据包装包
 */
export async function createGistDataPackage(appData: Record<string, unknown>, deviceId: string): Promise<GistDataPackage> {
  const version = generateVersion();
  const timestamp = Date.now();
  const checksum = await getChecksum(appData);

  return {
    version,
    timestamp,
    deviceId,
    checksum,
    data: {
      state: appData as GistDataPackage['data']['state'],
    },
  };
}

/**
 * 解析 Gist 数据文件（支持新旧格式）
 */
export function parseGistDataFile(content: string): GistDataPackage | null {
  try {
    const parsed = JSON.parse(content);

    // 检查是否为新格式
    if (parsed.version && parsed.data && parsed.checksum) {
      return parsed as GistDataPackage;
    }

    // 旧格式 - 包装它
    return {
      version: new Date().toISOString(),
      timestamp: Date.now(),
      deviceId: 'migrated',
      checksum: '',
      data: {
        state: parsed,
      },
    };
  } catch {
    return null;
  }
}

/**
 * 轻量级获取 Gist 元数据（不下载完整内容）
 */
export async function fetchGistInfo(config: BackupConfig): Promise<{ version?: string; updated_at: string } | null> {
  const { gistId, githubToken } = config;

  if (!githubToken || !gistId) {
    return null;
  }

  try {
    const url = `${GIST_API_BASE}/gists/${gistId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const gistData: GistResponse = await response.json();
    const file = gistData.files[GIST_FILENAME];

    if (!file) {
      return { updated_at: gistData.updated_at };
    }

    // 尝试解析文件内容以获取版本号
    if (file.content) {
      const pkg = parseGistDataFile(file.content);
      if (pkg) {
        return { version: pkg.version, updated_at: gistData.updated_at };
      }
    }

    return { updated_at: gistData.updated_at };
  } catch {
    return null;
  }
}

/**
 * 上传 Gist 数据包
 */
export async function uploadGistDataPackage(config: BackupConfig, dataPackage: GistDataPackage): Promise<void> {
  const { gistId, githubToken } = config;

  if (!githubToken) {
    throw new Error('GitHub Token 未配置');
  }

  const content = JSON.stringify(dataPackage, null, 2);

  try {
    const url = `${GIST_API_BASE}/gists/${gistId}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          [GIST_FILENAME]: {
            content,
          },
        },
        description: `家庭积分管理系统备份 - ${new Date().toLocaleString('zh-CN')}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`上传失败: ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('上传失败: 网络错误');
  }
}
