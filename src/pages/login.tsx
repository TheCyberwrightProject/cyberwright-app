import Authbox from "@/components/Authbox"

export default function Login() {
    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <Authbox isLogin={true}/>
        </div>
    )
}