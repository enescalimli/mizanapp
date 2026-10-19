from unittest.mock import AsyncMock, MagicMock
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.presentation.api.deps import get_db

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"
    assert data["api_v1"] == "/api/v1"


def test_api_docs():
    response = client.get("/docs")
    assert response.status_code == 200


def test_health_endpoint_with_mock_db():
    mock_session = AsyncMock()
    mock_session.execute = AsyncMock()

    async def override_get_db():
        yield mock_session

    app.dependency_overrides[get_db] = override_get_db

    try:
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert data["zero_float_policy"] == "STRICT_ACTIVE"
    finally:
        app.dependency_overrides.clear()


def test_company_not_found_with_mock_db():
    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_session.execute = AsyncMock(return_value=mock_result)

    async def override_get_db():
        yield mock_session

    app.dependency_overrides[get_db] = override_get_db

    try:
        response = client.get("/api/v1/companies/NONEXISTENT")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    finally:
        app.dependency_overrides.clear()
