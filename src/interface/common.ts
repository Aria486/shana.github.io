export interface ICommonComponent {
  className?: string;
}

export interface DirectoryNode {
  name: string;
  type: "directory" | "file";
  children?: DirectoryNode[];
  lastModified?: string;
}
