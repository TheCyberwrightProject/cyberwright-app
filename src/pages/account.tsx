import { Avatar, Button, Divider } from "@mantine/core"
import { UserIcon, Cog, LogOut } from "lucide-react"
import { useEffect, useState } from "react";
import { AccountInfo } from "@/types";
import { useRouter } from "next/navigation";
import { invoke } from "@tauri-apps/api/core";
import { sendErrNotification } from "@/utils";
import { Tooltip } from "@mantine/core";

export default function Account() {
    const router = useRouter();
    const [accountInfo, setAccountInfo] = useState<AccountInfo>();

    useEffect(() => {
        invoke<AccountInfo>("get_account_info").then((data) => {
            setAccountInfo(data)
        }).catch((err) => {
            sendErrNotification("Failed to get account details", err)
            return router.push('/')
        })
    }, [])

    const handleLogout = () => {
        invoke("logout").then(() => {
            router.push("/login")
        }).catch((err) => {
            sendErrNotification("Failed to logout", err)
        })
    }

    return (
        <div className="w-screen h-screen flex flex-col justify-center items-center">
            <div className="w-1/4 -translate-y-10">
                <div className="flex gap-x-6 justify-center items-center">
                    <Tooltip label="Changing pfps coming soon...">
                        <Avatar alt="User profile picture" color="green" size={80} src={accountInfo?.info.pfp_url}/>
                    </Tooltip>
                    <div>
                        <h1 className="font-bold text-xl mb-2">{accountInfo?.info.name}</h1>
                        <h1 className="text-sm opacity-50 mt-2">{accountInfo?.info.email}</h1>
                        <h1 className="text-sm opacity-50 mt-2">Account Type: <span className="capitalize">{accountInfo?.account_type}</span></h1>
                    </div>
                </div>
                <Divider 
                    size={"xs"} 
                    color="#888888" 
                    className="w-full mt-3"
                />
                <div className="mt-1">
                    <Button 
                        fullWidth
                        leftSection={<UserIcon size={20}/>}
                        variant="subtle"
                        color="green"
                        className="mt-2"
                        disabled
                    >
                        Account Settings
                    </Button>
                    <Button 
                        fullWidth
                        leftSection={<Cog size={20}/>}
                        variant="subtle"
                        color="green"
                        className="mt-2"
                        disabled
                    >
                        Preferences
                    </Button>
                </div>
                <Divider 
                    size={"xs"} 
                    color="#888888" 
                    className="w-full mt-3"
                />
                <Button 
                    fullWidth
                    leftSection={<LogOut size={20}/>}
                    variant="subtle"
                    color="green"
                    className="mt-2"
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </div>
        </div>
    )
}