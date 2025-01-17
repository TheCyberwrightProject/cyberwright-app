import { TabsType } from "@/types";
import { Button, ScrollArea } from "@mantine/core";
import { matchFileExtension } from "@/utils";
import { Tabs } from "@mantine/core";
import { X } from "lucide-react";

export function CustomTabs(props: TabsType) {
    return (
        <ScrollArea className={`pointer-events-auto ${props.tabs.length == 0 ? "" : "min-h-16"}`} scrollbarSize={0}>
          <div className={`pb-1 ${props.tabs.length == 0 ? "" : "min-h-16"}`}>
            <Tabs value={props.currentTab?.file_path} onChange={(val) => props.handleChange(val as string)} keepMounted={false}>
              <Tabs.List className="flex-nowrap">
                {
                  props.tabs.map((tab) => {
                    return (
                      <Tabs.Tab value={tab.file_path} key={tab.file_path} color={"green"}>
                        <div className="flex items-center">
                          <div className="flex">
                            {matchFileExtension(tab.file_name)}
                            <span className="ml-2">{tab.file_name}</span>
                          </div>
                          <Button
                            onClick={() => props.handleClose(tab.file_path)}
                            variant="transparent"
                            className="w-fit h-fit pr-0"
                            color="green"
                          >
                            <X width={15} />
                          </Button>
                        </div>
                      </Tabs.Tab>
                    )
                  })
                }
              </Tabs.List>
            </Tabs>
          </div>
        </ScrollArea>
    )
}