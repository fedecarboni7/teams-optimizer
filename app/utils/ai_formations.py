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
        f"{name}: Control {skills['control']}, Defensa {skills['defensa']}, Fuerza Cuerpo {skills['fuerza_cuerpo']}, Habilidad Arquero {skills['habilidad_arquero']}, Pases {skills['pases']}, Resistencia {skills['resistencia']}, Tiro {skills['tiro']}, Velocidad {skills['velocidad']}, Visión {skills['vision']}"
        for name, skills in players.items()
    ]
    team_data = ", ".join(player_data)

    # Ejecutar la cadena de procesamiento
    response = chain.invoke({"team_data": team_data, "num_players": len(players)})

    return response

# Ejemplo de uso
players = {
    "Marcos": {"control": 4, "defensa": 3, "fuerza_cuerpo": 4, "habilidad_arquero": 3, "pases": 4, "resistencia": 4, "tiro": 2, "velocidad": 3, "vision": 4},
    "Santiago": {"control": 4, "defensa": 3, "fuerza_cuerpo": 4, "habilidad_arquero": 3, "pases": 4, "resistencia": 4, "tiro": 2, "velocidad": 3, "vision": 4},
    "Juan": {"control": 4, "defensa": 3, "fuerza_cuerpo": 4, "habilidad_arquero": 3, "pases": 4, "resistencia": 4, "tiro": 2, "velocidad": 3, "vision": 4},
    "María": {"control": 4, "defensa": 3, "fuerza_cuerpo": 4, "habilidad_arquero": 3, "pases": 4, "resistencia": 4, "tiro": 2, "velocidad": 3, "vision": 4},
    "Carlos": {"control": 4, "defensa": 3, "fuerza_cuerpo": 4, "habilidad_arquero": 3, "pases": 4, "resistencia": 4, "tiro": 2, "velocidad": 3, "vision": 4}
}

formation = get_formation(players)
print(formation)
print(json.dumps(formation, indent=4))