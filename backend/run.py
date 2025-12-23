"""
Uvicorn server runner
"""
import uvicorn

from server.main import app


def run_server():
    """Run the uvicorn server"""
    uvicorn.run(
        "server.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )


if __name__ == "__main__":
    run_server()

