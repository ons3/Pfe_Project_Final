<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import axios from 'axios';

const toast = useToast();
const dt = ref();
const taches = ref([]);
const addEmployeeDialog = ref(false);
const editEmployeeDialog = ref(false);
const deleteEmployeeDialog = ref(false);
const employee = ref({});
const submitted = ref(false);
const searchQuery = ref('');
const employeeToDelete = ref(null); // To store the employee to delete

// Fetch employees
const fetchTaches = async () => {
  try {
    const query = `
      query {
        searchEmployees {
          employees {
            idEmployee
            nomEmployee
            emailEmployee
            role
          }
        }
      }
    `;
    const response = await axios.post('http://localhost:3000/graphql', { query });
    taches.value = response.data.data.searchEmployees.employees;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load employees', life: 3000 });
  }
};

// Filter employees based on search query
const filteredEmployees = computed(() => {
  return taches.value.filter(emp =>
    emp.nomEmployee.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Open new employee dialog
const openNew = () => {
  employee.value = { nomEmployee: '', emailEmployee: '', role: '', password: '' };
  submitted.value = false;
  addEmployeeDialog.value = true;
};

// Open edit employee dialog
const openEdit = (emp) => {
  employee.value = { ...emp, password: '' };
  editEmployeeDialog.value = true;
};

// Hide dialog
const hideDialog = () => {
  addEmployeeDialog.value = false;
  editEmployeeDialog.value = false;
  deleteEmployeeDialog.value = false;
  submitted.value = false;
};

// Update employee (mutation)
const updateEmployee = async () => {
  try {
    const mutation = `
      mutation {
        updateEmployee(
          id: "${employee.value.idEmployee}",
          nomEmployee: "${employee.value.nomEmployee}",
          emailEmployee: "${employee.value.emailEmployee}",
          role: "${employee.value.role}"
        ) {
          idEmployee
          nomEmployee
          emailEmployee
          role
        }
      }
    `;

    const response = await axios.post('http://localhost:3000/graphql', { query: mutation });

    // Handle the response
    const updatedEmployee = response.data.data.updateEmployee;
    const index = taches.value.findIndex(emp => emp.idEmployee === updatedEmployee.idEmployee);

    if (index !== -1) {
      taches.value[index] = updatedEmployee;
    }

    toast.add({ severity: 'success', summary: 'Success', detail: 'Employee updated successfully', life: 3000 });
    hideDialog();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update employee', life: 3000 });
  }
};

// Delete employee (mutation)
const deleteEmployee = async () => {
  try {
    const mutation = `
      mutation {
        deleteEmployee(id: "${employeeToDelete.value.idEmployee}") {
          success
          message
        }
      }
    `;

    const response = await axios.post('http://localhost:3000/graphql', { query: mutation });

    const result = response.data.data.deleteEmployee;
    if (result.success) {
      // Remove deleted employee from the list
      taches.value = taches.value.filter(emp => emp.idEmployee !== employeeToDelete.value.idEmployee);
      toast.add({ severity: 'success', summary: 'Success', detail: result.message, life: 3000 });
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete employee', life: 3000 });
    }

    hideDialog();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete employee', life: 3000 });
  }
};

// Open delete employee confirmation dialog
const confirmDeleteEmployee = (emp) => {
  employeeToDelete.value = emp; // Store the employee to delete
  deleteEmployeeDialog.value = true;
};

onMounted(() => {
  fetchTaches();
});
</script>



<template>
    <div class="employee-page p-4">
      <div class="card">
        <Toolbar class="mb-4">
          <template #start>
            <Button label="New" icon="pi pi-plus" class="p-button-success" @click="openNew" />
          </template>
          <template #end>
            <InputText v-model="searchQuery" placeholder="Search by name..." class="p-inputtext-sm p-mr-2" />
          </template>
        </Toolbar>

        <DataTable :value="filteredEmployees" ref="dt" paginator :rows="10" class="p-datatable-gridlines">
          <Column field="idEmployee" header="ID" />
          <Column field="nomEmployee" header="Name" />
          <Column field="emailEmployee" header="Email" />
          <Column field="role" header="Role" />
          <Column header="Actions">
            <template #body="{ data }">
              <Button icon="pi pi-pencil" class="p-button-rounded p-button-warning p-mr-2" @click="openEdit(data)" />
              <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDeleteEmployee(data)" />
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- New Employee Dialog -->
      <Dialog v-model:visible="addEmployeeDialog" header="New Employee" modal class="p-dialog-responsive" :style="{ width: '30%' }">
        <div class="p-fluid">
          <div class="field">
            <label for="nomEmployee">Name</label>
            <InputText id="nomEmployee" v-model="employee.nomEmployee" required autofocus class="p-inputtext-lg" />
          </div>
          <div class="field">
            <label for="emailEmployee">Email</label>
            <InputText id="emailEmployee" v-model="employee.emailEmployee" required class="p-inputtext-lg" />
          </div>
          <div class="field">
            <label for="role">Role</label>
            <InputText id="role" v-model="employee.role" required class="p-inputtext-lg" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <InputText id="password" v-model="employee.password" type="password" required class="p-inputtext-lg" />
          </div>
        </div>
        <template #footer>
          <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
          <Button label="Save" icon="pi pi-check" class="p-button-primary" @click="saveNewEmployee" />
        </template>
      </Dialog>

      <!-- Edit Employee Dialog -->
      <Dialog v-model:visible="editEmployeeDialog" header="Edit Employee" modal class="p-dialog-responsive" :style="{ width: '30%' }">
        <div class="p-fluid">
          <div class="field">
            <label for="nomEmployee">Name</label>
            <InputText id="nomEmployee" v-model="employee.nomEmployee" required autofocus class="p-inputtext-lg" />
          </div>
          <div class="field">
            <label for="emailEmployee">Email</label>
            <InputText id="emailEmployee" v-model="employee.emailEmployee" required class="p-inputtext-lg" />
          </div>
          <div class="field">
            <label for="role">Role</label>
            <InputText id="role" v-model="employee.role" required class="p-inputtext-lg" />
          </div>
        </div>
        <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
            <Button label="Update" icon="pi pi-check" class="p-button-primary" @click="updateEmployee" />
        </template>
      </Dialog>

      <!-- Delete Employee Confirmation Dialog -->
      <Dialog v-model:visible="deleteEmployeeDialog" header="Delete Employee" modal class="p-dialog-responsive" :style="{ width: '30%' }">
        <div class="p-fluid">
          <p>Are you sure you want to delete the employee?</p>
        </div>
        <template #footer>
          <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
          <Button label="Delete" icon="pi pi-check" class="p-button-danger" @click="deleteEmployee" />
        </template>
      </Dialog>
    </div>
</template>


  <style scoped>
  .employee-page {
      max-width: 1200px;
      margin: 0 auto;
  }

  .card {
      background: var(--surface-card);
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .field {
      margin-bottom: 1.5rem;
  }

  .p-fluid .field label {
      font-weight: bold;
      margin-bottom: 0.5rem;
      display: block;  /* Ensure labels are block-level elements */
  }

  .p-fluid .field .p-inputtext-lg {
      width: 100%;
      padding: 0.75rem;  /* Add padding for better spacing */
      font-size: 1rem;
      border-radius: 5px;
  }
  </style>
