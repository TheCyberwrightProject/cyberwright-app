import { recent_open } from "@/types";
import { Button } from "@mantine/core";
import { useRouter } from "next/router";

export default function RecentOpen(props: recent_open) {
    const router = useRouter();
    return (
        <div className="mt-2">
            <Button variant="transparent" className="hover:bg-[#e6fff7] hover:bg-opacity-10 h-fit" color="green" onClick={() => { router.push(`/view?path=${props.folder_path}`) }}>
                <div className="flex flex-col text-left gap-y-1 pt-2">
                    {props.folder_name}
                    <p className="mt-0 opacity-70">{props.folder_path}</p>
                </div>
            </Button>
        </div>
    )
}