import type { BackupConfig, GistResponse } from '@/types';
import JSZip from 'jszip';

const GIST_FILENAME = 'family-points-data.json';
const GIST_API_BASE = 'https://api.github.com';

/**
 * 从 localStorage 获取应用数据
 */
export function getAppData() {
  const data = localStorage.getItem('family-points-storage');
  if (!data) {
    throw new Error('没有找到本地数据');
  }
  return JSON.parse(data);
}

/**
 * 将数据保存到 localStorage
 */
export function saveAppData(data: Record<string, unknown>) {
  localStorage.setItem('family-points-storage', JSON.stringify(data));
  window.location.reload();
}

/**
 * 上传数据到 Gist
 */
export async function uploadToGist(config: BackupConfig): Promise<void> {
  const { gistId, githubToken } = config;

  if (!githubToken) {
    throw new Error('GitHub Token 未配置');
  }

  const appData = getAppData();
  const content = JSON.stringify(appData, null, 2);

  try {
    const url = `${GIST_API_BASE}/gists/${gistId}`;
    const response = await fetch(url, {
      method: 'PATCH',
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

/**
 * 从 Gist 下载数据
 */
export async function downloadFromGist(config: BackupConfig): Promise<void> {
  const { gistId, githubToken } = config;

  if (!githubToken) {
    throw new Error('GitHub Token 未配置');
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

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`下载失败: ${errorData.message || response.statusText}`);
    }

    const gistData: GistResponse = await response.json();
    const file = gistData.files[GIST_FILENAME];

    if (!file || !file.content) {
      throw new Error('Gist 中没有找到数据文件');
    }

    const appData = JSON.parse(file.content);
    saveAppData(appData);
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
