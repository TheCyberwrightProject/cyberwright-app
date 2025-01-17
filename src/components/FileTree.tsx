import { FileStructure, FileTreeType } from "@/types";
import { Group, ScrollArea, Tree, TreeNodeData } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { matchFileExtension } from "@/utils";

export function FileTree(props: FileTreeType) {
    const [treeData, setTreeData] = useState<TreeNodeData[]>([]);
    const [error, setError] = useState("");

    const recurse_node = (file: FileStructure) => {
        const fileData: TreeNodeData = {
          label: file.name,
          value: file.full_path,
        };
        if (file.children) {
          fileData.children = file.children.map(recurse_node);
        }
        return fileData;
    };

    useEffect(() => {
        const fetchFileStructure = async () => {
          try {
            const files: FileStructure = await invoke("get_file_structure", { path: props.folder_path });
            const processedData = recurse_node(files);
            setTreeData([processedData]);
          } catch (err) {
            console.error("An error occurred while fetching the file structure:", err);
            setError("Failed to load file structure.");
          }
        };
    
        fetchFileStructure();
    }, []);

    return (
        <ScrollArea scrollbars="y" className="overflow-ellipsis overflow-hidden pb-2 pt-2">
            <Tree
              data={treeData}
              levelOffset={20}
              renderNode={({ level, node, expanded, hasChildren, elementProps },) => {
                return (<Group gap={10} {...elementProps} className={`${props.currentTab?.file_path == node.value ? "bg-[#d2fcef] bg-opacity-20" : ""} ${elementProps.className}`}>
                  {hasChildren && (
                    <ChevronDown
                      size={18}
                      style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                    />
                  )}
                  <div
                    className="text-sm whitespace-nowrap flex items-center justify-center py-1"
                    onClick={() => !node.children && props.handleOpen(node.value, node.label as string)}
                  >
                    {!node.children && matchFileExtension(node.label as string)}
                    <span className={!node.children ? `ml-1` : ""}>{node.label}</span>
                  </div>
                </Group>)
              }}
            />
        </ScrollArea>
    )
}