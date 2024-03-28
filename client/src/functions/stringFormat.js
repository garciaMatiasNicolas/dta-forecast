const convertData = (data, typeofConversion) => {
    if (!typeofConversion) {
        // Utiliza una expresión regular para reemplazar todos los espacios en blanco con guiones bajos
        data = data.replace(/ /g, '_');
    } else {
        // Para convertir de nuevo a espacios en blanco, reemplaza todos los guiones bajos con espacios
        data = data.replace(/_/g, ' ');
    }
    return data;
};

export default convertData;