const stringFormat = str => {
    let string = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return string.replace(/[&\/\\#,+()|$~%.'":*?<>{}]/g, '').replaceAll(" ", "-").toLowerCase();
};

export default stringFormat;