import asyncio
import os

# Mock function to avoid Google API dependency for testing
async def create_formations(player_data_dict, teams):
    """
    Mock formations creation function for testing purposes
    In production, this would use Google AI to generate formations
    """
    # Return a mock response structure
    return {
        "formations": [
            {
                "team": 1,
                "formation": "4-3-3",
                "players": player_data_dict.get('team_1', [])
            },
            {
                "team": 2, 
                "formation": "4-3-3",
                "players": player_data_dict.get('team_2', [])
            }
        ],
        "mock": True,
        "message": "Mock formations for testing - Google AI integration disabled"
    }

# ORIGINAL GOOGLE AI IMPLEMENTATION COMMENTED OUT FOR TESTING
# Uncomment and configure Google API key when ready to use AI formations

"""
# Define el template del prompt
prompt_template = PromptTemplate(
    input_variables=["num_players", "team_data", "allowed_formations"],
    template='''
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
        {{"position": "XX", "name": "Nombre del Jugador"}},
        ...
      ]
    }}

    Donde:
    - "formation" es la formación asignada.
    - "players" es una lista de jugadores con su número de camiseta y posición asignada.
    - "position" es la abreviatura de la posición asignada al jugador.
    - "name" es el nombre del jugador

    Asegúrate de que la formación y las posiciones asignadas sean consistentes con las habilidades de los jugadores.
    '''
)

# Crea la cadena LLM
chain = prompt_template | llm | JsonOutputParser()
"""

allowed_formations = {
    5: {
        '2-1-1': ['GK', 'CB', 'CB', 'CM', 'ST'],
        '3-0-1': ['GK', 'CB', 'CB', 'CB', 'ST'],
        '2-0-2': ['GK', 'CB', 'CB', 'ST', 'ST'],
        '1-2-1': ['GK', 'CB', 'CM', 'CM', 'ST'],
        '1-1-2': ['GK', 'CB', 'CM', 'ST', 'ST'],
        '1-0-3': ['GK', 'CB', 'ST', 'ST', 'ST']
    },
    9: {
        '3-3-2': ['GK', 'CB', 'CB', 'CB', 'CM', 'CM', 'CM', 'ST', 'ST'],
        '4-2-2': ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CM', 'ST', 'ST'],
        '3-4-1': ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'CM', 'RM', 'ST'],
        '4-3-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CM', 'ST'],
        '3-2-3': ['GK', 'CB', 'CB', 'CB', 'CM', 'CM', 'LW', 'ST', 'RW'],
        '4-1-3': ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'LW', 'ST', 'RW']
    },
    11: 
    {
        '4-4-2': ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST', 'ST'],
        '4-3-3': ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CM', 'LW', 'ST', 'RW'],
        '3-4-3': ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'CM', 'RM', 'LW', 'ST', 'RW'],
        '4-2-3-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CDM', 'LW', 'CAM', 'RW', 'ST'],
        '5-4-1': ['GK', 'LB', 'CB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST'],
        '4-5-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'CM', 'RM', 'ST'],
        '3-5-2': ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'CM', 'CM', 'RM', 'ST', 'ST'],
        '5-3-2': ['GK', 'LB', 'CB', 'CB', 'CB', 'RB', 'LM', 'CM', 'RM', 'ST', 'ST'],
        '4-1-4-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'LM', 'CM', 'CM', 'RM', 'ST'],
        '3-4-2-1': ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'CM', 'RM', 'AM', 'AM', 'ST']
    }
}

# ORIGINAL FUNCTIONS COMMENTED OUT FOR TESTING
"""
def transformar_datos_jugadores(datos_originales):
    # Original function commented out
    pass

async def create_formations_original(players, teams, allowed_formations=allowed_formations):
    # Original Google AI implementation commented out
    pass
"""
