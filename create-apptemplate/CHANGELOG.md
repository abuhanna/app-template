# Changelog

All notable changes to @abuhannaa/create-apptemplate.

## 1.2.0 (2026-03-14)


### Features

* add advanced search and filtering with server-side pagination across all backends and frontends ([af0e05c](https://github.com/abuhanna/app-template/commit/af0e05c0fc70bf3940109f38691a7f9f8315a53b))
* add architecture selection (clean, nlayer, feature) for backend templates ([b22fb17](https://github.com/abuhanna/app-template/commit/b22fb175feee21cc2ae375cfeafda70c7b514139))
* add CI/CD, git hooks, and theme stores ([db9722f](https://github.com/abuhanna/app-template/commit/db9722f0804c8404fcf56a469409388c708056f0))
* add data export functionality (CSV, Excel, PDF) across all backends and frontends ([94a5dc9](https://github.com/abuhanna/app-template/commit/94a5dc9fdf9c0f49fbade7d4dd257ce2537b8fab))
* add dynamic readme templates ([c46c89d](https://github.com/abuhanna/app-template/commit/c46c89d6a6c49b0c469e4b404286cd4734e8a185))
* add env validation, health checks, password management, breadcrumbs, and i18n ([bad9727](https://github.com/abuhanna/app-template/commit/bad97278aab6149c7bcab5dbd8673cb015f672bd))
* add file upload and audit logging across all backends and frontends ([5c7e881](https://github.com/abuhanna/app-template/commit/5c7e881eb5fa13d075031f0ee7fbfae513983a8c))
* add React frontend support with MUI and PrimeReact templates ([fd5e540](https://github.com/abuhanna/app-template/commit/fd5e5400a722b8522f34a3246139c687a7a5b189))
* add STOMP WebSocket support for Spring Boot across all frontends ([979bbfd](https://github.com/abuhanna/app-template/commit/979bbfd9c2592ef0b2e9d7d97b2c730a4cf18e75))
* add zero variant (no-auth) to CLI and parity checker ([4468227](https://github.com/abuhanna/app-template/commit/446822778bdca256142838090daba4b2431a9d86))
* align minimal architectures with full architecture features and SSO auth ([3041eb4](https://github.com/abuhanna/app-template/commit/3041eb401c77a6faa6e1b2129b1ca72347fccdf8))
* **backend:** add JsonProperty annotations and audit listener improvements ([af4d612](https://github.com/abuhanna/app-template/commit/af4d61268b93ff6484314e5236bcc17449f0b984))
* **cli:** harden non-interactive mode with flag validation, quiet, and dry-run ([4829288](https://github.com/abuhanna/app-template/commit/48292889d0ff73d261dfb4a8872d271e296d7a44))
* **cli:** improve UX with per-step spinners, error messages, and rich summary ([c94e62d](https://github.com/abuhanna/app-template/commit/c94e62d8b4eebe49ccd262551944246e0c5e415a))
* configure Swagger OpenAPI documentation for Spring Boot templates ([32ab177](https://github.com/abuhanna/app-template/commit/32ab177b03ef370962598820f892c1da2e61a725))
* **create-apptemplate:** enhance java/spring project renaming support ([6eab222](https://github.com/abuhanna/app-template/commit/6eab2228b81b031ace43702ef42c402374208b82))
* enhance templates with docker, tests, and middleware for feature parity ([c5f1ea3](https://github.com/abuhanna/app-template/commit/c5f1ea3d7eea669f791e5d63181b8abfc7c01b7d))
* **frontend:** Standardize layouts, fix notifications, and refine UI ([95d2bfb](https://github.com/abuhanna/app-template/commit/95d2bfb4d380831fad496780925d13bce1c0f36b))
* **generator:** Add automatic environment file setup ([22ee44e](https://github.com/abuhanna/app-template/commit/22ee44e93cca8b76838ab8fc2213050947bd0214))
* implement Auth, Departments, Files, and Audit modules in all backend templates ([bb4e147](https://github.com/abuhanna/app-template/commit/bb4e147c6ac6d24cd379651bea2e525bfc7679da))
* Implement detailed audit logging and fix department update issues ([939b654](https://github.com/abuhanna/app-template/commit/939b65477ea837637a9eb90b47913b294721ed4b))
* implement dynamic docker config logic in generator ([2cae6a4](https://github.com/abuhanna/app-template/commit/2cae6a49da5169eb37b90cf5461342dda736a18e))
* implement dynamic feature selection and file cleanup logic ([d630edf](https://github.com/abuhanna/app-template/commit/d630edf9b10158d89d24310a74aa14aaeebdf9e6))
* implement dynamic readme generation ([0062a21](https://github.com/abuhanna/app-template/commit/0062a21a43c5c92858a7d2d6e9a1500b62303c5c))
* implement Health, Export, and Notification features across all templates ([fd851a5](https://github.com/abuhanna/app-template/commit/fd851a5795da150e558e6b3dfbe68c158eee73d1))
* implement pagination and sorting infrastructure across all templates ([3ed36c3](https://github.com/abuhanna/app-template/commit/3ed36c32215617c15415b408b9ef47e48e7651dc))
* implement role-based menu management across all frontends ([e70de60](https://github.com/abuhanna/app-template/commit/e70de60317754941ea8033270cae0fe0f5ad3d28))
* Implement Runtime Seeding and standardise Spring IDs ([9399f0c](https://github.com/abuhanna/app-template/commit/9399f0c19416bb896de92d37992b3dd30ef555fd))
* support login with email or username across all backends ([76f23ba](https://github.com/abuhanna/app-template/commit/76f23ba215159ba6ee1aadf0b63579fef7575e17))


### Bug Fixes

* align React frontends with Vue patterns and improve UX ([3e323f4](https://github.com/abuhanna/app-template/commit/3e323f4ad5bf0c2db854b0ef1149b2eca350e2aa))
* **auth:** make SSO users inactive by default ([2e7359a](https://github.com/abuhanna/app-template/commit/2e7359a301311470328ba72d3dd442539e4bef61))
* **backend:** align all minimal variants to spec, add missing tests ([c3db5e3](https://github.com/abuhanna/app-template/commit/c3db5e3ea984b272c115fbcb159fbb47c37b7fb3))
* **backend:** resolve InvalidCastException in AuditLogs and Auth endpoints and add soft delete audit tracking ([debdc57](https://github.com/abuhanna/app-template/commit/debdc57bbf8ea3454858c35ffc61b9cbdda2304c))
* **ci:** add mvnw chmod and sync nestjs lock file ([67f5bfa](https://github.com/abuhanna/app-template/commit/67f5bfa7764dddca34793ed986fe21e1be98e916))
* **ci:** correct working directories and paths in ci workflow ([406d44d](https://github.com/abuhanna/app-template/commit/406d44d3c901a64ca1b37ccea972f9bd256b3b6c))
* **cli:** ensure rename system works correctly for all stacks ([692faa0](https://github.com/abuhanna/app-template/commit/692faa02912a43a0246e19448a6ef61b747a9b78))
* **dotnet:** add missing using for async test helpers in clean/full ([27b1657](https://github.com/abuhanna/app-template/commit/27b1657f547d424701b7b07ab727a55ceb46536e))
* **dotnet:** align all variants to API contract specification ([6924888](https://github.com/abuhanna/app-template/commit/69248883498c4a61b7b0440e0601e3feddb5a542))
* **dotnet:** align package versions across all variants ([127575d](https://github.com/abuhanna/app-template/commit/127575dbf7da6361673c31dcefd25fc7c12bb148))
* ensure all default features present and working across all variants ([81214e0](https://github.com/abuhanna/app-template/commit/81214e0d4490b7dc1f8ace13772ba4afff46701d))
* **frontend:** align all minimal variants to spec ([81eaf49](https://github.com/abuhanna/app-template/commit/81eaf494876b175c2cd4c8eea21dc62cf42ea264))
* **frontend:** align all variants to API contract specification ([f6d2d80](https://github.com/abuhanna/app-template/commit/f6d2d80d5740300310060088b2aed371e84d184a))
* **frontend:** align package versions across all variants ([b562b85](https://github.com/abuhanna/app-template/commit/b562b854355cd3734e6a828064362655d7e432de))
* improve dark mode support and API response handling across frontends ([ef780d0](https://github.com/abuhanna/app-template/commit/ef780d042c6f9b229cd16fecae461f6b5690c4a4))
* **migrations:** gracefully handle existing database objects across architectures ([aa3e75f](https://github.com/abuhanna/app-template/commit/aa3e75f2be32939a584925d1c321306eae350817))
* **nestjs:** align all variants to API contract specification ([a2ee007](https://github.com/abuhanna/app-template/commit/a2ee007df762ccb9ac71e2b21b271d917760154a))
* **nestjs:** align package versions across all variants ([41505ff](https://github.com/abuhanna/app-template/commit/41505ff28078beb88651fa1de0901598b6310035))
* remove unused import and broken lint-staged config ([94bac69](https://github.com/abuhanna/app-template/commit/94bac695874797a6d7218fc8d8d782dea21fec1e)), closes [#6](https://github.com/abuhanna/app-template/issues/6)
* **spring:** align all variants to API contract specification ([5e010fc](https://github.com/abuhanna/app-template/commit/5e010fc1306d67ded776559a9a1262017cae1e8f))
* **spring:** align package versions across all variants ([4832030](https://github.com/abuhanna/app-template/commit/4832030247e25f84708c30816b2a1eac84149b95))
* **spring:** fix AuditLogIntegrationTest FK constraint in clean/minimal ([87dd4e7](https://github.com/abuhanna/app-template/commit/87dd4e755ac677615b529317eff1462b814c1097))
* standardize seed data across all variants ([bd84208](https://github.com/abuhanna/app-template/commit/bd842080c85935dd5f7563c9f97323ab8965329f))
* **template:** disable dataExport if dependencies (users, departments) are missing ([396a7c9](https://github.com/abuhanna/app-template/commit/396a7c94151c2a8b006f4445f748194b3d8682dd))
* **template:** fix CS8618 warnings and UserDto dependency in create-apptemplate ([f17b6c8](https://github.com/abuhanna/app-template/commit/f17b6c8effdf2bb527083234c99e96ec7a8c014c))


### Performance

* **cli:** use targeted degit downloads instead of full-repo download ([514cc2d](https://github.com/abuhanna/app-template/commit/514cc2dd0d149374357e86c89fbf5745a07c7986))


### Refactoring

* add shared/ README templates and unignore shared/*.md ([308d683](https://github.com/abuhanna/app-template/commit/308d6839c0d5abd4fb5750ee4df81b92a28770a7))
* Align backends with Clean Architecture and correct Seed Data ([421cc24](https://github.com/abuhanna/app-template/commit/421cc247a65a1bc6a5ce02f6e65203ee2b1d371e))
* convert TypeScript to JavaScript in Vue frontends for consistency ([c02df26](https://github.com/abuhanna/app-template/commit/c02df2660417c551f7d8489576caa09a73a11f1f))
* create shared/ folder for CLI-downloadable root files ([31221ac](https://github.com/abuhanna/app-template/commit/31221ac510d4a228ba4149f116232953975456fd))
* **dotnet:** consolidate to single InitialCreate migration per variant ([a4fe1b7](https://github.com/abuhanna/app-template/commit/a4fe1b7523b385ac9bfaa8e95e88982bbaff0034))
* **frontend:** fix layout scrolling behavior ([ac5f49b](https://github.com/abuhanna/app-template/commit/ac5f49bbe25afc1f6a7ad2c252ad8f7d986178c6))
* **frontend:** improve UX and fix file download issues ([afa9d11](https://github.com/abuhanna/app-template/commit/afa9d11d1b94534962e4c05acb93ba4fd855714b))
* **nestjs:** consolidate to single migration, enforce synchronize: false ([4ff7909](https://github.com/abuhanna/app-template/commit/4ff7909306bbc6ea7e82aeba3dcf28788c4cfc6b))
* **nestjs:** migrate ID types from UUID to numeric IDs across all layers ([cce9262](https://github.com/abuhanna/app-template/commit/cce92623ed72f3796568fb4ac3b01510f6c7d2a3))
* Remove Department entity and update minimal architecture auth services ([3a031b0](https://github.com/abuhanna/app-template/commit/3a031b0b83f449e63aba03c8f9f9a267e6d485f5))
* remove deprecated docker/templates/root in favor of shared/ ([870ac65](https://github.com/abuhanna/app-template/commit/870ac6559b57460455bc61ab841fd0870e655c69))
* restructure monorepo to hierarchical directory layout with full/minimal variants ([4c0d5cd](https://github.com/abuhanna/app-template/commit/4c0d5cd68c1dc0f43ee8348768747855b9d32348))
* **spring:** consolidate to single Flyway migration, enforce ddl-auto=validate ([8f83abb](https://github.com/abuhanna/app-template/commit/8f83abb88ce158b5bb991eb50f3fc86bd9d75f94))


### Tests

* add comprehensive unit tests across all 26 backend + 8 frontend variants ([7d4276e](https://github.com/abuhanna/app-template/commit/7d4276ed89825fe2343af50f64f9c4b2691877a2))
* add cross-stack API contract integration test ([82ee069](https://github.com/abuhanna/app-template/commit/82ee069ee1754808fc458aeb8986628e5402bb9a))
* add e2e test infrastructure for all 98 combinations ([d8f49ea](https://github.com/abuhanna/app-template/commit/d8f49ea1a504ab847f28e5e94f8c5761db1637b0))
* add layer 1 quick tests for cli, structure, and versions ([f845033](https://github.com/abuhanna/app-template/commit/f8450333aa183ff6c411ab792c716b5b89fb999d))
* add layer 2 full matrix generation and build tests ([ee7a880](https://github.com/abuhanna/app-template/commit/ee7a8803aa726f5fe0b0352ebb9ae5553a4779d7))
* add layer 3 api contract and cross-stack parity tests ([7063c1f](https://github.com/abuhanna/app-template/commit/7063c1f56ad80eed0d5e54e7c37f38c5b00ba629))


### CI/CD

* add 3-layer testing pipeline (quick, matrix, pre-publish) ([835f147](https://github.com/abuhanna/app-template/commit/835f1477942679ebb77dc2c62fa16ba09d9c0034))
* add automated minimal variant validation ([882984c](https://github.com/abuhanna/app-template/commit/882984c15268895d3f15caddba127f732d6e44a5))
* add version consistency check to PR pipeline ([5039a07](https://github.com/abuhanna/app-template/commit/5039a07237aeb91b8c6c21d6ed9f8060b787cb08))


### Documentation

* add canonical database schema, fix cross-stack mismatches ([61e4a2b](https://github.com/abuhanna/app-template/commit/61e4a2b10f609d1e58090021730920af78f8a26f))
* add definitive API contract specification ([b378614](https://github.com/abuhanna/app-template/commit/b3786143f1e4486d86a52a3fd3d4f1630cc3afd5))
* add minimal variant audit report ([46b5c7c](https://github.com/abuhanna/app-template/commit/46b5c7c6b782fa763c993ee806b5c8545af5ac1b))
* add minimal variant specification ([88af225](https://github.com/abuhanna/app-template/commit/88af22531db9d64035ae60b3513416580db55808))
* add previously-hidden files exposed by .gitignore cleanup ([62edd9c](https://github.com/abuhanna/app-template/commit/62edd9cbaab34428a8a0a2cf917da6fec6566aa3))
* add version alignment documentation ([c319a1f](https://github.com/abuhanna/app-template/commit/c319a1f32d8684bc8a75ce3119087ebe43159ce3))
* add zero variant specification ([9f6ba99](https://github.com/abuhanna/app-template/commit/9f6ba9916fe8b48caf19c8af01581e238ddb4175))
* expand CLAUDE.md, README, and version alignment documentation ([5b5b64b](https://github.com/abuhanna/app-template/commit/5b5b64b57f7aa0b02582925b95f272f53767d06e))
* **spring:** rename modules to clean architecture naming ([ecc5eca](https://github.com/abuhanna/app-template/commit/ecc5eca699ced9100bc00970a747170573beb694))
* update CLAUDE.md with React frontend documentation ([244cae8](https://github.com/abuhanna/app-template/commit/244cae88c3c60bf99d8632eccf38803767d64230))
* update create-apptemplate README with comprehensive documentation ([1cf5a08](https://github.com/abuhanna/app-template/commit/1cf5a08f7eb146466826a9eabb7625cd212753ea))


### Build System

* add centralized version manifest ([4932872](https://github.com/abuhanna/app-template/commit/4932872ef78d59daab50ccc000c38308c45ffd94))
* add dedicated test database setup ([5a9389f](https://github.com/abuhanna/app-template/commit/5a9389faade651193be9ab02d8fc3d7dd0ebc1a8))
* add pre-publish validation suite ([7cd5c2b](https://github.com/abuhanna/app-template/commit/7cd5c2b0b89e8d6e4b901c07c6f3b51ed146e83e))
* add variant feature parity checker ([38f564c](https://github.com/abuhanna/app-template/commit/38f564c377cf13e3dbabd2f0943cdd97ff5b7352))
* add version sync automation script ([d0397a7](https://github.com/abuhanna/app-template/commit/d0397a7e142658e267a36e2614c40767f840200d))
* add version sync checker script ([0ca283a](https://github.com/abuhanna/app-template/commit/0ca283aef73b64f900f56c0260a128a194019f4b))
* **cli:** add automated semantic versioning with standard-version ([97d73e7](https://github.com/abuhanna/app-template/commit/97d73e7ec13c04f0d6354b41238aad62a0ac343d))
* standardize all .gitignore files to enterprise standard ([bfb9055](https://github.com/abuhanna/app-template/commit/bfb905581970320497e840dede39adb1fb98219c))

### 1.1.1 (2026-03-14)


### Features

* add advanced search and filtering with server-side pagination across all backends and frontends ([af0e05c](https://github.com/abuhanna/app-template/commit/af0e05c0fc70bf3940109f38691a7f9f8315a53b))
* add architecture selection (clean, nlayer, feature) for backend templates ([b22fb17](https://github.com/abuhanna/app-template/commit/b22fb175feee21cc2ae375cfeafda70c7b514139))
* add CI/CD, git hooks, and theme stores ([db9722f](https://github.com/abuhanna/app-template/commit/db9722f0804c8404fcf56a469409388c708056f0))
* add data export functionality (CSV, Excel, PDF) across all backends and frontends ([94a5dc9](https://github.com/abuhanna/app-template/commit/94a5dc9fdf9c0f49fbade7d4dd257ce2537b8fab))
* add dynamic readme templates ([c46c89d](https://github.com/abuhanna/app-template/commit/c46c89d6a6c49b0c469e4b404286cd4734e8a185))
* add env validation, health checks, password management, breadcrumbs, and i18n ([bad9727](https://github.com/abuhanna/app-template/commit/bad97278aab6149c7bcab5dbd8673cb015f672bd))
* add file upload and audit logging across all backends and frontends ([5c7e881](https://github.com/abuhanna/app-template/commit/5c7e881eb5fa13d075031f0ee7fbfae513983a8c))
* add React frontend support with MUI and PrimeReact templates ([fd5e540](https://github.com/abuhanna/app-template/commit/fd5e5400a722b8522f34a3246139c687a7a5b189))
* add STOMP WebSocket support for Spring Boot across all frontends ([979bbfd](https://github.com/abuhanna/app-template/commit/979bbfd9c2592ef0b2e9d7d97b2c730a4cf18e75))
* add zero variant (no-auth) to CLI and parity checker ([4468227](https://github.com/abuhanna/app-template/commit/446822778bdca256142838090daba4b2431a9d86))
* align minimal architectures with full architecture features and SSO auth ([3041eb4](https://github.com/abuhanna/app-template/commit/3041eb401c77a6faa6e1b2129b1ca72347fccdf8))
* **backend:** add JsonProperty annotations and audit listener improvements ([af4d612](https://github.com/abuhanna/app-template/commit/af4d61268b93ff6484314e5236bcc17449f0b984))
* **cli:** harden non-interactive mode with flag validation, quiet, and dry-run ([4829288](https://github.com/abuhanna/app-template/commit/48292889d0ff73d261dfb4a8872d271e296d7a44))
* **cli:** improve UX with per-step spinners, error messages, and rich summary ([c94e62d](https://github.com/abuhanna/app-template/commit/c94e62d8b4eebe49ccd262551944246e0c5e415a))
* configure Swagger OpenAPI documentation for Spring Boot templates ([32ab177](https://github.com/abuhanna/app-template/commit/32ab177b03ef370962598820f892c1da2e61a725))
* **create-apptemplate:** enhance java/spring project renaming support ([6eab222](https://github.com/abuhanna/app-template/commit/6eab2228b81b031ace43702ef42c402374208b82))
* enhance templates with docker, tests, and middleware for feature parity ([c5f1ea3](https://github.com/abuhanna/app-template/commit/c5f1ea3d7eea669f791e5d63181b8abfc7c01b7d))
* **frontend:** Standardize layouts, fix notifications, and refine UI ([95d2bfb](https://github.com/abuhanna/app-template/commit/95d2bfb4d380831fad496780925d13bce1c0f36b))
* **generator:** Add automatic environment file setup ([22ee44e](https://github.com/abuhanna/app-template/commit/22ee44e93cca8b76838ab8fc2213050947bd0214))
* implement Auth, Departments, Files, and Audit modules in all backend templates ([bb4e147](https://github.com/abuhanna/app-template/commit/bb4e147c6ac6d24cd379651bea2e525bfc7679da))
* Implement detailed audit logging and fix department update issues ([939b654](https://github.com/abuhanna/app-template/commit/939b65477ea837637a9eb90b47913b294721ed4b))
* implement dynamic docker config logic in generator ([2cae6a4](https://github.com/abuhanna/app-template/commit/2cae6a49da5169eb37b90cf5461342dda736a18e))
* implement dynamic feature selection and file cleanup logic ([d630edf](https://github.com/abuhanna/app-template/commit/d630edf9b10158d89d24310a74aa14aaeebdf9e6))
* implement dynamic readme generation ([0062a21](https://github.com/abuhanna/app-template/commit/0062a21a43c5c92858a7d2d6e9a1500b62303c5c))
* implement Health, Export, and Notification features across all templates ([fd851a5](https://github.com/abuhanna/app-template/commit/fd851a5795da150e558e6b3dfbe68c158eee73d1))
* implement pagination and sorting infrastructure across all templates ([3ed36c3](https://github.com/abuhanna/app-template/commit/3ed36c32215617c15415b408b9ef47e48e7651dc))
* implement role-based menu management across all frontends ([e70de60](https://github.com/abuhanna/app-template/commit/e70de60317754941ea8033270cae0fe0f5ad3d28))
* Implement Runtime Seeding and standardise Spring IDs ([9399f0c](https://github.com/abuhanna/app-template/commit/9399f0c19416bb896de92d37992b3dd30ef555fd))
* support login with email or username across all backends ([76f23ba](https://github.com/abuhanna/app-template/commit/76f23ba215159ba6ee1aadf0b63579fef7575e17))


### Bug Fixes

* align React frontends with Vue patterns and improve UX ([3e323f4](https://github.com/abuhanna/app-template/commit/3e323f4ad5bf0c2db854b0ef1149b2eca350e2aa))
* **auth:** make SSO users inactive by default ([2e7359a](https://github.com/abuhanna/app-template/commit/2e7359a301311470328ba72d3dd442539e4bef61))
* **backend:** align all minimal variants to spec, add missing tests ([c3db5e3](https://github.com/abuhanna/app-template/commit/c3db5e3ea984b272c115fbcb159fbb47c37b7fb3))
* **backend:** resolve InvalidCastException in AuditLogs and Auth endpoints and add soft delete audit tracking ([debdc57](https://github.com/abuhanna/app-template/commit/debdc57bbf8ea3454858c35ffc61b9cbdda2304c))
* **cli:** ensure rename system works correctly for all stacks ([692faa0](https://github.com/abuhanna/app-template/commit/692faa02912a43a0246e19448a6ef61b747a9b78))
* **dotnet:** add missing using for async test helpers in clean/full ([27b1657](https://github.com/abuhanna/app-template/commit/27b1657f547d424701b7b07ab727a55ceb46536e))
* **dotnet:** align all variants to API contract specification ([6924888](https://github.com/abuhanna/app-template/commit/69248883498c4a61b7b0440e0601e3feddb5a542))
* **dotnet:** align package versions across all variants ([127575d](https://github.com/abuhanna/app-template/commit/127575dbf7da6361673c31dcefd25fc7c12bb148))
* ensure all default features present and working across all variants ([81214e0](https://github.com/abuhanna/app-template/commit/81214e0d4490b7dc1f8ace13772ba4afff46701d))
* **frontend:** align all minimal variants to spec ([81eaf49](https://github.com/abuhanna/app-template/commit/81eaf494876b175c2cd4c8eea21dc62cf42ea264))
* **frontend:** align all variants to API contract specification ([f6d2d80](https://github.com/abuhanna/app-template/commit/f6d2d80d5740300310060088b2aed371e84d184a))
* **frontend:** align package versions across all variants ([b562b85](https://github.com/abuhanna/app-template/commit/b562b854355cd3734e6a828064362655d7e432de))
* improve dark mode support and API response handling across frontends ([ef780d0](https://github.com/abuhanna/app-template/commit/ef780d042c6f9b229cd16fecae461f6b5690c4a4))
* **migrations:** gracefully handle existing database objects across architectures ([aa3e75f](https://github.com/abuhanna/app-template/commit/aa3e75f2be32939a584925d1c321306eae350817))
* **nestjs:** align all variants to API contract specification ([a2ee007](https://github.com/abuhanna/app-template/commit/a2ee007df762ccb9ac71e2b21b271d917760154a))
* **nestjs:** align package versions across all variants ([41505ff](https://github.com/abuhanna/app-template/commit/41505ff28078beb88651fa1de0901598b6310035))
* **spring:** align all variants to API contract specification ([5e010fc](https://github.com/abuhanna/app-template/commit/5e010fc1306d67ded776559a9a1262017cae1e8f))
* **spring:** align package versions across all variants ([4832030](https://github.com/abuhanna/app-template/commit/4832030247e25f84708c30816b2a1eac84149b95))
* **spring:** fix AuditLogIntegrationTest FK constraint in clean/minimal ([87dd4e7](https://github.com/abuhanna/app-template/commit/87dd4e755ac677615b529317eff1462b814c1097))
* standardize seed data across all variants ([bd84208](https://github.com/abuhanna/app-template/commit/bd842080c85935dd5f7563c9f97323ab8965329f))
* **template:** disable dataExport if dependencies (users, departments) are missing ([396a7c9](https://github.com/abuhanna/app-template/commit/396a7c94151c2a8b006f4445f748194b3d8682dd))
* **template:** fix CS8618 warnings and UserDto dependency in create-apptemplate ([f17b6c8](https://github.com/abuhanna/app-template/commit/f17b6c8effdf2bb527083234c99e96ec7a8c014c))


### Performance

* **cli:** use targeted degit downloads instead of full-repo download ([514cc2d](https://github.com/abuhanna/app-template/commit/514cc2dd0d149374357e86c89fbf5745a07c7986))


### Refactoring

* add shared/ README templates and unignore shared/*.md ([308d683](https://github.com/abuhanna/app-template/commit/308d6839c0d5abd4fb5750ee4df81b92a28770a7))
* Align backends with Clean Architecture and correct Seed Data ([421cc24](https://github.com/abuhanna/app-template/commit/421cc247a65a1bc6a5ce02f6e65203ee2b1d371e))
* convert TypeScript to JavaScript in Vue frontends for consistency ([c02df26](https://github.com/abuhanna/app-template/commit/c02df2660417c551f7d8489576caa09a73a11f1f))
* create shared/ folder for CLI-downloadable root files ([31221ac](https://github.com/abuhanna/app-template/commit/31221ac510d4a228ba4149f116232953975456fd))
* **dotnet:** consolidate to single InitialCreate migration per variant ([a4fe1b7](https://github.com/abuhanna/app-template/commit/a4fe1b7523b385ac9bfaa8e95e88982bbaff0034))
* **frontend:** fix layout scrolling behavior ([ac5f49b](https://github.com/abuhanna/app-template/commit/ac5f49bbe25afc1f6a7ad2c252ad8f7d986178c6))
* **frontend:** improve UX and fix file download issues ([afa9d11](https://github.com/abuhanna/app-template/commit/afa9d11d1b94534962e4c05acb93ba4fd855714b))
* **nestjs:** consolidate to single migration, enforce synchronize: false ([4ff7909](https://github.com/abuhanna/app-template/commit/4ff7909306bbc6ea7e82aeba3dcf28788c4cfc6b))
* **nestjs:** migrate ID types from UUID to numeric IDs across all layers ([cce9262](https://github.com/abuhanna/app-template/commit/cce92623ed72f3796568fb4ac3b01510f6c7d2a3))
* Remove Department entity and update minimal architecture auth services ([3a031b0](https://github.com/abuhanna/app-template/commit/3a031b0b83f449e63aba03c8f9f9a267e6d485f5))
* remove deprecated docker/templates/root in favor of shared/ ([870ac65](https://github.com/abuhanna/app-template/commit/870ac6559b57460455bc61ab841fd0870e655c69))
* restructure monorepo to hierarchical directory layout with full/minimal variants ([4c0d5cd](https://github.com/abuhanna/app-template/commit/4c0d5cd68c1dc0f43ee8348768747855b9d32348))
* **spring:** consolidate to single Flyway migration, enforce ddl-auto=validate ([8f83abb](https://github.com/abuhanna/app-template/commit/8f83abb88ce158b5bb991eb50f3fc86bd9d75f94))


### Tests

* add comprehensive unit tests across all 26 backend + 8 frontend variants ([7d4276e](https://github.com/abuhanna/app-template/commit/7d4276ed89825fe2343af50f64f9c4b2691877a2))
* add cross-stack API contract integration test ([82ee069](https://github.com/abuhanna/app-template/commit/82ee069ee1754808fc458aeb8986628e5402bb9a))
* add e2e test infrastructure for all 98 combinations ([d8f49ea](https://github.com/abuhanna/app-template/commit/d8f49ea1a504ab847f28e5e94f8c5761db1637b0))
* add layer 1 quick tests for cli, structure, and versions ([f845033](https://github.com/abuhanna/app-template/commit/f8450333aa183ff6c411ab792c716b5b89fb999d))
* add layer 2 full matrix generation and build tests ([ee7a880](https://github.com/abuhanna/app-template/commit/ee7a8803aa726f5fe0b0352ebb9ae5553a4779d7))
* add layer 3 api contract and cross-stack parity tests ([7063c1f](https://github.com/abuhanna/app-template/commit/7063c1f56ad80eed0d5e54e7c37f38c5b00ba629))


### CI/CD

* add 3-layer testing pipeline (quick, matrix, pre-publish) ([835f147](https://github.com/abuhanna/app-template/commit/835f1477942679ebb77dc2c62fa16ba09d9c0034))
* add automated minimal variant validation ([882984c](https://github.com/abuhanna/app-template/commit/882984c15268895d3f15caddba127f732d6e44a5))
* add version consistency check to PR pipeline ([5039a07](https://github.com/abuhanna/app-template/commit/5039a07237aeb91b8c6c21d6ed9f8060b787cb08))


### Build System

* add centralized version manifest ([4932872](https://github.com/abuhanna/app-template/commit/4932872ef78d59daab50ccc000c38308c45ffd94))
* add dedicated test database setup ([5a9389f](https://github.com/abuhanna/app-template/commit/5a9389faade651193be9ab02d8fc3d7dd0ebc1a8))
* add pre-publish validation suite ([7cd5c2b](https://github.com/abuhanna/app-template/commit/7cd5c2b0b89e8d6e4b901c07c6f3b51ed146e83e))
* add variant feature parity checker ([38f564c](https://github.com/abuhanna/app-template/commit/38f564c377cf13e3dbabd2f0943cdd97ff5b7352))
* add version sync automation script ([d0397a7](https://github.com/abuhanna/app-template/commit/d0397a7e142658e267a36e2614c40767f840200d))
* add version sync checker script ([0ca283a](https://github.com/abuhanna/app-template/commit/0ca283aef73b64f900f56c0260a128a194019f4b))
* standardize all .gitignore files to enterprise standard ([bfb9055](https://github.com/abuhanna/app-template/commit/bfb905581970320497e840dede39adb1fb98219c))


### Documentation

* add canonical database schema, fix cross-stack mismatches ([61e4a2b](https://github.com/abuhanna/app-template/commit/61e4a2b10f609d1e58090021730920af78f8a26f))
* add definitive API contract specification ([b378614](https://github.com/abuhanna/app-template/commit/b3786143f1e4486d86a52a3fd3d4f1630cc3afd5))
* add minimal variant audit report ([46b5c7c](https://github.com/abuhanna/app-template/commit/46b5c7c6b782fa763c993ee806b5c8545af5ac1b))
* add minimal variant specification ([88af225](https://github.com/abuhanna/app-template/commit/88af22531db9d64035ae60b3513416580db55808))
* add previously-hidden files exposed by .gitignore cleanup ([62edd9c](https://github.com/abuhanna/app-template/commit/62edd9cbaab34428a8a0a2cf917da6fec6566aa3))
* add version alignment documentation ([c319a1f](https://github.com/abuhanna/app-template/commit/c319a1f32d8684bc8a75ce3119087ebe43159ce3))
* add zero variant specification ([9f6ba99](https://github.com/abuhanna/app-template/commit/9f6ba9916fe8b48caf19c8af01581e238ddb4175))
* expand CLAUDE.md, README, and version alignment documentation ([5b5b64b](https://github.com/abuhanna/app-template/commit/5b5b64b57f7aa0b02582925b95f272f53767d06e))
* **spring:** rename modules to clean architecture naming ([ecc5eca](https://github.com/abuhanna/app-template/commit/ecc5eca699ced9100bc00970a747170573beb694))
* update CLAUDE.md with React frontend documentation ([244cae8](https://github.com/abuhanna/app-template/commit/244cae88c3c60bf99d8632eccf38803767d64230))
* update create-apptemplate README with comprehensive documentation ([1cf5a08](https://github.com/abuhanna/app-template/commit/1cf5a08f7eb146466826a9eabb7625cd212753ea))
