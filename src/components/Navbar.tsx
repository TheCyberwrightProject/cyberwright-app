import { ActionIcon, Image, Tooltip, Menu } from "@mantine/core"
import { House, LayoutDashboard, CircleUser, Folder } from "lucide-react"
import { useEffect, useState } from "react"
import { recent_open } from "@/types"
import { getRecentOpens } from "@/utils"
import { useRouter } from "next/router"

export default function Navbar() {
    const [recentOpens, setRecentOpens] = useState<recent_open[]>([]);
    const router = useRouter()

    useEffect(() => {
        getRecentOpens(setRecentOpens);
    }, []);

    return (
        <div className="border-b-[0.5px] border-x-0 border-t-0 border-solid border-[#5b5b5b] h-12 w-screen flex justify-between items-center bg-[#232323]">
            <div className="flex items-center ml-10">
                <Image 
                    src="/cyberwright_transparent.png"
                    h={40}
                    w="auto"
                    fit="contain"
                />
                <span className="font-bold">Cyberwright</span>
            </div>
            <div className="flex mr-10 gap-x-10">
                <Tooltip label="Home" offset={10}>
                    <ActionIcon variant="subtle" color="green" component="a" href="/">
                        <House size={23}/>
                    </ActionIcon>
                </Tooltip>
                <Menu>
                    <Menu.Target>
                        <Tooltip label="Recent Opens" offset={10}>
                            <ActionIcon variant="subtle" color="green">
                                <LayoutDashboard size={23}/>
                            </ActionIcon>
                        </Tooltip>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Label>Recent Opens</Menu.Label>
                        {
                            recentOpens.map((ro, index) => {
                                return (
                                    <Menu.Item key={index} onClick={() => { router.push(`/view?path=${ro.folder_path}`) }}>
                                        <Folder size={10} className="mr-2"/>
                                        <span>{ro.folder_name}</span>
                                    </Menu.Item>
                                )
                            })
                        }
                    </Menu.Dropdown>
                </Menu>
                <Tooltip label="Account" offset={10}>
                    <ActionIcon variant="subtle" color="green" component="a" href="/account">
                        <CircleUser size={23}/>
                    </ActionIcon>
                </Tooltip>
            </div>
        </div>
    )
}