.PHONY: default build run

default: run

build:
	docker build -t brannondorsey/app-sec-workshop .

run: build
	docker-compose up

login-vulnerable-services:
	docker exec -it vulnerable-services bash

login-attacker-controlled-services:
	docker exec -it attacker-controlled-services bash
