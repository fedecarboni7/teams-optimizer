from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")

# Define el template del prompt
prompt_template = PromptTemplate(
    input_variables=["num_players", "team_data"],
    template="""
    Eres un experto entrenador de fútbol {num_players}. Basándote en la información proporcionada, 
    sugiere una formación óptima y asigna posiciones a los jugadores.

    Habilidades de los jugadores:
    {team_data}

    Proporciona una formación que maximice las fortalezas del equipo en el siguiente formato JSON:
    {{
      "formation": "X-X-X",
      "players": [
        {{"position": "XX", "number": N, "name": "Nombre del Jugador"}},
        ...
      ]
    }}

    Donde:
    - "formation" es la formación sugerida (sin contar al arquero, ej. en un equipo de 5 jugadores iría "1-1-2") 
    - "players" es una lista de jugadores con sus posiciones asignadas
    - "position" usa abreviaturas estándar (GK, RB, CB, LB, RM, CM, LM, ST, etc.)
    - "number" es un número de camiseta único del 1 al {num_players}
    - "name" es el nombre del jugador

    Asegúrate de que la formación y las posiciones sean coherentes con las habilidades de los jugadores.
    """
)

# Crea la cadena LLM
chain = prompt_template | llm | JsonOutputParser()

def create_formations(players, teams):
    """
    Calcula la formación óptima y asigna posiciones a los jugadores.

    Args:
        players (dict): Un diccionario con los datos de los jugadores.
        teams (list): Una lista de listas con los nombres de los jugadores en cada equipo.

    Returns:
        formations (list): Una lista de formaciones sugeridas para cada equipo.
    """
    # Ejecutar la cadena de procesamiento por cada equipo
    # dividir players en equipos y ejecutar la cadena por cada equipo
    formations = {'team1': {}, 'team2': {}}
    i = 1
    for team in teams:
        players_by_team = {k: players[k] for k in team[0]}
        formation = chain.invoke({"team_data": players_by_team, "num_players": len(players_by_team)})
        formations[f'team{i}'] = formation
        i += 1
    
    return formations
