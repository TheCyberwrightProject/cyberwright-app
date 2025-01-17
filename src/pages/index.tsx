import RecentOpen from "@/components/RecentOpen";
import { recent_open } from "@/types";
import { getRecentOpens, saveRecentOpens } from "@/utils";
import { Button } from "@mantine/core";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderUp } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [recentOpens, setRecentOpens] = useState<recent_open[]>([]);

  useEffect(() => {
    invoke<boolean>("validate_token").then(async (valid) => {
      if(!valid) {
        return router.push("/login")
      }
      await getRecentOpens(setRecentOpens);
    }).catch((_) => {
      return router.push("/login")
    })
  }, []);

  function handleInput(e: any) {
    open({
      directory: true,
      multiple: false
    }).then(async (selected: any) => {
      if (!selected) {
        return;
      }
      await saveRecentOpens(recentOpens, selected);
      router.push(`/view?path=${encodeURI(selected)}`)
    })
  };

  return (
    <div className="w-screen h-screen">
      <div className="absolute top-20 left-10">
        <h1 className="text-lg mb-0">Recent Opens:</h1>
        {
          recentOpens.map((recent, index) => {
            return <RecentOpen key={index} {...recent} />
          })
        }
      </div>
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="font-bold text-5xl bg-gradient-to-r from-[#1fd698] to-[#d1fef0] bg-clip-text text-transparent pb-1 mb-0">
            Cyberwright
          </h1>
          <p className="text-xl mt-0">&quot;Cybersecurity done right&quot;</p>
        </div>

        <Button
          color="green"
          variant="light"
          leftSection={<FolderUp />}
          onClick={handleInput}
        >
          Open Folder
        </Button>
      </div>
    </div>
  );
}