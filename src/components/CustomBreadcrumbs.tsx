import { useEffect, useState } from "react";
import { Breadcrumbs, Anchor } from "@mantine/core";
import { BreadcrumbsType, TabStruct } from "@/types";

export function CustomBreadcrumbs(props: BreadcrumbsType) {
    const [items, setItems] = useState([]);

    const setBreadCrumbs = (file_name: TabStruct | undefined) => {
        let section: any = file_name?.file_path.replace(/\\/g, '/').split("/");
        const items = section.map((item: string, index: any) => (
          <Anchor key={index} className="text-sm" c="green">
            {item}
          </Anchor>
        ))
        setItems(items);
    }

    useEffect(() => {
        if(!props.currentTab) { return; }
        setBreadCrumbs(props.currentTab);
    }, [props.currentTab])

    return (
        <Breadcrumbs className="pl-4 pointer-events-auto pb-1">
          {items}
        </Breadcrumbs>
    )
}
