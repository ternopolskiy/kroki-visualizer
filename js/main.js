// Основной JavaScript файл

// Ожидаем загрузку DOM
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация редактора, если мы на странице редактора
    if (document.querySelector('.editor-container')) {
        initEditor();
    }

    // Инициализация галереи, если мы на странице галереи
    if (document.querySelector('.gallery-grid')) {
        loadGalleryExamples();
    }
});

// Функция инициализации редактора
function initEditor() {
    const diagramTypeSelect = document.getElementById('diagram-type');
    const outputFormatSelect = document.getElementById('output-format');
    const codeEditor = document.getElementById('code-editor');
    const renderButton = document.getElementById('render-button');
    const saveButton = document.getElementById('save-button');
    const preview = document.getElementById('preview');
    const previewImage = document.getElementById('preview-image');
    const loadingIndicator = document.getElementById('loading-indicator');

    // Примеры кода для разных типов диаграмм
    const examples = {
        'plantuml': '@startuml\nactor User\nUser -> System: Request\nSystem --> User: Response\n@enduml',
        'mermaid': 'graph TD\nA[Start] --> B{Decision}\nB -->|Yes| C[Process 1]\nB -->|No| D[Process 2]\nC --> E[End]\nD --> E',
        'graphviz': 'digraph G {\n  rankdir=LR;\n  node [shape=box];\n  A -> B -> C;\n  B -> D;\n}',
        'c4plantuml': '@startuml\n!include C4_Context.puml\n\nPerson(user, "User", "A user of the system")\nSystem(system, "System", "The system")\n\nRel(user, system, "Uses")\n@enduml',
        'bpmn': '<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"\n                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"\n                  id="Definitions_1"\n                  targetNamespace="http://bpmn.io/schema/bpmn">\n  <bpmn:process id="Process_1" isExecutable="false">\n    <bpmn:startEvent id="StartEvent_1"/>\n  </bpmn:process>\n</bpmn:definitions>'
    };

    // Загрузка примера при изменении типа диаграммы
    diagramTypeSelect.addEventListener('change', function() {
        const selectedType = diagramTypeSelect.value;
        if (examples[selectedType]) {
            codeEditor.value = examples[selectedType];
        }
    });

    // Установка начального примера
    codeEditor.value = examples['plantuml'];

    // Обработчик кнопки рендеринга
    renderButton.addEventListener('click', function() {
        renderDiagram();
    });

    // Обработчик кнопки сохранения
    saveButton.addEventListener('click', function() {
        saveDiagram();
    });

    // Функция рендеринга диаграммы
    function renderDiagram() {
        const diagramType = diagramTypeSelect.value;
        const outputFormat = outputFormatSelect.value;
        const code = codeEditor.value;
        
        // Показываем индикатор загрузки
        loadingIndicator.style.display = 'flex';
        previewImage.style.display = 'none';
        
        // Используем POST запрос вместо GET для более надежной работы
        fetch(`https://kroki.io/${diagramType}/${outputFormat}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: code
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            previewImage.onload = function() {
                loadingIndicator.style.display = 'none';
                previewImage.style.display = 'block';
            };
            previewImage.src = url;
        })
        .catch(error => {
            console.error('Ошибка при генерации диаграммы:', error);
            loadingIndicator.style.display = 'none';
            previewImage.style.display = 'none';
            alert('Ошибка при генерации диаграммы. Проверьте синтаксис и тип диаграммы.');
        });
    }

    // Функция сохранения диаграммы
    function saveDiagram() {
        const diagramType = diagramTypeSelect.value;
        const outputFormat = outputFormatSelect.value;
        const code = codeEditor.value;
        
        // Показываем индикатор загрузки
        loadingIndicator.style.display = 'flex';
        
        // Используем POST запрос для получения диаграммы
        fetch(`https://kroki.io/${diagramType}/${outputFormat}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: code
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            // Скрываем индикатор загрузки
            loadingIndicator.style.display = 'none';
            
            // Создаем ссылку для скачивания
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `diagram.${outputFormat}`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Освобождаем ресурсы
            setTimeout(() => URL.revokeObjectURL(url), 100);
        })
        .catch(error => {
            console.error('Ошибка при сохранении диаграммы:', error);
            loadingIndicator.style.display = 'none';
            alert('Ошибка при сохранении диаграммы. Проверьте синтаксис и тип диаграммы.');
        });
    }
}

// Функция загрузки примеров для галереи
function loadGalleryExamples() {
    const galleryItems = [
        {
            type: 'plantuml',
            title: 'Диаграмма последовательности',
            description: 'Пример диаграммы последовательности в PlantUML',
            code: '@startuml\nactor User\nparticipant "Frontend" as FE\nparticipant "Backend" as BE\ndatabase "Database" as DB\n\nUser -> FE: Запрос данных\nFE -> BE: API запрос\nBE -> DB: Запрос к БД\nDB --> BE: Результаты\nBE --> FE: JSON ответ\nFE --> User: Отображение данных\n@enduml'
        },
        {
            type: 'mermaid',
            title: 'Блок-схема',
            description: 'Пример блок-схемы в Mermaid',
            code: 'graph TD\nA[Начало] --> B{Условие?}\nB -->|Да| C[Процесс 1]\nB -->|Нет| D[Процесс 2]\nC --> E[Конец]\nD --> E'
        },
        {
            type: 'graphviz',
            title: 'Граф зависимостей',
            description: 'Пример графа в GraphViz',
            code: 'digraph G {\n  rankdir=LR;\n  node [shape=box, style=filled, color=lightblue];\n  A -> B -> C;\n  B -> D;\n  A -> D;\n}'
        },
        {
            type: 'c4plantuml',
            title: 'C4 Модель',
            description: 'Пример C4 модели архитектуры',
            code: '@startuml\n!include C4_Context.puml\n\nPerson(user, "Пользователь", "Пользователь системы")\nSystem(system, "Веб-приложение", "Наша система")\nSystem_Ext(payment, "Платежная система", "Внешняя система оплаты")\n\nRel(user, system, "Использует")\nRel(system, payment, "Отправляет запросы")\n@enduml'
        },
        {
            type: 'plantuml',
            title: 'Диаграмма классов',
            description: 'Пример диаграммы классов в PlantUML',
            code: '@startuml\nclass User {\n  +String name\n  +String email\n  +login()\n  +logout()\n}\n\nclass Product {\n  +String name\n  +float price\n  +getDetails()\n}\n\nclass Order {\n  +Date date\n  +float total\n  +process()\n}\n\nUser "1" -- "*" Order\nOrder "*" -- "*" Product\n@enduml'
        },
        {
            type: 'mermaid',
            title: 'Диаграмма Ганта',
            description: 'Пример диаграммы Ганта в Mermaid',
            code: 'gantt\ntitle Проектный план\ndateFormat  YYYY-MM-DD\nsection Планирование\nАнализ требований      :a1, 2023-01-01, 7d\nПроектирование        :a2, after a1, 10d\nsection Разработка\nРазработка Frontend    :a3, after a2, 15d\nРазработка Backend     :a4, after a2, 12d\nsection Тестирование\nТестирование          :a5, after a3, 7d'
        },
        {
            type: 'graphviz',
            title: 'Организационная структура',
            description: 'Пример организационной структуры компании',
            code: 'digraph G {\n  node [shape=box, style=filled, color="#e6f3ff", fontname="Arial"];\n  edge [color="#666666"];\n  rankdir=TB;\n  \n  CEO [label="Генеральный директор", fillcolor="#c1e1ff"];\n  CTO [label="Технический директор"];\n  CFO [label="Финансовый директор"];\n  COO [label="Операционный директор"];\n  \n  DEV1 [label="Команда разработки 1"];\n  DEV2 [label="Команда разработки 2"];\n  QA [label="Отдел тестирования"];\n  FIN [label="Финансовый отдел"];\n  HR [label="HR отдел"];\n  OPS [label="Операционный отдел"];\n  \n  CEO -> {CTO; CFO; COO};\n  CTO -> {DEV1; DEV2; QA};\n  CFO -> FIN;\n  COO -> {OPS; HR};\n}'
        },
        {
            type: 'plantuml',
            title: 'Диаграмма состояний',
            description: 'Пример диаграммы состояний заказа',
            code: '@startuml\nskinparam state {\n  BackgroundColor LightBlue\n  BorderColor Gray\n  FontName Arial\n}\n\n[*] --> Создан\nСоздан --> Оплачен : Оплата\nСоздан --> Отменен : Отмена\nОплачен --> ВПроцессе : Начало обработки\nВПроцессе --> Отправлен : Отправка\nОтправлен --> Доставлен : Доставка\nОтправлен --> Возвращен : Возврат\nДоставлен --> [*]\nОтменен --> [*]\nВозвращен --> [*]\n@enduml'
        },
        {
            type: 'mermaid',
            title: 'Круговая диаграмма',
            description: 'Пример круговой диаграммы в Mermaid',
            code: 'pie title Распределение бюджета проекта\n    "Разработка" : 45\n    "Маркетинг" : 25\n    "Инфраструктура" : 15\n    "Поддержка" : 10\n    "Прочее" : 5'
        },
        {
            type: 'plantuml',
            title: 'Диаграмма компонентов',
            description: 'Пример диаграммы компонентов системы',
            code: '@startuml\nskinparam component {\n  BackgroundColor LightGreen\n  BorderColor Green\n  FontSize 14\n}\n\npackage "Frontend" {\n  [Web UI] as UI\n  [JavaScript Client] as JS\n}\n\npackage "Backend" {\n  [API Gateway] as API\n  [Auth Service] as Auth\n  [User Service] as User\n  [Product Service] as Product\n}\n\ndatabase "Database" {\n  [PostgreSQL] as DB\n}\n\nUI --> JS\nJS --> API\nAPI --> Auth\nAPI --> User\nAPI --> Product\nAuth --> DB\nUser --> DB\nProduct --> DB\n@enduml'
        }
    ];

    const galleryGrid = document.querySelector('.gallery-grid');
    
    // Очищаем галерею
    galleryGrid.innerHTML = '';
    
    // Добавляем элементы галереи
    galleryItems.forEach(item => {
        // Создаем элемент галереи
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.dataset.type = item.type; // Добавляем тип диаграммы как атрибут data-type
        
        // Создаем временный контейнер для изображения
        const imageContainer = document.createElement('div');
        imageContainer.className = 'gallery-image';
        
        // Создаем индикатор загрузки
        const loader = document.createElement('div');
        loader.className = 'loading';
        imageContainer.appendChild(loader);
        
        // Создаем изображение
        const img = document.createElement('img');
        img.alt = item.title;
        img.style.display = 'none';
        imageContainer.appendChild(img);
        
        // Создаем информационный блок
        const infoDiv = document.createElement('div');
        infoDiv.className = 'gallery-info';
        infoDiv.innerHTML = `
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <button class="btn primary view-code-btn">Посмотреть код</button>
        `;
        
        // Добавляем элементы в галерею
        galleryItem.appendChild(imageContainer);
        galleryItem.appendChild(infoDiv);
        
        // Загружаем изображение через POST запрос
        fetch(`https://kroki.io/${item.type}/svg`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: item.code
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            img.onload = function() {
                loader.style.display = 'none';
                img.style.display = 'block';
            };
            img.src = url;
        })
        .catch(error => {
            console.error('Ошибка при загрузке диаграммы:', error);
            loader.style.display = 'none';
            imageContainer.innerHTML += '<p style="color: red; text-align: center;">Ошибка загрузки</p>';
        });
        
        // Добавляем обработчик для кнопки просмотра кода
        galleryItem.querySelector('.view-code-btn').addEventListener('click', function() {
            // Сохраняем код в localStorage
            localStorage.setItem('diagramCode', item.code);
            localStorage.setItem('diagramType', item.type);
            
            // Перенаправляем на страницу редактора
            window.location.href = 'editor.html';
        });
        
        // Добавляем элемент в галерею
        galleryGrid.appendChild(galleryItem);
    });
    
    // Инициализация фильтров, если они есть на странице
    initGalleryFilters();
}

// Функция инициализации фильтров галереи
function initGalleryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (!filterButtons.length) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Удаляем класс active у всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем класс active текущей кнопке
            this.classList.add('active');
            
            // Получаем значение фильтра
            const filterValue = this.dataset.filter;
            
            // Фильтруем элементы галереи
            filterGalleryItems(filterValue);
        });
    });
}

// Функция фильтрации элементов галереи
function filterGalleryItems(filter) {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        if (filter === 'all') {
            item.classList.remove('hidden');
        } else {
            if (item.dataset.type === filter) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        }
    });
}

// Функция для кодирования строки в base64
function btoa(str) {
    // Для поддержки Unicode
    return window.btoa(unescape(encodeURIComponent(str)));
}

// Проверяем, есть ли сохраненный код при загрузке редактора
if (document.querySelector('.editor-container')) {
    const savedCode = localStorage.getItem('diagramCode');
    const savedType = localStorage.getItem('diagramType');
    
    if (savedCode && savedType) {
        const codeEditor = document.getElementById('code-editor');
        const diagramTypeSelect = document.getElementById('diagram-type');
        
        if (codeEditor && diagramTypeSelect) {
            codeEditor.value = savedCode;
            diagramTypeSelect.value = savedType;
            
            // Очищаем localStorage
            localStorage.removeItem('diagramCode');
            localStorage.removeItem('diagramType');
            
            // Рендерим диаграмму
            setTimeout(() => {
                document.getElementById('render-button').click();
            }, 500);
        }
    }
}