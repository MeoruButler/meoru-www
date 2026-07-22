#!/usr/bin/env sh
set -eu

if [ "${1:-}" = "--" ]; then
  shift
fi

unset NO_COLOR

exec playwright test "$@"
