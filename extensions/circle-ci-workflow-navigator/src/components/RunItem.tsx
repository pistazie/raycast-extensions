import { Preferences, Workflow, WorkflowStatus } from "../types";
import { ActionPanel, Color, getPreferenceValues, Icon, ImageLike, List, Action } from "@raycast/api";
import moment from "moment";

const { repoGithubUrl }: Preferences = getPreferenceValues();

function generateRunDetailsBySubject(subject: string) {
  // Attempt with Github default merge message
  const prMergeRegex = /Merge pull request #(\d{1,7}).*from\s(.{1,100})/i;
  const prMergeRegexMatches = prMergeRegex.exec(subject);
  if (prMergeRegexMatches) {
    return {
      title: prMergeRegexMatches[1],
      githubPrNumber: parseInt(prMergeRegexMatches[1]),
      subTitle: prMergeRegexMatches[2]
    };
  }

  // Generically attempt with a #PR number
  const guessedPrNum = /[pull|pr].*#([0-9]{1,10})/i;
  const guessedPrNumMatches = guessedPrNum.exec(subject);
  if (guessedPrNumMatches) {
    return {
      title: guessedPrNumMatches[1],
      githubPrNumber: parseInt(guessedPrNumMatches[1]),
      subTitle: subject
    };
  }

  // last strategy, only return the full subject
  return { subTitle: subject };
}

function generateRunDetailsByTrigger(trigger: string) {
  return {
    subTitle: trigger
  };
}

function generateRunDetails(workflow: Workflow): { title?: string, subTitle?: string, githubPrNumber?: number } {

  // by subject strategy
  const subject = (workflow.pipeline?.vcs as any)?.commit?.subject;
  if (subject) return generateRunDetailsBySubject(subject);

  // by trigger strategy
  const trigger = (workflow.pipeline?.trigger as any)?.type;
  if (trigger) return generateRunDetailsByTrigger(trigger);

  // no strategy - return undefined
  return {};
}

export const RunItem = ({ workflow }: { workflow: Workflow }) => {
  const { id, pipeline_number, project_slug } = workflow;

  const projectUrlPathPart = project_slug.replace(/^gh\//, "github/");
  const circleCiRunUrl = `https://app.circleci.com/pipelines/${projectUrlPathPart}/${pipeline_number}/workflows/${id}`;

  const { title, subTitle, githubPrNumber } = generateRunDetails(workflow);

  const minutesAgo = moment(workflow.created_at).diff(Date.now(), "minutes");

  const gitHubPrUrl = githubPrNumber ? `${repoGithubUrl}/pull/${githubPrNumber}` : undefined

  return (
    <List.Item
      id={workflow.id}
      icon={getWorkflowAccessoryIcon({ status: workflow.status })}
      key={workflow.id}
      title={title || ""}
      subtitle={subTitle || ""}
      accessoryTitle={`started ${minutesAgo * -1} min. ago`}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser
            title={"Open in circle CI"}
            url={circleCiRunUrl}
          />
          <ConditionalOpenInBrowser
            title={"Open PR in GitHub"}
            url={gitHubPrUrl} />
        </ActionPanel>
      }
    />
  );
};

function ConditionalOpenInBrowser(props: {title: string, url: string | undefined}) {

  if (props.url) {
    return <Action.OpenInBrowser url={props.url} title={props.title} />
  } else {
    return null
  }
}

const getWorkflowAccessoryIcon = ({ status }: { status: WorkflowStatus }): ImageLike => {
  switch (status) {
    case WorkflowStatus.success:
      return { source: Icon.Checkmark, tintColor: Color.Green };
    case WorkflowStatus.running:
      return { source: Icon.Gear, tintColor: Color.Blue };
    case WorkflowStatus.not_run:
      return { source: Icon.Circle, tintColor: Color.SecondaryText };
    case WorkflowStatus.failed:
      return { source: Icon.XmarkCircle, tintColor: Color.Red };
    case WorkflowStatus.error:
      return { source: Icon.XmarkCircle, tintColor: Color.Orange };
    case WorkflowStatus.failing:
      return { source: Icon.XmarkCircle, tintColor: Color.Red };
    case WorkflowStatus.on_hold:
      return { source: Icon.Clock, tintColor: Color.Blue };
    case WorkflowStatus.canceled:
      return { source: Icon.XmarkCircle, tintColor: Color.SecondaryText };
    case WorkflowStatus.unauthorized:
      return { source: Icon.ExclamationMark, tintColor: Color.Red };
    default:
      return { source: Icon.Gear, tintColor: Color.Blue };
  }
};
