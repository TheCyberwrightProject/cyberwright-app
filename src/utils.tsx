import { Diagnostic } from "@codemirror/lint";
import { AIDiagnostic, AiIssue, MixedDiagnostic } from "./types";
import { File } from "lucide-react";
import { BiLogoTypescript } from "react-icons/bi";
import { FaCss3Alt, FaFileImage, FaHtml5, FaJs, FaMarkdown, FaRust, FaStar, FaPython } from "react-icons/fa";
import { PiFileCpp } from "react-icons/pi";
import { FaGear } from "react-icons/fa6";
import { LuFileJson } from "react-icons/lu";
import { recent_open } from "./types";
import { Dispatch, SetStateAction } from "react";
import { load } from "@tauri-apps/plugin-store"
import { notifications } from "@mantine/notifications";

export function transformDiagnostics(input: AIDiagnostic[], content: string): MixedDiagnostic[] {
    return input.map(issue => {
        const line = content ? content.split('\n')[issue.line_number - 1] : '';
        const from = content ? content.split('\n').slice(0, issue.line_number - 1).join('\n').length + 1 : issue.line_number;
        const to = from + (line ? line.length : 0);
        console.log(from, to)
        return {
            diag: {
              from: from,
              to: to,
              severity: issue.severity === 'critical' ? 'error' : 'warning',
              message: issue.reasoning,
            },
            vulnerability: issue.vulnerability,
        };
    });
}

export function matchFileExtension(file_name: string) {
    const split = file_name.split(".");
    const ext = split[split.length - 1];
    if (!ext) {
      return <File className="pr-1" size={18} />
    }
    switch (ext) {
      case "js":
        return <FaJs size={15} color="yellow" />
      case "jsx":
        return <FaJs size={15} color="yellow" />
      case "mjs":
        return <FaJs size={15} color="yellow" />
      case "tsx":
        return <BiLogoTypescript size={16} color="#83b0e0" />
      case "ts":
        return <BiLogoTypescript size={16} color="#83b0e0" />
      case "css":
        return <FaCss3Alt size={16} color="#2d53e5" />
      case "png":
        return <FaFileImage size={16} color="#aa7eed" />
      case "jpg":
        return <FaFileImage size={16} color="#aa7eed" />
      case "jpeg":
        return <FaFileImage size={16} color="#aa7eed" />
      case "rs":
        return <FaRust size={16} color="#fa8796" />
      case "toml":
        return <FaGear size={16} color="#bfbdbe" />
      case "json":
        return <LuFileJson size={16} color="yellow" />
      case "html":
        return <FaHtml5 size={16} color="#994d48" />
      case "ico":
        return <FaStar size={16} color="yellow" />
      case "icns":
        return <FaStar size={16} color="yellow" />
      case "md":
        return <FaMarkdown size={16} color="green" />
      case "py":
        return <FaPython size={16} color="#689be3"/>
      case "cpp":
        return <PiFileCpp size={16} color="#6295cb" />
      case "hpp":
        return <PiFileCpp size={16} color="#6295cb" />
      default:
        return <File className="pr-1" size={18} />
  }
}

export async function getRecentOpens(setRecentOpens: Dispatch<SetStateAction<recent_open[]>>) {
  const store = await load('.recent_opens.bin', { autoSave: true });
  const data = await store.get<recent_open[]>("recent_opens");
  if (!data) {
    return;
  }
  setRecentOpens(data.filter((obj1, i, arr) =>
    arr.findIndex(obj2 => (obj2.folder_path === obj1.folder_path)) === i
  ).reverse().slice(0, 3));
}

export async function saveRecentOpens(recentOpens: recent_open[], newOpen: string) {
  const store = await load('.recent_opens.bin', { autoSave: true });
  await store.set("recent_opens", [...recentOpens, { folder_path: newOpen, folder_name: newOpen.split("/").pop() }])
}

export function sendErrNotification(title: string, msg: string) {
  return notifications.show({
    color: 'red',
    title: title,
    message: msg,
    position: 'bottom-right'
  })
}