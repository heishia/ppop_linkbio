"""
Integration tests for health check endpoint
"""

import pytest


@pytest.mark.integration
class TestHealthEndpoint:
    """Test /health endpoint"""
    
    def test_health_check(self, client):
        """Test health check endpoint returns ok"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"

