module.exports = {
    seleccionarSkills: (seleccionadas = [], opciones) => {

        // console.log(opciones);

        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress'];

        let html = '';
        skills.forEach(skill => {
            html += `
                <li ${seleccionadas.includes(skill) ? 'class="activo"' : ''}>${skill}</li>
            `;
        });

        return opciones.fn().html = html; //fn() insertar html a opciones
    },
    tipoContrato: (seleccionado, opciones) => {
        // console.log(opciones.fn());
        return opciones.fn(this).replace(
            new RegExp(` value="${seleccionado}"`), '$& selected="selected"'
        )

    },
    mostrarAlertas: (errores = {}, alertas) => {
        const categoria = Object.keys(errores);

        let html = '';
        if(categoria.length) {
            errores[categoria].forEach(error => {
                html += `<div class="${categoria} alerta">
                    ${error}
                </div>`;
            });
        }
        
        // console.log(html);

        return alertas.fn().html = html
        // console.log(alertas.fn());

    }
}