import { AIDiagnostic, DiagnosticsProps, MixedDiagnostic } from "@/types";
import { matchFileExtension } from "@/utils";
import { Diagnostic } from "@codemirror/lint";
import { Accordion } from "@mantine/core";

export default function DiagnosticsComponent(props: DiagnosticsProps) {
    return (
        <Accordion>
            {
                Array.from(props.diagnostics.keys()).map((key, i) => {
                    const split = (key as string).split("@")
                    const path = split[0]
                    const name = split[1]
                    const filtered = props.diagnostics.get(key)?.filter((diag: AIDiagnostic) => diag.severity === props.value);
                    if (filtered?.length === 0) { return null; }

                    return (
                        <Accordion.Item key={i} value={path} className="h-fit">
                            <Accordion.Control>
                                <div className="flex items-center gap-x-2">
                                    {matchFileExtension(name)}
                                    {name}
                                </div>
                            </Accordion.Control>
                            <Accordion.Panel className="flex flex-col h-full">
                                {
                                    filtered.map((diag: AIDiagnostic, j: number) => (
                                        <div className="flex mb-3" key={j}>
                                            <span className="m-0 text-sm hover:cursor-pointer" onClick={() => props.handleFileOpen(path, name)}>
                                                <div className="mb-0 pb-0">
                                                    <span className="mr-2">
                                                        {diag.line_number}:{diag.line_number + 1}
                                                    </span>
                                                    <span>
                                                        {diag?.vulnerability}
                                                    </span>
                                                </div>
                                                <span className="opacity-75">
                                                    {diag?.reasoning}
                                                </span>
                                            </span>
                                        </div>
                                    ))
                                }
                            </Accordion.Panel>
                        </Accordion.Item>
                    );
                })
            }
                            
        </Accordion>
    );
}
