import re


def validate_username(username: str):
    if len(username) < 3 or len(username) > 30:
        raise ValueError("El nombre de usuario debe tener entre 3 y 30 caracteres.")
    if not re.match(r'^[\w.@]+$', username):
        raise ValueError("El nombre de usuario solo puede contener letras, números, guiones bajos y puntos.")

def validate_password(password: str):
    if len(password) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres.")
    if not re.search(r"[A-Z]", password):
        raise ValueError("La contraseña debe contener al menos una letra mayúscula.")
    if not re.search(r"[a-z]", password):
        raise ValueError("La contraseña debe contener al menos una letra minúscula.")
    if not re.search(r"[0-9]", password):
        raise ValueError("La contraseña debe contener al menos un número.")
    if len(password) < 12 and not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise ValueError("La contraseña de menos de 12 caracteres debe contener al menos un carácter especial.")
    