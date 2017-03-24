Roundaway
============

## Git Flow

<table>
 <thead>
  <tr>
   <th>Branch name</th>
   <th>Port</th>
   <th>URL</th>
   <th>Backend Version</th>
   <th>Frontend Version</th>
   <th>Purpose</th>
  </tr>
 </thead>
 <tbody>
  <tr>
   <td>master</td>
   <td>8080</td>
   <td>http://roundaway.com</td>
   <td>1.3.0</td>
   <td>0.1.0</td>
   <td>production</td>
  </tr>
  <tr>
   <td>dev</td>
   <td>8081</td>
   <td>http://roundaway.com:8081</th>
   <td>1.3.2</td>
   <td>0.1.0</td>
   <td>staging (completed items)</td>
  </tr>
  <tr>
   <td><i>#-topic</i></td>
   <td colspan="4">LOCAL</td>
   <td>development (tasks in progress)</td>
  </tr>
 </tbody>
</table>

- Always rebase the source branch onto the target branch before merging (--ff)
- When a task is complete merge the topic branch into dev
- Merges from dev -> master will occur once a significant number of tasks have been completed
- After every merge, update the version number in the package.json and this readme in the target branch following the appropriate scheme
  - Increment least significant digit by 1
  - i.e. on dev: `0.3.4` becomes `0.3.5`
  - on master: `0.3` becomes `0.4`
    - update the **minor** version number on dev after merging to master

## Set Up
1. Clone/download this repo
2. Run `npm update` to download and update all required packages
3. Create and/or find keys for *Facebook* and *Google* web applications (for authentication)
4. Create and/or find the *Google* API key and ensure that the following API's are enabled for it:
  - Geocoding API
5. Create and/or find the *Stripe* secret key
6. Create and/or find the application secret key for *JWT* authentication
7. Create a **config.js** file that exports an object with the following config keys (see **config.example.js** for more info and defaults):
  * FACEBOOK_CLIENT_ID
  * FACEBOOK_CLIENT_SECRET
  * GOOGLE_CLIENT_ID
  * GOOGLE_CLIENT_SECRET
  * GOOGLE_API_KEY
  * STRIPE_SECRET_KEY
  * STRIPE_PUBLISH_KEY
  * JWT_SECRET_KEY
  * PORT
  * DB_CONNECTION_STRING
  * RUN_SYSTEM_TESTS
  * RUN_EXTERNAL_TESTS
8. Ensure MongoDB server is running on localhost
9. *(Optional)* The server will be the port defined in **config.js**. Set up any necessary port-forwarding to accomodate this.

*(Note: For upgrading existing deployments, since `config.js` is `.gitignore`d, the file that is already deployed should be left with the keys it has and updated as necessary)*

## Tests

There are two types of tests in the backend: **unit** tests and **integration** tests.
The unit tests are organized by controller. All the integration tests are nested under a single describe
```
describe('the entire app should not explode', function() {
```
in the `system.test.js` file. This describe is `.skip()`ed on `dev` but allowed to run on `master` because it takes a *very* long time for the integration tests to complete. This is due to the fact that the **integration** tests interact with a live db so when running integration tests keep in mind that you will need to have a `mongod` instance running.
All the test files are named `*.test.js` and are in the `/app/tests/` directory.
Commits with breaking tests are allowed in topic branches and thus when merged into `dev` or `master` some commits will have failing changes, but **ENSURE THAT WHEN YOU MERGE BRANCHES THE `HEAD` IS PASSING ALL TESTS (INCLUDING INTEGRATION TESTS)**.

## Documentation

http://nigh7sh4de.github.io/roundaway/