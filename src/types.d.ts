import { Diagnostic } from "@codemirror/lint";

export interface FileStructure {
  name: string;
  file_type: "File" | "Directory";
  full_path: string;
  children: FileStructure[] | null;
}

export interface AiIssue {
  lineNumber: number;
  severity: "warning" | "critical";
  synopsis: string;
}

export interface AiFormat {
  issues: AiIssue[];
}

export interface RawAIFormat {
  file_path: string,
  issues: AiIssue[]
}

export interface RawAIResp {
  issues: RawAIFormat[],
}

export interface dialog {
  content: string,
  id: number,
  severity: string,
}

export interface recent_open {
  folder_path: string,
  folder_name: string
}

export interface TabStruct {
  file_name: string,
  file_content: string,
  file_path: string,
}

export interface FileTreeType {
  folder_path: string,
  handleOpen: (file_path: string, file_name: string) => void,
  currentTab: TabStruct | undefined
}

export interface BreadcrumbsType {
  currentTab: TabStruct | undefined
}

export interface TabsType {
  currentTab: TabStruct | undefined,
  tabs: TabStruct[],
  handleChange: (file_path: string) => void,
  handleClose: (file_path: string) => void
}

export interface KeyType {
  path: string,
  name: string,
}

export interface DiagnosticsProps {
  value: "warning" | "critical"
  diagnostics: map<KeyType, Diagnostic[]>
  handleFileOpen: (file_path: string, file_name: string) => void
}

export interface AuthResponse {
  access_token: string,
}

export interface AccountInfo {
  info: {
    name: string,
    email: string,
    pfp_url: string
  },
  account_type: string,
}

export interface AIDiagnostic {
  file_path: string,
  file_name: string,
  line_number: number,
  vulnerability: string,
  severity: string,
  reasoning: string,
}

export interface MixedDiagnostic {
  diag: Diagnostic,
  vulnerability: string,
}