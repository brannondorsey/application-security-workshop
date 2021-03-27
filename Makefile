.PHONY: default build run login-vulnerable-services login-attacker-controlled-services

default: run

build:
	docker-compose build

run: build
	docker-compose up

login-vulnerable-services:
	docker exec -it vulnerable-services bash

login-attacker-controlled-services:
	docker exec -it attacker-controlled-services bash
