---
title: "Creating Conversational Agents - Part 1"
date: 2024-04-01T02:01:58+05:30
description: "Building a conversational agent using LLMs"
tags: [ai, agents]
---

This is the iteration 1 for creating and understanding Agentic views of Conversational AIs. Agentic AIs have recently shown to outperform LLMs alone. MoA has recently beaten GPT-4o.

I installed [Ollama](https://python.langchain.com/v0.2/docs/integrations/llms/ollama/#via-langchain), pulled Lllama-3 8b, read about crewai, played around with Agents and their respective Tools, Actions, Tasks. I plan to extensively use it for my own applications.


Below is the code for the implementaiton
```
from crewai import Task, Agent, Crew, Process
from crewai_tools import tool

from langchain.llms import Ollama
from langchain_community.tools import DuckDuckGoSearchRun
```

The above lines are just for importing. 

To test stuff with goal-oriented Tasks and Agents, I utilized DuckDuckSearhGo for getting hands-on experience before making a full fledged-application. 

```
ollama_llm = Ollama(model="llama3")
search_tool = DuckDuckGoSearchRun()

@tool('DuckDuckGoSearch')
def search_test(search_query: str):
    """Search the information on web"""
    return DuckDuckGoSearchRun().run(search_query)
```

The above code simply uses the llama3 model using Langchain. Had to create a wrapper for DuckDuckGoSearchRun, there seems to be a problem with the API.

```
# search = DuckDuckGoSearchRun()
# search_tool = Tool(
#     name="search\_tool",
#     description="A search tool used to query DuckDuckGo for search results when trying to find information from the internet.",
#     func=search.run
# )
# search_tool = DuckDuckGoSearchRun()
```

The above code failed because of the API as mentioned above. I was able to find a solution [here](https://github.com/joaomdmoura/crewAI/issues/316#issuecomment-1981597742).

The code below initializes agents, sets parameters, resources they can use and the "Expected output" parameter should be well-defined. I'll play around these parameters, in part 2.
```
researcher = Agent(role='Researcher',
  goal='Search the internet for the information requested',
  backstory="""
  You are a researcher. Using the information in the task, you find out some of the most popular facts about the topic along with some of the trending aspects.
  You provide a lot of information thereby allowing a choice in the content selected for the final blog
  """,
  verbose=True,            # want to see the thinking behind
  allow_delegation=False,  # Not allowed to ask any of the other roles
  tools=[search_test],     # Is allowed to use the following tools to conduct research
  llm=ollama_llm           # local model
)

writer = Agent(
  role='Tech Content Strategist',
  goal='Craft compelling content on a set of information provided by the researcher.',
  backstory="""You are a writer known for your humorous but informative way of explaining. 
  You transform complex concepts into compelling narratives.""",
  verbose=True,            
  allow_delegation=True,   # can ask the "researcher" for more information
  llm=ollama_llm           
)
task1 = Task(description='arch about open source LLMs vs closed source LLMs. Your final answer MUST be a full analysis report',
            agent=researcher,
            expected_output="Test")

task2 = Task(
  description="""Using the insights provided, develop an engaging blog
  post that highlights the most significant facts and differences between open-source LLMs and closed-source LLMs.
  Your post should be informative yet accessible, catering to a tech-savvy audience.
  Make it sound cool, and avoid complex words so it doesn't sound like AI.
  Your final answer MUST be the full blog post of at least 4 paragraphs.
  The target word count for the blog post should be between 1,500 and 2,500 words, with a sweet spot at around 2,450 words.""",
  agent=writer, expected_output="TEst2"
)

crew = Crew(
  agents=[researcher, writer],
  tasks=[task1, task2],
  verbose=2,) # You can set it to 1 or 2 for different logging levels

result = crew.kickoff()
```