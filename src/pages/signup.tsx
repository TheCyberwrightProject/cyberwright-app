import Authbox from "@/components/Authbox"

export default function Signup() {
    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <Authbox isLogin={false}/>
        </div>
    )
}