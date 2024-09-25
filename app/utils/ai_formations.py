import json
from langchain_google_genai import GoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

llm = GoogleGenerativeAI(model="gemini-1.5-flash")

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

def get_formation(players):
    # Convertir la lista de jugadores a un formato adecuado para el prompt
    player_data = [
        f"{player['name']}: Defensa {player['defensa']}, Centrocampo {player['centrocampo']}, Ataque {player['ataque']}, Pase {player['pase']}, Velocidad {player['velocidad']}, Habilidad Arquero {player['habilidad_arquero']}"
        for player in players
    ]
    team_data = ", ".join(player_data)

    # Ejecutar la cadena de procesamiento
    response = chain.invoke({"team_data": team_data, "num_players": len(players)})

    return response

# Ejemplo de uso
players = [
    {"name": "Marcos", "defensa": 4, "centrocampo": 3, "ataque": 2, "pase": 2, "velocidad": 2, "habilidad_arquero": 5},
    {"name": "Santiago", "defensa": 2, "centrocampo": 5, "ataque": 3, "pase": 4, "velocidad": 4, "habilidad_arquero": 2},
    {"name": "Juan", "defensa": 2, "centrocampo": 3, "ataque": 4, "pase": 5, "velocidad": 3, "habilidad_arquero": 3},
    {"name": "María", "defensa": 5, "centrocampo": 2, "ataque": 3, "pase": 4, "velocidad": 4, "habilidad_arquero": 1},
    {"name": "Carlos", "defensa": 1, "centrocampo": 4, "ataque": 5, "pase": 3, "velocidad": 5, "habilidad_arquero": 2}
]

formation = get_formation(players)
print(formation)
print(json.dumps(formation, indent=4))