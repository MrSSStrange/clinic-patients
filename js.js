const loadBtn = document.getElementById("loadBtn");
const addPatientBtn = document.getElementById("addPatientBtn");
const resetBtn = document.getElementById("resetBtn");
const searchInput = document.getElementById("searchInput");
const paymentFilter = document.getElementById("paymentFilter");
const departmentFilter = document.getElementById("departmentFilter");
const sortSelect = document.getElementById("sortSelect");
const statusText = document.getElementById("status");
const patientsList = document.getElementById("patientsList");
const emptyState = document.getElementById("emptyState");
const detailsTitle = document.getElementById("detailsTitle");
const detailsNote = document.getElementById("detailsNote");
const detailsList = document.getElementById("detailsList");
const detailsPhoto = document.getElementById("detailsPhoto");
const detailsActions = document.getElementById("detailsActions");
const detailsPhotoInput = document.getElementById("detailsPhotoInput");
const removePhotoBtn = document.getElementById("removePhotoBtn");
const deletePatientBtn = document.getElementById("deletePatientBtn");
const patientDialog = document.getElementById("patientDialog");
const patientForm = document.getElementById("patientForm");
const cancelPatientBtn = document.getElementById("cancelPatientBtn");
const closeFormBtn = document.getElementById("closeFormBtn");
const formError = document.getElementById("formError");
const departmentOptions = document.getElementById("departmentOptions");

const totalPatients = document.getElementById("totalPatients");
const paidPatients = document.getElementById("paidPatients");
const unpaidPatients = document.getElementById("unpaidPatients");
const averageAge = document.getElementById("averageAge");
const customPatientsStorageKey = "clinicCustomPatients";
const photoOverridesStorageKey = "clinicPhotoOverrides";
const deletedPatientsStorageKey = "clinicDeletedPatients";
const generatedAvatarsPath = "assets/patient-avatars.png";
const avatarColumns = 4;
const avatarRows = 2;
const avatarCount = avatarColumns * avatarRows;
const maxPhotoSize = 512;

const patientsSource = [
  {
    id: 1,
    name: "Иван Петров",
    age: 30,
    paid: true,
    department: "Терапия",
    doctor: "Е. Смирнова",
    diagnosis: "Плановый осмотр",
    appointment: "2026-06-23T09:30:00",
    risk: "low",
    phone: "+7 900 111-24-70",
    avatarIndex: 0,
  },
  {
    id: 2,
    name: "Олег Соколов",
    age: 17,
    paid: false,
    department: "Педиатрия",
    doctor: "А. Волков",
    diagnosis: "Контроль анализов",
    appointment: "2026-06-23T11:00:00",
    risk: "medium",
    phone: "+7 900 448-19-03",
    avatarIndex: 6,
  },
  {
    id: 3,
    name: "Анна Морозова",
    age: 25,
    paid: true,
    department: "Кардиология",
    doctor: "М. Орлова",
    diagnosis: "ЭКГ и консультация",
    appointment: "2026-06-24T10:15:00",
    risk: "medium",
    phone: "+7 900 721-09-18",
    avatarIndex: 1,
  },
  {
    id: 4,
    name: "Петр Кузнецов",
    age: 45,
    paid: false,
    department: "Неврология",
    doctor: "Д. Никитин",
    diagnosis: "Повторный прием",
    appointment: "2026-06-24T13:45:00",
    risk: "high",
    phone: "+7 900 882-31-42",
    avatarIndex: 5,
  },
  {
    id: 5,
    name: "Мария Лебедева",
    age: 38,
    paid: true,
    department: "Терапия",
    doctor: "Е. Смирнова",
    diagnosis: "Результаты обследования",
    appointment: "2026-06-25T08:50:00",
    risk: "low",
    phone: "+7 900 553-10-24",
    avatarIndex: 7,
  },
  {
    id: 6,
    name: "Сергей Егоров",
    age: 52,
    paid: false,
    department: "Кардиология",
    doctor: "М. Орлова",
    diagnosis: "Нагрузка после операции",
    appointment: "2026-06-25T15:20:00",
    risk: "high",
    phone: "+7 900 300-66-74",
    avatarIndex: 2,
  },
  {
    id: 7,
    name: "Виктория Фомина",
    age: 29,
    paid: true,
    department: "Дерматология",
    doctor: "Н. Белова",
    diagnosis: "Первичная консультация",
    appointment: "2026-06-26T12:10:00",
    risk: "low",
    phone: "+7 900 145-79-88",
    avatarIndex: 3,
  },
  {
    id: 8,
    name: "Дмитрий Зайцев",
    age: 61,
    paid: false,
    department: "Неврология",
    doctor: "Д. Никитин",
    diagnosis: "МРТ, разбор снимков",
    appointment: "2026-06-26T16:30:00",
    risk: "medium",
    phone: "+7 900 674-90-21",
    avatarIndex: 5,
  },
];

const riskLabels = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

const riskOrder = {
  high: 0,
  medium: 1,
  low: 2,
};

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

let photoOverrides = readPhotoOverrides();
let deletedPatientIds = readDeletedPatientIds();
let customPatients = readCustomPatients();
let patients = [...customPatients];
let selectedPatientId = patients[0]?.id ?? null;

function fetchPatients() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getAvailableSourcePatients());
    }, 900);
  });
}

function getAvailableSourcePatients() {
  return patientsSource
    .filter((patient) => !deletedPatientIds.includes(patient.id))
    .map((patient) => ({
      ...patient,
      photo: photoOverrides[patient.id] || null,
    }));
}

function readCustomPatients() {
  try {
    const savedPatients = JSON.parse(
      localStorage.getItem(customPatientsStorageKey) || "[]"
    );

    if (!Array.isArray(savedPatients)) {
      return [];
    }

    return savedPatients
      .filter((patient) => {
        const hasRequiredText =
          patient &&
          ["name", "department", "doctor", "diagnosis", "appointment", "phone"].every(
            (key) => typeof patient[key] === "string" && patient[key].trim()
          );

        return (
          hasRequiredText &&
          Number.isInteger(patient.id) &&
          Number.isInteger(patient.age) &&
          patient.age >= 0 &&
          patient.age <= 120 &&
          typeof patient.paid === "boolean" &&
          ["low", "medium", "high"].includes(patient.risk) &&
          !Number.isNaN(new Date(patient.appointment).getTime())
        );
      })
      .map((patient) => ({
        ...patient,
        avatarIndex: Number.isInteger(patient.avatarIndex)
          ? patient.avatarIndex
          : getAvatarIndex(patient),
        photo: typeof patient.photo === "string" && patient.photo.startsWith("data:image/")
          ? patient.photo
          : null,
      }));
  } catch (error) {
    return [];
  }
}

function readPhotoOverrides() {
  try {
    const savedOverrides = JSON.parse(
      localStorage.getItem(photoOverridesStorageKey) || "{}"
    );

    if (!savedOverrides || typeof savedOverrides !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(savedOverrides).filter(([id, photo]) => {
        return Number.isInteger(Number(id)) && typeof photo === "string" &&
          photo.startsWith("data:image/");
      })
    );
  } catch (error) {
    return {};
  }
}

function readDeletedPatientIds() {
  try {
    const savedIds = JSON.parse(
      localStorage.getItem(deletedPatientsStorageKey) || "[]"
    );

    if (!Array.isArray(savedIds)) {
      return [];
    }

    return savedIds.filter((id) => Number.isInteger(id));
  } catch (error) {
    return [];
  }
}

function saveCustomPatients() {
  try {
    localStorage.setItem(customPatientsStorageKey, JSON.stringify(customPatients));
    return true;
  } catch (error) {
    return false;
  }
}

function savePhotoOverrides() {
  try {
    localStorage.setItem(photoOverridesStorageKey, JSON.stringify(photoOverrides));
    return true;
  } catch (error) {
    return false;
  }
}

function saveDeletedPatientIds() {
  try {
    localStorage.setItem(deletedPatientsStorageKey, JSON.stringify(deletedPatientIds));
    return true;
  } catch (error) {
    return false;
  }
}

function formatAppointment(value) {
  return dateFormatter.format(new Date(value));
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function getAvatarIndex(patient) {
  if (Number.isInteger(patient.avatarIndex)) {
    return patient.avatarIndex % avatarCount;
  }

  return patient.id % avatarCount;
}

function setBackgroundImage(element, imageUrl) {
  element.style.backgroundImage = `url("${imageUrl.replaceAll('"', '\\"')}")`;
}

function applyPatientPhoto(element, patient) {
  const avatarIndex = getAvatarIndex(patient);
  const avatarColumn = avatarIndex % avatarColumns;
  const avatarRow = Math.floor(avatarIndex / avatarColumns);
  const avatarX = avatarColumn === 0
    ? 0
    : (avatarColumn / (avatarColumns - 1)) * 100;
  const avatarY = avatarRow === 0 ? 0 : 100;

  element.classList.remove("avatar--uploaded", "avatar--generated");

  if (patient.photo) {
    element.classList.add("avatar--uploaded");
    setBackgroundImage(element, patient.photo);
    element.style.backgroundPosition = "center";
    element.style.backgroundSize = "cover";
    return;
  }

  element.classList.add("avatar--generated");
  setBackgroundImage(element, generatedAvatarsPath);
  element.style.backgroundPosition = `${avatarX}% ${avatarY}%`;
  element.style.backgroundSize = `${avatarColumns * 100}% ${avatarRows * 100}%`;
}

function createPatientPhotoElement(patient, className) {
  const avatar = createElement("span", className);
  avatar.setAttribute("aria-hidden", "true");
  applyPatientPhoto(avatar, patient);
  return avatar;
}

function getSelectedPatient() {
  return patients.find((patient) => patient.id === selectedPatientId) || null;
}

function getNextPatientId() {
  const allIds = [...patientsSource, ...patients, ...customPatients].map(
    (patient) => patient.id
  );

  return Math.max(0, ...allIds) + 1;
}

function getCurrentDateTimeValue() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function getFormValue(formData, name) {
  return String(formData.get(name) || "").trim();
}

function resizeImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = (image.naturalWidth - sourceSize) / 2;
      const sourceY = (image.naturalHeight - sourceSize) / 2;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = maxPhotoSize;
      canvas.height = maxPhotoSize;
      context.drawImage(
        image,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        maxPhotoSize,
        maxPhotoSize
      );

      resolve(canvas.toDataURL("image/jpeg", 0.86));
    };

    image.onerror = () => reject(new Error("Не удалось прочитать изображение."));
    image.src = dataUrl;
  });
}

function readPhotoFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error("Выберите файл изображения."));
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const resizedPhoto = await resizeImage(String(reader.result));
        resolve(resizedPhoto);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Не удалось загрузить фото."));
    reader.readAsDataURL(file);
  });
}

function setLoading(isLoading) {
  loadBtn.disabled = isLoading;
  addPatientBtn.disabled = isLoading;
  loadBtn.textContent = isLoading ? "Загружаем..." : "Обновить список";
  searchInput.disabled = isLoading;
  paymentFilter.disabled = isLoading;
  departmentFilter.disabled = isLoading;
  sortSelect.disabled = isLoading;
}

function populateDepartments() {
  const selectedDepartment = departmentFilter.value || "all";
  const departments = [...new Set(patients.map((patient) => patient.department))].sort();

  departmentFilter.replaceChildren(new Option("Все отделения", "all"));
  departmentOptions.replaceChildren();

  departments.forEach((department) => {
    departmentFilter.append(new Option(department, department));

    const option = document.createElement("option");
    option.value = department;
    departmentOptions.append(option);
  });

  departmentFilter.value = departments.includes(selectedDepartment)
    ? selectedDepartment
    : "all";
}

function getVisiblePatients() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const paymentValue = paymentFilter.value;
  const departmentValue = departmentFilter.value;

  return patients
    .filter((patient) => {
      const matchesSearch = [patient.name, patient.diagnosis, patient.doctor]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);
      const matchesPayment =
        paymentValue === "all" ||
        (paymentValue === "paid" && patient.paid) ||
        (paymentValue === "unpaid" && !patient.paid);
      const matchesDepartment =
        departmentValue === "all" || patient.department === departmentValue;

      return matchesSearch && matchesPayment && matchesDepartment;
    })
    .sort((first, second) => {
      if (sortSelect.value === "name") {
        return first.name.localeCompare(second.name, "ru");
      }

      if (sortSelect.value === "age") {
        return second.age - first.age;
      }

      if (sortSelect.value === "risk") {
        return riskOrder[first.risk] - riskOrder[second.risk];
      }

      return new Date(first.appointment) - new Date(second.appointment);
    });
}

function updateMetrics() {
  const paidCount = patients.filter((patient) => patient.paid).length;
  const unpaidCount = patients.length - paidCount;
  const ageSum = patients.reduce((sum, patient) => sum + patient.age, 0);
  const average = patients.length ? Math.round(ageSum / patients.length) : 0;

  totalPatients.textContent = patients.length;
  paidPatients.textContent = paidCount;
  unpaidPatients.textContent = unpaidCount;
  averageAge.textContent = average;
}

function renderPatients() {
  const visiblePatients = getVisiblePatients();

  patientsList.replaceChildren();
  emptyState.hidden = patients.length === 0 || visiblePatients.length > 0;

  visiblePatients.forEach((patient) => {
    const item = createElement("li", "patient-card");
    const button = createElement("button", "patient-card__button");
    button.type = "button";
    button.dataset.patientId = patient.id;
    button.setAttribute("aria-pressed", String(patient.id === selectedPatientId));

    if (patient.id === selectedPatientId) {
      button.classList.add("is-active");
    }

    const avatar = createPatientPhotoElement(patient, "avatar");
    const content = createElement("span", "patient-card__content");
    const header = createElement("span", "patient-card__header");
    const name = createElement("strong", "patient-card__name", patient.name);
    const payment = createElement(
      "span",
      `badge ${patient.paid ? "badge--paid" : "badge--unpaid"}`,
      patient.paid ? "Оплачено" : "Не оплачено"
    );
    const meta = createElement(
      "span",
      "patient-card__meta",
      `${patient.department} · ${patient.doctor}`
    );
    const footer = createElement("span", "patient-card__footer");
    const date = createElement(
      "span",
      "patient-card__date",
      formatAppointment(patient.appointment)
    );
    const risk = createElement(
      "span",
      `risk risk--${patient.risk}`,
      `${riskLabels[patient.risk]} риск`
    );

    header.append(name, payment);
    footer.append(date, risk);
    content.append(header, meta, footer);
    button.append(avatar, content);
    item.append(button);
    patientsList.append(item);
  });

  statusText.textContent = patients.length
    ? `Показано: ${visiblePatients.length} из ${patients.length}`
    : "Данные еще не загружены";
}

function renderDetails() {
  const patient = getSelectedPatient();

  detailsList.replaceChildren();

  if (!patient) {
    detailsPhoto.hidden = true;
    detailsActions.hidden = true;
    detailsTitle.textContent = "Пациент не выбран";
    detailsNote.textContent = patients.length
      ? "Выберите пациента из списка."
      : "Загрузите список или добавьте пациента.";
    detailsList.hidden = true;
    return;
  }

  detailsPhoto.hidden = false;
  detailsActions.hidden = false;
  removePhotoBtn.disabled = !patient.photo;
  applyPatientPhoto(detailsPhoto, patient);

  const rows = [
    ["Возраст", `${patient.age} лет`],
    ["Отделение", patient.department],
    ["Врач", patient.doctor],
    ["Диагноз", patient.diagnosis],
    ["Прием", formatAppointment(patient.appointment)],
    ["Оплата", patient.paid ? "Оплачено" : "Не оплачено"],
    ["Риск", riskLabels[patient.risk]],
    ["Телефон", patient.phone],
  ];

  detailsTitle.textContent = patient.name;
  detailsNote.textContent = patient.diagnosis;
  detailsList.hidden = false;

  rows.forEach(([label, value]) => {
    const term = createElement("dt", null, label);
    const description = createElement("dd", null, value);
    detailsList.append(term, description);
  });
}

function render() {
  updateMetrics();
  renderPatients();
  renderDetails();
}

async function loadPatients() {
  setLoading(true);
  statusText.textContent = "Загрузка пациентов...";
  emptyState.hidden = true;
  patientsList.replaceChildren();

  try {
    const loadedPatients = await fetchPatients();
    patients = [...loadedPatients, ...customPatients];
    selectedPatientId = patients.some((patient) => patient.id === selectedPatientId)
      ? selectedPatientId
      : patients[0]?.id ?? null;
    populateDepartments();
    statusText.textContent = "Пациенты загружены";
    render();
  } catch (error) {
    statusText.textContent = "Не удалось загрузить пациентов";
  } finally {
    setLoading(false);
  }
}

function resetFilters() {
  searchInput.value = "";
  paymentFilter.value = "all";
  departmentFilter.value = "all";
  sortSelect.value = "appointment";
  render();
}

function openPatientDialog() {
  patientForm.reset();
  formError.textContent = "";
  patientForm.elements.appointment.value = getCurrentDateTimeValue();
  patientForm.elements.paid.value = "true";
  patientForm.elements.risk.value = "low";
  patientDialog.showModal();
  patientForm.elements.name.focus();
}

function closePatientDialog() {
  patientDialog.close();
}

async function createPatientFromForm() {
  const formData = new FormData(patientForm);
  const age = Number(getFormValue(formData, "age"));
  const appointment = getFormValue(formData, "appointment");
  const appointmentDate = new Date(appointment);
  const newPatientId = getNextPatientId();
  const photoFile = patientForm.elements.photo.files[0];

  if (!Number.isInteger(age) || age < 0 || age > 120) {
    throw new Error("Возраст должен быть числом от 0 до 120.");
  }

  if (Number.isNaN(appointmentDate.getTime())) {
    throw new Error("Укажите корректную дату и время приема.");
  }

  const photo = await readPhotoFile(photoFile);

  return {
    id: newPatientId,
    name: getFormValue(formData, "name"),
    age,
    paid: getFormValue(formData, "paid") === "true",
    department: getFormValue(formData, "department"),
    doctor: getFormValue(formData, "doctor"),
    diagnosis: getFormValue(formData, "diagnosis"),
    appointment,
    risk: getFormValue(formData, "risk"),
    phone: getFormValue(formData, "phone") || "Не указан",
    avatarIndex: newPatientId % avatarCount,
    photo,
  };
}

function addPatient(patient) {
  customPatients = [patient, ...customPatients];
  patients = [patient, ...patients];
  selectedPatientId = patient.id;

  searchInput.value = "";
  paymentFilter.value = "all";
  departmentFilter.value = "all";
  sortSelect.value = "appointment";

  const isSaved = saveCustomPatients();
  populateDepartments();
  render();
  statusText.textContent = isSaved
    ? `Пациент ${patient.name} добавлен`
    : `Пациент ${patient.name} добавлен, но не сохранен после перезагрузки`;
}

function persistPatientChanges(patient) {
  const customPatientIndex = customPatients.findIndex((item) => item.id === patient.id);

  if (customPatientIndex !== -1) {
    customPatients[customPatientIndex] = { ...patient };
    return saveCustomPatients();
  }

  if (patient.photo) {
    photoOverrides[patient.id] = patient.photo;
  } else {
    delete photoOverrides[patient.id];
  }

  return savePhotoOverrides();
}

async function handleDetailsPhotoUpload(event) {
  const file = event.target.files[0];
  const patient = getSelectedPatient();

  if (!file || !patient) {
    return;
  }

  try {
    const photo = await readPhotoFile(file);
    patient.photo = photo;

    const isSaved = persistPatientChanges(patient);
    render();
    statusText.textContent = isSaved
      ? `Фото пациента ${patient.name} обновлено`
      : `Фото пациента ${patient.name} обновлено, но не сохранено после перезагрузки`;
  } catch (error) {
    statusText.textContent = error.message;
  } finally {
    detailsPhotoInput.value = "";
  }
}

function removeSelectedPatientPhoto() {
  const patient = getSelectedPatient();

  if (!patient) {
    return;
  }

  patient.photo = null;

  const isSaved = persistPatientChanges(patient);
  render();
  statusText.textContent = isSaved
    ? `Фото пациента ${patient.name} удалено`
    : `Фото пациента ${patient.name} удалено, но изменение не сохранено`;
}

function deleteSelectedPatient() {
  const patient = getSelectedPatient();

  if (!patient) {
    return;
  }

  const shouldDelete = confirm(`Удалить пациента ${patient.name}?`);

  if (!shouldDelete) {
    return;
  }

  const customPatientIndex = customPatients.findIndex((item) => item.id === patient.id);
  let isSaved = true;

  if (customPatientIndex !== -1) {
    customPatients = customPatients.filter((item) => item.id !== patient.id);
    isSaved = saveCustomPatients();
  } else {
    deletedPatientIds = [...new Set([...deletedPatientIds, patient.id])];
    delete photoOverrides[patient.id];
    isSaved = saveDeletedPatientIds() && savePhotoOverrides();
  }

  patients = patients.filter((item) => item.id !== patient.id);
  selectedPatientId = patients[0]?.id ?? null;
  populateDepartments();
  render();
  statusText.textContent = isSaved
    ? `Пациент ${patient.name} удален`
    : `Пациент ${patient.name} удален, но изменение не сохранено`;
}

async function handlePatientSubmit(event) {
  event.preventDefault();
  formError.textContent = "";

  if (!patientForm.checkValidity()) {
    formError.textContent = "Заполните обязательные поля.";
    patientForm.querySelector(":invalid")?.focus();
    return;
  }

  try {
    const patient = await createPatientFromForm();
    addPatient(patient);
    closePatientDialog();
  } catch (error) {
    formError.textContent = error.message;
  }
}

addPatientBtn.addEventListener("click", openPatientDialog);
loadBtn.addEventListener("click", loadPatients);
resetBtn.addEventListener("click", resetFilters);
cancelPatientBtn.addEventListener("click", closePatientDialog);
closeFormBtn.addEventListener("click", closePatientDialog);
patientForm.addEventListener("submit", handlePatientSubmit);
detailsPhotoInput.addEventListener("change", handleDetailsPhotoUpload);
removePhotoBtn.addEventListener("click", removeSelectedPatientPhoto);
deletePatientBtn.addEventListener("click", deleteSelectedPatient);

searchInput.addEventListener("input", render);

[paymentFilter, departmentFilter, sortSelect].forEach((control) => {
  control.addEventListener("change", render);
});

patientsList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-patient-id]");

  if (!button) {
    return;
  }

  selectedPatientId = Number(button.dataset.patientId);
  render();
});

patientDialog.addEventListener("click", (event) => {
  if (event.target === patientDialog) {
    closePatientDialog();
  }
});

populateDepartments();
render();
