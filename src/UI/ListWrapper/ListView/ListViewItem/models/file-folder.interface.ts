export interface FileFolder {
  id: number | string;
  name: string;
  path: string;
  sizeBytes?: number;
  lastModified?: string;
  isFolder: boolean;
}
