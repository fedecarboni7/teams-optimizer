from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash-lite")

# Define el template del prompt para matching de jugadores
player_matching_prompt = PromptTemplate(
    input_variables=["input_names", "available_players"],
    template="""
    Eres un asistente experto en matching de nombres de jugadores de fútbol.
    
    Tu tarea es encontrar coincidencias entre una lista de nombres ingresados por el usuario 
    y una lista de jugadores disponibles en el sistema.
    
    Debes considerar:
    - Nombres abreviados o apodos (ej: "Nahue" debería matchear con "Nahuel")
    - Variaciones de nombres (ej: "Nico" debería matchear con "Nicolás")
    - Errores tipográficos menores (ej: "Jhon" debería matchear con "John")
    - Nombres parciales (ej: "Martinez" podría matchear con "Juan Martinez")
    
    Lista de nombres ingresados por el usuario:
    {input_names}
    
    Lista de jugadores disponibles en el sistema (con sus IDs):
    {available_players}
    
    Responde en el siguiente formato JSON:
    {{
      "matches": [
        {{"input_name": "nombre ingresado", "matched_player_id": id_del_jugador, "matched_player_name": "nombre del jugador", "confidence": "high/medium/low"}},
        ...
      ],
      "not_found": ["nombre1", "nombre2", ...]
    }}
    
    Reglas:
    - Solo incluye matches cuando tengas suficiente confianza de que son la misma persona
    - Si un nombre ingresado podría matchear con múltiples jugadores, elige el más probable
    - Si no encuentras match para un nombre, inclúyelo en "not_found"
    - La confianza debe ser "high" si es una coincidencia clara, "medium" si hay algo de ambigüedad, 
      "low" si es una coincidencia posible pero no segura
    """
)

# Crea la cadena LLM para matching de jugadores
player_matching_chain = player_matching_prompt | llm | JsonOutputParser()


async def match_players(input_names: list[str], available_players: list[dict]) -> dict:
    """
    Usa IA para encontrar coincidencias entre nombres ingresados y jugadores disponibles.
    
    Args:
        input_names: Lista de nombres ingresados por el usuario
        available_players: Lista de diccionarios con {id, name} de jugadores disponibles
        
    Returns:
        Dict con matches encontrados y nombres no encontrados
    """
    # Formatear la lista de jugadores disponibles para el prompt
    players_formatted = "\n".join([f"- ID: {p['id']}, Nombre: {p['name']}" for p in available_players])
    names_formatted = "\n".join([f"- {name}" for name in input_names])
    
    result = await player_matching_chain.ainvoke({
        "input_names": names_formatted,
        "available_players": players_formatted
    })
    
    return result
