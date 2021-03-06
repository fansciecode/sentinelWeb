#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

for LABEL_PART in "iov1/tendermint" "iov1/bnsd"; do
  CONTAINER_ID=$(docker container ls | grep -F "$LABEL_PART:" | awk '{print $1}')
  echo "Killing $LABEL_PART container '$CONTAINER_ID' ..."
  docker container kill "$CONTAINER_ID"
done
