#!/usr/bin/env bash
set -euo pipefail

# Keeps your Cloud Run Artifact Registry storage under the 0.5 GB free tier
# by deleting older container image digests after a new deployment.
#
# Usage:
#   ./scripts/cleanup-artifact-registry.sh <GCP_PROJECT_ID> <REGION> <REPO_NAME> <IMAGE_NAME> [KEEP_COUNT]
# Example:
#   ./scripts/cleanup-artifact-registry.sh gen-lang-client-0087315974 us-central1 cloud-run-source-deploy portfolio 1

PROJECT_ID="${1:-gen-lang-client-0087315974}"
REGION="${2:-us-central1}"
REPO_NAME="${3:-cloud-run-source-deploy}"
IMAGE_NAME="${4:-portfolio}"
KEEP_COUNT="${5:-1}"

IMAGE_PATH="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${IMAGE_NAME}"

echo "Listing digests in ${IMAGE_PATH} (keeping newest ${KEEP_COUNT})..."
DIGESTS=$(gcloud artifacts docker images list "${IMAGE_PATH}" \
  --include-tags \
  --sort-by="~UPDATE_TIME" \
  --format="get(DIGEST)" | tail -n +"$((KEEP_COUNT + 1))")

if [[ -z "${DIGESTS}" ]]; then
  echo "Nothing older than the newest ${KEEP_COUNT} image(s) to remove."
  exit 0
fi

for digest in ${DIGESTS}; do
  echo "Deleting old image digest: ${digest}"
  gcloud artifacts docker images delete "${IMAGE_PATH}@${digest}" --delete-tags --quiet
done

echo "Done. Old Artifact Registry images cleaned."
