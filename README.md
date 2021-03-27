# Application Security Workshop

Explore web application vulnerabilities like XSS and server-side injection through example. This repo contains Docker runtime environments for a vulnerable web application and an attacker-controlled service meant to exploit it.

If you're looking for notes on the vulnerabilities covered in this workshop, and how to exploit them, see [WORKSHOP_NOTES.md](WORKSHOP_NOTES.md).

## Running the Demo Environment

Docker and docker-compose must be installed on your machine before continuing.

```bash
# Build and run the Docker image containers
make run

# You can now visit the vulnerable service in a web browser on http://localhost:8080

# And if you want to peruse stolen loot during the workshop, run...
make login-attacker-controlled-service
```

Read the [Makefile](Makefile) for more info.
