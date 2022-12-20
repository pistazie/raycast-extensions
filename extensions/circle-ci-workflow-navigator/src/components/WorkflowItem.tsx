import {ActionPanel, Icon, List, PushAction} from "@raycast/api";
import {Workflow, WorkflowStatus} from "../types";
import {RunsList} from "./RunsList";

export const WorkflowItem = ({ name, workflows, onReload }: { name: string,workflows: Workflow[]; onReload: () => void }) => {

    const statusToEmoji = (status: string)=>{
        switch (status){
            case WorkflowStatus.canceled:
                return '🙅'
            case WorkflowStatus.error:
                return '⁉️'
            case 'failed':
            case WorkflowStatus.failing:
                return '❗️'
            case WorkflowStatus.on_hold:
                return '⏸'
            case WorkflowStatus.success:
                return '✅'
            case WorkflowStatus.running:
                return '⚙️'
            case WorkflowStatus.not_run:
                return '⏱'
            case WorkflowStatus.unauthorized:
                return '🔐'
            default:
                return '⚪️'
        }
    }

    let stats:{[status: string]: number} = {}
    for (let workflowStatusKey in WorkflowStatus) {
        stats[workflowStatusKey] =workflows.filter((workflow) => workflow.status == workflowStatusKey).length
    }

    const actualStats = Object.entries(stats).filter(([status, count]) => count > 0 );

    const statsStr = actualStats.map(([status, count])=> `${statusToEmoji(status)} ${count}`);

    return (
        <List.Item
            icon={{source: Icon.Shuffle}}
            title={`${name}`}
            subtitle={`${statsStr.join(' | ')}`}
            actions={
                <ActionPanel>
                    <PushAction icon={Icon.Binoculars} title="View runs"
                                target={<RunsList name={name} workflows={workflows}/>}/>
                </ActionPanel>
            }
        />)
}


