import { AIDiagnostic, FileStructure, MixedDiagnostic, RawAIResp, TabStruct } from "@/types";
import { sendErrNotification, transformDiagnostics } from "@/utils";
import { javascript } from '@codemirror/lang-javascript';
import { Diagnostic, linter, lintGutter } from '@codemirror/lint';
import { Image, Loader, Progress, ScrollArea, Tabs } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { invoke } from "@tauri-apps/api/core";
import { atomone } from '@uiw/codemirror-theme-atomone';
import CodeMirror from '@uiw/react-codemirror';
import { ShieldAlert, TriangleAlert } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { notifications } from "@mantine/notifications";
import React from "react";
import { FileTree } from "@/components/FileTree";
import { CustomBreadcrumbs } from "@/components/CustomBreadcrumbs";
import { CustomTabs } from "@/components/CustomTabs";
import DiagnosticsComponent from "@/components/Diagnostics";

export default function Landing() {
  const params = useSearchParams();
  const dirPath = params.get("path");
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState<TabStruct>();
  const [editorData, setEditorData] = useState<string>("");
  const [tabs, setTabs] = useState<TabStruct[]>([]);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [opened, { toggle }] = useDisclosure(false);
  const [firstOpened, setFirstOpened] = useState(false);
  const [openLoader, setOpenLoader] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [currentPhrase, setCurrentPhrase] = useState("");
  const [progress, setProgress] = useState(0);
  const [map, setMap] = useState<Map<string, AIDiagnostic[]>>(new Map());

  const handleFileOpen = (file_path: string, file_name: string) => {
    if(file_path === currentTab?.file_path) {
      return;
    }
    setOpenLoader(true);
    if (tabs.find((tab) => tab.file_path == file_path)) {
      handleTabChange(file_path);
      return;
    }

    invoke<string>("read_file", { path: file_path }).then((data: string) => {
      const newTab: TabStruct = { file_name: file_name, file_content: data, file_path: file_path }
      setTabs([...tabs, newTab]);
      setCurrentTab(newTab);
      if (!firstOpened) {
        setFirstOpened(true);
      }
      setEditorData(newTab?.file_content || "");
      setOpenLoader(false);
    })
  };

  const handleTabChange = (file_path: string) => {
    if(opened) {
      toggle()
    }
    if(!file_path) {
      return;
    }

    let newTab = tabs.find((tab) => tab.file_path === file_path);
    if(!newTab) {
      return;
    }
    
    setCurrentTab(newTab);
    setEditorData(newTab?.file_content || "");
    setOpenLoader(false)
  }

  const handleClose = (file_path: string) => {
    let tabI = tabs.findIndex((tab) => tab.file_path === file_path);
    let newTabs = tabs;
    newTabs.splice(tabI, 1);
    setTabs([...newTabs]);

    if(newTabs.length > 0) {
      let newTab;
      if(tabI === 0) {
        newTab = tabs[0]
      } else if(tabI == tabs.length) {
        newTab = tabs[tabs.length - 1]
      } else {
        newTab = tabs[tabI - 1]
      }
      handleTabChange(newTab.file_path);
    } else {
      setCurrentTab(undefined)
      setEditorData("")
      setDiagnostics([])
      setOpenLoader(false)
    }
  }

  useEffect(() => {
    if (!editorData) return;
    setOpenLoader(true)
    const key_type = `${currentTab?.file_path as string}@${currentTab?.file_name as string}`
    const diag = map.get(key_type);
    if(!diag) { setOpenLoader(false); return }
    const diags: Diagnostic[] = transformDiagnostics(diag, editorData).map((val) => val.diag);
    setDiagnostics(existing => [...diags]);
    setOpenLoader(false);
  }, [editorData])

  useEffect(() => {
    invoke<boolean>("validate_token").then(async (valid) => {
      if(!valid) {
        return router.push("/login")
      }
  
      const fetchFiles = async () => {
        try {
          setProgress(0);

          const files = await invoke<FileStructure[]>("build_upload_structure", { path: dirPath });
          setProgress(10);

          setCurrentPhrase("Creating upload session...");
          const uid = await invoke<string>("init_upload", { 
            dirName: dirPath?.split('/').pop(), 
            numFiles: files.length 
          });
      
          console.log(`Upload session created with UID: ${uid}`);
          setProgress(20)

          const totalFiles = files.length;
          for (let i = 0; i < totalFiles; i++) {
            const file = files[i];
            setCurrentPhrase(`Uploading ${file.name}...`);
            await invoke("upload_file", { file, uid });
    
            const uploadProgress = 20 + Math.round((60 / totalFiles) * (i + 1)); 
            setProgress(uploadProgress);
          }
      
          setCurrentPhrase("Queuing upload...");
          const queuePosition = await invoke<string>("scan_upload", { uid });
          setProgress(85);
          setCurrentPhrase(`Upload is at position ${queuePosition} in the queue`);
      
          await pollDiagnostics(uid);

          return true;
        } catch (err) {
          sendErrNotification("Upload failed", String(err));
          setProgress(0);
          router.push("/");
          return false;
        }
      };
      
      const pollDiagnostics = async (uid: string): Promise<void> => {
        const pollInterval = 3000;
      
        const poll = async (): Promise<void> => {
          try {
            const diagRes = await invoke<string[]>("get_diagnostics", { uid });
            setCurrentPhrase(diagRes[0]);
            if (diagRes[1]) {
              let diagnosticMap = new Map();
              setProgress(100);
              setCurrentPhrase("Loading Diagnostics...")
              const diagnostics = diagRes[1] as unknown as AIDiagnostic[];
              for(const diagnostic of diagnostics) {
                let existing = diagnosticMap.get(`${diagnostic.file_path}@${diagnostic.file_name}`);
                let diags = [];
                if(!existing) {
                  diags.push(diagnostic);
                } else {
                  diags = [diagnostic, ...existing];
                }
                diagnosticMap.set(`${diagnostic.file_path}@${diagnostic.file_name}`, diags.reverse());
              }

              setMap(new Map([...diagnosticMap, ...map]))

              return;
            }

            await new Promise<void>((resolve) => setTimeout(resolve, pollInterval));
            await poll();
          } catch (err) {
            sendErrNotification("Diagnostics polling failed", String(err));
            return router.push('/')
          }
        };
      
        await poll();
      };
      
      fetchFiles()
        .then((success) => {
          if(!success) { return; }
          setCurrentPhrase("");
          setFirstLoad(false);
        })
        .catch((err) => {
          console.error("Unexpected error during fetchFiles:", err);
        });      
    }).catch((_) => {
      return router.push("/login")
    })
  }, []);

  useEffect(() => {
    if(firstLoad) { return }
    notifications.show({
      title: `Scan Successful`,
      message: `${map.size} files with vulnerabilities were detected.`,
      color: "green",
      autoClose: 4000,
      position: "top-right"
    })
  }, [firstLoad])

  return firstLoad ?
    <div className="h-screen w-screen justify-center items-center flex flex-col">
      <Progress value={progress} color="green" size={"lg"} className="w-1/3" transitionDuration={200}/>
      <h3 className="mt-4 text-[#1fd698]">{currentPhrase}</h3> 
    </div>
     : (
    <div className="flex flex-row h-screen w-screen">
      <div className="flex w-1/6 bg-transparent flex-col pl-2 pt-1 pr-2 border-r-[0.5px] border-y-0 border-l-0 border-solid border-[#5b5b5b]">
        <FileTree folder_path={dirPath as string} handleOpen={handleFileOpen} currentTab={currentTab}/>
      </div>
      <div className="w-5/6 h-full">
      {
        tabs.length === 0 ? <></>
        :
          <div className="w-full h-2/3 flex flex-col bg-[#272c35]">
            <CustomTabs 
              currentTab={currentTab} 
              tabs={tabs} 
              handleChange={handleTabChange}
              handleClose={handleClose}
            />
            <CustomBreadcrumbs currentTab={currentTab}/>
            <ScrollArea className="w-full bg-[#272c35]" type="auto">
              {
                openLoader ?
                <div className="w-full flex items-center justify-center flex-col">
                  <Loader color="green"/>
                  <h1>Loading your file...</h1>
                </div> :
                <CodeMirror
                  value={editorData}
                  extensions={[javascript(), linter((() => diagnostics), {needsRefresh: () => true}), lintGutter()]}
                  theme={atomone}
                  className={`${!firstOpened && "hidden"} w-full overflow-y-auto m-0`}
                />
              }
            </ScrollArea>
          </div>
        }
        {!currentTab && !openLoader && tabs.length === 0 &&
          <div className="h-2/3 w-full flex flex-col justify-center items-center">
              <Image 
                src="/cyberwright_gray.png"
                h={300}
                w="auto"
              />
            <span className="ml-4 mt-5 opacity-50">Start by selecting a file with a red or orange mark on the left to display code details.</span>
          </div>
        }

        <div className="w-full h-1/3 bg-[#232323] border-t-[0.5px] border-x-0 border-b-0 border-solid border-[#5b5b5b] pointer-events-auto">
          <Tabs color="green" defaultValue={"vulnerabilities"} className="h-full">
            <Tabs.List>
              <Tabs.Tab value="vulnerabilities" leftSection={<ShieldAlert color="red" size={15} />}>
                Vulnerabilities
              </Tabs.Tab>
              <Tabs.Tab value="warnings" leftSection={<TriangleAlert color="orange" size={15} />}>
                Warnings
              </Tabs.Tab>
            </Tabs.List>
     
              <Tabs.Panel value="vulnerabilities">
                <ScrollArea.Autosize type="auto" h={200}>
                  <DiagnosticsComponent diagnostics={map} value="critical" handleFileOpen={handleFileOpen}/>
                </ScrollArea.Autosize>
              </Tabs.Panel>
              <Tabs.Panel value="warnings">
                <ScrollArea.Autosize type="auto" h={200}>
                  <DiagnosticsComponent diagnostics={map} value="warning" handleFileOpen={handleFileOpen}/>
                </ScrollArea.Autosize>
              </Tabs.Panel>
          </Tabs>
        </div>
      </div>
      </div>
  );
}