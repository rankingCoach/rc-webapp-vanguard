#!/bin/bash
# Usage: collision-check.sh <git diff range or empty for working tree>
# Lists every existing selector or DOM query in Vanguard and rc-webapp that matches an attribute name this diff adds.
cd "$(git rev-parse --show-toplevel)"
NAMES=$(git diff $1 -- src | grep '^+' | grep -oE 'data-[a-z][a-z0-9-]*=' | sed 's/=$//; s/^data-//' | grep -v '^testid$' | sort -u | paste -sd'|' -)
SLOTS=$(git diff $1 -- src | grep '^+' | grep -oE "data-slot=\{?'[a-z0-9-]+'" | sed -E "s/.*'([a-z0-9-]+)'/\1/" | sort -u | paste -sd'|' -)
echo "names: $NAMES"
R=/Users/a.kott/PhpstormProjects/mgm/rc-webapp/html
echo "== css [data-name] (Vanguard src, rc-webapp html/**)"
grep -rnoE "\[data-($NAMES)\b[^]]*\]" src $R --include=*.scss --include=*.css --include=*.less 2>/dev/null | grep -v node_modules | grep -v '/app-build/'
echo "== js queries"
grep -rnE "(querySelector(All)?|closest|matches)\([^)]*data-($NAMES)\b|dataset\.($NAMES)\b|getAttribute\(['\"]data-($NAMES)" src $R/react/src --include=*.ts --include=*.tsx 2>/dev/null | grep -v "\.spec\.\|\.test\.\|dataSlot\|stories"
echo "== slot values referenced anywhere outside this diff's specs"
[ -n "$SLOTS" ] && grep -rnE "['\"=]($SLOTS)['\"\]]" src $R/react/src --include=*.scss --include=*.css --include=*.ts --include=*.tsx 2>/dev/null | grep -E "data-slot" | grep -v "dataSlot.spec\|/core/.*\.tsx:.*data-slot=" | head -20
echo done
