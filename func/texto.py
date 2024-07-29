def extraerTexto(texto, inicio, fin, direccion):
    # Filtrar solo los dígitos en la cadena
    solo_digitos = ''.join(filter(str.isdigit, texto))
    
    # Extraer los dígitos según la dirección
    if direccion == 0:
        # Desde el final hacia el principio
        if inicio == 0:
            extraidos = solo_digitos[-fin:][::-1]
        else:
            extraidos = solo_digitos[-fin:-(inicio):-1]
    elif direccion == 1:
        # Desde el inicio hacia el final
        extraidos = solo_digitos[inicio:fin]
    else:
        raise ValueError("La dirección debe ser 0 (del final al inicio) o 1 (del inicio al final).")
    
    # Devolver los dígitos extraídos en el orden correcto
    return extraidos[::-1] if direccion == 0 else extraidos