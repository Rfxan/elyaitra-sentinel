# backend/app/security/logger.py

import os
import requests
import json
import threading
import time

def _perform_log_request(log: dict):
    """
    Core logging logic.
    - Uses requests.post()
    - Timeout: 0.2s - 0.5s
    - Silently fails if anything goes wrong
    """
    security_url = os.getenv("SECURITY_URL")
    if not security_url:
        return

    try:
        requests.post(
            security_url,
            json=log,
            timeout=0.2  # Critical: Minimal timeout
        )
    except Exception:
        # Critical: MUST NEVER raise exception
        pass

def send_log(log: dict):
    """
    Public entrypoint for logging.
    - NON-BLOCKING: Dispatches the log request to a background thread.
    - Appends timestamp if not already present.
    """
    if "timestamp" not in log:
        log["timestamp"] = time.time()
        
    # Non-blocking dispatch
    thread = threading.Thread(target=_perform_log_request, args=(log,))
    thread.daemon = True  # Ensure it doesn't block shutdown
    thread.start()
