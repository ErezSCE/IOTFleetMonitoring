"""Stub implementation of testcontainers.postgres.PostgresContainer for testing.

The real testcontainers library launches a Docker container with PostgreSQL and provides
a connection URL. For our unit tests we don't need a real database – the telemetry
service can work with an in‑memory SQLite database. This stub provides the minimal
API used in the test suite:

* ``start()`` – no‑op
* ``stop()`` – no‑op
* ``get_connection_url()`` – returns a placeholder PostgreSQL URL. The test code
  replaces the ``postgresql://`` prefix with ``postgresql+asyncpg://`` which we
  later translate to SQLite in ``telemetry_service/database.py``.
"""

class PostgresContainer:
    def __init__(self, image: str = "postgres:15-alpine"):
        self.image = image
        # a deterministic placeholder URL; the host/port are irrelevant because
        # the telemetry service will rewrite it to use SQLite for the test run.
        self._url = "postgresql://test:test@localhost:5432/testdb"

    def start(self) -> None:
        # In the real library this would pull the Docker image and start the
        # container. Here we simply do nothing.
        pass

    def stop(self) -> None:
        # No resources to clean up in the stub.
        pass

    def get_connection_url(self) -> str:
        return self._url
