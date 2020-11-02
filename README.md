# spo-returns-automated-tests

This is the smoke-test repo for the SPO-Returns apps (API & UI).  It can be used as
a GitHub Action or run manually.

This is technically a public repo and action, but it **WILL NOT** be published to the
GitHub Action Marketplace for general usage.

This suite of tests uses environment variables to determine which environment to run the
tests against and to ensure proper test setup (calls to our test Shopify store).  These
**SHOULD NEVER** point to our production environments as the tests will be creating
users, orders, and returns.

**Required Variables**
```
# The default values.
RETURNS_API_URL=http://localhost:7071
RETURNS_UI_URL=http://localhost:3000
```

---
When the optional variables are specified, the tests will look for those values exactly
in the responses from the Returns Apps.  For example, if the `UI_VERSION` is specified,
the test will check the version of the React app to make sure it matches exactly.  If not,
the version will be tested via regular expression to confirm it matches our expected format.

**Optional Variables**
```
API_VERSION
UI_VERSION
```

### GitHub Action usage
This action should be used as part of a release deployment to ensure proper functionality
prior to a production release.  The steps should generally be:
1. Build the project
2. Release to non-prod
3. Smoke-test non-prod; if not successful, STOP
4. Build the project with production params (if necessary)
5. Release to prod

These lines will be in the action YAML file for the desired project to test
```
    - name: Run smoke tests
      uses: RueLaLa/spo-returns-automated-tests@main
      env:
        RETURNS_API_URL: "the url for non-prod APIs"
        RETURNS_UI_URL: "the url for the non-prod UI"
```
For the React app project, the `UI_VERSION` environment variable should be specified
as the name of the release/branch being deployed.
```
        UI_VERSION: "${{ steps.vars.outputs.RELEASE_NAME }}"
        # or
        UI_VERSION: "${{ steps.vars.outputs.BRANCH_HASH }}"
```
For the Azure Function app project, the `API_VERSION` environment variable should be specified
in the same manner.
```
        API_VERSION: "${{ steps.vars.outputs.RELEASE_NAME }}"
        # or
        API_VERSION: "${{ steps.vars.outputs.BRANCH_HASH }}"
```

### Manual Usage
The smoke tests should be run against your local environment before merging changes
into the main branch.  The tests can also be run manually against our non-prod environment
as a secondary check for feature testing.  

To run:
1. Clone the repo
2. Run `npm install`
3. Environment setup (using local as the example)
    * `cp env/env-setup-template env/local-setup`
    * Open `env/local-setup` in your favorite text editor (e.g. `vim`)
    * Modify and/or uncomment variables as needed
    * source the file to set the variables: `source env/local-setup`
4. Run the tests: `npm run test`

The `.gitignore` file is set up in such a way that your env file will not be saved
to our repo as long as you keep it in the `env` directory thus keeping any secrets
more safe.
