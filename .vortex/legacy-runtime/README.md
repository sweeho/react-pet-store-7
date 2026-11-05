# Legacy runtime: Java Pet Store 1.3.2

Runs the legacy application, Sun Java Pet Store 1.3.2, from its legacy source.
It runs on the J2EE 1.3.1 Reference Implementation, with Cloudscape as its
database, so the acceptance suite can run against it.

**URL the acceptance suite uses: `http://localhost:8000/petstore/`**

The same server also hosts `/opc`, `/supplier` and `/admin`. Set
`LEGACY_HTTP_PORT` to publish on a port other than 8000. The new system uses
5000 and 5178, so the default does not collide with it.

## Start

```sh
# once: put the two Oracle downloads in vendor/ (see below)
docker compose -f .vortex/legacy-runtime/compose.yaml up --build --wait
curl -fsS http://localhost:8000/petstore/ >/dev/null && echo up
docker compose -f .vortex/legacy-runtime/compose.yaml down   # data is not kept
```

`--wait` returns when `app` is healthy. That means all four EARs are deployed
and the catalog is loaded through `/petstore/Populate`. The first start
compiles everything and takes several minutes. Each `up` after a `down` starts
with fresh databases.

## What it does

| File           | Role                                                                                                                                                                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `compose.yaml` | `db`: Cloudscape (`cloudscape -start`, RMI :1099). `app`: the J2EE RI server (`j2ee -verbose`, HTTP :8000). `app` shares `db`'s network namespace because `setup.xml` creates the datasources against `localhost`. That is also why the HTTP port is published on `db`. |
| `Dockerfile`   | Builds with the legacy wrapper: `setup.sh build` (Ant, `setup.xml` → `src/build.xml`), then `setup.sh` (target `core`: JMS queues, users, XA datasources). Then it copies the four EARs to where the `deploy` target looks for them.                                    |
| `start-app.sh` | Starts the server, runs `setup.sh deploy`, calls `/petstore/Populate` and marks the container ready.                                                                                                                                                                    |

The legacy source is never copied onto `dev`. The build context `legacy` is
`legacy-source/` on the branch `vortex/legacy-spec/sx-0001`, read straight from
GitHub. To build from a local checkout instead:

```sh
git worktree add /tmp/legacy origin/vortex/legacy-spec/sx-0001
LEGACY_SOURCE=/tmp/legacy/legacy-source docker compose -f .vortex/legacy-runtime/compose.yaml up --build --wait
```

## What the container needs that is not in the repository

**Licensed, so you must supply them (Oracle Java Archive, free account,
licence accepted by you).** Extract each one into `vendor/`, which is
git-ignored:

| Path           | What                                                                                                                                                                                             | Check                                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| `vendor/jdk/`  | J2SE SDK 1.4.2 for Linux i586 (e.g. `j2sdk-1_4_2_19-linux-i586.bin`, run it and accept the Sun Binary Code Licence). This must be the JDK, not the JRE, because the build needs `lib/tools.jar`. | `vendor/jdk/bin/javac`, `vendor/jdk/lib/tools.jar` |
| `vendor/j2ee/` | J2EE 1.3.1 SDK (Reference Implementation, with Cloudscape) for Linux, `j2sdkee1.3.1`                                                                                                             | `vendor/j2ee/bin/j2ee`, `vendor/j2ee/lib/j2ee.jar` |

The image is `linux/386` because those JDK builds are 32-bit. On an arm64 host
it runs under emulation (binfmt/QEMU).

**Downloaded from Maven Central during the build (open-source).** The
original bundle shipped these jars, and the repository leaves binaries out:

| Placed at                                   | Artifact                                                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `app/lib/ant/lib/ant.jar`                   | `ant:ant:1.5.4` (the bundled Ant that `setup.sh` expects)                                          |
| `app/src/lib/jstl/jstl.jar`, `standard.jar` | `jstl:jstl:1.0.6`, `taglibs:standard:1.0.6`                                                        |
| `app/src/lib/base64/base64.jar`             | `commons-codec:commons-codec:1.1` (the last release with `org.apache.commons.codec.base64.Base64`) |

You do not need a JDBC driver. Cloudscape and its RmiJdbc client ship inside
the J2EE SDK.

## Not verified yet

These files were written without a Docker daemon and without the Oracle
binaries, so the build has not been run end to end. The first run with
`vendor/` filled in is the real check. The likeliest places to need a fix are
`setup.sh deploy`, which talks to the running server, and the JDK 1.4 JVM on a
current kernel.
