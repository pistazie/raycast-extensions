import { getPreferenceValues } from "@raycast/api";
import fetch from "node-fetch";
import { Job, Pipeline, Preferences, Workflow } from "./types";

const { apiKey, defaultBranch }: Preferences = getPreferenceValues();

export const circleCIListProjects = (): Promise<string[]> => {
  return fetch("https://circleci.com/api/v1.1/me", headers)
    .then((resp) => resp.json())
    .then((json) => json as { projects: Record<string, unknown>; message?: string })
    .then((json) => (json.projects ? json.projects : Promise.reject(new Error(json.message || JSON.stringify(json)))))
    .then(Object.keys)
    .then((list) => list.sort());
};

export const circleCIProjectPipelines = (uri: string): Promise<Pipeline[]> =>
  projectPipelines(uriToVCSAndFullName(uri));

function fetchProjectPipelines(vcs: string, full_name: string, pageToken?: string) {
  let baseUrl = `https://circleci.com/api/v2/project/${vcs}/${full_name}/pipeline?branch=${defaultBranch}`;
  if (pageToken){
      baseUrl = `${baseUrl}&page-token=${pageToken}`
  }

  return fetch(baseUrl, headers)
    .then((resp) => resp.json())
    .then((json) => {
      return json as { items: Pipeline[], next_page_token: string };
    });
}

// Performs two subsequent API requests and merges the pipelines
const projectPipelines = ({ vcs, full_name }: { vcs: string; full_name: string }) =>
  fetchProjectPipelines(vcs, full_name)
    .then(async (resp) => {
      const resp2 = await fetchProjectPipelines(vcs, full_name, resp.next_page_token);
      return [...resp.items, ...resp2.items]
    })

export const circleCIWorkflows = ({ id }: { id: string }): Promise<Workflow[]> =>
  fetch(`https://circleci.com/api/v2/pipeline/${id}/workflow`, headers)
    .then((resp) => resp.json())
    .then((json) => {return  json as { items: Workflow[] };}
    )
    .then((json) => json.items);

const uriToVCSAndFullName = (uri: string): { vcs: string; full_name: string } => {
  const groups = uri.match(/https?:\/\/(?<host>[^/]+)\/(?<full_name>.+$)/)?.groups;
  if (!groups) {
    throw new Error("Bad URI: " + uri);
  }

  const { host, full_name } = groups;
  const vcs = host === "github.com" ? "gh" : host;

  return { vcs, full_name };
};

const headers = {
  headers: {
    "Circle-Token": apiKey,
    Accept: "application/json",
  },
};
