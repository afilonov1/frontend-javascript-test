let requestUrlMini = 'http://www.filltext.com/?rows=32&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D';

let requestUrlBig = 'http://www.filltext.com/?rows=1000&id=%7Bnumber%7C1000%7D&firstName=%7BfirstName%7D&delay=3&lastName=%7BlastName%7D&email=%7Bemail%7D&phone=%7Bphone%7C(xxx)xxx-xx-xx%7D&address=%7BaddressObject%7D&description=%7Blorem%7C32%7D';





		let data = [];

		let itemsOnPage;

		let pagination;

		let currentPage = 1;

		// объявляем таблицу
		let tab = document.querySelector('.table');
		
		let wrapperOfBtns = document.querySelector('.btn-wrapper');

		let firstBtn = document.querySelector('.btn-first__mas');

		let secondBtn = document.querySelector('.btn-second__mas');

		const loader = document.querySelector('.loader');

		
		
	// объявляем промис чтобы функции которые работают с массивом сработали после окончания загрузки массива
	new Promise( (resolve, reject) => {
		// клик на левую кнопку загрузит короткий массий
		firstBtn.onclick = async function () {
			// убираем кнопки, добавляем Картику загрузки до окончания загрузки массива
			wrapperOfBtns.classList.add('display-none');
			loader.classList.toggle('display-none');
			await getData(requestUrlMini);
			loader.classList.toggle('display-none');
			resolve();
		}
		// клик на правую кнопку загрузит длинный массив
		secondBtn.onclick = async function () {
			// убираем кнопки, добавляем Картику загрузки до окончания загрузки массива
			wrapperOfBtns.classList.add('display-none');
			loader.classList.toggle('display-none');
			await getData(requestUrlBig);
			loader.classList.toggle('display-none');
			resolve();
		}
	})
	// смотрим сколько строк таблицы на загруженной странице
	.then (itemsOnPageFunc)
	// обрабатываем ошибки
	.catch(error => console.error(error))
	// создаем таблицу для Первой страницы
	.then(() => createTable(1))
	// запускаем возможность сортировки
	.then(() => {
		sorting()
	})
	// создаем пагинацию
	.then(() => {
		paginationCreate(pagesCount(data.length));
	})

	// меняем таблицу и текущую страницу в пагинации при клике
	.then(() => {
		pagination = document.querySelector('.pagination');
		clickManager();
	})
	// добавляем разблокировщик кнопки "добавить в таблицу" сюда, чтобы он срабатывал после скачивания массива
	.then(() => {
		formSelestion();
	})
	// чтобы "дополнительная информация" создавалась при работе с первой странице
	.then(() => {
		clicker();
	});




	/**
	 * Создаем визуальные стрелки на заголовках
	 */
	let tableHeading = tab.querySelectorAll('.table-heading');
	for (let i = 0; i < tableHeading.length; i++) {
		createArrow(i);
	}



	/**
	 * Получаем данные и записываем в переменную data
	 * @param {string} url - ссылка получения данных
	 */
	async function getData(url) {
		console.time('123');
		const response = await fetch(url);
		data = await response.json();
		console.timeEnd('123');
	}
	


		/**
		 * Создает ячейку таблицы
		 * @param {string} text - текст который зададим ячейке
		 * @param {} parent  - в конец какого элемента добавить ячейку
		 */
		function createCell(text, parent) {
			let cell = document.createElement('div');
			cell.classList.add('table-col');
			cell.textContent = text;
			parent.append(cell);
		}


		/**
		 * Создает строку таблицы
		 */
		function createRow() {
			let row = document.createElement('div');
			row.classList.add('table-row');
			return row;
		}


		/**
		 * Определяет колличество элементов на странице
		 */
		function pagesCount() {
			return Math.ceil(data.length / 50);
		}

		// 
		/**
		 * создает таблицу на странице № k
		 * @param {number} k - номер страницы
		 */
		function createTable (k) {
			itemsOnPageFunc(k);
			for (let i = (k - 1) * itemsOnPage; i < k * itemsOnPage; i++) {
				let row = createRow();
				for (let or in data[i]) {
					if (or === 'address') {
						for (let adr in data[i][or]) {
							createCell(data[i][or][adr], row);
						}
					} else {
						createCell(data[i][or], row);
					}
				}
				tab.append(row);
			}
		}
		
		/**
		 * Смотрит сколько элементов массива будет размещено на странице
		 * @param {number} k - номер страницы
		 */
		function itemsOnPageFunc(k) {
			if (data.length > 50 && k != pagesCount(data.length)) {
				itemsOnPage = 50;
				// можно было объеденить if, но код потерял бы наглядность условия
			} else if (data.length >= 50 && data.length % 50 === 0) {
				itemsOnPage = 50;
			}
			else {
				itemsOnPage = data.length % 50;
			}
		}


		


		/**
		 * Удаляет таблицу
		 */
		function deleteTable() {
			for (let i = 1; i <= itemsOnPage; i++) {
				tab.children[1].remove();
			}
		}

		// с
		/**
		 * Создает пагинацию
		 * @param {number} pages - колличество страниц (получаем с помощью функции pagesCount)
		 */
		let paginationCreate = function (pages) {
			let pagWrapper = document.createElement('ul');
			pagWrapper.classList.add('pagination');
			for (let i = 1; i <= pages; i++) {
				let pagPage = document.createElement('li');
				pagPage.classList.add('pag-item');
				if (i === 1) {
					pagPage.classList.add('pag-current');
				}
				pagPage.textContent = i;
				pagWrapper.append(pagPage);
			}
			tab.after(pagWrapper);
		};


		/**
		 * Меняет текущую страницу в пагинации на выбранную кликом
		 * @param {number} newPage - номер страницы на которую мы переходим и делаем её текущей
		 */
		function changePage(newPage) {
			pagination.children[currentPage - 1].classList.remove('pag-current');
			currentPage = newPage;
			pagination.children[currentPage - 1].classList.add('pag-current');
		}



		/**
		 * Меняет таблицу на таблицу выбранной страницы
		 */
		function clickManager () {
			for (let i = 1; i <= pagination.children.length; i++) {
				pagination.children[i - 1].onclick = function () {
					changePage(i);
					deleteTable();
					createTable(i);
					// чтобы на новой странице работал вывод раздела "дополнительная информация"
					clicker();
					// на новой странице опускаем все стрелки
					changeArrowToDown();
				};
			}
		}





		/**
		 * Проверяет отсортирован ли столбец по возрастанию
		 * @param {number} j а
		 */
		function isSortedUp(j) {
			for (let k = 1; k < tab.children.length - 1; k++) {
				if ((Number(tab.children[k].children[j].textContent) > Number(tab.children[k + 1].children[j].textContent)) || ((tab.children[k].children[j].textContent > tab.children[k + 1].children[j].textContent) && (isNaN(Number(tab.children[k].children[j].textContent))))) {
					return -1;
				}
			}
			return 1;
		}


		/**
		 * Проверяет отсортирован ли столбец по убыванию
		 * @param {number} j - номер столбц
		 */
		function isSortedDown(j) {
			for (let k = 1; k < tab.children.length - 1; k++) {
				if ((Number(tab.children[k].children[j].textContent) < Number(tab.children[k + 1].children[j].textContent)) || ((tab.children[k].children[j].textContent < tab.children[k + 1].children[j].textContent) && (isNaN(Number(tab.children[k].children[j].textContent))))) {
					return -1;
				}
			}
			return 1;
		}


		
		/**
		 * Проставляет стрелки в заголовках таблицы
		 * @param {number} j - номер столбца
		 */
		function createArrow(j) {
			let arrow = document.createElement('p');
			arrow.classList.add('arrow');
			let parent = tab.children[0].children[j];
			arrow.textContent = '▼';
			parent.style.position = 'relative';
			arrow.style.position = 'absolute';
			arrow.style.right = '10px';
			arrow.style.top = '10px';
			parent.append(arrow);
		}






		/**
		 * Функция меняет местами строку и следующую за ней по номеру местами
		 * @param {number} firstItem - номер строки
		 */
		let change = function (firstItem) {
			let span = tab.children[firstItem];
			tab.children[firstItem].remove();
			tab.children[firstItem].after(span);
		}



		/**
		 * Сортирует столбец по возрастанию
		 * @param {number} j - номер столбца
		 */
		function sortUp(j) {
			for (let i = 1; i < tab.children.length - 1; i++) {
				for (let k = 1; k < tab.children.length - 1; k++) {
					
					//
					if (j === 0 || j === 8) {
						if (Number(tab.children[k].children[j].textContent) > Number(tab.children[k + 1].children[j].textContent)) {
							change(k);
						}
					} else if ((tab.children[k].children[j].textContent > tab.children[k + 1].children[j].textContent)) {
						change(k);
					}
				}
			}
		}

		/**
		 * Сортирует столбец по убыванию
		 * @param {number} j - номер столбца
		 */
		function sortDown(j) {
			for (let i = 1; i < tab.children.length - 1; i++) {
				for (let k = 1; k < tab.children.length - 1; k++) {
					if (j === 0 || j === 8) {
						if (Number(tab.children[k].children[j].textContent) < Number(tab.children[k + 1].children[j].textContent)) {
							change(k);
						}
					} else if ((tab.children[k].children[j].textContent < tab.children[k + 1].children[j].textContent)) {
						change(k);
					}
				}
			}
		}


		let arrows = document.querySelectorAll('.arrow');
		/**
		 * Все стрелки опускает вниз (нужно при смене страницы)
		 */
		function changeArrowToDown() {
			for (let i = 0; i < tableHeading.length; i++) {
				arrows[i].textContent = '▼';
			}
		}


		/**
		 * Сортирует столбец при соответствующем нажатии
		 */
		function sorting() {
			for (let i = 0; i < tableHeading.length; i++) {
				tableHeading[i].onclick = function () {
					if (isSortedUp(i) === 1) {
						sortDown(i);
						arrows[i].textContent = '▼';
					}
					else if (isSortedDown(i) === 1) {
						sortUp(i);
						arrows[i].textContent = '▲';
					}
					else {
						sortUp(i);
						arrows[i].textContent = '▲';
					}
					// добавляем кликер чтобы после сортировки "дополнительная информация" выводилась корректно
					clicker();
				};

			}
		}

		/**
		 * Проверяет заполнены ли все элементы формы
		 * @param {Array} mas 
		 */
		function isFilled(mas) {
			let k = 0;
			for (let i = 0; i < mas.length; i++) {
				if (!mas[i].value) {
					return -1;
				}
			}
			return 1;
		}

		

		let openForm = document.querySelector('.open-form');
		let form = document.querySelector('.form');

		/**
		 * При нажатии на "добавить" открывается форма добавления, при повторном нажатии закрывается
		 */
		openForm.onclick = function () {
			form.classList.toggle('display-none');
		};



		let addForm = document.querySelector('.add-form');
		let formInput = form.querySelectorAll('.form-input');


		/**
		 * Разблокирует кнопку "добавить в таблицу", если введены верные значения формы
		 */
		function formSelestion() {
			for (let i = 0; i < formInput.length; i++) {
				formInput[i].onchange = function () {
					if (isFilled(formInput) === 1) {
						if (isNaN(Number(formInput[0].value)) || isNaN(Number(formInput[8].value))){
							alert('Введите числовое значение в id и zip');
							addForm.disabled = true;
						} else {
							addForm.disabled = false;
						}
					}
				};
			}
		}
		

		/**
		 * Вставляет строку заданную значениями в форме
		 * @param {} evt - для отмены отправки формы
		 */
		addForm.onclick = function (evt) {
			evt.preventDefault();
			let row = createRow();
			for (let i = 0; i < tab.children[0].children.length; i++) {
				createCell(formInput[i].value, row);	
			}
			tab.children[0].after(row);
			// добавили кликкер чтобы после добавления элемента через форму на него можно было кликнуть и вывести на страницу
			clicker();
		};

		// 
		/**
		 * Скрывает ряд, в котором нет подстроки value
		 * @param {string} value - то что мы ввели в searchInput
		 */
		let visionDown = function (value) {
			for (let i = 1; i < tab.children.length; i++) {
				let k = 0;
				for (let j = 0; j < tab.children[i].children.length; j++) {
					if (tab.children[i].children[j].textContent.indexOf(value) !== -1) {
						k += 1;
					};
					if (j === tab.children[i].children.length - 1 && k === 0) {
						tab.children[i].classList.add('display-none');
					}
				}
			}
		}

		/**
		 * Включает видимость скрытых рядов
		 */
		let visionUp = function () {
			for (let i = 1; i < tab.children.length; i++) {
				for (let j = 0; j < tab.children[i].children.length; j++) {
					tab.children[i].classList.remove('display-none');
				}
			}
		};

		let searchInput = document.querySelector('.search');
		let btnFinder = document.querySelector('.btn-finder');

		/**
		 * При клике на кнопку "Поиск на странице" сначала показывает все скрытые элементы, потом скрывает те, которые не соответствуют подстроке поиска
		 */
		btnFinder.onclick = function () {
			visionUp();
			visionDown(searchInput.value);
			// Вставляем кликер, чтобы, когда мы нажмем поик, мы смогли кликать на новые контакты и выводить их в "дополнительная информация"
			clicker();
		};

		

		/**
		 * Удаляет элемент "дополнительное описание"
		 */
		function additionalDelete() {
			let addInfo = document.querySelector('.additional-info');
			if (addInfo != null) {
				addInfo.remove();
			}
		}


		/**
		 * создает элемент дополнительное описание. Принимает значени
		 * @param {} row - строка таблицы
		 * @param {} parent - после какого элемента добавить созданный элемент
		 */
		function additionalCreate(row, parent) {
			// let additionalInfo = document.createElement('p');
			let additionalInfo = document.createElement('div');
			additionalInfo.classList.add('additional-info');
			additionalInfo.innerHTML = 'Выбран пользователь <b>' + row.children[1].textContent + ' ' + row.children[2].textContent + '</b><br>' +
				'Описание:<br>' +
				'<textarea class="additional-textarea">' + row.children[9].textContent + '</textarea><br>' +
				'Адрес проживания: <b>' + row.children[5].textContent + '</b><br>' +
				'Город: <b>' + row.children[6].textContent + '</b><br>' +
				'Провинция / штат: <b>' + row.children[7].textContent + '</b><br>' +
				'Индекс: <b>' + row.children[8].textContent + '</b>';
			parent.after(additionalInfo);
		}


		/**
		 * При клике на ячейку таблицы, строка этой ячейки выводится в дополнительном описании
		 */
		function clicker() {
			for (let i = 1; i < tab.children.length; i++) {		
				for (let j = 0; j < tab.children[i].children.length; j++) {
					tab.children[i].children[j].onclick = function () {

						additionalDelete();
						additionalCreate(tab.children[i], pagination);
						window.scrollTo(0, document.body.scrollHeight);
					};
				}
			}
		}

		

