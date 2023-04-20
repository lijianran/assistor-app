#!/bin/bash

TAURI_PRIVATE_KEY=$(cat ~/.tauri/assistor_app.key)
if [ ! $TAURI_PRIVATE_KEY ]; then
    echo "ERROR: tauri key not exists"
    exit
else
    echo "tauri private key:"
    echo $TAURI_PRIVATE_KEY
fi

export TAURI_PRIVATE_KEY
export TAURI_KEY_PASSWORD='lijianran'

echo --------------------
echo Start to build the app
pnpm tauri build
