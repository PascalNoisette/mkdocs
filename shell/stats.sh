#!/bin/bash
ls ../docs | xargs -L1 -I% sh -c 'echo % && ls "%" | wc -l'
