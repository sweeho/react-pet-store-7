#!/bin/bash
# Start the RI, deploy the EARs with the legacy wrapper, load the catalog.
set -u
"$J2EE_HOME/bin/j2ee" -verbose &
server=$!
trap 'kill $server' TERM INT

until curl -s -o /dev/null http://localhost:8000/; do
  kill -0 $server 2>/dev/null || { echo "j2ee server exited"; exit 1; }
  sleep 3
done

cd "$PS_APP" && sh setup.sh deploy || exit 1

until curl -fsS -o /dev/null "http://localhost:8000/petstore/Populate?success_page=index.jsp"; do
  sleep 5
done
touch /tmp/petstore-ready
echo "Pet Store ready on http://localhost:8000/petstore/"
wait $server
