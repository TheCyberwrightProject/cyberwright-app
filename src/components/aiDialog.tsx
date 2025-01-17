import { dialog } from "@/types";
import { TriangleAlert, ShieldAlert } from 'lucide-react';

export default function AiDialog(props: dialog) {
    return (
        <div className="flex flex-row items-center mx-12 gap-x-3">
            <div>
                {props.severity === "warning" ? <TriangleAlert color="orange" size={20}/> : <ShieldAlert color="red" size={20}/>}
            </div>
            <p className="text-white">{props.content}</p>
        </div>
    )
}