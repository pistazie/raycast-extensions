import { Workflow } from "../types";
import { useEffect, useState } from "react";
import { List } from "@raycast/api";
import { RunItem } from "./RunItem";

export const RunsList = ({ name, workflows }: { name:string, workflows: Workflow[] }) => {
  const [workflowss, setWorkflows] = useState<Workflow[]>([]);

  useEffect(() => {
    setWorkflows(workflows)
  }, []);

  return (
    <List navigationTitle={`${workflows.length} recent runs found for the ${name} workflow`}>
      {workflows.map((workflow, index) => (
        <RunItem key={index} workflow={workflow}/>
      ))}
    </List>
  );
};
