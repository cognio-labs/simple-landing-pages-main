import React from "react";
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type FileTreeProps = {
  files: Record<string, string>;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
};

type TreeNode = {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeNode[];
};

export function FileTree({ files, selectedFile, onSelectFile }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set(["src"]));

  const toggleFolder = (path: string) => {
    const next = new Set(expandedFolders);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setExpandedFolders(next);
  };

  const tree = React.useMemo(() => {
    const root: TreeNode[] = [];
    Object.keys(files).forEach((path) => {
      const parts = path.split("/");
      let current = root;
      parts.forEach((part, i) => {
        const fullPath = parts.slice(0, i + 1).join("/");
        const isLast = i === parts.length - 1;
        let node = current.find((n) => n.name === part);
        if (!node) {
          node = {
            name: part,
            path: fullPath,
            type: isLast ? "file" : "folder",
            children: isLast ? undefined : [],
          };
          current.push(node);
        }
        if (node.children) current = node.children;
      });
    });

    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      nodes.forEach((n) => n.children && sortNodes(n.children));
    };
    sortNodes(root);
    return root;
  }, [files]);

  const renderNode = (node: TreeNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;

    if (node.type === "folder") {
      return (
        <div key={node.path}>
          <button
            onClick={() => toggleFolder(node.path)}
            className={cn(
              "flex w-full items-center gap-1.5 py-1.5 px-2 text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors",
              depth > 0 && `ml-${depth * 2}`
            )}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-3.5 w-3.5 text-blue-400" />
            ) : (
              <Folder className="h-3.5 w-3.5 text-blue-400" />
            )}
            <span className="truncate">{node.name}</span>
          </button>
          {isExpanded && node.children?.map((child) => renderNode(child, depth + 1))}
        </div>
      );
    }

    return (
      <button
        key={node.path}
        onClick={() => onSelectFile(node.path)}
        className={cn(
          "flex w-full items-center gap-1.5 py-1.5 px-2 text-xs transition-colors",
          isSelected
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
          depth > 0 && `ml-${depth * 2}`
        )}
        style={{ paddingLeft: `${depth * 12 + 24}px` }}
      >
        <FileText className="h-3.5 w-3.5 text-muted-foreground/70" />
        <span className="truncate">{node.name}</span>
      </button>
    );
  };

  return (
    <div className="h-full overflow-y-auto py-2">
      <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
        Explorer
      </div>
      {tree.map((node) => renderNode(node))}
    </div>
  );
}
