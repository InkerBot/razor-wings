#!/bin/sh
# RW pre-commit hook: block commits that fail static checks (lint).
# Any lint error (non-zero exit) fails the commit. Warnings are allowed.
npm run lint
