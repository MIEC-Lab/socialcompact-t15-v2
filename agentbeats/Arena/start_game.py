# Authorship: Yuhao Ye (E) owns the V2 backend/Arena integration around this inherited service code; Bowen Dong (A) owns Render deployment of the surrounding public service; Runze Chen (F) owns public verification of the deployed endpoints.
# Scope: Inherited Arena/Agent service code used by the public V2 deployment.
# Original-source note: The core Arena/Agent/A2A logic in this file is inherited from the upstream ReserveJudgement/SocialCOMPACT repository.

import json
import httpx
from uuid import uuid4
from urllib.parse import urljoin
from a2a.client import A2AClient
from a2a.types import MessageSendParams, SendMessageRequest
from a2a.client.errors import A2AClientTimeoutError

PLAYERS = [
    "http://127.0.0.1:9018",
    "http://127.0.0.1:9019"
]

ARENA = "http://127.0.0.1:9009"

def check_availability(name, address):
    AGENT_CARD = "/.well-known/agent-card.json"
    try:
        arena_response = httpx.get(urljoin(address, AGENT_CARD))
        print(f"{name} is online: {arena_response.text}\n")
    except:
        print(f"ERROR: {name} is OFFLINE. Check the server address {address}")
        exit(0)

async def main():
    # Step 2: Build an A2A request
    json_message = {
        "participants": {f"Player{index}" : address 
                        for index, address in enumerate(PLAYERS)},
        "config": {}
    }
    send_message_payload = {
        'message': {
            'role': 'user',
            'parts': [
              {'kind': 'text', 'text': json.dumps(json_message)}
            ],
            'messageId': uuid4().hex,
        }
    }
    request = SendMessageRequest(
        id=str(uuid4()), 
        params=MessageSendParams(**send_message_payload)
    )
    # Step 3: Send out the request to ARENA
    async with httpx.AsyncClient() as httpx_client:
        a2a_client = A2AClient(httpx_client=httpx_client, url=ARENA)
        try:
            response = await a2a_client.send_message(request)
            print(f"Unexpected response message: {response.model_dump(mode='json', exclude_none=True)}")
        except A2AClientTimeoutError:
            print(f"Game started with {len(PLAYERS)} Players")
            for index, address in enumerate(PLAYERS):
                print(f"    - Player{index}: {address}")
            print(f"Arena Address: {ARENA}")

if __name__ == '__main__':
    # Step 1: Check the availability of all agent servers
    check_availability("Arena", ARENA)
    for index, player_addr in enumerate(PLAYERS):
        check_availability(f"Player{index}", player_addr)
    import asyncio
    asyncio.run(main())