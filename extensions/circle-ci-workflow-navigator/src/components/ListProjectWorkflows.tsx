import {List} from "@raycast/api";
import {useEffect, useState} from "react";
import {circleCIProjectPipelines, circleCIWorkflows} from "../circleci-functions";
import {Workflow} from "../types";
import {showError} from "../utils";
import * as _ from "lodash";
import {WorkflowItem} from "./WorkflowItem";

interface Params {
    uri: string;
}

export const ListProjectWorkflows = ({uri}: Params) => {

    const [isLoading, setIsLoading] = useState(true);
    const [pipelines, setPipelines] = useState<{[name: string]: Workflow[]}>({});

    const load = () =>
        Promise.resolve()
            .then(() => setIsLoading(true))
            .then(() => circleCIProjectPipelines(uri))
            .then((pipelines) =>
                Promise.all(pipelines.map(({id}) => circleCIWorkflows({id})))
                    .then((workflows) => ({
                    pipelines,
                    workflows,
                }))
            ).then(({pipelines, workflows}) => {
                pipelines.forEach((p, i) => {
                    p.workflows = workflows[i];
                    workflows[i].forEach((workflow) => (workflow.pipeline = p));
                    workflows[i].forEach((workflow) => (workflow.repository = p.vcs));
                });
                return pipelines
            })
            .then((pipelines) => {
                const workflowNames = _.uniq(pipelines.flatMap((pipeline)=>pipeline.workflows!).map((workflow)=> workflow.name));
                const workflowInstances: {[name: string]: Workflow[]} = {}
                workflowNames.forEach((name)=> {
                    workflowInstances[name] = pipelines
                        .flatMap((pipeline)=>
                            pipeline.workflows!.filter((workflow) => workflow.name == name))
                })
                setPipelines(workflowInstances);
            })
            .then(() => setIsLoading(false));

    useEffect(() => {
        load().catch(showError);
    }, []);

    return (
        <List isLoading={isLoading} navigationTitle="Workflows">
            {Object.entries(pipelines)
                .sort(([a], [b]) => a.localeCompare(b) )
                .map(([name, items]) => (
                        <WorkflowItem name={name} key={name} workflows={items} onReload={load}/>
                ))}
        </List>
    );
};
