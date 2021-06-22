// Компонент загрузки
const loading = {
    props: ['loading'],
    template: "#loading",
    data() {
        return {
            
        }
    }
}

// Компонент поиска
const search = {
    props: ['search'],
    template: "#search",
    data() {
        return {

        }
    },

    methods: {
        searchTerm() {
            // Значение инпута
            const inputValue = this.$refs.inputSearch.value;
            // Текст с инпута
            const text = inputValue.toUpperCase();
            // Таблица, в к-ой будем искать
            const table = myApp.$refs.tableBox;
            // Все строчки таблицы
            const tr = table.getElementsByTagName("tr");
            // Проходимся по каждой ячейке и ищем совпадения
            for (let i = 1; i < tr.length; i++) {
                const td = tr[i].getElementsByTagName("td");
                let hidden = true;
                for (let k = 0; k < td.length; k++) {
                    if (td[k].innerText.toUpperCase().indexOf(text) > -1) {
                        hidden = false;
                        continue;
                    }
                }
                if (hidden) {
                    tr[i].style.display = "none";
                } else {
                    tr[i].style.display = "";
                }
            }
        },
    },
}

const addForm = {
    props: ['btn-add'],
    template: "#btn-add",
    data() {
        return {
            addForm: false,
            id: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',

            regex:/[^A-Za-zА-Яа-яЁё]/g,
            regexPhone: /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/,
            regexEmail: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
        }
    },

    methods: {
        addPerson() {
            const personInfo = {
                id: this.id,
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                phone: this.phone,
                description: 'test',
                address: {
                    streetAddress: 'test',
                    city: 'test',
                    state: 'test',
                    zip: 'test',
                },
            };

            this.clearValue(this.firstName);
            this.clearValue(this.lastName);
            this.clearValue(this.email);
            this.clearValue(this.phone);

            myApp.info.unshift(personInfo);
            myApp.insertToTable(myApp.info);
            myApp.prepareSort();
        },

        clearValue(item) {
            item = "";
        },

        checkValues() {
            const btnAddPerson = this.$refs.btnAddPerson;

            if (this.id 
                && this.firstName.length > 3
                && this.lastName.length > 3
                && this.validationEmail()
                && this.valudationPhone()) {
                    btnAddPerson.removeAttribute("disabled");
                } else {
                    btnAddPerson.setAttribute("disabled", "disabled");
                }
        },

        validationEmail() {
            if(!this.regexEmail.test(this.email)) {
                return false;
            }
            return true;
        },

        valudationPhone() {
            if(!this.regexPhone.test(this.phone)) { 
                return false;
            }
            return true;
        },

        validationFName() {
            if (this.firstName.match(this.regex)) {
                this.firstName = this.firstName.replace(this.regex, "");
            }
        },

        validationLName() {
            if (this.lastName.match(this.regex)) {
                this.lastName = this.lastName.replace(this.regex, "");
            }
        },

        showForm() {
            this.addForm = true;
        },
    }
}

const app = {
    data() {
        return {
            info: [],
            _url: "http://www.filltext.com/?rows=32&id={number|1000}&firstName={firstName}&lastName={lastName}&email={email}&phone={phone|(xxx)xxx-xx-xx}&address={addressObject}&description={lorem|32}",
        }
    },

    mounted() {
        const body = this.getData();
        body.then((body) => {
            this.info = body;
            this.insertToTable(this.info);
            this.prepareSort();
        }).catch((err) => {
            console.error(err);
            this.showError();
        });
    },

    methods: {
        async getData() {
            const response = await fetch(this._url);

            if (!response.ok) {
                throw new Error(`Could not fetch ${this._url}` +
                `, received ${res.status}`)
            }

            return await response.json();
        },

        showError() {
            const body = this.$refs.errorBox;
            const error = `
                <h1>Всё сломалось, извините😢</h1>
            `;
            body.classList.add("error-box");
            body.innerHTML = error;
        },

        prepareSort() {
            const getSort = ({ target }) => {
                const order = (target.dataset.order = -(target.dataset.order || -1));
                const index = [...target.parentNode.cells].indexOf(target);
                const collator = new Intl.Collator(['en', 'ru'], { numeric: true });
                const comparator = (index, order) => (a, b) => order * collator.compare(
                    a.children[index].innerHTML,
                    b.children[index].innerHTML
                );
                
                for(const tBody of target.closest('table').tBodies)
                    tBody.append(...[...tBody.rows].sort(comparator(index, order)));
        
                for(const cell of target.parentNode.cells)
                    cell.classList.toggle('sorted', cell === target);
            };
            
            document.querySelectorAll('.table_sort thead').forEach(tableTH => tableTH.addEventListener('click', () => getSort(event)))
        },

        insertToTable(data) {
            const table = this.$refs.tableBox;

            const startTable = `
                <table border='1' class='table table_sort'>
                    <thead title='Нажмите для сортировки по колонке'>
                        <th>id</th>
                        <th>firstName</th>
                        <th>lastName</th>
                        <th>email</th>
                        <th>phone</th>
                    </thead>
                <tbody>
            `;
            let bodyTable = "";

            for (let i = 0; i < data.length; i++) {
                bodyTable += `
                    <tr onclick='showPersonInfo(${data[i].id})' 
                        title='Нажмите, чтобы узнать подробнее'>
                        <td>${data[i].id}</td>
                        <td>${data[i].firstName}</td>
                        <td>${data[i].lastName}</td>
                        <td>${data[i].email}</td>
                        <td>${data[i].phone}</td>
                    </tr>
                `;
            }

            const endTable = "</tbody></table>";

            table.innerHTML = startTable + bodyTable + endTable;
        },
    },

    components: {
        'loading': loading,
        'search': search,
        'btn-add': addForm,
    }
}

const myApp = Vue.createApp(app).mount("#app");

function showPersonInfo(id) {
    // Инпут с id выбранного человека
    const personId = document.querySelector(".input-person-id");

    // Если не выбран тот же самый человек, то показываем 
    // новую информацию
    if (personId.value != id) {
        // Ищем человека по id в массиве всех людей
        for (let i = 0; i < myApp.info.length; i++) {
            if (id == myApp.info[i]['id']) {
                const person = myApp.info[i];
                const infoContainer = document.querySelector(".info-container");
                
                const result = `
                    <p>Выбран пользователь <b>${person.firstName} ${person.lastName}</b><p>
                    <div class='description'>
                        <p>Описание:</p>
                        <textarea>
                            ${person.description}
                        </textarea>
                    </div>
                    <p>Адрес проживания: <b>${person.address.streetAddress}</b></p>
                    <p>Город: <b>${person.address.city}</b></p>
                    <p>Провинция/штат: <b>${person.address.state}</b></p>
                    <p>Индекс: <b>${person.address.zip}</b></p>
                `;
                personId.value = person.id;

                infoContainer.style.display = "flex";
                infoContainer.innerHTML = result;
            }
        }
    }
}