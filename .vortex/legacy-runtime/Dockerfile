# Builds Java Pet Store 1.3.2 with its own Ant wrapper (app/setup.sh) and
# configures the J2EE 1.3.1 RI with setup.xml's `core` target.
# vendor/jdk and vendor/j2ee are NOT in the repository: see README.md.
FROM debian:bullseye-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates procps \
 && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/opt/jdk \
    J2EE_HOME=/opt/j2ee \
    PS_APP=/opt/petstore/app
ENV PATH=$JAVA_HOME/bin:$J2EE_HOME/bin:$PATH

COPY vendor/jdk  /opt/jdk
COPY vendor/j2ee /opt/j2ee
COPY --from=legacy app /opt/petstore/app

# Binaries the legacy tree had and the repository leaves out. setup.sh finds
# Ant under ./lib/ant; the build files expect JSTL and base64 under src/lib.
RUN set -eux; cd "$PS_APP"; M=https://repo1.maven.org/maven2; \
    mkdir -p lib/ant/lib; \
    curl -fsSL -o lib/ant/lib/ant.jar           $M/ant/ant/1.5.4/ant-1.5.4.jar; \
    curl -fsSL -o src/lib/jstl/jstl.jar         $M/jstl/jstl/1.0.6/jstl-1.0.6.jar; \
    curl -fsSL -o src/lib/jstl/standard.jar     $M/taglibs/standard/1.0.6/standard-1.0.6.jar; \
    curl -fsSL -o src/lib/base64/base64.jar     $M/commons-codec/commons-codec/1.1/commons-codec-1.1.jar

# Compile and package (setup.xml `build` -> src/build.xml `core`), then put the
# EARs where setup.xml's `deploy` target looks for them (the app directory).
RUN set -eux; cd "$PS_APP"; sh setup.sh build; \
    cp src/apps/petstore/build/petstore.ear \
       src/apps/opc/build/opc.ear \
       src/apps/supplier/build/supplier.ear \
       src/apps/admin/build/petstoreadmin.ear .

# JMS queues, users and the three XA datasources (setup.xml `core`). AdminTool
# edits $J2EE_HOME/config offline, so no server is needed here.
RUN cd "$PS_APP" && sh setup.sh

COPY start-db.sh start-app.sh /opt/runtime/
RUN chmod +x /opt/runtime/*.sh
EXPOSE 8000
