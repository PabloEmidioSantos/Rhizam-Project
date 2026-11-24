import { createManagedRecord, deleteManagedRecord, listManagedRecords, updateManagedRecord } from "./managedDataService.js";

export const listClients = () => listManagedRecords("clients");
export const createClient = (payload) => createManagedRecord("clients", payload);
export const updateClient = (id, payload) => updateManagedRecord("clients", id, payload);
export const deleteClient = (id) => deleteManagedRecord("clients", id);
