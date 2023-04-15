#!/bin/bash
exit 0
if ! command -v docker &> /dev/null
then
    curl -sSL https://get.docker.com/ -o get-docker.sh && sudo sh get-docker.sh || sudo apt update && sudo apt install -y docker-ce-cli
fi


if ! command -v docker-compose &> /dev/null
then
    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose && sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
fi
