def convertir_formato(formaciones):
    resultado = {}
    
    for formacion, posiciones in formaciones.items():
        lista_posiciones = []
        
        for posicion, datos in posiciones.items():
            if isinstance(datos, list):
                # Si hay una lista, significa que hay múltiples posiciones de ese tipo
                for _ in datos:
                    lista_posiciones.append(posicion)
            else:
                # Si no es una lista, es una única posición
                lista_posiciones.append(posicion)
        
        resultado[formacion] = lista_posiciones
    
    return resultado

# Ejemplo de uso
formaciones_iniciales = {
    "4-4-2": {
                "GK": {'top': 92, 'left': 50},
                "LB": {'top': 82, 'left': 15},
                "CB": [{'top': 82, 'left': 37}, {'top': 82, 'left': 62}],
                "RB": {'top': 82, 'left': 85},
                "LM": {'top': 67, 'left': 85},
                "CM": [{'top': 67, 'left': 38}, {'top': 67, 'left': 62}],
                "RM": {'top': 67, 'left': 15},
                "ST": [{'top': 54, 'left': 38}, {'top': 54, 'left': 62}]
            },
            "4-3-3": {
                "GK": {'top': 92, 'left': 50},
                "LB": {'top': 82, 'left': 15},
                "CB": [{'top': 82, 'left': 37}, {'top': 82, 'left': 62}],
                "RB": {'top': 82, 'left': 85},
                "CM": [{'top': 70, 'left': 30}, {'top': 70, 'left': 50}, {'top': 70, 'left': 70}],
                "LW": {'top': 56, 'left': 30},
                "ST": {'top': 54, 'left': 50},
                "RW": {'top': 56, 'left': 70}
            },
            "3-4-3": {
                "GK": {'top': 92, 'left': 50},
                "CB": [{'top': 82, 'left': 30}, {'top': 82, 'left': 50}, {'top': 82, 'left': 70}],
                "LM": {'top': 70, 'left': 15},
                "CM": [{'top': 70, 'left': 38}, {'top': 70, 'left': 62}],
                "RM": {'top': 70, 'left': 85},
                "LW": {'top': 57, 'left': 25},
                "ST": {'top': 54, 'left': 50},
                "RW": {'top': 57, 'left': 75}
            },
            "4-2-3-1": {
                "GK": {'top': 92, 'left': 50},
                "LB": {'top': 82, 'left': 15},
                "CB": [{'top': 82, 'left': 37}, {'top': 82, 'left': 62}],
                "RB": {'top': 82, 'left': 85},
                "CDM": [{'top': 72, 'left': 37}, {'top': 72, 'left': 62}],
                "LW": {'top': 60, 'left': 25},
                "CAM": {'top': 65, 'left': 50},
                "RW": {'top': 60, 'left': 75},
                "ST": {'top': 54, 'left': 50}
            },
            "5-4-1": {
                "GK": {'top': 92, 'left': 50},
                "LB": {'top': 82, 'left': 10},
                "CB": [{'top': 82, 'left': 30}, {'top': 82, 'left': 50}, {'top': 82, 'left': 70}],
                "RB": {'top': 82, 'left': 90},
                "LM": {'top': 66, 'left': 15},
                "CM": [{'top': 66, 'left': 38}, {'top': 66, 'left': 62}],
                "RM": {'top': 66, 'left': 85},
                "ST": {'top': 54, 'left': 50}
            },
            "4-5-1": {
                "GK": {'top': 92, 'left': 50},
                "LB": {'top': 82, 'left': 15},
                "CB": [{'top': 82, 'left': 37}, {'top': 82, 'left': 62}],
                "RB": {'top': 82, 'left': 85},
                "LM": {'top': 67, 'left': 10},
                "CM": [{'top': 67, 'left': 30}, {'top': 67, 'left': 50}, {'top': 67, 'left': 70}],
                "RM": {'top': 67, 'left': 90},
                "ST": {'top': 54, 'left': 50}
            },
            "3-5-2": {
                "GK": {'top': 92, 'left': 50},
                "CB": [{'top': 82, 'left': 30}, {'top': 82, 'left': 50}, {'top': 82, 'left': 70}],
                "LM": {'top': 67, 'left': 10},
                "CM": [{'top': 67, 'left': 30}, {'top': 67, 'left': 50}, {'top': 67, 'left': 70}],
                "RM": {'top': 67, 'left': 90},
                "ST": [{'top': 54, 'left': 40}, {'top': 54, 'left': 60}]
            },
            "5-3-2": {
                "GK": {'top': 92, 'left': 50},
                "LB": {'top': 77, 'left': 15},
                "CB": [{'top': 82, 'left': 30}, {'top': 82, 'left': 50}, {'top': 82, 'left': 70}],
                "RB": {'top': 77, 'left': 85},
                "LM": {'top': 67, 'left': 30},
                "CM": {'top': 67, 'left': 50},
                "RM": {'top': 67, 'left': 70},
                "ST": [{'top': 54, 'left': 40}, {'top': 54, 'left': 60}]
            },
            "4-1-4-1": {
                "GK": {'top': 92, 'left': 50},
                "LB": {'top': 82, 'left': 15},
                "CB": [{'top': 82, 'left': 38}, {'top': 82, 'left': 62}],
                "RB": {'top': 82, 'left': 85},
                "CDM": {'top': 75, 'left': 50},
                "LM": {'top': 66, 'left': 15},
                "CM": [{'top': 66, 'left': 38}, {'top': 66, 'left': 62}],
                "RM": {'top': 66, 'left': 85},
                "ST": {'top': 54, 'left': 50}
            },
            "3-4-2-1":{
                "GK": {'top': 92, 'left': 50},
                "CB": [{'top': 82, 'left': 30}, {'top': 82, 'left': 50}, {'top': 82, 'left': 70}],
                "LM": {'top': 70, 'left': 15},
                "CM": [{'top': 70, 'left': 38}, {'top': 70, 'left': 62}],
                "RM": {'top': 70, 'left': 85},
                "AM": [{'top': 58, 'left': 30}, {'top': 58, 'left': 70}],
                "ST": {'top': 54, 'left': 50}
            }
}

formaciones_convertidas = convertir_formato(formaciones_iniciales)
# imprimir formaciones_convertidas separadas por un salto de línea

for formacion, posiciones in formaciones_convertidas.items():
    print(f"{formacion}: {posiciones}")
