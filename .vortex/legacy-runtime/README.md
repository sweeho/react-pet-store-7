# Legacy runtime: Java Pet Store 1.3.2

Runs the legacy application for initiative SWHR6-N-0001, Sun Java Pet Store
1.3.2, built from its legacy source with its own Ant build and deployed to the
J2EE 1.3.1 Reference Implementation (RI), with the RI's Cloudscape database.

## URL

The acceptance suite reaches the legacy application at:

```
http://localhost:8000/petstore/
```

Set `LEGACY_HTTP_PORT` to publish on another host port; the path stays
`/petstore/`.

## Start

From the repository root:

```sh
docker compose -f .vortex/legacy-runtime/compose.yaml up --build --wait
```

`--wait` returns when the `app` healthcheck gets a 200 from `/petstore/`. The
first start deploys the four EARs and can take several minutes. Stop with
`docker compose -f .vortex/legacy-runtime/compose.yaml down`.

| Service | What it runs                                                                                                                                                                                  |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `db`    | `cloudscape -start`: the RI's Cloudscape server (RmiJdbc, port 1099), holding PetStoreDB, OPCDB and SupplierDB. It also owns the network namespace and publishes port 8000.                   |
| `app`   | `j2ee -verbose`, the RI server on port 8000, sharing `db`'s network namespace so the datasources' `localhost` RMI URLs reach Cloudscape. On first start it runs the legacy `build.sh deploy`. |

The image build does what the legacy docs prescribe, with no change to the
source:

1. `src/build.sh core` (Ant) compiles the components, WAF and the four
   applications and packages `petstore.ear`, `opc.ear`, `supplier.ear` and
   `petstoreadmin.ear`.
2. `setup.sh core` adds the JMS queues and factories, the `jps_admin` and
   `supplier` users and the three Cloudscape XA datasources to the RI
   configuration.

The catalog tables are created and filled by the application's own populate
servlet on first visit to the storefront.

## What the container needs that is not in the repository

| Input                                      | Where                                 | Why                                                                                                                                                                                                                                      |
| ------------------------------------------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Java 2 SDK 1.4.x for Linux i586, extracted | `.vortex/legacy-runtime/vendor/jdk/`  | Sun/Oracle licence: download from the Oracle Java archive (login required) and accept the Binary Code Licence. `vendor/jdk/bin/java` must exist.                                                                                         |
| J2EE SDK 1.3.1 for Linux (RI), extracted   | `.vortex/legacy-runtime/vendor/j2ee/` | Sun licence, same archive. Includes the application server, `deploytool` and Cloudscape (with its JDBC/RmiJdbc drivers). `vendor/j2ee/bin/j2ee` and `vendor/j2ee/lib/j2ee.jar` must exist.                                               |
| Read access to the legacy source           | `LEGACY_SOURCE` build context         | Defaults to `legacy-source/` on branch `vortex/legacy-spec/sx-0001` of this repository, fetched by BuildKit (needs Git credentials if the repository is private). To use a checkout instead: `LEGACY_SOURCE=/abs/path/to/legacy-source`. |
| Network access to Maven Central at build   | `repo1.maven.org`                     | The legacy tree leaves out its third-party jars: Ant 1.4.1, JSTL 1.0.6 (`jstl.jar`, `standard.jar`) and commons-codec 1.1 (as `lib/base64/base64.jar`).                                                                                  |

Do not commit `vendor/`: both SDKs are licensed and cannot be redistributed.

A local checkout of the legacy source:

```sh
git worktree add /tmp/legacy origin/vortex/legacy-spec/sx-0001
LEGACY_SOURCE=/tmp/legacy/legacy-source \
  docker compose -f .vortex/legacy-runtime/compose.yaml up --build --wait
```

## Notes

- The images are `linux/386` because both SDKs are 32-bit builds. On an
  arm64 host Docker runs them under emulation, which is slower.
- `docker compose down` discards the deployment and the Cloudscape data; the
  next `up` deploys again and repopulates the catalog.
