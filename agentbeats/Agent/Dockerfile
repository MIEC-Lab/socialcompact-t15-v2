# Authorship: Bowen Dong (A) owns public Render deployment setup for this service; Yuhao Ye (E) maintains V2 compatibility; Runze Chen (F) owns deployed-service verification.
# Scope: Configuration or packaging for the inherited Arena/Agent service inside the public V2 deployment.
# Original-source note: The core Arena/Agent/A2A logic in this file is inherited from the upstream ReserveJudgement/SocialCOMPACT repository.

# --------------------------------------------------------------
FROM ghcr.io/astral-sh/uv:python3.13-bookworm

# ---- create a non‑root user -----------------------------------
RUN adduser agent
USER agent
WORKDIR /home/agent

# --------------------------------------------------------------
# Copy source code
COPY pyproject.toml uv.lock ./
COPY src src

# Install dependencies – cache the uv directory for speed
RUN --mount=type=cache,target=/home/agent/.cache/uv,uid=1000 \
    uv sync --locked

# --------------------------------------------------------------
ENTRYPOINT ["uv", "run", "src/server.py"]
CMD ["--host", "0.0.0.0"]
EXPOSE 9019
