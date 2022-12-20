# Circle CI + Github - Workflow navigator

This extensions navigates CircleCI workflows in an alternative way which is useful for projects with many workflows. 
A classic scenario is an organisation with a monorepo.

## How is it different?
Circle CI usually navigates by Project->Pipelines->Workflow-Run->Jobs
This extension navigates by Workflow-name->Workflow-Runs->Workflow-jobs.

This extension uses a fixed Project and branch names. It executes multiple requests against the CircleCI API and the aggregates
the data by workflow names (in contrary to Workflow runs in the classic CircleCI UI). 

## How to get an API Token

1. Open https://app.circleci.com/settings/user/tokens.
2. Click "Create New Token".
3. Name it (eg: "Raycast")
4. Here is your API Token.

# Credits 
This extension was bootstrapped from https://github.com/raycast/extensions/tree/main/extensions/circle-ci.
It contains much code from there but uses a different navigation methodology.