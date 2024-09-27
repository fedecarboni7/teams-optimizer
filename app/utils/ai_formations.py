from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")

# Define el template del prompt
prompt_template = PromptTemplate(
    input_variables=["num_players", "team_data", "allowed_formations"],
    template="""
    Eres un entrenador experto especializado en equipos de fútbol de {num_players} jugadores.
    Basándote en la habilidades de los jugadores listadas a continuación y en las formaciones permitidas con sus posiciones correspondientes, 
    asigna una formación táctica óptima y posiciones a los jugadores.

    Formaciones permitidas:
    {allowed_formations}
    
    Habilidades de los jugadores:
    {team_data}

    Asigna una formación que maximice las fortalezas del equipo, en el siguiente formato JSON:
    {{
      "formation": "X-X-X",
      "players": [
        {{"position": "XX", "number": N, "name": "Nombre del Jugador"}},
        ...
      ]
    }}

    Donde:
    - "formation" es la formación asignada.
    - "players" es una lista de jugadores con su número de camiseta y posición asignada.
    - "position" es la abreviatura de la posición asignada al jugador.
    - "number" es un número de camiseta único del 1 al {num_players}
    - "name" es el nombre del jugador

    Asegúrate de que la formación y las posiciones asignadas sean consistentes con las habilidades de los jugadores.
    """
)

# Crea la cadena LLM
chain = prompt_template | llm | JsonOutputParser()

allowed_formations = {
    "2-1-1": ["GK", "CB", "CB", "CM", "ST"],
    "3-0-1": ["GK", "CB", "CB", "CB", "ST"],
    "2-0-2": ["GK", "CB", "CB", "ST", "ST"],
    "1-2-1": ["GK", "CB", "CM", "CM", "ST"],
    "1-1-2": ["GK", "CB", "CM", "ST", "ST"],
    "1-0-3": ["GK", "CB", "ST", "ST", "ST"]
}

def create_formations(players, teams, allowed_formations=allowed_formations):
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
        formation = chain.invoke({"team_data": players_by_team, "num_players": len(players_by_team), "allowed_formations": allowed_formations})
        formations[f'team{i}'] = formation
        i += 1
    
    return formations
