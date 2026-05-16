# SocialCOMPACT

## Background
AI agents are poised to take on roles in the real world, interacting with third parties, including other people and other agents, requiring them to navigate complex social situations. This creates a need for evaluating social intelligence. Social intelligence involves the ability to achieve objectives in mixed cooperative-competitive multi-agent environments of variable sizes and compositions, while communicating and interacting with other agents over time, possibly under uncertainty. 

SocialCOMPACT is an arena of such games. At each round of a game, agents must first communicate with each other in natural language, then expressly anticipate each others' actions, and then reason about their own actions and make decisions (COMmunicate-Predict-ACT). The communication stage is conducted pairwise between players with limited message-passing in natural language. The prediction stage requires the players to privately reflect on the conversations and the history of the game and predict the next actions of the other players. Players then simultaneously reason strategically and make their next decision.

## Games
There are five classic games in the arena:

### Survivor
<img width="56" height="56" alt="military-ship" src="https://github.com/user-attachments/assets/d2def0dc-cccd-409e-9bc7-25880af83600" /> a simplified version of "Diplomacy" (or "Risk") but with no board. Players are given ammunition and lives, and their aim is to eliminate all other players and remain the last one standing. The game tests alliance formation and betrayal; 

### Tragedy of the Commons
<img width="56" height="56" alt="earth" src="https://github.com/user-attachments/assets/02e378a0-905e-4492-887b-6d1abbc7bb70" /> a public resource utilization game. There is a limited resource which can only be preserved over time if the players show self-restraint, but which could also invite free-riders. The game tests social dilemmas between the individual and the collective good;

### Coalition
<img width="56" height="56" alt="coalition2" src="https://github.com/user-attachments/assets/28e8cf4b-a448-4bef-a4e0-0403fd65bd3f" /> a classic cooperative game where a subset of players form a coalition, dependent on an agreement regarding the distribution of the benefits. The game tests group formation and resource allocation;

### Scheduler
<img width="56" height="56" alt="schedule" src="https://github.com/user-attachments/assets/228d6989-100e-45a8-be46-d983f41d036a" /> a multiplayer generalization of "Battle of the Sexes", where players seek agreement on a choice from a set of options with different preference orders, but failure to coordinate is the worst case for all. The game tests coordination and compromise under preference conflict;

### HUPI
<img width="56" height="56" alt="HUPI" src="https://github.com/user-attachments/assets/426b1472-5e80-4a11-a9d6-c3ef22ef56bd" />
a game where players try to pick the "Highest Unique Positive Integer", testing complex k-level reasoning.  

<br />
<br />

Players are initialized with random names and private preferences, but the game logic is deterministic in all games, and the informational and reward structures are strictly symmetric. Each game has two alternative semantic back-stories to test for agent robustness to framing. 

For full game descriptions see the pdf file "GameDescriptions.pdf".

## Agent Skills

At the beginning of each round, agents are provided with their name, the other participants' names, the game description and their private preferences. The three basic agent skills are to communicate, predict and act, which agents are prompted to engage in by the assessor at each round of the game. Agents are required to provide predictions and decisions in formalized json strings, which has game-specific structure. Agents will also be required to provide reasoning between <reasoning> </reasoning> tags, which is useful for later analysis but not used for the current leaderboard evaluation. At the end of each round, agent decisions are processed and the assessor prompts them with their subsequent observations. No actions are immediately required upon receiving the initial background or the observations after each round, but it is an optional opportunity for agent reflection.

## Assessment

The assessor agent receives a set of agents and orchestrates their participation in the games, in multiple compositions of players.


The chief metric used to rate agents is an Elo score, based on pairwise comparison of agent rewards in the games. For Elo scores to be significant, there needs to build up a critical mass of games for each agent. Preferably, they should also be balanced across the game types. 


In addition to the Elo score, agents are rated on their ability to predict other agents, by comparing an agent's output at the Predict stage of a game round to the outputs of the other agents at the Act stage of the same round. Since the difficulty of the prediction task and the form of the action space vary across games, these scores are normalized within game types (where the combination of game category and the number of players constitutes a "game type"), and rescaled to the interval [0, 1] before taking the mean for each agent. This gives us an indication of relative predictive capabilties between agents.


The directed pairwise predictive ability of agents can also be reversed (i.e. "how well did other agents predict this agent's action?") to give us a "transparency" metric for each agent. This is also normalized within game types and rescaled, and the mean per agent is displayed as a third measure on the leaderboard.


Why these metrics?
- Social intelligence must generalize across both games and player compositions. An Elo score is comparative between players. It is also based on binary pairwise comparisons (who got a higher score) thereby ignoring the idiosyncracies of the per-game reward scales.
- Prediction accuracy of actions is a proxy metric for "Theory of Mind" (modeling other agents). Many believe that this is fundamental to social intelligence. And the question of whether ToM is an emergent property in LLMs is an open research question.
- The transparency metric reflects how well intentions are communicated (or obfuscated). Since communication is a crucial part of social interaction, this is an important measurement.
- It isn't clear how prediction or transparency (or other social metrics) might lead to different outcomes. Experiments with LLM agents can shine new light on how elements such as "Theory of Mind" or clarity of intent relate to actual performance in social settings. 

## This repository
The Agent folder has the purple agent docker file and source code, the Arena folder has the corresponding green agent files. 

## CS183 Web Deployment Demo

This project also includes a web deployment demo for the Survivor game:

- `frontend/`: Next.js frontend deployed on Vercel.
- `web-backend/`: FastAPI backend for starting matches, storing results, and serving process logs.
- `agentbeats/`: Original Arena and Agent services for optional real Agent mode.

For the V2 public demo, deploy `web-backend/` as a public FastAPI service and
set the Vercel environment variable below so users do not need to enter a local
backend port manually:

```text
NEXT_PUBLIC_API_BASE_URL=https://your-public-backend-url
```

Detailed Chinese instructions are available in:

```text
docs/V2_PUBLIC_BACKEND_DEPLOYMENT.md
```

For the real public Agent version, deploy the backend, Arena, and two Agent
services. The step-by-step Chinese guide is available in:

```text
docs/V2_REAL_AGENT_PUBLIC_DEPLOYMENT.md
```
