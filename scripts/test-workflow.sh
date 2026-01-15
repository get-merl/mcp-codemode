#!/bin/bash
# Helper script to test GitHub Actions workflows locally with act

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo "❌ 'act' is not installed."
    echo "Install it with: brew install act"
    echo "Or see: https://github.com/nektos/act#installation"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

WORKFLOW=${1:-""}
EVENT=${2:-"push"}
SECRETS_FILE=".github/workflows/.secrets"

if [ -z "$WORKFLOW" ]; then
    echo "Usage: $0 <workflow-name> [event]"
    echo ""
    echo "Available workflows:"
    echo "  - mcp-toolbox-check"
    echo "  - mcp-toolbox-sync"
    echo "  - release"
    echo ""
    echo "Examples:"
    echo "  $0 mcp-toolbox-check push"
    echo "  $0 mcp-toolbox-sync workflow_dispatch"
    echo "  $0 release push"
    exit 1
fi

WORKFLOW_FILE=".github/workflows/${WORKFLOW}.yml"

if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi

echo -e "${GREEN}Testing workflow: ${WORKFLOW}${NC}"
echo -e "${YELLOW}Event: ${EVENT}${NC}"
echo ""

# Check if secrets file exists
if [ -f "$SECRETS_FILE" ]; then
    echo -e "${GREEN}Using secrets from: ${SECRETS_FILE}${NC}"
    act "$EVENT" \
        --secret-file "$SECRETS_FILE" \
        -W "$WORKFLOW_FILE" \
        -v
else
    echo -e "${YELLOW}⚠️  No secrets file found at ${SECRETS_FILE}${NC}"
    echo "   Run without secrets (some steps may fail)"
    echo ""
    act "$EVENT" \
        -W "$WORKFLOW_FILE" \
        -v
fi
