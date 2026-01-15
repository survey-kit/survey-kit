## Branch Convention

Before creating a branch, a ticket is created on [survey-kit.com](https://www.survey-kit.com/#board).

Name the branch as `sk<sprint-number>-<ticket-title>`.

For example: `sk1-initial-creation`.

## Commit Convention

Before you create a Pull Request, please check whether your commits comply with
the commit conventions used in this repository.

When you create a commit we kindly ask you to follow the convention
`category(scope or module): message` in your commit message while using one of
the following categories:

- `feat / feature`: all changes that introduce completely new code or new
  features
- `fix`: changes that fix a bug (ideally you will additionally reference an
  issue if present)
- `refactor`: any code-related change that is not a fix nor a feature
- `docs`: changing existing or creating new documentation (i.e. README, docs for
  usage of a library or CLI usage)
- `build`: all changes regarding the build of the software, changes to
  dependencies or the addition of new dependencies
- `test`: all changes regarding tests (adding new tests or changing existing
  ones)
- `ci`: all changes regarding the configuration of continuous integration (i.e.
  GitHub Actions, CI system)
- `chore`: all changes to the repository that do not fit into any of the above
  categories

  e.g. `feat(components): add new prop to the avatar component`

If you are interested in the detailed specification you can visit
https://www.conventionalcommits.org/ or check out the
[Angular Commit Message Guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines).

## Pull Request Convetion

When creating a pull request, please reference the sprint and branch name in the title.

For example if the sprint is `sk1` and the branch is `sk1-initial-creation`, the pull request title should be `SK1 - Initial Creation`.

## Publishing

- Run `npm run build --workspaces`
- Publish each package from its folder with `npm publish --access public`
